const https = require("https");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const color = require("ansi-colors");

console.clear();
color.enabled = false;
color.enabled = require("color-support").hasBasic;

console.log(color.magenta("Verifying installation..."))

const programFilesPath = process.env.ProgramFiles;
var filePath = () => {
    if (!config.localInstall) return path.join(programFilesPath, "NWjsForC2").toString()
    else return path.join(__dirname, "NWjsForC2").toString()
}
const checkDirs = ["win64", "win32", "linux64", "linux32", "osx64"];

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
                    process.exit(0);
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
            } else if (config.preferedVersion == "latest" && fileData.trim() != latestVersion) {
                console.log(color.yellow("Installed version is not the latest. Updating..."));
            } else if (config.preferedVersion == "latest") {
                console.log(color.green("Already up-to-date."));
                process.exit(1);
            }
        });
    })
        .on("error", console.error)
});