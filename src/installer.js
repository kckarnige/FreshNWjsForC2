const fs = require('fs');
const path = require('path');
const tar = require("tar");
const AdmZip = require("adm-zip");

console.clear();
console.log("Running...")

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
fs.readFile(path.join(filePath, 'currentVersion'), (err, latestVersion) => {
    console.log('Installing...');
    checkDirs.forEach(dir => {
        if (dir === "win64") {
            console.log('Installing for Windows 64-bit...');
            extractZip(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-win-x64.zip"), path.join(filePath))
                .then(() => {
                    fs.rmSync(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-win-x64.zip"), { recursive: true, force: true })
                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-win-x64"), path.join(filePath, dir))
                    fs.rmSync(dir, { recursive: true, force: true })
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        } else if (dir === "win32") {
            console.log('Installing for Windows 32-bit...');
            extractZip(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-win-ia32.zip"), path.join(filePath))
                .then(() => {
                    fs.rmSync(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-win-ia32.zip"), { recursive: true, force: true })
                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-win-ia32"), path.join(filePath, dir))
                    fs.rmSync(dir, { recursive: true, force: true })
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        } else if (dir === "linux64") {
            console.log('Installing for Linux 64-bit...');
            tar.x({
                file: path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-linux-x64.tar.gz"),
                C: path.join(filePath)
            })
                .then(() => {
                    fs.rmSync(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-linux-x64.tar.gz"), { recursive: true, force: true })
                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-linux-x64"), path.join(filePath, dir))
                    fs.rmSync(dir, { recursive: true, force: true })
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        } else if (dir === "linux32") {
            console.log('Installing for Linux 32-bit...');
            tar.x({
                file: path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-linux-ia32.tar.gz"),
                C: path.join(filePath)
            })
                .then(() => {
                    fs.rmSync(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-linux-ia32.tar.gz"), { recursive: true, force: true })
                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-linux-ia32"), path.join(filePath, dir))
                    fs.rmSync(dir, { recursive: true, force: true })
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        } else if (dir === "osx64") {
            console.log('Installing for MacOS X 64-bit...');
            extractZip(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-osx-x64.zip"), path.join(filePath))
                .then(() => {
                    fs.rmSync(path.join(__dirname, "temp", "nwjs-v" + latestVersion + "-osx-x64.zip"), { recursive: true, force: true })
                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-osx-x64", "nwjs.app"), path.join(filePath, dir))
                    fs.rmSync(path.join(filePath, "nwjs-v" + latestVersion + "-osx-x64"), { recursive: true, force: true })
                    fs.rmSync(dir, { recursive: true, force: true })
                })
                .catch(err => {
                    console.error('Error:', err);
                });
        }
    })
});
