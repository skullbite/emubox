# 🎮 Emubox
A package manager for emulators, in a distrobox container.

I like the ideas utilized by the [Emudeck](https://github.com/dragoonDorise/EmuDeck) project, but think their scope reaches a little too far for my preferences. Emubox is supposed to be a smaller alternative.

### Features
- Custom ROM and *~~Saves~~ directory choices (*saves currently don't save to this directory, wip)
- Emulator installation and updates from AUR, Flathub, and Github (as Appimages)
- Steam ROM Manager preset manifests


### Installation
Requires distrobox
```
sh -c "$(curl -sSL https://emubox.pupper.space/install)"
```