const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const tar = require("tar");
const AdmZip = require("adm-zip");
const color = require("ansi-colors");

color.enabled = false;
color.enabled = require("color-support").hasBasic;

const programFilesPath = process.env.ProgramFiles;
var filePath = () => {
    if (!config.localInstall) return path.join(programFilesPath, "NWjsForC2").toString()
    else return path.join(__dirname, "NWjsForC2").toString()
}
const checkDirs = ["win64", "win32", "linux64", "linux32", "osx64"];

function extractZip(zipPath, outputFolder) {
    return new Promise((resolve, reject) => {
        try {
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(outputFolder, true);
            resolve("Extraction complete!");
        } catch (error) {
            reject(error);
        }
    });
}

console.clear();
console.log(color.yellow("Will be installed to: " + filePath()))
console.log(color.magenta(`Starting install process...\n`))

// Read the installed version
fs.readFile(path.join(filePath(), "installedversion.freshnw"), (err, installVersionRaw) => {
    if (err) return console.log(color.red("Error reading version file:"), err);
    const installVersion = installVersionRaw.toString().trim();
    let installCount = 0;

    const installPromises = checkDirs.map(dir => {
        if (dir === "win64") {
            console.log("Installing for " + color.cyan("Windows 64-bit") + "...");
            return extractZip(path.join(__dirname, "temp", `nwjs-v${installVersion}-win-x64.zip`), filePath())
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath(), `nwjs-v${installVersion}-win-x64`), path.join(filePath(), dir));
                });
        } else if (dir === "win32") {
            console.log("Installing for " + color.cyan("Windows 32-bit") + "...");
            return extractZip(path.join(__dirname, "temp", `nwjs-v${installVersion}-win-ia32.zip`), filePath())
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath(), `nwjs-v${installVersion}-win-ia32`), path.join(filePath(), dir));
                });
        } else if (dir === "linux64") {
            console.log("Installing for " + color.yellow("Linux 64-bit") + "...");
            return tar.x({
                file: path.join(__dirname, "temp", `nwjs-v${installVersion}-linux-x64.tar.gz`),
                C: filePath()
            })
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath(), `nwjs-v${installVersion}-linux-x64`), path.join(filePath(), dir));
                });
        } else if (dir === "linux32") {
            console.log("Installing for " + color.yellow("Linux 32-bit") + "...");
            return tar.x({
                file: path.join(__dirname, "temp", `nwjs-v${installVersion}-linux-ia32.tar.gz`),
                C: filePath()
            })
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath(), `nwjs-v${installVersion}-linux-ia32`), path.join(filePath(), dir));
                });
        } else if (dir === "osx64") {
            console.log("Installing for " + color.magenta("MacOS X 64-bit") + "...");
            return extractZip(path.join(__dirname, "temp", `nwjs-v${installVersion}-osx-x64.zip`), filePath())
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath(), `nwjs-v${installVersion}-osx-x64`, "nwjs.app"), path.join(filePath(), dir));
                    fs.rmSync(path.join(filePath(), `nwjs-v${installVersion}-osx-x64`), { recursive: true, force: true });
                });
        }
    });

    Promise.allSettled(installPromises)
        .then(() => {

            if (installCount === checkDirs.length) {
                console.log(color.magenta(`\nFiles installed to: ${filePath()}`));
                if (config.preferedVersion !== "latest") {
                    console.log(color.green(`NW.js for Construct 2 installed successfully!\nEnjoy your preferred version of NW.js, ${installVersion}!`));
                } else {
                    console.log(color.green(`NW.js for Construct 2 installed successfully!\nEnjoy the latest version of NW.js, ${installVersion}!`));
                }
                if (config.localInstall) {
                    console.log(color.yellow("The \"NWjsForC2\" folder needs to be moved to your \'Program Files\' folder to function.\n"));
                } else console.log("")

                if (config.deleteTempDirAfterInstall === true) {
                    const tempPath = path.join(__dirname, "temp");
                    if (fs.existsSync(tempPath)) {
                        fs.rmSync(tempPath, { recursive: true, force: true });
                    }
                }
            } else {
                console.log(color.red(`${(checkDirs.length - installCount)} of ${checkDirs.length} platform(s) failed to install!\n\nDisable "deleteTempDirAfterInstall" in your config.json and check if the files download correctly.\n\nMake sure to check your internet connection. If it\"s not that, try running "pnpm reconstruct".\n`));
            }
        });
});
