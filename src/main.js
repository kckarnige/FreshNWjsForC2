const https = require("https");
const fs = require("fs");
const path = require("path");
const { DownloaderHelper } = require("node-downloader-helper");
const cliProgress = require("cli-progress");
const color = require("ansi-colors");
const tar = require("tar");
const AdmZip = require("adm-zip");


console.clear();
color.enabled = false;
color.enabled = require("color-support").hasBasic;

// ======= // Important Variables // ======= //

const configPath = path.join(process.cwd(), 'config.json');
var config;
var filePath;
const checkDirs = ["win64", "win32", "linux64", "linux32", "osx64"];
const progressBar = new cliProgress.MultiBar({
    format: ` ‖{bar}‖  {platformName}  ‖ {speed} ‖ {percentage}%`,
    barCompleteChar: "█",
    barIncompleteChar: " ",
    hideCursor: true,
    linewrap: true
});

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

// ======= // Startup Check // ======= //

function startUpCheck() {
    return new Promise((resolve) => {
        console.log(color.magenta("Verifying config file..."))

        var defaultConfig = {
            "preferedVersion": "latest",
            "deleteTempDirAfterInstall": true,
            "localInstall": false,
            "sdkBuild": false,
            "skipVersionCheck": false
        }

        if (!fs.existsSync(path.join(process.cwd(), "./config.json"))) {
            fs.writeFile(path.join(process.cwd(), "./config.json"), JSON.stringify(defaultConfig, null, 4), null, (err) => {
                if (err) {
                    console.log(color.red(`An error occurred: ${err}`));
                } else {
                    console.log(color.green("Config file created!"))

                    filePath = () => {
                        if (!config.localInstall) return path.join(process.env.ProgramFiles, "NWjsForC2").toString()
                        else return path.join(process.cwd(), "NWjsForC2").toString()
                    }
                    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                    resolve();
                };
            })
        } else {
            console.log(color.green("Config file exists!"))

            filePath = () => {
                if (!config.localInstall) return path.join(process.env.ProgramFiles, "NWjsForC2").toString()
                else return path.join(process.cwd(), "NWjsForC2").toString()
            }
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (config.preferedVersion === undefined ||
                config.deleteTempDirAfterInstall === undefined ||
                config.localInstall === undefined ||
                config.sdkBuild === undefined ||
                config.skipVersionCheck === undefined
            ) {
                console.log(color.red("Config file is incomplete!"))
                console.log(color.magenta("Regenerating config file...\n"))
                fs.rm(path.join(process.cwd(), "./config.json"), () => {
                    fs.writeFile(path.join(process.cwd(), "./config.json"), JSON.stringify(defaultConfig, null, 4), null, (err) => {
                        if (err) {
                            console.log(color.red(`An error occurred: ${err}`));
                        } else {
                            console.log(color.green("Config file created!"))
                            setTimeout(() => { resolve() }, 500);
                        };
                    })
                })
            } else {
                resolve();
            }
        }
    })
}

// Check if temp folder exists before anything, and get rid of it
if (fs.existsSync(path.join(process.cwd(), "temp"))) {
    fs.rmSync(path.join(process.cwd(), "temp"), { recursive: true, force: true })
}

// ======= // Version/Update Check // ======= //

