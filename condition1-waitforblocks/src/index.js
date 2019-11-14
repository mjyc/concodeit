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

const FaceDirectionChanged = {
  noFace: "noFace",
  center: "center",
  left: "left",
  right: "right"
};

const IsSpeakingChanged = {
  speaking: true,
  notSpeaking: false
};

const Event = {
  face: {
    noFace: FaceDirectionChanged.noFace,
    center: FaceDirectionChanged.center,
    left: FaceDirectionChanged.left,
    right: FaceDirectionChanged.right
  },
  speak: {
    speaking: IsSpeakingChanged.speaking,
    notSpeaking: IsSpeakingChanged.notSpeaking
  }
};

const ANGLE = 10; // magnitude of head turn to determine direction

const waitHandles = {};

function detectFaceDirectionChanged(id, callback) {
  let prevFaceDirection = null;
  waitHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        const features = extractFaceFeatures(poses);
        const faceDirection = !features.isVisible
          ? "noFace"
          : features.noseAngle > ANGLE
          ? "left"
          : features.noseAngle < -ANGLE
          ? "right"
          : "center";
        if (prevFaceDirection === null) {
          prevFaceDirection = faceDirection;
          return;
        }
        if (faceDirection === prevFaceDirection) return;
        waitHandles[id].stream.removeListener(waitHandles[id].listener);
        callback(null, faceDirection);
      }
    }
  };
  waitHandles[id].stream.addListener(waitHandles[id].listener);
  return id;
}

function waitUntilFaceDirectionChanged(id) {
  return promisify(detectFaceDirectionChanged)(id);
}

/* Waits for face to turn to direction direction before terminating
   inputs:
    id: process id for this
    direction: direction to face */
function waitUntilFaceEvent(id, direction) {
  waitHandles[id] = {
    listener: null,
    stream: sources.PoseDetection.events("poses"),
    stop: () => {
      waitHandles[id].stream.removeListener(waitHandles[id].listener);
    }
  };
  return promisify((pred, cb) => {
    waitHandles[id].listener = createStreamEventListener(
      poses => {
        const faceFeatures = extractFaceFeatures(poses);
        return pred(
          !faceFeatures.isVisible
            ? FaceDirectionChanged.noFace
            : faceFeatures.noseAngle < -1 * ANGLE
            ? FaceDirectionChanged.right
            : faceFeatures.noseAngle > ANGLE
            ? FaceDirectionChanged.left
            : FaceDirectionChanged.center
        );
      },
      (err, val) => {
        waitHandles[id].stream.removeListener(waitHandles[id].listener);
        cb(err, direction);
      }
    );
    waitHandles[id].stream.addListener(waitHandles[id].listener);
  })(dir => dir == direction);
}

function waitUntilVADStateChanged(id) {
  waitHandles[id] = {
    listener: null,
    stream: sources.VAD,
    stop: () => {
      waitHandles[id].stream.removeListener(waitHandles[id].listener);
    }
  };
  return promisify(cb => {
    waitHandles[id].listener = {
      next: val => {
        waitHandles[id].stream.removeListener(waitHandles[id].listener);
        cb(null, val);
      }
    };
    waitHandles[id].stream.addListener(waitHandles[id].listener);
  })();
}

function waitUntilVADState(id, state) {
  waitHandles[id] = {
    listener: null,
    stream: sources.VAD,
    stop: () => {
      waitHandles[id].stream.removeListener(waitHandles[id].listener);
    }
  };
  return promisify(cb => {
    waitHandles[id].listener = {
      next: val => {
        if (val === state) {
          waitHandles[id].stream.removeListener(waitHandles[id].listener);
          cb(null, val);
        }
      }
    };
    waitHandles[id].stream.addListener(waitHandles[id].listener);
  })();
}

function setMessage(message) {
  // : void, instantaneous
  sendActionGoal("RobotSpeechbubbleAction", String(message));
}

function startFollowingFace() {
  // : void, instantaneous
  sources.followFace.shamefullySendNext(true);
}

function stopFollowingFace() {
  // : void, instantaneous
  sources.followFace.shamefullySendNext(false);
}

async function say(message) {
  // : void, durative
  return sendActionGoal("SpeechSynthesisAction", String(message));
}

async function gesture(name) {
  // : void, durative
  return sendActionGoal("FacialExpressionAction", String(name));
}

async function waitForEvent(event) {
  // FaceDirectionChanged | IsSpeakingChanged // durative
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "FaceDirectionChanged") {
    return await waitUntilFaceDirectionChanged(id);
  }
  // else if event == Event.face...
  return await waitUntilVADStateChanged(id);
}

async function waitForSpecificEvent(event) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "FaceDirectionCenter") {
    return await waitUntilFaceEvent(id, "center");
  } else if (event == "FaceDirectionLeft") {
    return await waitUntilFaceEvent(id, "left");
  } else if (event == "FaceDirectionRight") {
    return await waitUntilFaceEvent(id, "right");
  } else if (event == "NoFace") {
    return await waitUntilFaceEvent(id, "noFace");
  } else if (event == "IsSpeakingFalse") {
    return await waitUntilVADState(id, false);
  } else if (event == "IsSpeakingTrue") {
    return await waitUntilVADState(id, true);
  }
}

