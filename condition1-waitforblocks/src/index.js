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
  makeCancelGoal(actionName)(handles[actionName]);
}

async function sleep(sec) {
  return promisify((s, cb) => setTimeout(cb, s * 1000))(sec);
}

async function race(sendActionGoalFncs, cancelFncs) {
  const out = await Promise.race(
    sendActionGoalFncs.map(async (sendActionGoalFnc, i) => ({
      i: i,
      o: await sendActionGoalFnc()
    }))
  );
  cancelFncs.map((cancelFnc, i) => {
    if (i !== out.i) {
      cancelFnc();
    }
  });
  return out.o;
}

const waitHandles = {};

function waitUntilFaceEvent(id, predicate) {
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
        if (poses.length === 0) {
          return pred(null, null);
        } else {
          const nosePoint = poses[0].keypoints.find(kpt => kpt.part === "nose");
          return pred(
            !nosePoint
              ? null
              : nosePoint.position.x === 0
              ? 0
              : nosePoint.position.x / 640,
            !nosePoint
              ? null
              : nosePoint.position.y === 0
              ? 0
              : (480 - nosePoint.position.y) / 480
          );
        }
      },
      (err, val) => {
        waitHandles[id].stream.removeListener(waitHandles[id].listener);
        cb(err, val);
      }
    );
    waitHandles[id].stream.addListener(waitHandles[id].listener);
  })(predicate);
}

function stopWaitUntilFaceEvent(id) {
  waitHandles[id].stop();
}

//------------------------------------------------------------------------------
// Block Function Definitions

Blockly.defineBlocksWithJsonArray([
  {
    type: "wait_until_face_event",
    message0: "wait until face event: faceYaw, faceRoll %1",
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
  //----------------------------------------------------------------------------
  {
    type: "display_message",
    message0: "display message %1",
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
    type: "ask_multiple_choice",
    message0: "ask multiple choice %1",
    args0: [
      {
        type: "input_value",
        name: "CHOICES",
        check: "Array"
      }
    ],
    output: ["Action", "String"],
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "speak",
    message0: "speak %1",
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
    type: "listen",
    message0: "listen",
    output: ["Action", "String"],
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  //----------------------------------------------------------------------------
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
    colour: 290,
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
  }
  //----------------------------------------------------------------------------
]);

Blockly.JavaScript["display_message"] = function(block) {
  const code = `await sendActionGoal("RobotSpeechbubbleAction", String(${Blockly.JavaScript.valueToCode(
    block,
    "MESSAGE",
    Blockly.JavaScript.ORDER_ATOMIC
  )}))`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["ask_multiple_choice"] = function(block) {
  const code = `await sendActionGoal("HumanSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
    block,
    "CHOICES",
    Blockly.JavaScript.ORDER_ATOMIC
  )})`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["speak"] = function(block) {
  const code = `await sendActionGoal("SpeechSynthesisAction", String(${Blockly.JavaScript.valueToCode(
    block,
    "MESSAGE",
    Blockly.JavaScript.ORDER_ATOMIC
  )}))`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["listen"] = function(block) {
  const code = `await sendActionGoal("SpeechRecognitionAction", {})`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["sleep"] = function(block) {
  return `await sleep(${Blockly.JavaScript.valueToCode(
    block,
    "ARG0",
    Blockly.JavaScript.ORDER_ATOMIC
  )})`;
};

Blockly.JavaScript["wait_for_all"] = function(block) {
  return "";
  // return [
  //   "await Promise.all([" +
  //     [0, 1]
  //       .map(
  //         i =>
  //           `(async () => {\n${Blockly.JavaScript.valueToCode(
  //             block,
  //             "DO" + i,
  //             Blockly.JavaScript.ORDER_ATOMIC
  //           )}})()`
  //       )
  //       .join(", ")
  //       .trim() +
  //     "]);",
  //   Blockly.JavaScript.ORDER_NONE
  // ];
};

Blockly.JavaScript["wait_for_one"] = function(block) {
  const cancelFncsCode = [];
  return "";
  // return [
  //   `race([${[0, 1]
  //     .map(i => {
  //       const code = Blockly.JavaScript.valueToCode(
  //         block,
  //         "DO" + i,
  //         Blockly.JavaScript.ORDER_ATOMIC
  //       );
  //       const m = code.match(/\("([a-zA-Z]+)",/);
  //       const name = !!m ? m[1] : "";
  //       cancelFncsCode.push(
  //         actionNames.indexOf(name) !== -1
  //           ? `cancelActionGoal.bind(null, "${name}")`
  //           : name !== ""
  //           ? `stopWaitUntilFaceEvent.bind(null, "${name}")`
  //           : `() => {}`
  //       );
  //       return `(async () => {\nreturn ${Blockly.JavaScript.valueToCode(
  //         block,
  //         "DO" + i,
  //         Blockly.JavaScript.ORDER_ATOMIC
  //       )}})`;
  //     })
  //     .join(",\n")
  //     .trim()}], [${[0, 1].map(i => `${cancelFncsCode[i]}`).join(", ")}]);`,
  //   Blockly.JavaScript.ORDER_NONE
  // ];
};

Blockly.JavaScript["wait_until_face_event"] = function(block) {
  const id = `${Math.floor(Math.random() * Math.pow(10, 8))}`;
  return [
    `await waitUntilFaceEvent("${id}", (posX, posY) => ${Blockly.JavaScript.valueToCode(
      block,
      "WU0",
      Blockly.JavaScript.ORDER_ATOMIC
    )})`,
    Blockly.JavaScript.ORDER_NONE
  ];
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
  console.log("test");
})();
