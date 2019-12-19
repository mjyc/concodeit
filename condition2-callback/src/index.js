import "./styles.css";

import Blockly from "node-blockly/browser";
import {
  actionNames,
  initialize,
  makeSendGoal,
  makeCancelGoal
} from "cycle-robot-drivers-async";
require("util.promisify/shim")();
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

function sleep(sec, callback) {
  return promisify((s, cb) => setTimeout(cb, s * 1000))(sec);
}

const eventHandles = {};
function removeEventHandles() {
  for (const key in eventHandles) {
    const eventHandle = eventHandles[key];
    eventHandle.stream.removeListener(eventHandle.listener);
  }
}

const NOSE_ANGLE_THRESHOLD = 10;
function onFaceDirectionChanged(id, callback) {
  let prevFaceDirection = null;
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        const features = extractFaceFeatures(poses);
        const faceDirection = !features.isVisible
          ? "noface"
          : features.noseAngle > NOSE_ANGLE_THRESHOLD
          ? "left"
          : features.noseAngle < -NOSE_ANGLE_THRESHOLD
          ? "right"
          : "center";
        if (prevFaceDirection === null) {
          prevFaceDirection = faceDirection;
          return;
        }
        if (faceDirection === prevFaceDirection) return;
        callback(null, faceDirection);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function onVADChanged(id, callback) {
  eventHandles[id] = {
    stream: sources.VAD.drop(1),
    listener: {
      next: val => {
        callback(null, val);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function onFaceDirection(id, faceDirection, callback) {
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        const features = extractFaceFeatures(poses);
        const curFaceDirection = !features.isVisible
          ? "noface"
          : features.noseAngle > NOSE_ANGLE_THRESHOLD
          ? "left"
          : features.noseAngle < -NOSE_ANGLE_THRESHOLD
          ? "right"
          : "center";
        if (curFaceDirection !== faceDirection) return;
        callback(null, null);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function onVoiceActivity(id, voiceActivity, callback) {
  eventHandles[id] = {
    stream: sources.VAD,
    listener: {
      next: val => {
        if (val !== voiceActivity) return;
        callback(null, val);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

const actionCallbacks = {};
["sleep", "SpeechSynthesisAction", "FacialExpressionAction"].map(actionName => (actionCallbacks[actionName] = []));

function removeActionCallbacks() {
  for (const key in actionCallbacks) {
    actionCallbacks[key] = [];
  }
}

function when(id, eventName, callback) {
  switch (eventName) {
    case "humanFaceDirectionChanged":
      onFaceDirectionChanged(id, callback);
      return;
    case "isHumanSpeakingChanged":
      onVADChanged(id, callback);
      return;
    case "noHumanFaceFound":
      onFaceDirection(id, "noface", callback);
      return;
    case "humanFaceLookingAtRight":
      onFaceDirection(id, "right", callback);
      return;
    case "humanFaceLookingAtLeft":
      onFaceDirection(id, "left", callback);
      return;
    case "humanFaceLookingAtCenter":
      onFaceDirection(id, "center", callback);
      return;
    case "isHumanSpeakingFalse":
      onVoiceActivity(id, false, callback);
      return;
    case "isHumanSpeakingTrue":
      onVoiceActivity(id, true, callback);
      return;
    case "sleepDone":
      actionCallbacks["sleep"].push(callback);
      return;
    case "sayDone":
      actionCallbacks["SpeechSynthesisAction"].push(callback);
      return;
    case "gestureDone":
      actionCallbacks["FacialExpressionAction"].push(callback);
      return;
    default:
      throw new Error("unknown eventName", eventName);
  }
}

function stopDetectChangeOrWait(id) {
  eventHandles[id].stream.removeListener(eventHandles[id].listener);
}

function startSleeping(duration) {
  setTimeout(() => {
    for (const callback of actionCallbacks["sleep"]) {
      callback();
    }
  }, duration * 1000);
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

function startSaying(text) {
  sendActionGoalCallback("SpeechSynthesisAction", text, result => {
    for (const callback of actionCallbacks["SpeechSynthesisAction"]) {
      callback(result);
    }
  });
}

function startGesturing(gesture) {
  sendActionGoalCallback("FacialExpressionAction", gesture, result => {
    for (const callback of actionCallbacks["FacialExpressionAction"]) {
      callback(result);
    }
  });
}

function waitForEvent(event, callback) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "humanFaceDirectionChanged") {
    detectFaceDirectionChanged(id, callback);
  } else if (event == "isHumanSpeakingChanged") {
    detectVADChanged(id, callback);
  }
}

function waitUntil(event, callback) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "humanFaceLookingAtCenter") {
    waitForFaceDirection(id, "center", callback);
  } else if (event == "humanFaceLookingAtLeft") {
    waitForFaceDirection(id, "left", callback);
  } else if (event == "humanFaceLookingAtRight") {
    waitForFaceDirection(id, "right", callback);
  } else if (event == "noHumanFaceFound") {
    waitForFaceDirection(id, "noface", callback);
  } else if (event == "isHumanSpeakingFalse") {
    waitForVoiceActivity(id, false, callback);
  } else if (event == "isHumanSpeakingTrue") {
    waitForVoiceActivity(id, true, callback);
  }
}

//------------------------------------------------------------------------------
// Block Function Definitions

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
    message0: "start program",
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "start_sleeping",
    message0: "start sleeping for %1",
    args0: [
      {
        type: "input_value",
        name: "SE",
        check: "Number"
      }
      // {
      //   type: "input_statement",
      //   name: "DO"
      // }
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
    type: "start_gesturing",
    message0: "start gesturing %1",
    args0: [
      {
        type: "field_dropdown",
        name: "MESSAGE",
        options: [
          ["happy", '"HAPPY"'],
          ["sad", '"SAD"'],
          ["angry", '"ANGRY"'],
          ["focused", '"FOCUSED"'],
          ["confused", '"CONFUSED"']
        ]
      }
      // {
      //   type: "input_dummy"
      // },
      // {
      //   type: "input_statement",
      //   name: "DO"
      // }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "when",
    message0: "when %1 %2 %3",
    args0: [
      {
        type: "field_dropdown",
        name: "SE",
        options: [
          ["humanFaceDirectionChanged", '"humanFaceDirectionChanged"'],
          ["isHumanSpeakingChanged", '"isHumanSpeakingChanged"'],
          ["humanLooksAtCenter", '"humanFaceLookingAtCenter"'],
          ["humanLooksAtLeft", '"humanFaceLookingAtLeft"'],
          ["humanLooksAtRight", '"humanFaceLookingAtRight"'],
          ["humanDisappears", '"noHumanFaceFound"'],
          ["humanSpeaks", '"isHumanSpeakingTrue"'],
          ["humanStopsSpeaking", '"isHumanSpeakingFalse"'],
          ["sleepDone", '"sleepDone"'],
          ["sayDone", '"sayDone"'],
          ["gestureDone", '"gestureDone"']
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
    colour: 210,
    tooltip: "",
    helpUrl: ""
  }
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
  return (
    "while (" +
    argument0 +
    ") {\n  await sleep(0.1);console.log('sleep');\n" +
    branch +
    "}\n"
  );
  return "";
};

function check(block) {
  return (
    block.getRootBlock().type === "start_program" ||
    block.getRootBlock().type === "procedures_defnoreturn" ||
    block.getRootBlock().type === "when"
  );
}

Blockly.JavaScript["start_sleeping"] = function(block) {
  return check(block)
    ? `startSleeping(${Blockly.JavaScript.valueToCode(
        block,
        "SE",
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
      )}));\n`
    : "";
};

Blockly.JavaScript["start_gesturing"] = function(block) {
  return check(block)
    ? `sendActionGoalCallback("FacialExpressionAction", String(${block.getFieldValue(
        "MESSAGE"
      )}));\n`
    : "";
};

Blockly.JavaScript["when"] = function(block) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  const stmtCode = Blockly.JavaScript.statementToCode(block, "DO");
  return stmtCode !== ""
    ? `when(${id}, ${block.getFieldValue("SE")}, (res, err) => {\n${stmtCode}})`
    : "";
};

Blockly.JavaScript["start_program"] = function(block) {
  return "";
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

const handle = setInterval(() => {
  if (!sources) return;
  sources.PoseDetection.events("poses").addListener({ next: _ => {} });
  sources.VAD.addListener({ next: _ => {} });
  clearInterval(handle);
});

const _exit = [];

const run = code => {
  // stop previously ran code
  if (_exit.length > 0) {
    _exit[_exit.length - 1] = true;
  }
  removeEventHandles();
  removeActionCallbacks();
  cancelActionGoals();
  stopFollowingFace();
  // patch & run code
  const patched = code.replace(
    /;\n/g,
    `; if (_exit[${_exit.length}]) return;\n`
  );
  const wrapped = `_exit[${_exit.length}] = false;
(async () => {
await sleep(1); // HACK to wait until all actions are cancelled
${patched}})();`;
  eval(wrapped);
};

const stop = () => {
  if (_exit.length > 0) {
    _exit[_exit.length - 1] = true;
  }
  removeEventHandles();
  removeActionCallbacks();
  cancelActionGoals();
  stopFollowingFace();
};

document.getElementById("run").onclick = () => {
  const code = Blockly.JavaScript.workspaceToCode(editor);
  run(code);
};

document.getElementById("stop").onclick = stop;

document.getElementById("download_js").onclick = () => {
  const text = document.getElementById("js").innerText;
  const a = document.createElement("a");
  a.id = "js";
  a.href = "data:text/javascript;charset=utf-8," + encodeURIComponent(text);
  a.download = "program";
  a.click();
};

document.getElementById("run_js").onclick = e => {
  const filename = document.getElementById("filename").value;
  console.debug(`filepath /programs/${filename}`);
  fetch(`/programs/${filename}`)
    .then(function(response) {
      return response.text();
    })
    .then(function(code) {
      console.debug(code);
      run(code);
    });
};

document.getElementById("download_xml").onclick = () => {
  const workspace = Blockly.getMainWorkspace();
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToText(xml);
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

//------------------------------------------------------------------------------
// Scratch
(async () => {
  console.log("started");
})();
