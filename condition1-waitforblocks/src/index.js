import "./styles.css";

import Blockly from "node-blockly/browser";

Blockly.defineBlocksWithJsonArray([
  {
    type: "display_message",
    message0: "display message %1",
    args0: [
      {
        type: "input_value",
        name: "MESSAGE",
        check: "String"
      }
    ],
    output: null,
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
    output: null,
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
    output: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "return",
    message0: "return %1",
    args0: [
      {
        type: "input_value",
        name: "VALUE"
      }
    ],
    previousStatement: null,
    colour: 290,
    tooltip: "",
    helpUrl: ""
  }
]);

Blockly.JavaScript["display_message"] = function(block) {
  const code = `await sendActionGoal("RobotSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
    block,
    "MESSAGE",
    Blockly.JavaScript.ORDER_ATOMIC
  )})`;
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

Blockly.JavaScript["wait_for_all"] = function(block) {
  return [
    "await Promise.all([" +
      [0, 1]
        .map(function(i) {
          return `(async () => {\n${Blockly.JavaScript.statementToCode(
            block,
            "DO" + i
          )}})()`;
        })
        .join(", ")
        .trim() +
      "])",
    Blockly.JavaScript.ORDER_NONE
  ];
};

Blockly.JavaScript["wait_for_one"] = function(block) {
  return [
    "await Promise.race([" +
      [0, 1]
        .map(function(i) {
          return `(async () => {\n${Blockly.JavaScript.statementToCode(
            block,
            "DO" + i
          )}})()`;
        })
        .join(", ")
        .trim() +
      "])",
    Blockly.JavaScript.ORDER_NONE
  ];
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
    handles[actionName] = makeSendGoal(actionName)(g, (err, val) => {
      if (val.status.status === "SUCCEEDED") {
        callback(null, val.result);
      } else {
        callback(null, null);
      }
    });
  })(goal);
}

initialize({
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

document.getElementById("run").onclick = () => {
  var curCode = `(async () => {${Blockly.JavaScript.workspaceToCode(
    editor
  )}})();`;
  eval(curCode);
};

// setTimeout(async () => {
//   // const outputs = await Promise.race([
//   //   (async () => {
//   //     var result = await sendActionGoal("RobotSpeechbubbleAction", "Hello");
//   //     return result;
//   //   })(),
//   //   (async () => {
//   //     var result = await sendActionGoal("HumanSpeechbubbleAction", ["Hi"])
//   //     return result;
//   //   })(),
//   // ]);
//   // console.log(outputs);
//   // const outputs = await Promise.race([
//   //   (async () => {
//   //     return (await sendActionGoal("RobotSpeechbubbleAction", 'Hello'));})(),
//   //   (async () => {
//   //     return (await sendActionGoal("HumanSpeechbubbleAction", ['31', '2']));})()
//   // ]);
//   // console.log(outputs);
//   // return (await sendActionGoal("RobotSpeechbubbleAction", '3'));
//   var result;
//   result = await Promise.all([
//     (async () => {
//       return await sendActionGoal("RobotSpeechbubbleAction", "Hello");
//     })(),
//     (async () => {
//       result = await sendActionGoal("HumanSpeechbubbleAction", [
//         "Hello",
//         "Hello"
//       ]);
//       makeCancelGoal("RobotSpeechbubbleAction")(
//         handles["RobotSpeechbubbleAction"]
//       );
//       return result;
//     })()
//   ]);
//   return await sendActionGoal("RobotSpeechbubbleAction", result);
// }, 2000);

// setTimeout(async () => {
//   sendActionGoal("RobotSpeechbubbleAction", ' ');
// }, 3000);

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
