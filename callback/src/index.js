import "./styles.css";

require("util.promisify/shim")();
import { promisify } from "util";
import Blockly from "node-blockly/browser";
import {
  // actionNames,
  initialize
  // cancelActionGoals,
  // off
} from "cycle-robot-drivers-async";

let settings = {};
try {
  settings = require("./settings.json");
} catch (e) {}

//------------------------------------------------------------------------------
// Blockly Definitions

Blockly.defineBlocksWithJsonArray([
  {
    type: "controls_repeat_ext_with_sleep",
    message0: "%{BKY_CONTROLS_REPEAT_TITLE}",
    args0: [
      {
        type: "input_value",
        name: "TIMES",
        check: "Number"
      }
    ],
    message1: "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    args1: [
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: "loop_blocks",
    tooltip: "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
    helpUrl: "%{BKY_CONTROLS_REPEAT_HELPURL}"
  },
  {
    type: "controls_whileUntil_with_sleep",
    message0: "%1 %2",
    args0: [
      {
        type: "field_dropdown",
        name: "MODE",
        options: [
          ["%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_WHILE}", "WHILE"],
          ["%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL}", "UNTIL"]
        ]
      },
      {
        type: "input_value",
        name: "BOOL",
        check: "Boolean"
      }
    ],
    message1: "%{BKY_CONTROLS_REPEAT_INPUT_DO} %1",
    args1: [
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    style: "loop_blocks",
    helpUrl: "%{BKY_CONTROLS_WHILEUNTIL_HELPURL}",
    extensions: ["controls_whileUntil_tooltip"]
  },
  {
    type: "start_program",
    message0: "start program %1 %2",
    args0: [
      {
        type: "input_dummy"
      },
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    colour: 290,
    tooltip: "",
    helpUrl: ""
  }
  //   {
  //     type: "start_sleeping",
  //     message0: "start sleeping for %1",
  //     args0: [
  //       {
  //         type: "input_value",
  //         name: "SE",
  //         check: "Number"
  //       }
  //       // {
  //       //   type: "input_statement",
  //       //   name: "DO"
  //       // }
  //     ],
  //     previousStatement: null,
  //     nextStatement: null,
  //     colour: 230,
  //     tooltip: "",
  //     helpUrl: ""
  //   },
  //   {
  //     type: "set_message",
  //     message0: "set message %1",
  //     args0: [
  //       {
  //         type: "input_value",
  //         name: "MESSAGE",
  //         check: ["String", "Number"]
  //       }
  //     ],
  //     previousStatement: null,
  //     nextStatement: null,
  //     colour: 230,
  //     tooltip: "",
  //     helpUrl: ""
  //   },
  //   {
  //     type: "start_following_face",
  //     message0: "start following face",
  //     previousStatement: null,
  //     nextStatement: null,
  //     colour: 230,
  //     tooltip: "",
  //     helpUrl: ""
  //   },
  //   {
  //     type: "stop_following_face",
  //     message0: "stop following face",
  //     previousStatement: null,
  //     nextStatement: null,
  //     colour: 230,
  //     tooltip: "",
  //     helpUrl: ""
  //   },
  //   {
  //     type: "start_saying",
  //     message0: "start saying %1",
  //     args0: [
  //       {
  //         type: "input_value",
  //         name: "MESSAGE",
  //         check: ["String", "Number"]
  //       }
  //     ],
  //     previousStatement: null,
  //     nextStatement: null,
  //     colour: 230,
  //     tooltip: "",
  //     helpUrl: ""
  //   },
  //   {
  //     type: "start_gesturing",
  //     message0: "start gesturing %1",
  //     args0: [
  //       {
  //         type: "field_dropdown",
  //         name: "MESSAGE",
  //         options: [
  //           ["happy", '"HAPPY"'],
  //           ["sad", '"SAD"'],
  //           ["angry", '"ANGRY"'],
  //           ["focused", '"FOCUSED"'],
  //           ["confused", '"CONFUSED"']
  //         ]
  //       }
  //       // {
  //       //   type: "input_dummy"
  //       // },
  //       // {
  //       //   type: "input_statement",
  //       //   name: "DO"
  //       // }
  //     ],
  //     previousStatement: null,
  //     nextStatement: null,
  //     colour: 230,
  //     tooltip: "",
  //     helpUrl: ""
  //   },
  //   {
  //     type: "when",
  //     message0: "when %1 %2 %3",
  //     args0: [
  //       {
  //         type: "field_dropdown",
  //         name: "SE",
  //         options: [
  //           ["humanFaceDirectionChanged", '"humanFaceDirectionChanged"'],
  //           ["isHumanSpeakingChanged", '"isHumanSpeakingChanged"'],
  //           ["humanLooksAtCenter", '"humanFaceLookingAtCenter"'],
  //           ["humanLooksAtLeft", '"humanFaceLookingAtLeft"'],
  //           ["humanLooksAtRight", '"humanFaceLookingAtRight"'],
  //           ["humanAppears", '"humanFaceFound"'],
  //           ["humanDisappears", '"noHumanFaceFound"'],
  //           ["humanSpeaks", '"isHumanSpeakingTrue"'],
  //           ["humanStopsSpeaking", '"isHumanSpeakingFalse"'],
  //           ["sleepDone", '"sleepDone"'],
  //           ["sayDone", '"sayDone"'],
  //           ["gestureDone", '"gestureDone"']
  //         ]
  //       },
  //       {
  //         type: "input_dummy"
  //       },
  //       {
  //         type: "input_statement",
  //         name: "DO"
  //       }
  //     ],
  //     colour: 210,
  //     tooltip: "",
  //     helpUrl: ""
  //   }
]);

//------------------------------------------------------------------------------
// Code Generators

// copied and modified
//   https://github.com/google/blockly/blob/23a78c89e4c0f2801768b5c55c7f91ac261f4bc6/generators/javascript/loops.js#L29-L55
Blockly.JavaScript["controls_repeat_ext_with_sleep"] = function(block) {
  // Repeat n times.
  if (block.getField("TIMES")) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue("TIMES")));
  } else {
    // External number.
    var repeats =
      Blockly.JavaScript.valueToCode(
        block,
        "TIMES",
        Blockly.JavaScript.ORDER_ASSIGNMENT
      ) || "0";
  }
  var branch = Blockly.JavaScript.statementToCode(block, "DO");
  // branch = Blockly.JavaScript.addLoopTrap(branch, block); // addLoopTrap doesn't do anything significant and throws error
  var code = "";
  var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
    "count",
    Blockly.Variables.NAME_TYPE
  );
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Blockly.JavaScript.variableDB_.getDistinctName(
      "repeat_end",
      Blockly.Variables.NAME_TYPE
    );
    code += "var " + endVar + " = " + repeats + ";\n";
  }
  code +=
    "for (var " +
    loopVar +
    " = 0; " +
    loopVar +
    " < " +
    endVar +
    "; " +
    loopVar +
    "++) {\n" +
    branch +
    "  await sleep(0.1);\n" +
    "}\n";
  return code;
};

