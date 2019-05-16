import "./styles.css";

import Blockly from "node-blockly/browser";

Blockly.defineBlocksWithJsonArray([
  {
    type: "send_action_goal",
    message0: "send action goal %1 %2",
    args0: [
      {
        type: "input_value",
        name: "ACTION_NAME"
      },
      {
        type: "input_value",
        name: "GOAL"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "wait_for_all",
    message0: "wait for all %1 %2",
    args0: [
      {
        type: "input_statement",
        name: "DO0"
      },
      {
        type: "input_statement",
        name: "DO1"
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
    message0: "wait for one %1 %2",
    args0: [
      {
        type: "input_statement",
        name: "DO0"
      },
      {
        type: "input_statement",
        name: "DO1"
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  }
]);

Blockly.JavaScript["send_action_goal"] = function(block) {
  return `await sendActionGoal(${Blockly.JavaScript.valueToCode(
    block,
    "ACTION_NAME",
    Blockly.JavaScript.ORDER_ATOMIC
  )}, ${Blockly.JavaScript.valueToCode(
    block,
    "GOAL",
    Blockly.JavaScript.ORDER_ATOMIC
  )});\n`;
};

Blockly.JavaScript["wait_for_all"] = function(block) {
  return (
    "Promise.all(" +
    [0, 1]
      .map(function(i) {
        return Blockly.JavaScript.statementToCode(block, "DO" + i);
      })
      .join(",")
      .trim() +
    "]);\n"
  );
};

Blockly.JavaScript["wait_for_one"] = function(block) {
  return (
    "Promise.race([" +
    [0, 1]
      .map(function(i) {
        return Blockly.JavaScript.statementToCode(block, "DO" + i);
      })
      .join(",")
      .trim() +
    "]);\n"
  );
};

var editor;
var code = document.getElementById("startBlocks");

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

import {
  initialize,
  makeSendGoal,
  makeCancelGoal
} from "cycle-robot-drivers-async";
import { promisify } from "util";

initialize();

const handles = {};

function sendActionGoal(actionName, goal) {
  return promisify((g, callback) => {
    handles[actionName] = makeSendGoal(actionName)(g, callback);
  })(goal);
}

// setTimeout(async () => {
//   console.log("start");
//   await sendActionGoal("RobotSpeechbubbleAction", ["Hello"]);
//   console.log("done");
// }, 1000);

// const sendRobotSpeechbubbleActionGoal = promisify((goal, callback) => {
//   handles["RobotSpeechbubbleAction"] = makeSendGoal("RobotSpeechbubbleAction")(
//     goal,
//     callback
//   );
// });
// const sendHumanSpeechbubbleActionGoal = promisify(
//   makeSendGoal("HumanSpeechbubbleAction")
// );

// (async () => {
//   const outputs = await Promise.race([
//     sendRobotSpeechbubbleActionGoal("Hello"),
//     sendHumanSpeechbubbleActionGoal(["Hi"])
//   ]);
//   makeCancelGoal("RobotSpeechbubbleAction")(handles["RobotSpeechbubbleAction"]);
//   console.log(outputs);
// })();



//------------------------------------------------------------------------------

window.onload = () => {
  document.getElementById("run").onclick=() => {
    console.log("run");
    var curCode = `(async () => {${Blockly.JavaScript.workspaceToCode(editor)}})();`
    eval(curCode);
    console.log("done");
  };
}
