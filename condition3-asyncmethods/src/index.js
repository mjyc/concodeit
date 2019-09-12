import "./styles.css";

import Blockly from "node-blockly/browser";
import {
  actionNames,
  initialize,
  makeSendGoal,
  makeCancelGoal
} from "cycle-robot-drivers-async";
import { extractFaceFeatures } from "tabletrobotface-userstudy";
import { promisify } from "util";

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

function getActionStatus(actionName) {
  return promisify(callback => {
    const listener = {
      next: val => {
        sources[actionName].status.removeListener(listener);
        console.debug(actionName, "status", val);
        callback(null, val.status);
      }
    };
    sources[actionName].status.addListener(listener);
  })();
}

function getActionResult(actionName) {
  return promisify(callback => {
    const listener = {
      next: val => {
        sources[actionName].result.removeListener(listener);
        console.debug(actionName, "result", val);
        if (val.status.status === "SUCCEEDED") {
          callback(null, val.result);
        } else {
          callback(null, null);
        }
      }
    };
    sources[actionName].result.addListener(listener);
  })();
}

function cancelActionGoal(actionName) {
  if (handles[actionName]) makeCancelGoal(actionName)(handles[actionName]);
}

function cancelActionGoals() {
  actionNames.map(actionName => cancelActionGoal(actionName));
}

function sleep(sec) {
  return promisify((s, cb) => setTimeout(cb, s * 1000))(sec);
}

function startFollowingFace() {
  sources.followFace.shamefullySendNext(true);
}

function stopFollowingFace() {
  sources.followFace.shamefullySendNext(false);
}

//------------------------------------------------------------------------------
// Face Detection Functions

let poses$;
function getNumDetectedFaces() {
  return promisify(callback => {
    const listener = {
      next: val => {
        poses$.removeListener(listener);
        callback(null, val.length);
      }
    };
    poses$.addListener(listener);
  })();
}

function getHumanFaceDirection() {
  return promisify(callback => {
    const listener = {
      next: val => {
        poses$.removeListener(listener);
        const features = extractFaceFeatures(val);
        if (features.isVisible) {
          if (features.noseAngle < -5) {
            callback(null, "Right");
          } else if (features.noseAngle > 5) {
            callback(null, "Left");
          } else {
            callback(null, "Center");
          }
        } else {
          callback(null, "face not found");
        }
      }
    };
    poses$.addListener(listener);
  })();
}

let VAD$;
function getVADState() {
  return promisify(callback => {
    const listener = {
      next: val => {
        VAD$.removeListener(listener);
        callback(null, val);
      }
    };
    VAD$.addListener(listener);
  })();
}

//------------------------------------------------------------------------------
// Update API stuff
async function getState(whichState) {
  if (whichState === "faceDirection") {
    return await getHumanFaceDirection();
  } else if (whichState === "isSpeaking") {
    return await getVADState();
  }
}

const GESTURES = ["HAPPY", "SAD", "ANGRY", "FOCUSED", "CONFUSED"];
function startGesturing(gesture) {
  if (GESTURES.indexOf(gesture) != -1) {
    sendActionGoal("FacialExpressionAction", gesture);
  }
}

function setMessage(message) {
  sendActionGoal("RobotSpeechbubbleAction", message);
}

function startSaying(message) {
  sendActionGoal("SpeechSynthesisAction", message);
}

async function isSayFinished() {
  const speech_status = await getActionStatus("SpeechSynthesisAction");
  return speech_status !== "ACTIVE";
}

async function isGestureFinished() {
  const gesture_status = await getActionStatus("FacialExpressionAction");
  return gesture_status !== "ACTIVE";
}

//------------------------------------------------------------------------------
// Monologue Program

async function monologue() {
  console.log("Hi");
  setMessage("Hello there!");
  console.log("Bye");
  var faceDir = await getHumanFaceDirection();
  while (faceDir === "face not found") {
    await sleep(1);
    faceDir = await getHumanFaceDirection();
  }
  // after waiting for face to appear, introduce yourself
  await communicate("My name is Meebo", "Happy");

  while (!isSayFinished()) {
    await sleep(1);
  }

  await communicate("I'm made of a touch monitor and a robot arm", "n/a");
  // if face exists and still talking 
  faceDir = await getHumanFaceDirection();
  while (!isSayFinished() && faceDir !== "face not found") {
    await sleep(1);
    faceDir = await getHumanFaceDirection();
  }

  if (faceDir === "face not found") {
    await exit();
    return;
  } 

  communicate("Nice to meet you", "Happy"); // what is the goodbye gesture?
  while (!isSayFinished() && getHumanFaceDirection() !== "face not found") {
    await sleep(1);
  }
  exit();

}

