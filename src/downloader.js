const https = require("https");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const { DownloaderHelper } = require("node-downloader-helper");
const cliProgress = require("cli-progress");
const color = require("ansi-colors");

color.enabled = false;
color.enabled = require("color-support").hasBasic;

if (fs.existsSync(path.join(__dirname, "temp"))) {
    fs.rmSync(path.join(__dirname, "temp"), { recursive: true, force: true })
}
const programFilesPath = process.env.ProgramFiles;
var filePath = () => {
    if (!config.localInstall) return path.join(programFilesPath, "NWjsForC2").toString()
    else return path.join(__dirname, "NWjsForC2").toString()
}
const checkDirs = ["win64", "win32", "linux64", "linux32", "osx64"];

const progressBar = new cliProgress.MultiBar({
    format: ` ‖{bar}‖  {platformName}  ‖ {speed} ‖ {percentage}%`,
    barCompleteChar: "█",
    barIncompleteChar: " ",
    hideCursor: true,
    linewrap: true
});

console.clear();
console.log(color.yellow("Will be installed to: " + filePath()))
console.log(color.magenta("Starting download process..."))

// Fetch latest version from npm
https.get("https://registry.npmjs.com/nw", (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", async () => {
        var installVersion;
        if (config.preferedVersion != "latest") {
            installVersion = config.preferedVersion
        } else {
            installVersion = JSON.parse(data)["dist-tags"].latest;
        }


        if (!fs.existsSync(filePath())) {
            fs.mkdirSync(filePath(), { recursive: true });
            fs.writeFileSync(path.join(filePath(), "installedversion.freshnw"), installVersion);
        } else {
            fs.writeFileSync(path.join(filePath(), "installedversion.freshnw"), installVersion);
        }
        if (!fs.existsSync(path.join(__dirname, "temp"))) {
            fs.mkdirSync(path.join(__dirname, "temp"), { recursive: true });
        }

        // URLs for different platforms
        const urls = {
            win64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-win-x64.zip`,
            win32: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-win-ia32.zip`,
            linux64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-linux-x64.tar.gz`,
            linux32: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-linux-ia32.tar.gz`,
            osx64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-osx-x64.zip`
        };

        // Remove old directories
        checkDirs.forEach(dir => fs.rmSync(path.join(filePath(), dir), { recursive: true, force: true }));

        // Start all downloads in parallel using Promise.all
        await Promise.all(checkDirs.map(dir => downloadFile(urls[dir], dir, installVersion)));

        // When all downloads are compeleted, exit
        console.log(color.green("\nAll files downloaded!"));
        setTimeout(()=>{process.exit(0)}, 500);        
    });
}).on("error", console.error);

var completedDLs = 0;
// Download function (returns a promise)
function downloadFile(url, type, installVersion) {
    return new Promise((resolve) => {
        if (!url) return resolve(); // Skip if URL is missing

        let progress = progressBar.create(100, 0);
        const dl = new DownloaderHelper(url, path.join(__dirname, "temp"));

        dl.on("progress", (stats) => {
            const percentage = Math.round(stats.progress);
            const speed = (((stats.speed / 1024) / 1000).toFixed(2)).toString()+" MB/s";
            progress.update(percentage, { speed });
        });

        dl.on("end", (stats) => {
            const percentage = Math.round(stats.progress);
            const speed = "Done!"
            progress.update(percentage, { speed })
            completedDLs++
            if (completedDLs == 5) {
                progressBar.stop();
            }
            resolve();
        });

        dl.on("error", (err) => {
            console.log(color.red(`Failed to download ${type}: ${err}`));
            progressBar.remove(progress);
            resolve();
            process.exit(1);
        });

        dl.on("start", () => {
            if (type == "win64") {
                progress.start(100, 0, { speed: "Wait...", downloaded: "0", total: "0", nwVersion: installVersion, platformName: color.cyan("Windows 64-bit") });
            } else
                if (type == "win32") {
                    progress.start(100, 0, { speed: "Wait...", downloaded: "0", total: "0", nwVersion: installVersion, platformName: color.cyan("Windows 32-bit") });
                } else
                    if (type == "linux64") {
                        progress.start(100, 0, { speed: "Wait...", downloaded: "0", total: "0", nwVersion: installVersion, platformName: color.yellow(" Linux 64-bit ") });
                    } else
                        if (type == "linux32") {
                            progress.start(100, 0, { speed: "Wait...", downloaded: "0", total: "0", nwVersion: installVersion, platformName: color.yellow(" Linux 32-bit ") });
                        } else
                            if (type == "osx64") {
                                progress.start(100, 0, { speed: "Wait...", downloaded: "0", total: "0", nwVersion: installVersion, platformName: color.magenta("MacOS X 64-bit") });
                                console.log(color.magenta(`Downloading NW.js version: ${installVersion}\n`));
                            }
        });

        dl.start().catch(err => {
            console.error(err);
            resolve();
        });
    });
}
