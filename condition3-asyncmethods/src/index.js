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
        if (
          handles[actionName].goal_id &&
          handles[actionName].goal_id.id === val.goal_id.id
        ) {
          callback(null, val.status);
        } else {
          callback(null, null);
        }
      }
    };
    sources[actionName].status.addListener(listener);
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

let poses$;
function getFaceDirection() {
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

async function getState(whichState) {
  if (whichState === "humanFaceDirection") {
    return await getFaceDirection();
  } else if (whichState === "isHumanSpeaking") {
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
  return speech_status !== null && speech_status !== "ACTIVE";
}

async function isGestureFinished() {
  const gesture_status = await getActionStatus("FacialExpressionAction");
  return gesture_status !== null && gesture_status !== "ACTIVE";
}

//------------------------------------------------------------------------------
// Block Function Definitions

Blockly.defineBlocksWithJsonArray([
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
    type: "start_gesturing",
    message0: "start gesture  %1",
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
        name: "MESSAGE",
        options: [
          ["humanFaceDirection", '"humanFaceDirection"'],
          ["isHumanSpeaking", '"isHumanSpeaking"']
        ]
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

//------------------------------------------------------------------------------
// Code Generators

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
    block.getRootBlock().type === "procedures_defnoreturn"
  );
}

Blockly.JavaScript["get_state"] = function(block) {
  const code = check(block)
    ? `await getState(${block.getFieldValue("MESSAGE")})`
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

Blockly.JavaScript["start_gesturing"] = function(block) {
  return check(block)
    ? `startGesturing(${block.getFieldValue("MESSAGE")});\n`
    : "";
};

Blockly.JavaScript["is_say_finished"] = function(block) {
  const code = check(block) ? `await isSayFinished()` : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
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
  // provide an initial value for result streams
  sources[actionName].result = sources[actionName].result.startWith({
    status: { status: null }
  });
  sources[actionName].result.addListener({ next: _ => {} });
});
actionNames.map(actionName => {
  // provide an initial value for status streams
  sources[actionName].status = sources[actionName].status.startWith({
    status: null
  });
  sources[actionName].status.addListener({ next: _ => {} });
});

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
await sleep(0.5); // HACK to wait until all actions are cancelled
${patched}})();`;
  eval(wrapped);
};

document.getElementById("run").onclick = () => {
  const code = Blockly.JavaScript.workspaceToCode(editor);
  run(code);
};

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
