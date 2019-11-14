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

function detectFaceDirectionChange(id, callback) {
  let prevFaceDirection = null;
  const SIDE_ANGLE = 13;
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        const features = extractFaceFeatures(poses);
        const faceDirection = !features.isVisible
          ? "noface"
          : features.noseAngle > SIDE_ANGLE
          ? "left"
          : features.noseAngle < -SIDE_ANGLE
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

function detectVADChange(id, callback) {
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

function stopDetectChange(id) {
  eventHandles[id].stream.removeListener(eventHandles[id].listener);
}

function waitForFaceDirection(id, faceDirection, callback) {
  const SIDE_ANGLE = 13;
  eventHandles[id] = {
    stream: sources.PoseDetection.events("poses"),
    listener: {
      next: poses => {
        const features = extractFaceFeatures(poses);
        const curFaceDirection = !features.isVisible
          ? "noface"
          : features.noseAngle > SIDE_ANGLE
          ? "left"
          : features.noseAngle < -SIDE_ANGLE
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

function waitUntil(event, callback) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (event == "FaceDirectionCenter") {
    waitForFaceDirection(id, "center", callback);
  } else if (event == "FaceDirectionLeft") {
    waitForFaceDirection(id, "left", callback);
  } else if (event == "FaceDirectionRight") {
    waitForFaceDirection(id, "right", callback);
  } else if (event == "NoFace") {
    waitForFaceDirection(id, "noface", callback);
  } else if (event == "IsSpeakingFalse") {
    waitForVoiceActivity(id, false, callback);
  } else if (event == "IsSpeakingTrue") {
    waitForVoiceActivity(id, true, callback);
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
  },
  {
    type: "wait_until",
    message0: "wait until %1 %2 then %3",
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
    type: "Action_Action_WaitAll",
    message0: "Action Action Wait All",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Action_Event_WaitAll",
    message0: "Action Event Wait All",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Event_Event_WaitAll",
    message0: "Event Event Wait All",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Action_Action_WaitOne",
    message0: "Action Action Wait One",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Action_Event_WaitOne",
    message0: "Action Event Wait One",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "Event_Event_WaitOne",
    message0: "Event Event Wait One",
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

Blockly.JavaScript["Action_Action_WaitAll"] = function(block) {
  return check(block)
    ? `// beg start_program\n
          cancelActionGoals();\n
          // end start_program\n
          sendActionGoalCallback("FacialExpressionAction", String("CONFUSED"), (result) => {});\n
          startSaying(String('Hello'), (result) => {\n
          startSleeping(1, _ => {\n
          sendActionGoalCallback("FacialExpressionAction", String("HAPPY"), (result) => {});\n
          startSaying(String('My name is Meebo'), (result) => {});});});`
    : "";
};
Blockly.JavaScript["Action_Event_WaitAll"] = function(block) {
  return check(block)
    ? `// beg start_program\n
          cancelActionGoals();\n
          // end start_program\n
          startSaying(String('Hello There'), (result) => {\n
          waitUntil(String("FaceDirectionCenter"), () => {\n
          setMessage(String('Nice to Meet You'));});});`
    : "";
};
Blockly.JavaScript["Event_Event_WaitAll"] = function(block) {
  return check(block)
    ? `// beg start_program\n
          cancelActionGoals();\n
          // end start_program\n
          waitUntil(String("FaceDirectionCenter"), () => {\n
          waitUntil(String("IsSpeakingFalse"), () => {\n
          startSaying(String('Hello'), (result) => {});});});`
    : "";
};
Blockly.JavaScript["Action_Action_WaitOne"] = function(block) {
  return check(block)
    ? `// beg start_program\n
          cancelActionGoals();\n
          // end start_program\n
          startSaying(String('Hello'), (result) => {\n
          startSleeping(3, _ => {\n
          startSaying(String('Timed Out'), (result) => {});});});`
    : "";
};
Blockly.JavaScript["Action_Event_WaitOne"] = function(block) {
  return check(block)
    ? `// beg start_program\n
          cancelActionGoals();\n
          // end start_program\n
          startSaying(String('Hello my name is Meebo. Goodbye now'), (result) => {\n
          waitUntil(String("NoFace"), () => {\n
          setMessage(String('On Standby'));});});`
    : "";
};
Blockly.JavaScript["Event_Event_WaitOne"] = function(block) {
  return check(block)
    ? `// beg start_program\n
          cancelActionGoals();\n
          // end start_program\n
          waitUntil(String("FaceDirectionLeft"), () => {\n
            waitUntil(String("FaceDirectionRight"), () => {\n
              setMessage(String('Bye Now'));\n
            });
          });`
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
};

document.getElementById("run").onclick = () => {
  var code = Blockly.JavaScript.workspaceToCode(editor);
  run(code);
};

document.getElementById("stop").onclick = stop;

document.getElementById("run_instruction").onclick = () => {
  fetch("/public/instruction.js")
    .then(function(response) {
      return response.text();
    })
    .then(function(code) {
      console.log(code);
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
      var curCode = `(async () => {${code}})();`;
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
      var curCode = `(async () => {${code}})();`;
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
