import "./styles.css";

import Blockly from "node-blockly/browser";
import {
  actionNames,
  initialize,
  makeSendGoal,
  makeCancelGoal
} from "cycle-robot-drivers-async";
import { promisify } from "util";
import { extractFaceFeatures } from "tabletrobotface-userstudy";

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
  if (handles[actionName]) makeCancelGoal(actionName)(handles[actionName]);
}

function cancelActionGoals() {
  actionNames.map(actionName => cancelActionGoal(actionName));
}

function sleep(second = 0, callback = () => {}) {
  setTimeout(callback, second * 1000);
}

const eventHandles = {};

let prevFaceDirection = "center";
function detectFaceDirectionChange(id, callback) {
  const SIDE_ANGLE = 13;
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        if (poses.length === 0) return;
        const features = extractFaceFeatures(poses);
        if (!features.isVisible) return;
        const faceDirection =
          features.noseAngle > SIDE_ANGLE
            ? "left"
            : features.noseAngle < -SIDE_ANGLE
            ? "right"
            : "center";
        if (faceDirection !== prevFaceDirection) {
          eventHandles[id].stream.removeListener(eventHandles[id].listener);
          prevFaceDirection = faceDirection;
          callback(null, faceDirection);
        }
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function detectVADChange(id, callback) {
  eventHandles[id] = {
    stream: sources.VAD.drop(1).debug(),
    listener: {
      next: val => {
        eventHandles[id].stream.removeListener(eventHandles[id].listener);
        callback(null, val);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function stopDetectChange(id) {
  eventHandles[id].stream.removeListener(eventHandles[id].listener);
}

function startSleeping(duration, callback) {
  sleep(duration, callback);
}

function setMessage(message) {
  sendActionGoalCallback("RobotSpeechbubbleAction", message, result => {});
}

function startFollowingFace() {
  sources.followFace.shamefullySendNext(true);
}

function stopFollowingFace() {
  sources.followFace.shamefullySendNext(false);
}

function startSaying(text, callback) {
  sendActionGoalCallback("SpeechSynthesisAction", text, result =>
    callback(result)
  );
}

function startGesturing(gesture, callback) {
  sendActionGoalCallback("FacialExpressionAction", gesture, result =>
    callback(result)
  );
}

function waitForEvent(event, callback) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "FaceDirectionChanged") {
    detectFaceDirectionChange(id, callback);
  } else if (event == "IsSpeakingChanged") {
    detectVADChange(id, callback);
  }
}

//------------------------------------------------------------------------------
// Block Function Definitions

Blockly.defineBlocksWithJsonArray([
  {
    type: "start_program",
    message0: "start program",
    nextStatement: null,
    colour: 290,
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
    type: "set_message",
    message0: "set message %1",
    args0: [
      {
        type: "input_value",
        name: "MESSAGE",
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
    type: "start_following_face",
    message0: "start following face",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "stop_following_face",
    message0: "stop following face",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "start_saying",
    message0: "start saying %1 then %2",
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
    type: "start_gesturing",
    message0: "start gesturing %1 %2 then %3",
    args0: [
      {
        type: "field_dropdown",
        name: "MESSAGE",
        options: [
          ["Happy", '"HAPPY"'],
          ["Sad", '"SAD"'],
          ["Angry", '"ANGRY"'],
          ["Focused", '"FOCUSED"'],
          ["Confused", '"CONFUSED"']
        ]
      },
      {
        type: "input_dummy"
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
    type: "wait_for_event",
    message0: "wait for event %1 %2 then %3",
    args0: [
      {
        type: "field_dropdown",
        name: "SE",
        options: [
          ["FaceDirectionChanged", '"FaceDirectionChanged"'],
          ["IsSpeakingChanged", '"IsSpeakingChanged"']
        ]
      },
      {
        type: "input_dummy"
      },
      {
        type: "input_statement",
        name: "DO"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "",
    helpUrl: ""
  }
]);

// IMPORTANT!! callbacks are introduces local variables, which blockly does not
//   usually allow; it might bring confusion in future

function check(block) {
  return (
    block.getRootBlock().type === "start_program" ||
    block.getRootBlock().type === "procedures_defnoreturn"
  );
}

Blockly.JavaScript["sleep"] = function(block) {
  return check(block)
    ? `startSleeping(${Blockly.JavaScript.valueToCode(
        block,
        "SE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}, _ => {\n${Blockly.JavaScript.statementToCode(block, "DO")}});\n`
    : "";
};

Blockly.JavaScript["set_message"] = function(block) {
  return check(block)
    ? `setMessage(String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}));\n`
    : "";
};

Blockly.JavaScript["start_following_face"] = function(block) {
  return check(block) ? `startFollowingFace();\n` : "";
};

Blockly.JavaScript["stop_following_face"] = function(block) {
  return check(block) ? `stopFollowingFace();\n` : "";
};

Blockly.JavaScript["start_saying"] = function(block) {
  return check(block)
    ? `startSaying(String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}), (result) => {\n${Blockly.JavaScript.statementToCode(
        block,
        "DO"
      )}});\n`
    : "";
};

Blockly.JavaScript["start_gesturing"] = function(block) {
  return check(block)
    ? `sendActionGoalCallback("FacialExpressionAction", String(${block.getFieldValue(
        "MESSAGE"
      )}), (result) => {\n${Blockly.JavaScript.statementToCode(
        block,
        "DO"
      )}});\n`
    : "";
};

Blockly.JavaScript["wait_for_event"] = function(block) {
  return check(block)
    ? `waitForEvent(String(${block.getFieldValue("SE")}), (err, res) => {
  event = res;\n${Blockly.JavaScript.statementToCode(block, "DO")}});\n`
    : "";
};

Blockly.JavaScript["start_program"] = function(block) {
  return !!block.getNextBlock()
    ? `// beg start_program\ncancelActionGoals();\n// end start_program\n`
    : "";
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
sources.VAD.addListener({ next: _ => {} });

document.getElementById("run").onclick = () => {
  var curCode = `var faceDir;\n (async () => {${Blockly.JavaScript.workspaceToCode(
    editor
  )}})();`;
  eval(curCode);
};

document.getElementById("run_neckexercise").onclick = () => {
  fetch("/public/neck.js")
    .then(function(response) {
      return response.text();
    })
    .then(function(code) {
      console.log(code);
      var curCode = `(async () => {${code} runNeckExerciseApp()})();`;
      eval(curCode);
    });
};

//------------------------------------------------------------------------------
// Scratch
(async () => {
  console.log("started");
})();