function waitForAll(subprogram1, subprogram2) {
  // : [any]
  return Promise.all([subprogram1, subprogram2]);
}

function waitForOne(subprogram1, subprogram2) {
  // : any
  return Promise.race([subprogram1, subprogram2]);
}

//------------------------------------------------------------------------------
// Block Function Definitions

Blockly.defineBlocksWithJsonArray([
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
          ["FaceDirectionCenter", '"FaceDirectionCenter"'],
          ["FaceDirectionLeft", '"FaceDirectionLeft"'],
          ["FaceDirectionRight", '"FaceDirectionRight"'],
          ["NoFace", '"NoFace"'],
          ["IsSpeakingFalse", '"IsSpeakingFalse"'],
          ["IsSpeakingTrue", '"IsSpeakingTrue"']
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
  },
  {
    type: "Action_Action_WaitAll",
    message0: "Action Action Wait All",
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Action_Event_WaitAll",
    message0: "Action Event Wait All",
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Event_Event_WaitAll",
    message0: "Event Event Wait All",
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Action_Action_WaitOne",
    message0: "Action Action Wait One",
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Action_Event_WaitOne",
    message0: "Action_Event_WaitOne",
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Event_Event_WaitOne",
    message0: "Event_Event_WaitOne",
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  }
  //----------------------------------------------------------------------------
]);

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

Blockly.JavaScript["Action_Action_WaitAll"] = function(block) {
  return `var result;
          await waitForAll(promisify2(async cb => {\n
            result = (await say('Hello There'));
            cb(null, null);\n
          })(), promisify2(async cb => {
            result = (await gesture("CONFUSED"));\n
            cb(null, null);
          })());\n
          await sleep(1);
          await waitForAll(promisify2(async cb => {\n
            result = (await say('My name is Meebo'));
            cb(null, null);\n
          })(), promisify2(async cb => {
            result = (await gesture("HAPPY"));\n
            cb(null, null);
          })());
`;
};

Blockly.JavaScript["Action_Event_WaitAll"] = function(block) {
  return `var result;
          result = (await say('Hello There'));\n
          await waitForSpecificEvent(String("FaceDirectionCenter"));\n
          result = (await say('Nice to Meet You'));`;
};

Blockly.JavaScript["Event_Event_WaitAll"] = function(block) {
  return `var result;
          await waitForAll(promisify2(async cb => {\n
            await waitForSpecificEvent(String("FaceDirectionCenter"));\n
            cb(null, null);
          })(), promisify2(async cb => {\n
            await waitForSpecificEvent(String("IsSpeakingFalse"));
            cb(null, null);\n
          })());
          result = (await say('Hello'));
          result = 0;`;
};

Blockly.JavaScript["Action_Action_WaitOne"] = function(block) {
  return `var result;
          result = (await say('Hello'));\n
          await sleep(3);
          result = (await say('Timed Out'));`;
};

Blockly.JavaScript["Action_Event_WaitOne"] = function(block) {
  return `var result;
          result = (await say('Hello my name is Meebo'));\n
          await waitForSpecificEvent(String("NoFace"));\n
          result = (await setMessage('On Standby'));`;
};

Blockly.JavaScript["Event_Event_WaitOne"] = function(block) {
  return `var result;
          await waitForSpecificEvent(String("FaceDirectionLeft"));\n
          await waitForSpecificEvent(String("FaceDirectionRight"));\n
          result = (await setMessage('Bye Now'));`;
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

document.getElementById("run").onclick = () => {
  const code = Blockly.JavaScript.workspaceToCode(editor);
  run(code);
};

document.getElementById("stop").onclick = stop;

document.getElementById("run_neckexercise").onclick = () => {
  fetch("/public/neck.js")
    .then(function(response) {
      return response.text();
    })
    .then(function(code) {
      console.debug(code);
      run(code);
    });
};

document.getElementById("run_monologue").onclick = () => {
  fetch("/public/monologue.js")
    .then(function(response) {
      return response.text();
    })
    .then(function(code) {
      console.debug(code);
      var curCode = `(async () => {${code} monologue()})();`;
      eval(curCode);
    });
};

document.getElementById("run_interview").onclick = () => {
  fetch("/public/interview.js")
    .then(function(response) {
      return response.text();
    })
    .then(function(code) {
      console.debug(code);
      var curCode = `(async () => {${code} interview()})();`;
      eval(curCode);
    });
};

document.getElementById("download").onclick = () => {
  const text = document.getElementById("js").innerText;
  const a = document.createElement("a");
  a.id = "js";
  a.href = "data:text/javascript;charset=utf-8," + encodeURIComponent(text);
  a.download = "program";
  a.click();
};

//------------------------------------------------------------------------------
// Scratch
(async () => {
  console.log("started");
})();
