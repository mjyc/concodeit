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

function sleep(sec, callback) {
  return promisify((s, cb) => setTimeout(cb, s * 1000))(sec);
}

const NOSE_ANGLE_THRESHOLD = 10;
const eventHandles = {};
function detectFaceDirectionChanged(id, callback) {
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
        eventHandles[id].stream.removeListener(eventHandles[id].listener);
        callback(null, faceDirection);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function detectVADChanged(id, callback) {
  eventHandles[id] = {
    stream: sources.VAD.drop(1),
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

function waitForFaceDirection(id, faceDirection, callback) {
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
        eventHandles[id].stream.removeListener(eventHandles[id].listener);
        callback(null, null);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function waitForVoiceActivity(id, voiceActivity, callback) {
  eventHandles[id] = {
    stream: sources.VAD,
    listener: {
      next: val => {
        if (val !== voiceActivity) return;
        eventHandles[id].stream.removeListener(eventHandles[id].listener);
        callback(null, val);
      }
    }
  };
  eventHandles[id].stream.addListener(eventHandles[id].listener);
  return id;
}

function stopDetectChangeOrWait(id) {
  eventHandles[id].stream.removeListener(eventHandles[id].listener);
}

function startSleeping(duration, callback) {
  setTimeout(callback, duration * 1000);
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
          ["happy", '"HAPPY"'],
          ["sad", '"SAD"'],
          ["angry", '"ANGRY"'],
          ["focused", '"FOCUSED"'],
          ["confused", '"CONFUSED"']
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
    type: "wait_for",
    message0: "wait for %1 %2 then %3",
    args0: [
      {
        type: "field_dropdown",
        name: "SE",
        options: [
          ["humanFaceDirectionChanged", '"humanFaceDirectionChanged"'],
          ["isHumanSpeakingChanged", '"isHumanSpeakingChanged"']
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
  },
  {
    type: "wait_until",
    message0: "wait until %1 %2 then %3",
    args0: [
      {
        type: "field_dropdown",
        name: "SE",
        options: [
          ["humanFaceLookingAtCenter", '"humanFaceLookingAtCenter"'],
          ["humanFaceLookingAtLeft", '"humanFaceLookingAtLeft"'],
          ["humanFaceLookingAtRight", '"humanFaceLookingAtRight"'],
          ["noHumanFaceFound", '"noHumanFaceFound"'],
          ["isHumanSpeakingFalse", '"isHumanSpeakingFalse"'],
          ["isHumanSpeakingTrue", '"isHumanSpeakingTrue"']
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

Blockly.JavaScript["wait_for"] = function(block) {
  return check(block)
    ? `waitForEvent(String(${block.getFieldValue("SE")}), async (err, res) => {
  event = res;\n${Blockly.JavaScript.statementToCode(block, "DO")}});\n`
    : "";
};

Blockly.JavaScript["wait_until"] = function(block) {
  return check(block)
    ? `waitUntil(String(${block.getFieldValue("SE")}), () => {
${Blockly.JavaScript.statementToCode(block, "DO")}});\n`
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

const _exit = [];

const run = code => {
  // stop previously ran code
  if (_exit.length > 0) {
    _exit[_exit.length - 1] = true;
  }
  cancelActionGoals();
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
