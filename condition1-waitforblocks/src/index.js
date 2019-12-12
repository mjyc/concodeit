import "./styles.css";

import { promisify } from "util";
import Blockly from "node-blockly/browser";
import {
  actionNames,
  initialize,
  makeSendGoal,
  makeCancelGoal,
  createStreamEventListener
} from "cycle-robot-drivers-async";
import { extractFaceFeatures } from "tabletrobotface-userstudy";

//------------------------------------------------------------------------------
// Helper Function Definitions

const handles = {};

function sendActionGoal(actionName, goal) {
  return promisify((g, callback) => {
    handles[actionName] = makeSendGoal(actionName)(g, (err, val) => {
      if (!err && val.status.status === "SUCCEEDED") {
        callback(null, val.result);
      } else {
        callback(null, null);
      }
    });
  })(goal);
}

function cancelActionGoal(actionName) {
  if (handles[actionName]) makeCancelGoal(actionName)(handles[actionName]);
}

function cancelActionGoals() {
  actionNames.map(actionName => cancelActionGoal(actionName));
}

function sleep(duration) {
  return promisify((s, cb) => setTimeout(cb, s * 1000))(duration);
}

// HACK to make promisify in eval; used by wait_for_all and wait_for_one
function promisify2(f) {
  return promisify(f);
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

function waitUntilFaceDirectionChanged(id) {
  return promisify(detectFaceDirectionChanged)(id);
}

function waitUntilFaceEvent(id, direction) {
  eventHandles[id] = {
    listener: null,
    stream: sources.PoseDetection.events("poses"),
    stop: () => {
      eventHandles[id].stream.removeListener(eventHandles[id].listener);
    }
  };
  return promisify((pred, cb) => {
    eventHandles[id].listener = createStreamEventListener(
      poses => {
        const faceFeatures = extractFaceFeatures(poses);
        return pred(
          !faceFeatures.isVisible
            ? "noface"
            : faceFeatures.noseAngle < -NOSE_ANGLE_THRESHOLD
            ? "right"
            : faceFeatures.noseAngle > NOSE_ANGLE_THRESHOLD
            ? "left"
            : "center"
        );
      },
      (err, val) => {
        eventHandles[id].stream.removeListener(eventHandles[id].listener);
        cb(err, direction);
      }
    );
    eventHandles[id].stream.addListener(eventHandles[id].listener);
  })(dir => dir == direction);
}

function waitUntilVADStateChanged(id) {
  eventHandles[id] = {
    listener: null,
    stream: sources.VAD,
    stop: () => {
      eventHandles[id].stream.removeListener(eventHandles[id].listener);
    }
  };
  return promisify(cb => {
    eventHandles[id].listener = {
      next: val => {
        eventHandles[id].stream.removeListener(eventHandles[id].listener);
        cb(null, val);
      }
    };
    eventHandles[id].stream.addListener(eventHandles[id].listener);
  })();
}

function waitUntilVADState(id, state) {
  eventHandles[id] = {
    listener: null,
    stream: sources.VAD,
    stop: () => {
      eventHandles[id].stream.removeListener(eventHandles[id].listener);
    }
  };
  return promisify(cb => {
    eventHandles[id].listener = {
      next: val => {
        if (val === state) {
          eventHandles[id].stream.removeListener(eventHandles[id].listener);
          cb(null, val);
        }
      }
    };
    eventHandles[id].stream.addListener(eventHandles[id].listener);
  })();
}

function setMessage(message) {
  sendActionGoal("RobotSpeechbubbleAction", String(message));
}

function startFollowingFace() {
  sources.followFace.shamefullySendNext(true);
}

function stopFollowingFace() {
  sources.followFace.shamefullySendNext(false);
}

async function say(message) {
  return sendActionGoal("SpeechSynthesisAction", String(message));
}

async function gesture(name) {
  return sendActionGoal("FacialExpressionAction", String(name));
}

async function waitForEvent(event) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "FaceDirectionChanged") {
    return await waitUntilFaceDirectionChanged(id);
  }
  return await waitUntilVADStateChanged(id);
}