function updateCheck() {
    console.clear();
    return new Promise((resolve) => {

        console.log(color.magenta("Verifying installation..."))

        fs.readFile(path.join(filePath().trim(), "installedversion.freshnw"), "utf8", (err, fileData) => {

            https.get("https://registry.npmjs.com/nw", (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    const latestVersion = JSON.parse(data)["dist-tags"].latest;

                    if (config.preferedVersion != "latest") {
                        console.log(color.magenta("Prefered version found:", config.preferedVersion));
                        if (!err && fileData.trim() != config.preferedVersion) {
                            console.log(color.yellow("Version file does not match the prefered version. Updating..."));
                            resolve();
                        } else if (!err) {
                            console.log(color.green("Prefered version already installed."));
                            process.exit(1);
                        }
                    } else {
                        console.log(color.yellow(`Checking for updates. Latest NW version: ${latestVersion}`));
                    }



                    // Checking currently installed version via a file, and creating it if it doesn't exist
                    if (err) {
                        const foundDir = checkDirs.find(dir => fs.existsSync(path.join(filePath(), dir)));
                        if (foundDir) {
                            if (["unins000.dat"].find(dir => fs.existsSync(path.join(filePath(), dir)))) {
                                console.log(color.red("Detected \"unins000.dat\"! Please uninstall \"NWjsForC2\" then try again!"));
                                process.exit(1);
                            } else {
                                console.log(color.yellow("Detected an install without a version file! Removing installed files and attempting to reinstall..."));
                                checkDirs.forEach(dir => {
                                    if (fs.existsSync(path.join(filePath(), dir))) {
                                        fs.rmSync(path.join(filePath(), dir), { recursive: true, force: true })
                                    }
                                })
                            }
                        }
                        if (!fs.existsSync(filePath())) {
                            fs.mkdirSync(filePath(), { recursive: true });
                        }
                        console.log(color.yellow("Version file not found. Attempting to create..."));
                        resolve();
                    } else if (config.preferedVersion === "latest" && fileData.trim() != latestVersion) {
                        console.log(color.yellow("Installed version is not the latest. Updating..."));
                        resolve();
                    } else if (config.preferedVersion === "latest") {
                        console.log(color.green("Already up-to-date."));
                        process.exit(1);
                    }
                });
            })
                .on("error", console.error)
        });
    })
}

// ======= // Downloader // ======= //

