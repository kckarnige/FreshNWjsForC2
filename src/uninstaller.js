const fs = require('fs');
const path = require('path');


if (fs.existsSync(path.join(process.env.ProgramFiles, 'NWjsForC2'))) {
    fs.rmSync(path.join(process.env.ProgramFiles, 'NWjsForC2'), { recursive: true, force: true })
    console.log("Deconstructed!")
} else {
    console.log("Nothing to deconstruct!")
}