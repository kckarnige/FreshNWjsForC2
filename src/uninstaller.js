const fs = require("fs");
const path = require("path");
const config = require("./config.json");
const color = require("ansi-colors");

console.clear();
color.enabled = false;
color.enabled = require("color-support").hasBasic;

var filePath = () => {
    if (!config.localInstall) return path.join(process.env.ProgramFiles, "NWjsForC2").toString()
    else return path.join(__dirname, "NWjsForC2").toString()
}
if (fs.existsSync(filePath())) {
    fs.rmSync(filePath(), { recursive: true, force: true });
    console.log(color.green("Deconstructed!"));
    console.log(color.magenta(filePath()));
} else {
    console.log(color.red("Tried to deconstruct, but there was nothing there!"));
    console.log(color.magenta(filePath()));
}