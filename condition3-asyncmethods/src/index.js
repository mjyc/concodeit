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
        if (val.status === "SUCCEEDED") {
          callback(null, val.status);
        } else {
          callback(null, null);
        }
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
    type: "display_message",
    message0: "display message %1",
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
    type: "ask_multiple_choice",
    message0: "ask multiple choice %1",
    args0: [
      {
        type: "input_value",
        name: "CHOICES",
        check: "Array"
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
    message0: "speak %1",
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
    type: "listen",
    message0: "listen",
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_display_message_result",
    message0: "get display message result",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_ask_multiple_choice_result",
    message0: "get multiple choice result",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_speak_result",
    message0: "get speak result",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_listen_result",
    message0: "get listen result",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_display_message_status",
    message0: "get display message status",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_ask_multiple_choice_status",
    message0: "get multiple choice status",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_speak_status",
    message0: "get speak status",
    output: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "get_listen_status",
    message0: "get listen status",
    output: null,
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

Blockly.JavaScript["sleep"] = function(block) {
  return block.getRootBlock().type === "start_program"
    ? `await sleep(${Blockly.JavaScript.valueToCode(
        block,
        "ARG0",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
    : "";
};

Blockly.JavaScript["display_message"] = function(block) {
  return block.getRootBlock().type === "start_program"
    ? `sendActionGoal("RobotSpeechbubbleAction", String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}));\n`
    : "";
};

Blockly.JavaScript["ask_multiple_choice"] = function(block) {
  return block.getRootBlock().type === "start_program"
    ? `sendActionGoal("HumanSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
        block,
        "CHOICES",
        Blockly.JavaScript.ORDER_ATOMIC
      )});\n`
    : "";
};

Blockly.JavaScript["get_display_message_result"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionResult("RobotSpeechbubbleAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["get_ask_multiple_choice_result"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionResult("HumanSpeechbubbleAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["get_speak_result"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionResult("SpeechSynthesisAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["get_listen_result"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionResult("SpeechRecognitionAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["get_display_message_status"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionStatus("RobotSpeechbubbleAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["get_ask_multiple_choice_status"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionStatus("HumanSpeechbubbleAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["get_speak_status"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionStatus("SpeechSynthesisAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["get_listen_status"] = function(block) {
  const code =
    block.getRootBlock().type === "start_program"
      ? `await getActionStatus("SpeechRecognitionAction")`
      : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["cancel_display_message"] = function(block) {
  return `cancelActionGoal("RobotSpeechbubbleAction");\n`;
};

Blockly.JavaScript["cancel_ask_multiple_choice"] = function(block) {
  return `cancelActionGoal("HumanSpeechbubbleAction");\n`;
};

Blockly.JavaScript["cancel_speak"] = function(block) {
  return `cancelActionGoal("SpeechSynthesisAction");\n`;
};

Blockly.JavaScript["cancel_listen"] = function(block) {
  return `cancelActionGoal("SpeechRecognitionAction");\n`;
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

//------------------------------------------------------------------------------
// Scratch
(async () => {
  console.log("started");
})();
