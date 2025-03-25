// "Sorry for the mess"
// The mess:

const https = require('https');
const fs = require('fs');
const path = require('path');
const AdmZip = require("adm-zip");
const { DownloaderHelper } = require('node-downloader-helper');
const cliProgress = require('cli-progress');

console.clear()
console.log("Running...")

const programFilesPath = process.env.ProgramFiles;
const filePath = path.join(programFilesPath, 'NWjsForC2');
const checkDirs = ['win64', 'win32', 'linux64', 'linux32', 'osx64'];

https.get('https://registry.npmjs.com/nw', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const latestVersion = JSON.parse(data)['dist-tags'].latest;
        console.log('Latest NW.js version:', latestVersion);

        fs.readFile(path.join(filePath, 'currentVersion'), 'utf8', (err, fileData) => {
            if (err) {
                const foundDir = checkDirs.find(dir => fs.existsSync(path.join(filePath, dir)));
                if (foundDir) {
                    if (['unins000.dat'].find(dir => fs.existsSync(path.join(filePath, dir)))) {
                        console.log(`Please uninstall "NWjsForC2" before proceeding. Detected '${foundDir}' folder and uninstall files.`);
                        process.exit(1);
                    } else {
                        console.log(`Please the "NWjsForC2" folder in 'Program Files' before proceeding. Detected '${foundDir}' folder.`);
                        process.exit(1);
                    }
                }
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, { recursive: true })
                }
                console.log('Version file not found. Attempting to update...', latestVersion);
            } else if (fileData.trim() !== latestVersion) {
                console.log('Version file does not match the latest version. Updating...');
            } else {
                console.log('Already up-to-date.');
                return;
            }

            fs.writeFile(path.join(filePath, 'currentVersion'), latestVersion, (writeErr) => {
            //fs.writeFile(path.join(filePath, 'currentVersion'), "latestVersion", (writeErr) => {
                if (writeErr) console.error('Error writing to file:', writeErr);
                else {
                    if (!fs.existsSync("temp")) {
                        fs.mkdirSync("temp", { recursive: true })
                    }
                    checkDirs.forEach(dir => {
                        fs.rmSync(path.join(filePath, dir), { recursive: true, force: true })
                        function dlFunc(value) {
                            const progressBar = new cliProgress.SingleBar({
                                format: 'Downloading: [{bar}] {percentage}%',
                                barCompleteChar: '#',
                                barIncompleteChar: '-',
                                hideCursor: true
                            });
                            const dl = new DownloaderHelper((value).toString(), path.join(__dirname,"temp"))
                            dl.on('progress', (stats) => {
                                const percentage = Math.round(stats.progress);
                                const downloaded = (stats.downloaded / 1024).toFixed(2);
                                const total = (stats.total / 1024).toFixed(2);
                                const speed = (stats.speed / 1024).toFixed(2);
                                
                                progressBar.update(percentage, { speed, downloaded, total });
                            });
                            dl.on('end', () => {
                                progressBar.stop();
                                console.log('File downloaded successfully');
                                console.log("Download Completed: " + dir);
                                if (dir == "win64") {
                                    new AdmZip(path.join(__dirname,"temp","nwjs-v" + latestVersion + "-win-x64.zip")).extractAllTo(path.join(filePath))
                                    fs.rmSync(path.join(__dirname,"temp","nwjs-v" + latestVersion + "-win-x64.zip"), { recursive: true, force: true })
                                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-win-x64"), path.join(filePath, dir))
                                    fs.rmSync(dir, { recursive: true, force: true })
                                } else if (dir == "win32") {
                                    new AdmZip(path.join(__dirname,"temp","nwjs-v" + latestVersion + "-win-ia32.zip")).extractAllTo(path.join(filePath))
                                    fs.rmSync(path.join(__dirname,"temp","nwjs-v" + latestVersion + "-win-ia32.zip"), { recursive: true, force: true })
                                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-win-ia32"), path.join(filePath, dir))
                                    fs.rmSync(dir, { recursive: true, force: true })
                                } else if (dir == "osx64") {
                                    new AdmZip(path.join(__dirname,"temp","nwjs-v" + latestVersion + "-osx-x64.zip")).extractAllTo(path.join(filePath))
                                    fs.rmSync(path.join(__dirname,"temp","nwjs-v" + latestVersion + "-osx-x64.zip"), { recursive: true, force: true })
                                    fs.renameSync(path.join(filePath, "nwjs-v" + latestVersion + "-osx-x64"), path.join(filePath, dir))
                                    fs.rmSync(dir, { recursive: true, force: true })
                                }
                            })
                            dl.on('error', (err) => {
                                progressBar.stop();
                                console.log(`Failed to download`, err)
                            });
                            dl.on('start', () => {
                                console.log('Download started...');
                                progressBar.start(100, 0, { speed: "0", downloaded: "0", total: "0" });
                            });
                            dl.start().catch(err => console.error(err));
                        };
                        if (dir == "win64") {
                            dlFunc("https://dl.nwjs.io/v" + latestVersion + "/nwjs-v" + latestVersion + "-win-x64.zip")
                        } else if (dir == "win32") {
                            dlFunc("https://dl.nwjs.io/v" + latestVersion + "/nwjs-v" + latestVersion + "-win-ia32.zip")
                        } else if (dir == "osx64") {
                            dlFunc("https://dl.nwjs.io/v" + latestVersion + "/nwjs-v" + latestVersion + "-osx-x64.zip")
                        }
                    })
                    console.log('File updated successfully.');
                }
            });
        });
    });
    fs.rmSync(path.join(__dirname,"temp"), { recursive: true, force: true })
})
.on('error', console.error)
