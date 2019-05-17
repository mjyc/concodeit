import "./styles.css";

import Blockly from "node-blockly/browser";

Blockly.defineBlocksWithJsonArray([
  {
    type: "send_action_goal",
    message0: "send action goal %1 %2",
    args0: [
      {
        type: "input_value",
        name: "ACTION_NAME",
        check: "String"
      },
      {
        type: "input_value",
        name: "GOAL"
      }
    ],
    output: null,
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
  const code = `await sendActionGoal(${Blockly.JavaScript.valueToCode(
    block,
    "ACTION_NAME",
    Blockly.JavaScript.ORDER_ATOMIC
  )}, ${Blockly.JavaScript.valueToCode(
    block,
    "GOAL",
    Blockly.JavaScript.ORDER_ATOMIC
  )})`;
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["wait_for_all"] = function(block) {
  // NOTE: wrap await with another promise
  return (
    "Promise.all([" +
    [0, 1]
      .map(function(i) {
        return `(async () => {\n${Blockly.JavaScript.statementToCode(block, "DO" + i)}})()`;
      })
      .join(", ")
      .trim() +
    "]);\n"
  );
};

Blockly.JavaScript["wait_for_one"] = function(block) {
  return (
    "Promise.race([" +
    [0, 1]
      .map(function(i) {
        return `(async () => {\n${Blockly.JavaScript.statementToCode(block, "DO" + i)}})()`;
      })
      .join(", ")
      .trim() +
    "]);\n"
  );
};

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

import {
  initialize,
  makeSendGoal,
  makeCancelGoal
} from "cycle-robot-drivers-async";
import { promisify } from "util";

const handles = {};

function sendActionGoal(actionName, goal) {
  return promisify((g, callback) => {
    handles[actionName] = makeSendGoal(actionName)(g, callback);
  })(goal);
}

// setTimeout(async () => {
//   // console.log("start");
//   // await sendActionGoal("RobotSpeechbubbleAction", ["Hello"]);
//   // console.log("done");
//   const outputs = await Promise.race([
//     (async () => {
//       var result = await sendActionGoal("RobotSpeechbubbleAction", "Hello");
//       return result;
//     })(),
//     (async () => {
//       var result = await sendActionGoal("HumanSpeechbubbleAction", ["Hi"])
//       return result;
//     })(),
//   ]);
//   console.log(outputs);
// }, 2000);

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
  setTimeout(() => {
    initialize({
      container: document.getElementById('app'),
      styles: {
        speechbubblesOuter: {
          width: "585px",
        },
        robotSpeechbubble: {
          styles: {
            message: {fontSize: '60px'},
            button: {fontSize: '48px'},
          }
        },
        humanSpeechbubble: {
          styles: {
            message: {fontSize: '60px'},
            button: {fontSize: '48px'},
          }
        },
      },
      TabletFace: {
        styles: {
          faceHeight: "480px",
          faceWidth: "640px",
          eyeSize: "160px",
        }
      }
    });
  }, 1000);

  document.getElementById("run").onclick=() => {
    console.log("run");
    var curCode = `(async () => {${Blockly.JavaScript.workspaceToCode(editor)}})();`
    eval(curCode);
    console.log("done");
  };
}
