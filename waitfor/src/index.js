import "./styles.css";

require("util.promisify/shim")();
import { promisify } from "util";
import Blockly from "node-blockly/browser";
import {
  initialize,
  cancelActionGoals,
  off
} from "cycle-robot-drivers-async";
import robot from "cycle-robot-drivers-async/api";

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
    type: "sleep",
    message0: "sleep for %1",
    args0: [
      {
        type: "input_value",
        name: "ARG0",
        check: "Number"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "display_text",
    message0: "display text %1 %2",
    args0: [
      {
        type: "input_value",
        name: "TEXT",
        check: ["String", "Number"]
      },
      {
        type: "input_value",
        name: "DURATION",
        check: ["Number"]
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "display_button",
    message0: "display button %1 %2",
    args0: [
      {
        type: "input_value",
        name: "BUTTONS"
      },
      {
        type: "input_value",
        name: "DURATION",
        check: ["Number"]
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "say",
    message0: "say %1",
    args0: [
      {
        type: "input_value",
        name: "TEXT",
        check: ["String", "Number"]
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "express",
    message0: "express  %1",
    args0: [
      {
        type: "field_dropdown",
        name: "EXPRESSION",
        options: [
          ["happy", '"HAPPY"'],
          ["sad", '"SAD"'],
          ["angry", '"ANGRY"'],
          ["focused", '"FOCUSED"'],
          ["confused", '"CONFUSED"']
        ]
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_state",
    message0: "get state of %1",
    args0: [
      {
        type: "field_dropdown",
        name: "TYPE",
        options: [
          ["isSaying", "isSaying"],
          ["isExpressing", "isExpressing"],
          ["isDisplayingText", "isDisplayingText"],
          ["isDisplayingButton", "isDisplayingButton"]
        ]
      }
    ],
    output: "String",
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "wait_for_event",
    message0: "wait for event %1",
    args0: [
      {
        type: "field_dropdown",
        name: "SE",
        options: [
          ["speechDetected", '"speechDetected"'],
          ["buttonPressed", '"buttonPressed"']
        ]
      }
    ],
    output: null,
    colour: 210,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "wait_for_all",
    message0: "wait for all %1 %2 %3",
    args0: [
      {
        type: "input_dummy"
      },
      {
        type: "input_statement",
        name: "DO0",
        check: "Action"
      },
      {
        type: "input_statement",
        name: "DO1",
        check: "Action"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "wait_for_one",
    message0: "wait for one %1 %2 %3",
    args0: [
      {
        type: "input_dummy"
      },
      {
        type: "input_statement",
        name: "DO0",
        check: "Action"
      },
      {
        type: "input_statement",
        name: "DO1",
        check: "Action"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "start_program",
    message0: "start program",
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  }
  //----------------------------------------------------------------------------
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
  return "while (" + argument0 + ") {\n" + branch + "  await sleep(0.1);\n}\n";
  return "";
};

function check(block) {
  return (
    block.getRootBlock().type === "start_program" ||
    block.getRootBlock().type === "procedures_defnoreturn"
  );
}

Blockly.JavaScript["sleep"] = function(block) {
  return check(block)
    ? `await robot.sleep(${Blockly.JavaScript.valueToCode(
        block,
        "ARG0",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
    : "";
};

Blockly.JavaScript["display_text"] = function(block) {
  return check(block)
    ? `await robot.displayText(${Blockly.JavaScript.valueToCode(
        block,
        "TEXT",
        Blockly.JavaScript.ORDER_ATOMIC
      )}, ${Blockly.JavaScript.valueToCode(
        block,
        "DURATION",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
    : "";
};

Blockly.JavaScript["display_button"] = function(block) {
  return check(block)
    ? `await robot.displayButton(${Blockly.JavaScript.valueToCode(
        block,
        "BUTTONS",
        Blockly.JavaScript.ORDER_ATOMIC
      )}, ${Blockly.JavaScript.valueToCode(
        block,
        "DURATION",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
    : "";
};

Blockly.JavaScript["say"] = function(block) {
  return check(block)
    ? `await robot.say(${Blockly.JavaScript.valueToCode(
        block,
        "TEXT",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
    : "";
};

Blockly.JavaScript["express"] = function(block) {
  return check(block)
    ? `await robot.express(${block.getFieldValue("EXPRESSION")});\n`
    : "";
};

Blockly.JavaScript["get_state"] = function(block) {
  const code = check(block)
    ? `await robot.${block.getFieldValue("TYPE").replace(/['"]+/g, "")}()`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["wait_for_event"] = function(block) {
  const code = check(block)
    ? `await robot.waitForEvent(String(${block.getFieldValue("SE")}))`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["wait_for_all"] = function(block) {
  return check(block)
    ? `await robot.waitForAll([${[0, 1]
        .map(
          i =>
            `promisify(async cb => {\n${Blockly.JavaScript.statementToCode(
              block,
              `DO${i}`
            )}  cb(null, null);\n})()`
        )
        .join(", ")}]);\n`
    : "";
};

const _stop = [];

Blockly.JavaScript["wait_for_one"] = function(block) {
  const id = block.id;
  return check(block)
    ? `robot._stop["${id}"] = false;\nawait robot.waitForOne([${[0, 1]
        .map(
          i =>
            `robot.promisify(async cb => {\n${Blockly.JavaScript.statementToCode(
              block,
              `DO${i}`
            ).replace(
              /;\n/g,
              `; if (robot._stop["${block.id}"]) return;\n`
            )}  cb(null, null);\n})()`
        )
        .join(", ")}]);\nrobot._stop["${block.id}"] = true;\n`
    : "";
};

Blockly.JavaScript["start_program"] = function(block) {
  return "";
};

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

// "_stop" is defined above Blockly.JavaScript["wait_for_one"] ...
const _exit = [];

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
    `; if (robot._exit[${_exit.length}]) return;\n`
  );
  const wrapped = `robot._exit[${_exit.length}] = false;
(async () => {
await robot.sleep(0.5); // HACK to wait until all actions are cancelled
${patched}})();`;

  (code =>
    Function('"use strict";return (function(robot) {' + code + "})")()(
      Object.assign({ promisify, _stop, _exit }, robot)
    ))(wrapped);
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