// copied and modified
//   https://github.com/google/blockly/blob/23a78c89e4c0f2801768b5c55c7f91ac261f4bc6/generators/javascript/loops.js#L60-L72
Blockly.JavaScript["controls_whileUntil_with_sleep"] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue("MODE") == "UNTIL";
  var argument0 =
    Blockly.JavaScript.valueToCode(
      block,
      "BOOL",
      until
        ? Blockly.JavaScript.ORDER_LOGICAL_NOT
        : Blockly.JavaScript.ORDER_NONE
    ) || "false";
  var branch = Blockly.JavaScript.statementToCode(block, "DO");
  // branch = Blockly.JavaScript.addLoopTrap(branch, block); // addLoopTrap doesn't do anything significant and throws error
  if (until) {
    argument0 = "!" + argument0;
  }
  return "while (" + argument0 + ") {\n  await sleep(0.1);\n" + branch + "}\n";
  return "";
};

function check(block) {
  return (
    block.getRootBlock().type === "start_program" ||
    block.getRootBlock().type === "procedures_defnoreturn" ||
    block.getRootBlock().type === "when"
  );
}

// Blockly.JavaScript["start_sleeping"] = function(block) {
//   return check(block)
//     ? `startSleeping(${Blockly.JavaScript.valueToCode(
//         block,
//         "SE",
//         Blockly.JavaScript.ORDER_ATOMIC
//       )});\n`
//     : "";
// };

// Blockly.JavaScript["set_message"] = function(block) {
//   return check(block)
//     ? `setMessage(String(${Blockly.JavaScript.valueToCode(
//         block,
//         "MESSAGE",
//         Blockly.JavaScript.ORDER_ATOMIC
//       )}));\n`
//     : "";
// };

// Blockly.JavaScript["start_following_face"] = function(block) {
//   return check(block) ? `startFollowingFace();\n` : "";
// };

// Blockly.JavaScript["stop_following_face"] = function(block) {
//   return check(block) ? `stopFollowingFace();\n` : "";
// };

