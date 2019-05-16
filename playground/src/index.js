import "./styles.css";

import Blockly from "node-blockly/browser";

Blockly.defineBlocksWithJsonArray([
  {
    type: "send_robot_action",
    message0: "send robot action with arg %1",
    args0: [
      {
        type: "input_value",
        name: "ARG"
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

// Blockly.JavaScript["send_robot_action"] = function(block) {
//   return (
//     promisify((goal, callback) => {
//       handles["RobotSpeechbubbleAction"] = makeSendGoal("RobotSpeechbubbleAction")(
//         goal,
//         callback
//       );
//     })
//   );
// };

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
