const fs = require('fs')

if (process.argv.length <= 2) {
    console.log("Usage: node evalScript.js path/to/directory");
    process.exit(-1);
}

var programDir = process.argv[2];

fs.readdir(programDir, (err, files) => {
    for (var i = 0; i < files.length; i++) {
        let filename = files[i];
        let fullpath = programDir + '' + filename;
        if (filename.endsWith(".xml")) {
            fs.readFile(fullpath, (err, data) => {
                if (err) throw err;
                console.log("Block count in " + filename + ": " + (data.toString().match(/<block /g) || []).length);
            });
        }
    }
});
