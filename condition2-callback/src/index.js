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
  if (handles[actionName]) makeCancelGoal(actionName)(handles[actionName]);
}

function cancelActionGoals() {
  actionNames.map(actionName => cancelActionGoal(actionName));
}

function sleep(second = 0, callback = () => {}) {
  setTimeout(callback, second * 1000);
}

const eventHandles = {};

const defaultFaceFeatures = {
  stamp: 0,
  isVisible: false,
  faceSize: 0,
  faceHeight: 0,
  faceCenterX: 0,
  faceCenterY: 0,
  faceAngle: 0,
  noseAngle: 0
};

// helper function to detect facial features, such as direction. 
function norm(pt) {
  return Math.sqrt(pt.x * pt.x + pt.y * pt.y);
}

function extractFaceFeatures(poses) {
  if (
    poses.length === 0 ||
    (!poses[0].keypoints.find(function(kpt) {
      return kpt.part === "nose";
    }) ||
      !poses[0].keypoints.find(function(kpt) {
        return kpt.part === "leftEye";
      }) ||
      !poses[0].keypoints.find(function(kpt) {
        return kpt.part === "rightEye";
      }))
  ) {
    return {
      stamp: Date.now(),
      isVisible: false,
      faceSize: defaultFaceFeatures.faceSize,
      faceHeight: defaultFaceFeatures.faceHeight,
      faceCenterX: defaultFaceFeatures.faceCenterX,
      faceCenterY: defaultFaceFeatures.faceCenterY,
      faceAngle: defaultFaceFeatures.faceAngle,
      noseAngle: defaultFaceFeatures.noseAngle
    };
  }

  const ns = poses[0].keypoints.filter(function(kpt) {
    return kpt.part === "nose";
  })[0].position;
  const le = poses[0].keypoints.filter(function(kpt) {
    return kpt.part === "leftEye";
  })[0].position;
  const re = poses[0].keypoints.filter(function(kpt) {
    return kpt.part === "rightEye";
  })[0].position;
  const dnsre = Math.sqrt(Math.pow(ns.x - le.x, 2) + Math.pow(ns.y - le.y, 2));
  const dnsle = Math.sqrt(Math.pow(ns.x - re.x, 2) + Math.pow(ns.y - re.y, 2));
  const drele = Math.sqrt(Math.pow(re.x - le.x, 2) + Math.pow(re.y - le.y, 2));
  const s = 0.5 * (dnsre + dnsle + drele);
  const faceSize = Math.sqrt(s * (s - dnsre) * (s - dnsle) * (s - drele));
  const faceCenterX = (ns.x + le.x + re.x) / 3;
  const faceCenterY = (ns.y + le.y + re.y) / 3;

  // a point between two eyes
  const bw = {
    x: (le.x + re.x) * 0.5,
    y: (le.y + re.y) * 0.5
  };
  // a vector from the point between two eyes to the right eye
  const vbl = {
    x: le.x - bw.x,
    y: le.y - bw.y
  };
  const faceRotation = Math.atan2(vbl.y, vbl.x);

  const vbn = {
    x: ns.x - bw.x,
    y: ns.y - bw.y
  };
  const dvbl = Math.sqrt(Math.pow(vbl.x, 2) + Math.pow(vbl.y, 2));
  const dvbn = Math.sqrt(Math.pow(vbn.x, 2) + Math.pow(vbn.y, 2));
  let noseRotation = Math.acos((vbl.x * vbn.x + vbl.y * vbn.y) / (dvbl * dvbn));

  const faceAngle = (faceRotation / Math.PI) * 180;
  const noseAngle = ((noseRotation - Math.PI / 2) / Math.PI) * 180;

  return {
    stamp: Date.now(),
    isVisible: true,
    faceSize: faceSize,
    faceHeight: norm(vbn),
    faceCenterX: faceCenterX,
    faceCenterY: faceCenterY,
    faceAngle: faceAngle,
    noseAngle: noseAngle
  };
}

// IDEA: provide faceYaw, faceRoll, faceSize in addition; "detectFaceFeatures"
function detectFace(id, callback) {
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        if (poses.length === 0) {
          return callback(null, null, 0);
        } else {
          const nosePoint = poses[0].keypoints.find(kpt => kpt.part === "nose");
          let noseAngle = extractFaceFeatures(poses).noseAngle;
          let faceDirection = 
              noseAngle > 20 
              ? "left" 
              : noseAngle < -20 
              ? "right" 
              : "center";
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
              : (480 - nosePoint.position.y) / 480,
            faceDirection
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
    type: "start_program",
    message0: "start program",
    nextStatement: null,
    colour: 290,
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
      )}, (posX, posY, faceDir) => {\n${Blockly.JavaScript.statementToCode(
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
    ? `sleep(${Blockly.JavaScript.valueToCode(
        block,
        "SE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}, _ => {\n${Blockly.JavaScript.statementToCode(block, "DO")}});\n`
    : "";
};

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
    ? `sendActionGoalCallback("SpeechSynthesisAction", String(${Blockly.JavaScript.valueToCode(
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
  console.log("started");
})();
