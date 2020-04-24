if (process.argv.length <= 2) {
  console.log("Usage: node measure.js path/to/directory");
  process.exit(-1);
}

const fs = require("fs");

const readProgXMLFile = (filename) => fs.readFileSync(filename).toString();

const countNumBlocks = (progXMLStr) =>
  (progXMLStr.match(/<block type="\w+"/g) || []).length;

const countNumVariables = (progXMLStr) =>
  (progXMLStr.match(/<variable type=""/g) || []).length;

// Builds dictionary of <block type, # of block type> pairs
const countBlockByType = (progXMLStr, { knownBlockTypes } = {}) => {
  const blocks = progXMLStr.match(/<block type="\w+"/g) || [];
  const counts = {
    variables: countNumVariables(progXMLStr),
  };
  for (let i = 0; i < blocks.length; i++) {
    let blockType = blocks[i].slice(13, blocks[i].length - 1);
    if (counts[blockType]) {
      counts[blockType] += 1;
    } else {
      counts[blockType] = 1;
    }
  }

  const countsOut = Object.assign(
    {
      numBlockTypes: Object.keys(counts).length - 1,
      functions:
        (counts["when"] || 0) + (counts["procedures_defnoreturn"] || 0),
    },
    !knownBlockTypes
      ? counts
      : knownBlockTypes.reduce((prev, blockType) => {
          prev[blockType] = counts[blockType] || 0;
          return prev;
        }, {})
  );
  return countsOut;
};

// Returns the maximum depth of a nested scope in the given program xml string
const getMaxDepth = (progXMLStr) => {
  // get maximum depth of a nested scope in program
  let result;
  const startReg = /<statement name/g,
    startIndices = [];
  while ((result = startReg.exec(progXMLStr))) {
    startIndices.push(result.index);
  }
  const endReg = /<\/statement>/g,
    endIndices = [];
  while ((result = endReg.exec(progXMLStr))) {
    endIndices.push(result.index);
  }

  const stack = [];
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
      let subInput = progXMLStr.slice(start, currEnd);
      let depth = (subInput.match(/<next>/g) || []).length + 1;
      maxDepth = Math.max(maxDepth, depth);
      progXMLStr =
        progXMLStr.substring(0, start) +
        subInput.replace("<next>", "<abcd>") +
        progXMLStr.substring(currEnd);
      e_i++;
    }
  }
  return maxDepth;
};

const computeMeasures = (progXMLStr) => {
  const numBlocks = countNumBlocks(progXMLStr);
  const maxDepth = getMaxDepth(progXMLStr);
  const numVariables = countNumVariables(progXMLStr);
  const knownBlockTypes = [
    "start_program",
    "say",
    "text",
    "gesture",
    "controls_whileUntil_with_sleep",
    "logic_operation",
    "action_state",
    "sleep",
    "math_number",
    "text_isEmpty",
    "last_detected_event",
    "lists_create_with",
    "display_button",
    "pass",
    "variables_set",
    "logic_boolean",
    "when",
    "procedures_callnoreturn",
    "procedures_defnoreturn",
    "controls_if",
    "logic_negate",
    "variables_get",
    "wait_for_all",
    "wait_for_event",
    "wait_for_one",
  ];
  const numBlocksByType = countBlockByType(progXMLStr, { knownBlockTypes });
  return Object.assign({ numBlocks, maxDepth, numVariables }, numBlocksByType);
};

// main

const path = require("path");

const programDirname = process.argv[2];
const outputFormat = process.argv[3] || "csv";

const out = fs.readdirSync(programDirname).map((filename, index) => {
  const filepath = path.join(programDirname, filename);
  const progXMLStr = readProgXMLFile(filepath);
  const measures = Object.assign({ filename }, computeMeasures(progXMLStr));
  if (outputFormat === "json") return measures;
  if (index === 0) console.log(Object.keys(measures).join(","));
  console.log(Object.values(measures).join(","));
});

if (outputFormat !== "json") return;
console.log(JSON.stringify(out));
