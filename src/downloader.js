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

// Fetch latest version NW.js from npm's API
https.get("https://registry.npmjs.com/nw", (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", async () => {

        // Get the version that is trying to be installed
        var installVersion;
        if (config.preferedVersion != "latest") {
            installVersion = config.preferedVersion
        } else {
            installVersion = JSON.parse(data)["dist-tags"].latest;
        }

        // If the 'temp' directory exists, delete it
        if (!fs.existsSync(path.join(__dirname, "temp"))) {
            fs.mkdirSync(path.join(__dirname, "temp"), { recursive: true });
        }        

        // Remove directories if they already exist
        checkDirs.forEach(dir => fs.rmSync(path.join(filePath(), dir), { recursive: true, force: true }));

        // URLs for different platforms
        const urls = {
            win64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-win-x64.zip`,
            win32: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-win-ia32.zip`,
            linux64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-linux-x64.tar.gz`,
            linux32: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-linux-ia32.tar.gz`,
            osx64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-osx-x64.zip`
        };

        // Create progress bars for each download
        console.log(color.magenta(`Downloading NW.js version: ${installVersion}\n`));
        const progressBars = {};
        for (var dir of checkDirs) {
            let label;
            switch (dir) {
                case "win64": label = color.cyan("Windows 64-bit"); break;
                case "win32": label = color.cyan("Windows 32-bit"); break;
                case "linux64": label = color.yellow(" Linux 64-bit "); break;
                case "linux32": label = color.yellow(" Linux 32-bit "); break;
                case "osx64": label = color.magenta("MacOS X 64-bit"); break;
            }
            progressBars[dir] = progressBar.create(100, 0, { speed: "Wait...", platformName: label });
        }

        // Start each download after the previous is completed
        for (var dir of checkDirs) {
            await downloadFile(urls[dir], dir, progressBars[dir]);
        }

        // When all downloads are completed, let the user know
        console.log(color.green("\nAll files downloaded!"));
    
        // Write the version that was installed to a file
        if (!fs.existsSync(filePath())) {
            fs.mkdirSync(filePath(), { recursive: true });
            fs.writeFileSync(path.join(filePath(), "installedversion.freshnw"), installVersion);
        } else {
            fs.writeFileSync(path.join(filePath(), "installedversion.freshnw"), installVersion);
        }
        
        // Then exit
        setTimeout(() => { process.exit(0) }, 500);
    });
}).on("error", console.error);

// Download function
var completedDLs = 0;
function downloadFile(url, type, progress) {
    return new Promise((resolve) => {
        const dl = new DownloaderHelper(url, path.join(__dirname, "temp"));

        dl.on("progress", (stats) => {
            const percentage = Math.round(stats.progress);
            const speed = (((stats.speed / 1024) / 1000).toFixed(2)).toString() + " MB/s";
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
            progress.update(0, { speed: "Starting..." });
        });

        dl.start().catch(err => {
            console.error(err);
            resolve();
        });
    });
}
