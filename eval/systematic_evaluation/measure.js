const fs = require("fs");

if (process.argv.length <= 2) {
  console.log("Usage: node evalScript.js path/to/directory");
  process.exit(-1);
}

var programDir = process.argv[2];

fs.readdir(programDir, (err, files) => {
  for (var i = 0; i < files.length; i++) {
    let filename = files[i];
    let fullpath = programDir + "" + filename;
    if (filename.endsWith(".xml")) {
      fs.readFile(fullpath, (err, data) => {
        if (err) throw err;

        console.log("Stats for " + filename + "\n");

        let input = data.toString();

        // get list of blocks and variables used in program
        let blocks = input.match(/<block type="\w+"/g) || [];
        let variables = input.match(/<variable type=""/g) || [];

        // count number of each type of block used in program
        var blockCountDict = {};
        blockCountDict["variables"] = variables.length;
        let numIslands = populateBlockDict(blocks, blockCountDict);

        // get maximum depth of a nested scope in program
        let startReg = /<statement name/g,
          result,
          startIndices = [];
        while ((result = startReg.exec(input))) {
          startIndices.push(result.index);
        }
        let endReg = /<\/statement>/g,
          endIndices = [];
        while ((result = endReg.exec(input))) {
          endIndices.push(result.index);
        }
        if (filename.includes("Callback")) {
          // exclude the nested scope of the start program block for Callback API
          startIndices.pop();
          endIndices.pop();
        }
        let maxDepth = getMaxDepth(input, startIndices, endIndices);

        console.log("Total block count: " + blocks.length);
        //console.log("Count of each block type:");
        //console.log(blockCountDict);
        console.log("Number of islands: " + numIslands);
        console.log("Maximum depth: " + maxDepth);

        console.log("----------------------------------");
      });
    }
  }
});

// Builds dictionary of <block type, count of block type> pairs
function populateBlockDict(blocks, dict) {
  let islandCount = 0;
  for (var i = 0; i < blocks.length; i++) {
    let blockType = blocks[i].slice(13, blocks[i].length - 1);
    if (dict[blockType]) {
      dict[blockType] += 1;
    } else {
      dict[blockType] = 1;
    }
    islandCount +=
      blockType.includes("when") || blockType.includes("procedures_def")
        ? 1
        : 0;
  }
  return islandCount;
}

// Returns the maximum depth of a nested scope in the input program
function getMaxDepth(input, startIndices, endIndices) {
  var stack = [];
  let s_i = 0;
  let e_i = 0;
  let maxDepth = -1;
  while (e_i < endIndices.length) {
    let currEnd = endIndices[e_i];
    while (s_i < startIndices.length && startIndices[s_i] < currEnd) {
      stack.push(startIndices[s_i++]);
    }
    if (s_i < startIndices.length || e_i < endIndices.length) {
      let start = stack.pop();
      let subInput = input.slice(start, currEnd);
      let depth = (subInput.match(/<next>/g) || []).length + 1;
      maxDepth = Math.max(maxDepth, depth);
      input =
        input.substring(0, start) +
        subInput.replace("<next>", "<abcd>") +
        input.substring(currEnd);
      e_i++;
    }
  }
  return maxDepth;
}
