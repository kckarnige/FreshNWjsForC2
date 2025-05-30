![icon as scuffed as the program](./icon_banner_readme.png)

# Fresh NW for Construct 2

My own modern replacement for the official NW.js support installer for Construct 2, made to last far beyond 2025.


> [!NOTE]
>
> Due to how Construct 2 handles NW.js support, files need to be placed in a specific directory: `C:\Program Files\NWjsForC2`. Accessing this directory requires an elevated terminal, this is why it is a requirement. I recommend installing something like [gsudo](https://github.com/gerardog/gsudo) to make it easier on yourself, or if you're using the 24H2 release of Windows 11, the [sudo](https://learn.microsoft.com/en-us/windows/sudo/) command should be available to you right out the box. *You do not need an elevated terminal if `localInstall` is enabled, or if you use the `--local` flag.*
>
> ## Running under Wine
>
> **As Construct 2 only officially supports Windows, this tool will be made with that in mind above all else.** If you're by any chance using Construct 2 under [Wine](https://en.wikipedia.org/wiki/Wine_(software)), [Proton](https://en.wikipedia.org/wiki/Proton_(software)), or something of the sort, don't be surprised if Fresh NW doesn't function as intended, though I don't believe there should much issue, just make sure to configure Wine accordingly. That being said, support will NOT be provided for alternative setups, especially if a lot of jank is involved.

## Usage (From Binary)

- Download the binary file from the [releases page](https://github.com/kckarnige/FreshNWjsForC2/releases).

- Place the binary file whenever you'd like, and open the directory in an elevated terminal.

- Run `./FreshNW.exe` and let it do it's thing.

- If you want to prevent deleting the `temp` directory after installing, or choose a specific version of NW.js to install, you can edit the `config.json` file generated after install, or look at the available flags by running with the `--help` flag.

- Once Fresh NW says it's done installing, you should be able to export your Construct 2 games with a much more stable version of NW.js! (Or less stable, if you're into that.)

## Usage (From Source)

- Make sure you have [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io) installed.

- Clone this repository and open it's directory into an elevated terminal.

- Run `pnpm i` and then either `pnpm start` or `pnpm construct` and let it do it's thing.

- If you want to prevent deleting the `temp` directory after installing, or choose a specific version of NW.js to install, you can edit the `config.json` file in the `src` directory, or look at the available flags by running with the `--help` flag.

- Once Fresh NW says it's done installing, you should be able to export your Construct 2 games with a much more stable version of NW.js! (Or less stable, if you're into that.)

## Building from Source

- Make sure you have [Node.js](https://nodejs.org), [pnpm](https://pnpm.io), [Netwide Assembler (NASM)](https://www.nasm.us/), and [Microsoft C++ build tools](https://aka.ms/vs/17/release/vs_buildtools.exe) installed.

- Run `pnpm i` and give it a moment.

- Run `pnpm release` and let it do it's thing.

- If the install is successful, the binary should be in the `dist` folder!

## Troubleshooting

- Make sure you don't have the official NW.js support for Construct 2. If you do have it installed, uninstall it as you would any other Windows program. Theoretically, you should also be able to uninstall it using `pnpm deconstruct`, though it's not recommended. If you're using a binary, use the `--uninstall` flag.

- If Construct 2 is telling you NW.js support is not installed, or Fresh NW isn't recognising any new NW.js hotfix, you can force an install without checking for updates by running either `pnpm start` or `pnpm construct` with either the `--nocheck` or `--force` flag. The same applies if you're using the binary.

- You can reinstalling by running `pnpm reconstruct`. This uninstalls everything, then attempts an install from scratch. If you're using the binary, try uninstalling using the `--uninstall` flag, then run the binary like normal.

> [!WARNING]
>
> If you are STILL having issues, you should make sure you have a capable system/os and make sure you have a newer version of Node.js installed. This was originally created with Node v18 and tested with Node v22. If you're having issues with a Node version that isn't on Long-Term Support and older than 18.20.8, you will not receive support.
>
> **If all else fails, consider investing in a new system!**
>


## AI Politics

### This was made with assistance from AI.

(No, I'm not an AI or cryto bro. I hate crypto, AI however...)

I have a strong stance against AI and the ethics surrounding it's use, and I believe human input is what makes truly remarkable things, **however**, I also believe AI is a valuable resource if used sparingly and responsibly.

This project is a good example, as the downloader was created with AI, and molded into something entirely new, with some help with said AI to help understand how the downloader actually works and how to integrate a progress bar to keep track of downloads.

I intend to use AI as a tool to help me do the homework, not do it for me. This isn't some college course I want done and over with, this is a passion project I want fully realised with my heart and soul.

To put it bluntly, fuck AI "art".

True art, is made by the human hand on any blank canvas, not by an AI who's told to mash a bunch of stolen images together to make...[whatever this is](https://kckarnige.github.io/dl/i_hate_ai_slop.mp4).

Get your hands dirty! Learn and make something great!

----

<sub><i>The Neo NW icon uses the Construct 2 logo, <a href="https://www.roblox.com/catalog/122415713240099/Sonic-Ova-Movie-Iconic-Pink-Hat">this Roblox hat</a>, and <a href="https://www.homedepot.com/p/Brazos-Walking-Sticks-37-in-Twisted-Walnut-Walking-Cane-502-3000-0281/205856200">this cane from the Home Depot website</a>.</i></sub>       
<sub><i>Not affiliated with Scirra Ltd.</i></sub>