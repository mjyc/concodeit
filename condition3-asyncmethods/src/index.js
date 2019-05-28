import "./styles.css";

import Blockly from "node-blockly/browser";
import {
  actionNames,
  initialize,
  makeSendGoal,
  makeCancelGoal
} from "cycle-robot-drivers-async";

//------------------------------------------------------------------------------
// Helper Function Definitions

const handles = {};

function sendActionGoal(actionName, goal) {
  return promisify((g, callback) => {
    handles[actionName] = makeSendGoal(actionName)(g, (err, val) => {
      if (val.status.status === "SUCCEEDED") {
        callback(null, val.result);
      } else {
        callback(null, null);
      }
    });
  })(goal);
}

//------------------------------------------------------------------------------
// Block Function Definitions

Blockly.defineBlocksWithJsonArray([
  {
    type: "display_message",
    message0: "display message %1",
    args0: [
      {
        type: "input_value",
        name: "MESSAGE",
        check: "String"
      }
    ],
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "getResult",
    message0: "get result %1",
    args0: [
      {
        type: "input_value",
        name: "GOALID"
      }
    ],
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "getStatus",
    message0: "get status %1",
    args0: [
      {
        type: "input_value",
        name: "GOALID"
      }
    ],
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "cancel",
    message0: "cancel %1",
    args0: [
      {
        type: "input_value",
        name: "GOALID"
      }
    ],
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "ask_multiple_choice",
    message0: "ask multiple choice %1",
    args0: [
      {
        type: "input_value",
        name: "CHOICES",
        check: "Array"
      }
    ],
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "cancel_display_message",
    message0: "cancel display message",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "cancel_ask_multiple_choice",
    message0: "cancel ask multiple choice",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  }
]);

Blockly.JavaScript["display_message"] = function(block) {
  const code = `await sendActionGoal("RobotSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
    block,
    "MESSAGE",
    Blockly.JavaScript.ORDER_ATOMIC
  )})`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["ask_multiple_choice"] = function(block) {
  const code = `await sendActionGoal("HumanSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
    block,
    "CHOICES",
    Blockly.JavaScript.ORDER_ATOMIC
  )})`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["cancel_display_message"] = function(block) {
  return `makeCancelGoal("RobotSpeechbubbleAction")(handles["RobotSpeechbubbleAction"]);\n`;
};

Blockly.JavaScript["cancel_ask_multiple_choice"] = function(block) {
  return `makeCancelGoal("HumanSpeechbubbleAction")(handles["HumanSpeechbubbleAction"]);\n`;
};

Blockly.JavaScript["wait_for_all"] = function(block) {
  return [
    "await Promise.all([" +
      [0, 1]
        .map(function(i) {
          return `(async () => {\n${Blockly.JavaScript.statementToCode(
            block,
            "DO" + i
          )}})()`;
        })
        .join(", ")
        .trim() +
      "])",
    Blockly.JavaScript.ORDER_NONE
  ];
};

Blockly.JavaScript["wait_for_one"] = function(block) {
  return [
    "await Promise.race([" +
      [0, 1]
        .map(function(i) {
          return `(async () => {\n${Blockly.JavaScript.statementToCode(
            block,
            "DO" + i
          )}})()`;
        })
        .join(", ")
        .trim() +
      "])",
    Blockly.JavaScript.ORDER_NONE
  ];
};

Blockly.JavaScript["return"] = function(block) {
  return `return ${Blockly.JavaScript.valueToCode(
    block,
    "VALUE",
    Blockly.JavaScript.ORDER_ATOMIC
  )};`;
};

//------------------------------------------------------------------------------
// Main Setup

let editor;
let code = document.getElementById("startBlocks");

function render(element, toolbox) {
  if (editor) {
    editor.removeChangeListener(updateCode);
    code = Blockly.Xml.workspaceToDom(editor);
    editor.dispose();
  }
  editor = Blockly.inject(element, {
    toolbox: document.getElementById(toolbox)
  });

  Blockly.Xml.domToWorkspace(code, editor);

  editor.addChangeListener(updateCode);

  return editor;
}

function updateCode() {
  document.getElementById("js").innerText = Blockly.JavaScript.workspaceToCode(
    editor
  );
}

editor = render("editor", "toolbox");

updateCode();

//------------------------------------------------------------------------------
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

document.getElementById("run").onclick = () => {
  var curCode = `(async () => {${Blockly.JavaScript.workspaceToCode(
    editor
  )}})();`;
  eval(curCode);
};

//------------------------------------------------------------------------------
// Scratch
(async () => {
  console.log("test");
  console.log("done");
})();
