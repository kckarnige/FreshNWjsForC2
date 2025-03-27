const https = require('https');
const fs = require('fs');
const path = require('path');
const { DownloaderHelper } = require('node-downloader-helper');
const cliProgress = require('cli-progress');

console.log("Running...");

if (fs.existsSync(path.join(__dirname, "temp"))) {
    fs.rmSync(path.join(__dirname, "temp"), { recursive: true, force: true })
}
const programFilesPath = process.env.ProgramFiles;
const filePath = path.join(programFilesPath, 'NWjsForC2');
const checkDirs = ['win64', 'win32', 'linux64', 'linux32', 'osx64'];

const progressBar = new cliProgress.MultiBar({
    format: ` {bar} |  {platformName}  | {speed} MB/s | {percentage}%`,
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
    linewrap: true
});

// Fetch latest version from npm
https.get('https://registry.npmjs.com/nw', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
        const latestVersion = JSON.parse(data)['dist-tags'].latest;
        fs.writeFileSync(path.join(filePath, 'currentVersion'), latestVersion);
        if (!fs.existsSync(path.join(__dirname, "temp"))) {
            fs.mkdirSync(path.join(__dirname, "temp"), { recursive: true });
        }

        // URLs for different platforms
        const urls = {
            win64: `https://dl.nwjs.io/v${latestVersion}/nwjs-v${latestVersion}-win-x64.zip`,
            win32: `https://dl.nwjs.io/v${latestVersion}/nwjs-v${latestVersion}-win-ia32.zip`,
            linux64: `https://dl.nwjs.io/v${latestVersion}/nwjs-v${latestVersion}-linux-x64.tar.gz`,
            linux32: `https://dl.nwjs.io/v${latestVersion}/nwjs-v${latestVersion}-linux-ia32.tar.gz`,
            osx64: `https://dl.nwjs.io/v${latestVersion}/nwjs-v${latestVersion}-osx-x64.zip`
        };

        // Remove old directories
        checkDirs.forEach(dir => fs.rmSync(path.join(filePath, dir), { recursive: true, force: true }));

        // Start all downloads in parallel using Promise.all
        await Promise.all(checkDirs.map(dir => downloadFile(urls[dir], dir, latestVersion)));

        // Stop progress bar and exit
        progressBar.stop();
        console.clear();
        console.log("All files downloaded!");
        process.exit(0);
    });
}).on('error', console.error);

// Download function (returns a promise)
function downloadFile(url, type, latestVersion) {
    return new Promise((resolve, reject) => {
        if (!url) return resolve(); // Skip if URL is missing

        let progress = progressBar.create(100, 0);
        const dl = new DownloaderHelper(url, path.join(__dirname, "temp"));

        dl.on('progress', (stats) => {
            const percentage = Math.round(stats.progress);
            const speed = ((stats.speed / 1024) / 1000).toFixed(2);
            progress.update(percentage, { speed });
        });

        dl.on('end', () => {
            progressBar.remove(progress);
            resolve();
        });

        dl.on('error', (err) => {
            console.log(`Failed to download ${type}:`, err);
            progressBar.remove(progress);
            resolve(); // Do not reject to prevent `Promise.all()` from failing
        });

        dl.on('start', () => {
            console.clear();
            console.log('Downloading NW.js version:', latestVersion);
            if (type == "win64") {
                progress.start(100, 0, { speed: "0", downloaded: "0", total: "0", nwVersion: latestVersion, platformName: "Windows 64-bit" });
            } else
                if (type == "win32") {
                    progress.start(100, 0, { speed: "0", downloaded: "0", total: "0", nwVersion: latestVersion, platformName: "Windows 32-bit" });
                } else
                    if (type == "linux64") {
                        progress.start(100, 0, { speed: "0", downloaded: "0", total: "0", nwVersion: latestVersion, platformName: " Linux 64-bit " });
                    } else
                        if (type == "linux32") {
                            progress.start(100, 0, { speed: "0", downloaded: "0", total: "0", nwVersion: latestVersion, platformName: " Linux 32-bit " });
                        } else
                            if (type == "osx64") {
                                progress.start(100, 0, { speed: "0", downloaded: "0", total: "0", nwVersion: latestVersion, platformName: "MacOS X 64-bit" });
                            }
        });

        dl.start().catch(err => {
            console.error(err);
            resolve();
        });
    });
}
