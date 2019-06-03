import "./styles.css";

import Blockly from "node-blockly/browser";
import {
  actionNames,
  initialize,
  makeSendGoal,
  makeCancelGoal
} from "cycle-robot-drivers-async";
import { promisify } from "util";

//------------------------------------------------------------------------------
// Helper Function Definitions

const handles = {};

function sendActionGoalCallback(actionName, goal, callback = () => {}) {
  ((g, cb) => {
    handles[actionName] = makeSendGoal(actionName)(g, (err, val) => {
      if (!err && val.status.status === "SUCCEEDED") {
        cb(val.result);
      } else {
        cb(null);
      }
    });
  })(goal, callback);
}

function cancelActionGoal(actionName) {
  makeCancelGoal(actionName)(handles[actionName]);
}

function sleep(second = 0, callback = () => {}) {
  setTimeout(callback, second * 1000);
}

const eventHandles = {};

// IDEA: provide faceYaw, faceRoll, faceSize in addition; "detectFaceFeatures"
function detectFace(id, callback) {
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        if (poses.length === 0) {
          return callback(null, null);
        } else {
          const nosePoint = poses[0].keypoints.find(kpt => kpt.part === "nose");
          return callback(
            !nosePoint
              ? null
              : nosePoint.position.x === 0
              ? 0
              : nosePoint.position.x / 640,
            !nosePoint
              ? null
              : nosePoint.position.y === 0
              ? 0
              : (480 - nosePoint.position.y) / 480
          );
        }
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function stopDetectFace(id) {
  eventHandles[id].stream.removeListener(eventHandles[id].listener);
}

//------------------------------------------------------------------------------
// Block Function Definitions

// IDEA: add "speak" and "listen"

Blockly.defineBlocksWithJsonArray([
  {
    type: "detect_face",
    message0: "detect face; when detected %1 do %2",
    args0: [
      {
        type: "input_dummy"
      },
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    output: "String",
    colour: 210,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "stop_detect_face",
    message0: "stop detecting face %1",
    args0: [
      {
        type: "input_value",
        name: "ID",
        check: "String"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "sleep",
    message0: "sleep for %1 then %2",
    args0: [
      {
        type: "input_value",
        name: "SE",
        check: "Number"
      },
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "display_message",
    message0: "display message %1 %2",
    args0: [
      {
        type: "input_value",
        name: "MESSAGE",
        check: ["String", "Number"]
      },
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "ask_multiple_choice",
    message0: "ask multiple choice %1 %2",
    args0: [
      {
        type: "input_value",
        name: "CHOICES"
      },
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    previousStatement: null,
    nextStatement: null,
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
  },
  {
    type: "end_program",
    message0: "end program",
    previousStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  }
]);

// IMPORTANT!! callbacks are introduces local variables, which blockly does not
//   usually allow; it might bring confusion in future

Blockly.JavaScript["detect_face"] = function(block) {
  const id = `${Math.floor(Math.random() * Math.pow(10, 8))}`;
  return [
    `detectFace(${id}, (posX, posY) => {\n${Blockly.JavaScript.statementToCode(
      block,
      "DO"
    )}})`,
    Blockly.JavaScript.ORDER_NONE
  ];
};

Blockly.JavaScript["stop_detect_face"] = function(block) {
  return `stopDetectFace(${Blockly.JavaScript.valueToCode(
    block,
    "ID",
    Blockly.JavaScript.ORDER_ATOMIC
  )});`;
};

Blockly.JavaScript["sleep"] = function(block) {
  return `sleep(${Blockly.JavaScript.valueToCode(
    block,
    "SE",
    Blockly.JavaScript.ORDER_ATOMIC
  )}, _ => {\n${Blockly.JavaScript.statementToCode(block, "DO")}});`;
};

Blockly.JavaScript["display_message"] = function(block) {
  const code = `sendActionGoalCallback("RobotSpeechbubbleAction", String(${Blockly.JavaScript.valueToCode(
    block,
    "MESSAGE",
    Blockly.JavaScript.ORDER_ATOMIC
  )}), (result) => {\n${Blockly.JavaScript.statementToCode(block, "DO")}})`;
  return code;
};

Blockly.JavaScript["ask_multiple_choice"] = function(block) {
  const code = `sendActionGoalCallback("HumanSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
    block,
    "CHOICES",
    Blockly.JavaScript.ORDER_ATOMIC
  )}, (result) => {\n${Blockly.JavaScript.statementToCode(block, "DO")}})`;
  return code;
};

Blockly.JavaScript["cancel_display_message"] = function(block) {
  return `cancelActionGoal("RobotSpeechbubbleAction");\n`;
};

Blockly.JavaScript["cancel_ask_multiple_choice"] = function(block) {
  return `cancelActionGoal("HumanSpeechbubbleAction");\n`;
};

Blockly.JavaScript["end_program"] = function(block) {
  return !!block.getPreviousBlock() ? "endProgram();\n" : "";
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

sources.PoseDetection.events("poses").addListener({ next: _ => {} });

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
})();
