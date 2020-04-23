if (process.argv.length <= 2) {
  console.log("Usage: node evalScript.js path/to/directory");
  process.exit(-1);
}

const fs = require("fs");

const readProgXMLFile = (filename) => fs.readFileSync(filename).toString();

const countNumBlocks = (progXMLStr) =>
  (progXMLStr.match(/<block type="\w+"/g) || []).length;

const countNumVariables = (progXMLStr) =>
  (progXMLStr.match(/<variable type=""/g) || []).length;

// Builds dictionary of <block type, # of block type> pairs
const countBlockByType = (progXMLStr) => {
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
  const countsOut = knownBlockTypes.reduce(
    (prev, blockType) => {
      prev[blockType] = counts[blockType] || 0;
      return prev;
    },
    {
      numBlockTypes: Object.keys(counts).length - 1,
      functions:
        (counts["when"] || 0) + (counts["procedures_defnoreturn"] || 0),
    }
  );
  return countsOut;
};

const parseXml = require("@rgrove/parse-xml");

// Returns the maximum depth of a nested scope in the input program xml string
const getMaxDepth = (progXMLStr) => {
  const progJSON = parseXml(progXMLStr).toJSON();
  console.log(JSON.stringify(progJSON, null, 2));
  return 1;
};

const computeMeasures = (progXMLStr) => {
  const numBlocks = countNumBlocks(progXMLStr);
  const numBlocksByType = countBlockByType(progXMLStr);
  const maxDepth = getMaxDepth(progXMLStr);
  return Object.assign({ numBlocks, maxDepth }, numBlocksByType);
};

// main

const path = require("path");

const programDirname = process.argv[2];

fs.readdirSync(programDirname).map((filename, index) => {
  const filepath = path.join(programDirname, filename);
  const progXMLStr = readProgXMLFile(filepath);
  const measures = Object.assign({ filename }, computeMeasures(progXMLStr));
  if (index === 0) console.log(Object.keys(measures).join(","));
  console.log(Object.values(measures).join(","));
});