async function communicate(message, gesture) {
  setMessage(message);
  startSaying(message);
  startGesturing(gesture);
}

async function exit() {
  setMessage("Goodbye!");
  startSaying("Goodbye!");
  startGesturing("Happy");
}


//------------------------------------------------------------------------------
// Interview Program -- test works!!

async function interview() {
  setMessage("What does a typical day look like for you?");
  // user hasn't said anything yet
  var isSpeaking = await getState("isSpeaking");
  while (!isSpeaking) {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
  }
  // started talking
  startFollowingFace();
  var dir = await getHumanFaceDirection();
  while (isSpeaking || dir !== "Center") {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
    dir = await getHumanFaceDirection();
  }
  // finished talking
  stopFollowingFace();
  // prompt next question
  setMessage("What sort of vacations do you like to take?");
  startFollowingFace();
  // wait to start talking
  isSpeaking = await getState("isSpeaking");
  while (!isSpeaking) {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
  }
  // wait till finish talking
  dir = await getHumanFaceDirection();
  while (isSpeaking || dir !== "Center") {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
    dir = await getHumanFaceDirection();
  }
  stopFollowingFace();
  // finish
  setMessage("We are done. Thank you.");
}

//------------------------------------------------------------------------------
// Block Function Definitions

Blockly.defineBlocksWithJsonArray([
  {
    type: "get_state",
    message0: "get state of %1",
    args0: [
      {
        type: "input_value",
        name: "MESSAGE",
        check: "String"
      }
    ],
    output: "String",
    colour: 210,
    tooltip: "",
    helpUrl: ""
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
    type: "stop_following_face",
    message0: "stop following face",
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
    type: "start_saying",
    message0: "start saying %1",
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
    type: "is_say_finished",
    message0: "is say finished",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "start_gesturing",
    message0: "start gesturing %1",
    args0: [
      {
        type: "input_value",
        name: "MESSAGE",
        check: "String"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "is_gesture_finished",
    message0: "is gesture finished",
    output: null,
    colour: 230,
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
]);

function check(block) {
  return (
    block.getRootBlock().type === "start_program" ||
    block.getRootBlock().type === "procedures_defnoreturn"
  );
}

//------------------------------------------------------------------------------
// API Code Generating Blocks

Blockly.JavaScript["get_state"] = function(block) {
  const code = check(block)
    ? `await getState(String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}))`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["sleep"] = function(block) {
  return check(block)
    ? `await sleep(${Blockly.JavaScript.valueToCode(
        block,
        "ARG0",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
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
  return `startFollowingFace();\n`;
};

Blockly.JavaScript["stop_following_face"] = function(block) {
  return `stopFollowingFace();\n`;
};

Blockly.JavaScript["start_saying"] = function(block) {
  return check(block)
    ? `sendActionGoal("SpeechSynthesisAction", String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}));\n`
    : "";
};

Blockly.JavaScript["is_say_finished"] = function(block) {
  const code = check(block) ? `await isSayFinished()` : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["start_gesturing"] = function(block) {
  return check(block)
    ? `startGesturing(String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}));\n`
    : "";
};

Blockly.JavaScript["is_gesture_finished"] = function(block) {
  const code = check(block) ? `await isGestureFinished()` : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
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

poses$ = sources.PoseDetection.events("poses").startWith([]);
poses$.addListener({ next: _ => {} });
VAD$ = sources.VAD;
VAD$.addListener({ next: _ => {} });

actionNames.map(actionName => {
  // HACK to give an initial value for result streams
  sources[actionName].result = sources[actionName].result.startWith({
    status: { status: null }
  });
  sources[actionName].result.addListener({ next: _ => {} });
});
actionNames.map(actionName => {
  // HACK to give an initial value for status streams
  sources[actionName].status = sources[actionName].status.startWith({
    status: null
  });
  sources[actionName].status.addListener({ next: _ => {} });
});

document.getElementById("run").onclick = () => {
  var curCode = `(async () => {${Blockly.JavaScript.workspaceToCode(
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
      console.debug(code);
      var curCode = `(async () => {${code} fullNeckExercise()})();`;
      eval(curCode);
    });
};

//------------------------------------------------------------------------------
// Scratch
(async () => {
  console.log("started");
  monologue();
  console.log("started");
})();
