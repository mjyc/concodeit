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

// IDEA: provide faceYaw, faceRoll, faceSize in addition; "detectFaceFeatures"
function detectFace(id, callback) {
  const SIDE_ANGLE = 13;
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        if (poses.length === 0) {
          return callback(null, {posX: null, posY: null, faceDir: null});
        } else {
          const nosePoint = poses[0].keypoints.find(kpt => kpt.part === "nose");
          const noseAngle = extractFaceFeatures(poses).noseAngle;
          const faceDirection =
            noseAngle > SIDE_ANGLE ? "left" : noseAngle < -SIDE_ANGLE ? "right" : "center";
          return callback(null, {
            posX: !nosePoint
              ? null
              : nosePoint.position.x === 0
              ? 0
              : nosePoint.position.x / 640,
            posY: !nosePoint
              ? null
              : nosePoint.position.y === 0
              ? 0
              : (480 - nosePoint.position.y) / 480,
            faceDir: faceDirection
          });
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

function detectVADChange(id, callback) {
  let jsonrtrn = {number: id, val:null}
  eventHandles[id] = {
    stream: sources.VAD,
    listener: {
      next: val => {
        jsonrtrn.val = val; 
        //callback(null, val);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  //return id;
  return jsonrtrn;
}

function stopDetectVADChange(id) {
  eventHandles[id].stream.removeListener(eventHandles[id].listener);
}

function startFollowingFace() {
  sources.followFace.shamefullySendNext(true);
}

function stopFollowingFace() {
  sources.followFace.shamefullySendNext(false);
}

function setMessage(message) {
  sendActionGoalCallback("RobotSpeechbubbleAction", message, (result) => {});
}

function startGesturing(gesture, callback) {
  sendActionGoalCallback("FacialExpressionAction", gesture, (result) => callback(result));
}

// uses the global id value from detectface
// setResultTo not yet implemented due to weird blockly error
function waitForEvent(event, storagevar, callback) {
  if (event == "FaceDirectionChanged" && storagevar == "true") {
    callback();
  }
  else if (event == "IsSpeakingChanged") {
    let idval = Math.floor(Math.random() * Math.pow(10, 8));
    let speakingbool = detectVADChange(idval, callback).val;
    let intervalID = setInterval(function() {
      let tmpbool = detectVADChange(idval, callback).val;
      if (tmpbool != speakingbool) {
        callback();
        speakingbool = tmpbool;
        clearInterval(intervalID);
      }
      speakingbool = tmpbool;
    }, 250);

  }
} // : FaceDirectionChanged | IsSpeakingChanged

function startSleeping(duration, callback) {
  sleep(duration, callback);
}

function startSaying(text, callback) {
  sendActionGoalCallback("SpeechSynthesisAction", text, (result) => callback(result));
}
//------------------------------------------------------------------------------
// Block Function Definitions

// IDEA: add "speak" and "listen"

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
    type: "start_following_face",
    message0: "start following face",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "stop_following_face",
    message0: "stop following face",
    previousStatement: null,
    nextStatement: null,
    colour: 210,
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
    type: "wait_for_event",
    message0: "wait for event %1 then %2",
    args0: [
      {
        type: "field_dropdown",
        name: "SE",
        "options": [
        [ "FaceDirectionChanged", "\"FaceDirectionChanged\""],
        [ "IsSpeakingChanged", "\"IsSpeakingChanged\"" ],
        ]
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
    type: "gesture",
    message0: "gesture %1 %2",
    args0: [
      {
        type: "field_dropdown",
        name: "MESSAGE",
        "options": [
          [ "Happy", "\"HAPPY\"" ],
          [ "Sad", "\"SAD\"" ],
          [ "Angry", "\"ANGRY\"" ],
          [ "Focused", "\"FOCUSED\"" ],
          [ "Confused", "\"CONFUSED\"" ]
        ]
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
    type: "speak",
    message0: "speak %1 %2",
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
    type: "listen",
    message0: "listen %1",
    args0: [
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
    type: "cancel_speak",
    message0: "cancel speak",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "cancel_listen",
    message0: "cancel listen",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
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

Blockly.JavaScript["detect_face"] = function(block) {
  const code = check(block)
    ? `detectFace(${Math.floor(
        Math.random() * Math.pow(10, 8)
      )}, (err, {posX, posY, faceDir}) => {\n${Blockly.JavaScript.statementToCode(
        block,
        "DO"
      )}})`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["stop_detect_face"] = function(block) {
  return check(block)
    ? `stopDetectFace(${Blockly.JavaScript.valueToCode(
        block,
        "ID",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
    : "";
};

Blockly.JavaScript["sleep"] = function(block) {
    return check(block)
    ? `startSleeping(${Blockly.JavaScript.valueToCode(
        block,
        "SE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}, _ => {\n${Blockly.JavaScript.statementToCode(block, "DO")}});\n`
    : "";
}

Blockly.JavaScript["wait_for_event"] = function(block) {
    return check(block)
    ? `waitForEvent(String(${block.getFieldValue("SE")}), "false", (result) => {${Blockly.JavaScript.statementToCode(block, "DO")}});\n
    result=faceDir;\nsetTimeout(function(){result = (result===faceDir);\n
    if (!result) {waitForEvent(String(${block.getFieldValue("SE")}), "true", (result) => {${Blockly.JavaScript.statementToCode(block, "DO")}})};}, 100);\n`
    : "";
}

Blockly.JavaScript["display_message"] = function(block) {
  return check(block)
    ? `sendActionGoalCallback("RobotSpeechbubbleAction", String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}), (result) => {\n${Blockly.JavaScript.statementToCode(
        block,
        "DO"
      )}});\n`
    : "";
};

Blockly.JavaScript["gesture"] = function(block) {
  return check(block)
    ? `sendActionGoalCallback("FacialExpressionAction", String(${block.getFieldValue("MESSAGE")
      }), (result) => {\n${Blockly.JavaScript.statementToCode(
        block,
        "DO"
      )}});\n`
    : "";
};

Blockly.JavaScript["ask_multiple_choice"] = function(block) {
  return check(block)
    ? `sendActionGoalCallback("HumanSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
        block,
        "CHOICES",
        Blockly.JavaScript.ORDER_ATOMIC
      )}, (result) => {\n${Blockly.JavaScript.statementToCode(
        block,
        "DO"
      )}});\n`
    : "";
};

Blockly.JavaScript["speak"] = function(block) {
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

Blockly.JavaScript["listen"] = function(block) {
  return check(block)
    ? `sendActionGoalCallback("SpeechRecognitionAction", {}, (result) => {\n${Blockly.JavaScript.statementToCode(
        block,
        "DO"
      )}});\n`
    : "";
};

Blockly.JavaScript["cancel_display_message"] = function(block) {
  return check(block) ? `cancelActionGoal("RobotSpeechbubbleAction");\n` : "";
};

Blockly.JavaScript["cancel_ask_multiple_choice"] = function(block) {
  return check(block) ? `cancelActionGoal("HumanSpeechbubbleAction");\n` : "";
};

Blockly.JavaScript["cancel_speak"] = function(block) {
  return check(block) ? `cancelActionGoal("SpeechSynthesisAction");\n` : "";
};

Blockly.JavaScript["cancel_listen"] = function(block) {
  return check(block) ? `cancelActionGoal("SpeechRecognitionAction");\n` : "";
};

Blockly.JavaScript["start_program"] = function(block) {
  return !!block.getNextBlock()
    ? `// beg start_program\ncancelActionGoals();\n// end start_program\n`
    : "";
};

Blockly.JavaScript["start_following_face"] = function(block) {
  return check(block) ? `startFollowingFace();\n` : "";
};

Blockly.JavaScript["stop_following_face"] = function(block) {
  return check(block) ? `stopFollowingFace();\n` : "";
};

Blockly.JavaScript["set_message"] = function(block) {
  return check(block) ? `setMessage(String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}));\n` : "";
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
