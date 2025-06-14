import { $ } from "bun";
import install from "funcs/install";
import { getAppFromId } from "utils/apps";
import { openConfig, writeConfig } from "utils/config";
import containerPrefix from "utils/containerPrefix";
import getLatestRelease from "utils/getLatestRelease";
import { bold, green, red } from "yoctocolors";

export default async function() {
    await $`${containerPrefix}paru -Syy`;
    console.log("Updating apps...");
    const config = await openConfig();
    const aurUpdatesNeeded = await $`${containerPrefix}paru --query --upgrades`.nothrow().text();
    const flatpakUpdatesNeeded = await $`${containerPrefix}flatpak list -u`.nothrow().text();
    
    for (const i of config.installed) {
        const dumbIndex = config.installed.indexOf(i);
        const app = getAppFromId(i.id)!;
        console.log(bold(`[${dumbIndex+1}/${config.installed.length}] ${app.name}`));
        if (app.installOptions.multi) {
            app.installOptions = app.installOptions.multi[config.installed[dumbIndex].mIndex!];
        }

        try {
            switch (i.source) {
                case "aur":
                    if (!aurUpdatesNeeded.includes(app.installOptions.aur!)) {
                        console.log(green(`Up to date`));
                        continue;
                    }
    
                    await $`${containerPrefix}paru -S ${app?.installOptions.aurBin}`;
                    break;
                case "flatpak":
                    if (!flatpakUpdatesNeeded.includes(app.installOptions.flatpak!)) {
                        console.log(green(`Up to date`));
                        continue;
                    }
    
                    await $`${containerPrefix}flatpak update ${app?.installOptions.flatpak}`;
                    break;
                case "github":
                    const latest = await getLatestRelease(app.installOptions.gitRepo!);
                    if (String(latest.id) === i.releaseId) {
                        console.log(green(`Up to date`));
                        continue;
                    }
                    
                    console.log(bold(`New release availible: ${i.releaseId} ~> ${latest.id}`));
    
                    const targetAsset = latest.assets.find((d: { name: string }) => d.name.match(app.installOptions.gitRe!));
                    if (!targetAsset) 
                        throw new Error("No asset found");
                    await $`rm ~/.emubox/apps/${i.file!}`;
                    console.log(`Updating ${app.name}...`);
                    config.installed.splice(dumbIndex, 1);
                    writeConfig(config);
                    await install(app.id, "github");
            }
        }
        catch (e) {
            console.log(red(`Failed to update '${app.name}'`), e);
        }
    }

    const lastestVer = await fetch("https://emubox.pupper.space/latest");
    const lastestTxt = (await lastestVer.text()).replace("\n", "");
    const currentVer = (await $`~/.local/bin/emubox -v`.text()).replace("\n", "");
    
    if (lastestTxt !== currentVer) {
        console.log(`Updating package manager to ${lastestTxt}...`);
        await $`curl -O https://emubox.pupper.space/emubox`.cwd("/tmp");
        await $`cp /tmp/emubox $HOME/.local/bin/emubox`;
    }
    else {
        console.log("Package manager is up to date!");
    }

    // console.log("Update the package manager itself using 'emubox-update'");
}