function downloadFiles() {
    console.clear();
    return new Promise((resolve) => {

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
                if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
                    fs.mkdirSync(path.join(process.cwd(), "temp"), { recursive: true });
                }

                // Remove directories if they already exist
                checkDirs.forEach(dir => fs.rmSync(path.join(filePath(), dir), { recursive: true, force: true }));

                // Define URLs for different platforms
                var urls = {};

                // Set download for SDK build if specified
                if (!config.sdkBuild) {
                    urls = {
                        win64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-win-x64.zip`,
                        win32: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-win-ia32.zip`,
                        linux64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-linux-x64.tar.gz`,
                        linux32: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-linux-ia32.tar.gz`,
                        osx64: `https://dl.nwjs.io/v${installVersion}/nwjs-v${installVersion}-osx-x64.zip`
                    }
                    console.log(color.magenta(`Downloading NW.js version: ${installVersion}\n`));
                } else {
                    urls = {
                        win64: `https://dl.nwjs.io/v${installVersion}/nwjs-sdk-v${installVersion}-win-x64.zip`,
                        win32: `https://dl.nwjs.io/v${installVersion}/nwjs-sdk-v${installVersion}-win-ia32.zip`,
                        linux64: `https://dl.nwjs.io/v${installVersion}/nwjs-sdk-v${installVersion}-linux-x64.tar.gz`,
                        linux32: `https://dl.nwjs.io/v${installVersion}/nwjs-sdk-v${installVersion}-linux-ia32.tar.gz`,
                        osx64: `https://dl.nwjs.io/v${installVersion}/nwjs-sdk-v${installVersion}-osx-x64.zip`
                    }
                    console.log(color.magenta(`Downloading NW.js version: ${installVersion} (SDK Build)\n`));
                }

                // Create progress bars for each download
                var dir;
                const progressBars = {};
                for (dir of checkDirs) {
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
                for (dir of checkDirs) {
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
                setTimeout(() => { resolve() }, 500);
            });
        }).on("error", console.error);

        // Download function
        var completedDLs = 0;
        function downloadFile(url, type, progress) {
            return new Promise((resolve) => {
                const dl = new DownloaderHelper(url, path.join(process.cwd(), "temp"));

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
                    if (completedDLs === 5) {
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
    })
}

// ======= // Installer // ======= //

function installFiles() {
    console.clear();
    return new Promise((resolve) => {

        console.log(color.yellow("Will be installed to: " + filePath()))
        console.log(color.magenta(`Starting install process...\n`))

        // Read the installed version
        fs.readFile(path.join(filePath(), "installedversion.freshnw"), (err, installVersionRaw) => {
            if (err) return console.log(color.red("Error reading version file:"), err);
            var yesDK = "";
            if (config.sdkBuild) yesDK = "-sdk";
            const installVersion = installVersionRaw.toString().trim();
            let installCount = 0;

            const installPromises = checkDirs.map(dir => {
                if (dir === "win64") {
                    console.log("Installing for " + color.cyan("Windows 64-bit") + "...");
                    return extractZip(path.join(process.cwd(), "temp", `nwjs${yesDK}-v${installVersion}-win-x64.zip`), filePath())
                        .then(() => {
                            installCount++;
                            fs.renameSync(path.join(filePath(), `nwjs${yesDK}-v${installVersion}-win-x64`), path.join(filePath(), dir));
                        });
                } else if (dir === "win32") {
                    console.log("Installing for " + color.cyan("Windows 32-bit") + "...");
                    return extractZip(path.join(process.cwd(), "temp", `nwjs${yesDK}-v${installVersion}-win-ia32.zip`), filePath())
                        .then(() => {
                            installCount++;
                            fs.renameSync(path.join(filePath(), `nwjs${yesDK}-v${installVersion}-win-ia32`), path.join(filePath(), dir));
                        });
                } else if (dir === "linux64") {
                    console.log("Installing for " + color.yellow("Linux 64-bit") + "...");
                    return tar.x({
                        file: path.join(process.cwd(), "temp", `nwjs${yesDK}-v${installVersion}-linux-x64.tar.gz`),
                        C: filePath()
                    })
                        .then(() => {
                            installCount++;
                            fs.renameSync(path.join(filePath(), `nwjs${yesDK}-v${installVersion}-linux-x64`), path.join(filePath(), dir));
                        });
                } else if (dir === "linux32") {
                    console.log("Installing for " + color.yellow("Linux 32-bit") + "...");
                    return tar.x({
                        file: path.join(process.cwd(), "temp", `nwjs${yesDK}-v${installVersion}-linux-ia32.tar.gz`),
                        C: filePath()
                    })
                        .then(() => {
                            installCount++;
                            fs.renameSync(path.join(filePath(), `nwjs${yesDK}-v${installVersion}-linux-ia32`), path.join(filePath(), dir));
                        });
                } else if (dir === "osx64") {
                    console.log("Installing for " + color.magenta("MacOS X 64-bit") + "...");
                    return extractZip(path.join(process.cwd(), "temp", `nwjs${yesDK}-v${installVersion}-osx-x64.zip`), filePath())
                        .then(() => {
                            installCount++;
                            fs.renameSync(path.join(filePath(), `nwjs${yesDK}-v${installVersion}-osx-x64`, "nwjs.app"), path.join(filePath(), dir));
                            fs.rmSync(path.join(filePath(), `nwjs${yesDK}-v${installVersion}-osx-x64`), { recursive: true, force: true });
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
                            console.log(color.yellow("The \"NWjsForC2\" folder needs to be moved to your 'Program Files' folder to function.\n"));
                        } else console.log("")
                    } else {
                        console.log(color.red(`${(checkDirs.length - installCount)} of ${checkDirs.length} platform(s) failed to install!\n\nDisable "deleteTempDirAfterInstall" in your config.json and check if the files download correctly.\n\nMake sure to check your internet connection. If it's not that, try running "pnpm reconstruct".\n`));
                    }

                    if (config.deleteTempDirAfterInstall === true) {
                        const tempPath = path.join(process.cwd(), "temp");
                        if (fs.existsSync(tempPath)) {
                            fs.rmSync(tempPath, { recursive: true, force: true });
                        }
                    }
                    resolve();
                });
        });
    })
}

// ======= // Start // ======= //

startUpCheck().then(() => {
    if (process.argv.includes("--uninstall")) {
        if (fs.existsSync(filePath())) {
            fs.rmSync(filePath(), { recursive: true, force: true });
            console.log(color.green("Deconstructed!"));
            console.log(color.magenta(filePath()));
        } else {
            console.log(color.red("Tried to deconstruct, but there was nothing there!"));
            console.log(color.magenta(filePath()));
        }
    } else {
        if (process.argv.includes("--nocheck") || process.argv.includes("--force") || config.skipVersionCheck) {
            downloadFiles().then(() => {
                installFiles()
            })
        } else {
            updateCheck().then(() => {
                downloadFiles().then(() => {
                    installFiles()
                })
            })
        }
    }
})