// Blockly.JavaScript["start_saying"] = function(block) {
//   return check(block)
//     ? `startSaying(String(${Blockly.JavaScript.valueToCode(
//         block,
//         "MESSAGE",
//         Blockly.JavaScript.ORDER_ATOMIC
//       )}));\n`
//     : "";
// };

// Blockly.JavaScript["start_gesturing"] = function(block) {
//   return check(block)
//     ? `startGesturing(String(${block.getFieldValue("MESSAGE")}));\n`
//     : "";
// };

// Blockly.JavaScript["when"] = function(block) {
//   const id = Math.floor(Math.random() * Math.pow(10, 8));
//   const stmtCode = Blockly.JavaScript.statementToCode(block, "DO");
//   return stmtCode !== ""
//     ? `when(${id}, ${block.getFieldValue("SE")}, (res, err) => {\n${stmtCode}})`
//     : "";
// };

// Blockly.JavaScript["start_program"] = function(block) {
//   const stmtCode = Blockly.JavaScript.statementToCode(block, "DO");
//   return stmtCode !== ""
//     ? `(async () => {\n${Blockly.JavaScript.statementToCode(
//         block,
//         "DO"
//       )}})();\n`
//     : "";
// };

//------------------------------------------------------------------------------
// UI Logic

let editor;

function render(element, toolbox) {
  if (editor) {
    editor.dispose();
  }
  editor = Blockly.inject(element, {
    toolbox: document.getElementById(toolbox)
  });
  Blockly.Xml.domToWorkspace(document.getElementById("startBlocks"), editor);
  // editor.addChangeListener(() =>
  //   console.debug(Blockly.JavaScript.workspaceToCode(editor))
  // );
  return editor;
}

editor = render("editor", "toolbox");

const sources = initialize({
  container: document.getElementById("app"),
  styles: {
    speechbubblesOuter: {
      width: "585px"
    },
    robotSpeechbubble: {
      styles: {
        message: { fontSize: "60px" },
        button: { fontSize: "48px" }
      }
    },
    humanSpeechbubble: {
      styles: {
        message: { fontSize: "60px" },
        button: { fontSize: "48px" }
      }
    }
  },
  TabletFace: {
    styles: {
      faceHeight: "480px",
      faceWidth: "640px",
      eyeSize: "160px"
    }
  }
});

const _exit = [1];

function stop() {
  if (_exit.length > 0) {
    _exit[_exit.length - 1] = true;
  }
  for (const key in _stop) {
    _stop[key] = true;
  }
  off();
  cancelActionGoals();
}

function run(code) {
  // stop previously ran code
  stop();
  // patch & run code
  const patched = code.replace(
    /;\n/g,
    `; if (_exit[${_exit.length}]) return;\n`
  );
  const wrapped = `_exit[${_exit.length}] = false;
(async () => {
await sleep(0.5); // HACK to wait until all actions are cancelled
${patched}})();`;

  // (code =>
  //   Function(
  //     '"use strict";return (function(promisify, _exit, _stop, say, express, sleep, displayText, displayButton, waitForEvent, waitForAll, waitForOne, isSaying, isExpressing, isDisplayingText, isDisplayingButton) {' +
  //       code +
  //       "})"
  //   )()(
  //     promisify,
  //     _stop,
  //     _exit,
  //     say,
  //     express,
  //     sleep,
  //     displayText,
  //     displayButton,
  //     waitForEvent,
  //     waitForAll,
  //     waitForOne,
  //     isSaying,
  //     isExpressing,
  //     isDisplayingText,
  //     isDisplayingButton
  //   ))(wrapped);
}

document.getElementById("run").onclick = () => {
  const code = Blockly.JavaScript.workspaceToCode(editor);
  run(code);
};

document.getElementById("stop").onclick = stop;

let startTime = Date.now();
document.getElementById("download_xml").onclick = () => {
  const workspace = Blockly.getMainWorkspace();
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText =
    Blockly.Xml.domToText(xml) +
    `\n<!-- ${startTime} -->\n<!-- ${Date.now()} -->`;
  const a = document.createElement("a");
  a.id = "xml";
  a.href = "data:text/xml;charset=utf-8," + encodeURIComponent(xmlText);
  a.download = "blocks";
  a.click();
};

document.getElementById("load_xml").onchange = e => {
  const xmlFile = e.target.files[0];
  const reader = new FileReader();
  reader.onload = evt => {
    const xmlText = evt.target.result;
    var xmlDom = Blockly.Xml.textToDom(xmlText);
    var workspace = Blockly.getMainWorkspace();
    workspace.clear();
    Blockly.Xml.domToWorkspace(xmlDom, workspace);
  };
  reader.readAsText(xmlFile);
};
