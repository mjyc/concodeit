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

const countElseIfs = (progXMLStr) =>
  (progXMLStr.match(/<mutation elseif=/g) || []).length;

// Builds dictionary of <block type, # of block type> pairs
const countBlocksByType = (progXMLStr, { knownBlockTypes } = {}) => {
  const blocks = progXMLStr.match(/<block type="\w+"/g) || [];
  const counts = {};
  for (let i = 0; i < blocks.length; i++) {
    let blockType = blocks[i].slice(13, blocks[i].length - 1);
    if (counts[blockType]) {
      counts[blockType] += 1;
    } else {
      counts[blockType] = 1;
    }
  }

  const countsOut = Object.assign(
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
  const knownBlockTypes = [
    "action_state",
    "controls_if",
    "controls_repeat_ext_with_sleep",
    "controls_whileUntil_with_sleep",
    "display_button",
    "display_text",
    "gesture",
    "last_detected_event",
    "lists_create_with",
    "lists_getIndex",
    "lists_getSublist",
    "lists_indexOf",
    "lists_isEmpty",
    "lists_length",
    "lists_repeat",
    "lists_setIndex",
    "lists_sort",
    "lists_split",
    "logic_boolean",
    "logic_compare",
    "logic_negate",
    "logic_null",
    "logic_operation",
    "logic_ternary",
    "math_arithmetic",
    "math_constant",
    "math_number",
    "math_single",
    "math_trig",
    "pass",
    "procedures_callnoreturn",
    "procedures_callreturn",
    "procedures_defnoreturn",
    "procedures_defreturn",
    "procedures_ifreturn",
    "reset_event",
    "say",
    "sleep",
    "start_program",
    "stop_action",
    "text",
    "text_append",
    "text_changeCase",
    "text_charAt",
    "text_getSubstring",
    "text_indexOf",
    "text_isEmpty",
    "text_join",
    "text_length",
    "text_print",
    "text_prompt_ext",
    "text_trim",
    "variables_get",
    "when",
    "wait_for_all",
    "wait_for_event",
    "wait_for_one",
  ];
  const numBlocksByType = countBlocksByType(progXMLStr, { knownBlockTypes });
  const numFunctions =
    numBlocksByType.procedures_defnoreturn +
    numBlocksByType.procedures_defreturn +
    numBlocksByType.when;
  const numVariables = countNumVariables(progXMLStr);
  const numElseIfs = countElseIfs(progXMLStr);
  const numBranches =
    numBlocksByType.controls_if + numBlocksByType.logic_ternary + numElseIfs;
  const numLoops =
    numBlocksByType.controls_repeat_ext_with_sleep +
    numBlocksByType.controls_whileUntil_with_sleep;
  const numConds =
    numBlocksByType.logic_compare +
    numBlocksByType.logic_operation +
    numBlocksByType.logic_negate;
  const numBlocks = countNumBlocks(progXMLStr);
  const numTotalBlocks = numBlocks + numVariables + numElseIfs;
  const maxDepth = getMaxDepth(progXMLStr);
  return Object.assign(
    {
      numFunctions,
      numVariables,
      numBranches,
      numLoops,
      numConds,
      numTotalBlocks,
      maxDepth,
    },
    numBlocksByType
  );
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
