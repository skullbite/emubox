import { $ } from "bun";
import { getAppFromShort } from "../utils/apps";
import { openConfig, writeConfig } from "../utils/config";
import containerPrefix from "utils/containerPrefix";

export default async function(app: string) {
    const config = await openConfig();
        const target = config.installed.find(d => d.short === app);
        const emu = getAppFromShort(app);
    
        if (!emu) {
            console.error(`'${app}' not found`);
            return;
        }
    
        if (!target) {
            console.error(`'${app}' isn't installed`);
            return;
        }
    
        await $`rm $HOME/.emubox/launchers/${target.short}.sh`.nothrow();
    
        switch (target.source) {
            case "aur":
                await $`
                    ${containerPrefix}distrobox-export \
                        --bin /usr/bin/${emu.installOptions.aurBin} \
                        --export-path $HOME/.local/bin \
                        --delete
                `.nothrow();
                await $`${containerPrefix}paru -Rs --noconfirm ${emu.installOptions.aur}`;
                break;
            case "flatpak":
                await $`distrobox-host-exec flatpak remove -u ${emu.installOptions.flatpak}`;
                break;
        }
    
        config.installed.splice(
            config.installed.indexOf(target),
            1
        );

    
    writeConfig(config);

    console.log(`'${target.short}' has been removed.`);
}