const fs = require('fs');
const path = require('path');
const config = require("./config.json")
const tar = require("tar");
const AdmZip = require("adm-zip");

console.clear();
console.log("Starting install process...")

const programFilesPath = process.env.ProgramFiles;
const filePath = path.join(programFilesPath, 'NWjsForC2');
const checkDirs = ['win64', 'win32', 'linux64', 'linux32', 'osx64'];

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
fs.readFile(path.join(filePath, 'installedversion.freshnw'), (err, installVersionRaw) => {
    if (err) return console.error('Error reading installedversion.freshnw:', err);
    const installVersion = installVersionRaw.toString().trim();
    let installCount = 0;

    console.log('Installing...');

    const installPromises = checkDirs.map(dir => {
        if (dir === "win64") {
            console.log('Installing for Windows 64-bit...');
            return extractZip(path.join(__dirname, "temp", `nwjs-v${installVersion}-win-x64.zip`), filePath)
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath, `nwjs-v${installVersion}-win-x64`), path.join(filePath, dir));
                });
        } else if (dir === "win32") {
            console.log('Installing for Windows 32-bit...');
            return extractZip(path.join(__dirname, "temp", `nwjs-v${installVersion}-win-ia32.zip`), filePath)
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath, `nwjs-v${installVersion}-win-ia32`), path.join(filePath, dir));
                });
        } else if (dir === "linux64") {
            console.log('Installing for Linux 64-bit...');
            return tar.x({
                file: path.join(__dirname, "temp", `nwjs-v${installVersion}-linux-x64.tar.gz`),
                C: filePath
            })
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath, `nwjs-v${installVersion}-linux-x64`), path.join(filePath, dir));
                });
        } else if (dir === "linux32") {
            console.log('Installing for Linux 32-bit...');
            return tar.x({
                file: path.join(__dirname, "temp", `nwjs-v${installVersion}-linux-ia32.tar.gz`),
                C: filePath
            })
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath, `nwjs-v${installVersion}-linux-ia32`), path.join(filePath, dir));
                });
        } else if (dir === "osx64") {
            console.log('Installing for MacOS X 64-bit...');
            return extractZip(path.join(__dirname, "temp", `nwjs-v${installVersion}-osx-x64.zip`), filePath)
                .then(() => {
                    installCount++;
                    fs.renameSync(path.join(filePath, `nwjs-v${installVersion}-osx-x64`, "nwjs.app"), path.join(filePath, dir));
                    fs.rmSync(path.join(filePath, `nwjs-v${installVersion}-osx-x64`), { recursive: true, force: true });
                });
        }
    });

    Promise.allSettled(installPromises)
        .then(() => {
            console.clear();

            if (installCount === checkDirs.length) {
                console.log('Files installed to', filePath);
                if (config.preferedVersion !== "latest") {
                    console.log(`\nNW.js for Construct 2 installed successfully!\n\nEnjoy your preferred version of NW.js, ${installVersion}!\n`);
                } else {
                    console.log(`\nNW.js for Construct 2 installed successfully!\n\nEnjoy the latest version of NW.js, ${installVersion}!\n`);
                }

                if (config.deleteTempDirAfterInstall === true) {
                    const tempPath = path.join(__dirname, "temp");
                    if (fs.existsSync(tempPath)) {
                        fs.rmSync(tempPath, { recursive: true, force: true });
                    }
                }
            } else {
                console.log((checkDirs.length - installCount) + ' of ' + checkDirs.length + ' platform(s) failed to install!\n\nDisable "deleteTempDirAfterInstall" in your config.json and check if the files download correctly.\n\nMake sure to check your internet connection. If it\'s not that, try running "pnpm reconstruct".\n');
            }
        });
});