async function waitForSpecificEvent(event) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "humanFaceLookingAtCenter") {
    return await waitUntilFaceEvent(id, "center");
  } else if (event == "humanFaceLookingAtLeft") {
    return await waitUntilFaceEvent(id, "left");
  } else if (event == "humanFaceLookingAtRight") {
    return await waitUntilFaceEvent(id, "right");
  } else if (event == "noHumanFaceFound") {
    return await waitUntilFaceEvent(id, "noface");
  } else if (event == "isHumanSpeakingFalse") {
    return await waitUntilVADState(id, false);
  } else if (event == "isHumanSpeakingTrue") {
    return await waitUntilVADState(id, true);
  }
}

function waitForAll(subprogram1, subprogram2) {
  return Promise.all([subprogram1, subprogram2]);
}

function waitForOne(subprogram1, subprogram2) {
  return Promise.race([subprogram1, subprogram2]);
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
    output: "Action",
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
    type: "say",
    message0: "say %1",
    args0: [
      {
        type: "input_value",
        name: "MESSAGE",
        check: ["String", "Number"]
      }
    ],
    output: "Action",
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "gesture",
    message0: "gesture  %1",
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
    output: "Action",
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
          ["FaceDirectionChanged", '"FaceDirectionChanged"'],
          ["IsSpeakingChanged", '"IsSpeakingChanged"']
        ]
      }
    ],
    output: null,
    colour: 210,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "wait_until",
    message0: "wait until %1",
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
      }
    ],
    previousStatement: null,
    nextStatement: null,
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
    type: "done",
    message0: "done",
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "wait_until_face_event",
    message0: "wait until face event: posX, posY %1",
    args0: [
      {
        type: "input_value",
        name: "WU0",
        check: "Boolean"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 210,
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
  const code = check(block)
    ? `await setMessage(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )})`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["start_following_face"] = function(block) {
  return check(block) ? `await startFollowingFace();\n` : "";
};

Blockly.JavaScript["stop_following_face"] = function(block) {
  return check(block) ? `await stopFollowingFace();\n` : "";
};

Blockly.JavaScript["say"] = function(block) {
  const code = check(block)
    ? `await say(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )})`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["gesture"] = function(block) {
  const code = check(block)
    ? `await gesture(${block.getFieldValue("MESSAGE")})`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["wait_for_event"] = function(block) {
  const code = check(block)
    ? `await waitForEvent(String(${block.getFieldValue("SE")}))`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["wait_until"] = function(block) {
  return check(block)
    ? `await waitForSpecificEvent(String(${block.getFieldValue("SE")}));\n`
    : "";
};

Blockly.JavaScript["wait_for_all"] = function(block) {
  return check(block)
    ? `await waitForAll(${[0, 1]
        .map(
          i =>
            `promisify2(async cb => {\n${Blockly.JavaScript.statementToCode(
              block,
              `DO${i}`
            )}  cb(null, null);\n})()`
        )
        .join(", ")});\n`
    : "";
};

const _stop = [];
Blockly.JavaScript["wait_for_one"] = function(block) {
  const id = block.id;
  return check(block)
    ? `_stop["${id}"] = false;\nawait waitForOne(${[0, 1]
        .map(
          i =>
            `promisify2(async cb => {\n${Blockly.JavaScript.statementToCode(
              block,
              `DO${i}`
            ).replace(
              /;\n/g,
              `; if (_stop["${block.id}"]) return;\n`
            )}  cb(null, null);\n})()`
        )
        .join(", ")});\n_stop["${block.id}"] = true;\n`
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
await sleep(0.5); // HACK to wait until all actions are cancelled
${patched}})();`;
  eval(wrapped);
};

const stop = () => {
  if (_exit.length > 0) {
    _exit[_exit.length - 1] = true;
  }
  cancelActionGoals();
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
