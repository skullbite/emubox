import remove from "../funcs/remove";

const HELP_MSG = `
emubox remove: emubox remove <...EMULATOR_IDS>
    Remove emulators/utilites from your container.

    Apps, as well as their binaries will be exported to the host.
`;
export default async function(...toRemove: string[]) {
    if (!toRemove.length) {
        console.log(HELP_MSG);
        return;
    }
    
    for (const i of toRemove) {
        remove(i);
    }
}