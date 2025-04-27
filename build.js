const { compile } = require("nexe");
const package = require("./package.json");
const color = require("ansi-colors");

color.enabled = false;
color.enabled = require("color-support").hasBasic;

var compileOptions = {
  name: "./dist/FreshNW.exe",
  input: "./src/main.js",
  target: "windows-x64-22.15.0",
  ico: "./icon.ico",
  build: true,
  rc: {
    CompanyName: package.author,
    FileDescription: `Licensed under ${package.license}`,
    ProductName: "Fresh NW for Construct 2",
    InternalName: package.name,
    LegalCopyright: `Copyright ${package.author} 2025`,
    OriginalFilename: "FreshNW.exe",
    ProductVersion: package.version,
    FileVersion: package.version,
  },
  clean: false
}

compile(compileOptions).then(() => {
  if (compileOptions.clean) {
    console.clear()
    console.log(color.green("Successfully cleaned!\n"))
  } else {
    console.clear()
    console.log(color.green("Successfully compiled executable!"))
    console.log(color.magenta("The file should be located in the \"dist\" folder.\n"))
  }
})