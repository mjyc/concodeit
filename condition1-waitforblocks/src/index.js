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

//----------------------- ROS setup -----------------------------------------

// Connect to local rosbridge server via 
var ros = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
 });

 // Called on connection, outputs feedback to indicate connection success
 ros.on('connection', function() {
    console.log("connected");
 });

// Called on error. outputs error for user to see.
ros.on('error', function(error) {
    console.log("err");
});

// called on close. outputs feedback to indicate server shutdown
ros.on('close', function() {
    console.log("connection closed");
 });

// Create a service that facilitates moving the end effector.
var endEffectorClient = new ROSLIB.Service({
    ros: ros,
    name : '/open_manipulator/goal_task_space_path_position_only',
    serviceType : 'open_manipulator_msgs/SetKinematicsPose' 
});

// Create a service that facilitates panning and tilting.
var tiltAndPanClient = new ROSLIB.Service({
    ros: ros,
    name : '/open_manipulator/goal_joint_space_path',
    serviceType : 'open_manipulator_msgs/SetJointPosition' 
});

// Create a service that facilitates rolling the screen.
var pitchClient = new ROSLIB.Service({
    ros: ros,
    name : '/open_manipulator/goal_tool_control',
    serviceType : 'open_manipulator_msgs/SetJointPosition' 
});

// Set up a service request with parameters for the endEffectorClient.
var endEffector = new ROSLIB.ServiceRequest({
    planning_group : '',
    end_effector_name : 'gripper',
    kinematics_pose : {
        pose : {
            position : {
                x : 0.286,
                y : 0.0,
                z : 0.2045
            },
            orientation : {
                x : 0.0,
                y : 0.0,
                z : 0.0,
                w : 1.0
            }
        },
        max_accelerations_scaling_factor : 0.0,
        max_velocity_scaling_factor : 0.0,
        tolerance : 0.0
    },
    path_time : 2.0
});

// Service with parameters for thetiltAndPanClient
var tiltAndPan = new ROSLIB.ServiceRequest({
    planning_group : '',
    joint_position : {
        joint_name : ['joint1', 'joint2', 'joint3', 'joint4'],
        position : [0.0, 0.0, 0.0, 0.0],
        max_accelerations_scaling_factor : 0.0,
        max_velocity_scaling_factor : 0.0
    },
    path_time : 2.0
});

// Service with parameters for pitchClient
var pitchSrv = new ROSLIB.ServiceRequest({
    planning_group : '',
    joint_position : {
        joint_name : ['gripper'],
        position : [0.0],
        max_accelerations_scaling_factor : 0.0,
        max_velocity_scaling_factor : 0.0
    },
    path_time : 2.0
});

/*
  Calls the moveArmClient service with the requested parameters.
  Params:
    srv: a ROSLIB.ServiceRequest 
    client: The service to client to call
  RetVal: if service is planned then return true.
*/
function callService(srv, client) {
  var retVal = false;

    client.callService(srv, function(result) {
        console.log('Result for service call on '
        + client.name
        + ': '
        + result.is_planned);

        retVal = result.is_planned;
    });

    return retVal;
}

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

function sleep(sec) {
  return promisify((s, cb) => setTimeout(cb, s * 1000))(sec);
}

// HACK to make promisify in eval; used by wait_for_all and wait_for_one
function promisify2(f) {
  return promisify(f);
}

const waitHandles = {};

// IDEA: provide faceYaw, faceRoll, faceSize in addition
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

function waitUntilVAD(id) {
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

//------------------------------------------------------------------------------
// Block Function Definitions

Blockly.defineBlocksWithJsonArray([
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
  //----------------------------------------------------------------------------
    // added move primitive
  {
    type: "move",
    message0: "Move to position : x %1 y %2 z %3 in %4 seconds",
    args0: [
      {
        type: "input_value",
        name: "x",
        check: "Number"
      },
      {
        type: "input_value",
        name: "y",
        check: "Number"
      },
      {
        type: "input_value",
        name: "z",
        check: "Number"
      },
      {
        type: "input_value",
        name: "dur",
        check: "Number"
      }
    ],
    inputsInline: true,
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
  ,
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
    colour: 230,
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
  //----------------------------------------------------------------------------
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

function check(block) {
  return (
    block.getRootBlock().type === "start_program" ||
    block.getRootBlock().type === "procedures_defnoreturn"
  );
}

Blockly.JavaScript["move"] = function(block) {
  var value_x = Blockly.JavaScript.valueToCode(block, 'x', Blockly.JavaScript.ORDER_ATOMIC);
  var value_y = Blockly.JavaScript.valueToCode(block, 'y', Blockly.JavaScript.ORDER_ATOMIC);
  var value_z = Blockly.JavaScript.valueToCode(block, 'z', Blockly.JavaScript.ORDER_ATOMIC);
  var value_dur = Blockly.JavaScript.valueToCode(block, 'dur', Blockly.JavaScript.ORDER_ATOMIC);
  return code = check(block)
      ? `var pos = {
                x : ${value_x},
                y : ${value_y},
                z : ${value_z}
         };
         move(pos, ${value_dur});`
      : "";
};

Blockly.JavaScript["display_message"] = function(block) {
  const code = check(block)
    ? `await sendActionGoal("RobotSpeechbubbleAction", String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}))`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["ask_multiple_choice"] = function(block) {
  const code = check(block)
    ? `await sendActionGoal("HumanSpeechbubbleAction", ${Blockly.JavaScript.valueToCode(
        block,
        "CHOICES",
        Blockly.JavaScript.ORDER_ATOMIC
      )})`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["speak"] = function(block) {
  const code = check(block)
    ? `await sendActionGoal("SpeechSynthesisAction", String(${Blockly.JavaScript.valueToCode(
        block,
        "MESSAGE",
        Blockly.JavaScript.ORDER_ATOMIC
      )}))`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["listen"] = function(block) {
  const code = check(block)
    ? `await sendActionGoal("SpeechRecognitionAction", {})`
    : "";
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript["cancel_display_message"] = function(block) {
  return check(block) ? `cancelActionGoal("RobotSpeechbubbleAction");\n` : "";
};

Blockly.JavaScript["cancel_ask_multiple_choice"] = function(block) {
  return check(block) ? `cancelActionGoal("HumanSpeechbubbleAction");\n` : "";
};

Blockly.JavaScript["cancel_speak"] = function(block) {
  return check(block) ? `cancelActionGoal("SpeechSynthesisAction");\n` : "";
};

Blockly.JavaScript["cancel_listen"] = function(block) {
  return check(block) ? `cancelActionGoal("SpeechRecognitionAction");\n` : "";
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

Blockly.JavaScript["wait_for_all"] = function(block) {
  return check(block)
    ? `await Promise.all([${[0, 1]
        .map(
          i =>
            `promisify2(async cb => {\n${Blockly.JavaScript.statementToCode(
              block,
              `DO${i}`
            )}  cb(null, null);\n})()`
        )
        .join(", ")}]);\n`
    : "";
};

// IDEA: stop unfinished sub-programs by adding "if (is{id}Done) return" after
//   every statement in sub-programs; in addition, running sendActionGoal and
//   waitUntilFaceEvent functions should be stopped
Blockly.JavaScript["wait_for_one"] = function(block) {
  return check(block)
    ? `await Promise.race([${[0, 1]
        .map(
          i =>
            `promisify2(async cb => {\n${Blockly.JavaScript.statementToCode(
              block,
              `DO${i}`
            )}  cb(null, null);\n})()`
        )
        .join(", ")}]);\n`
    : "";
};

function hasParentBlock(block, type) {
  return block === null
    ? false
    : block.type === type
    ? true
    : hasParentBlock(block.getParent(), type);
}

Blockly.JavaScript["done"] = function(block) {
  return check(block)
    ? hasParentBlock(block, "wait_for_all") ||
      hasParentBlock(block, "wait_for_one")
      ? `cb(null, null); // done\n`
      : `// done not surrounded by wait_for_all or wait_for_one\n`
    : "";
};

Blockly.JavaScript["wait_until_face_event"] = function(block) {
  return check(block)
    ? `waitUntilFaceEvent("${Math.floor(
        Math.random() * Math.pow(10, 8)
      )}", (posX, posY) => ${Blockly.JavaScript.valueToCode(
        block,
        "WU0",
        Blockly.JavaScript.ORDER_ATOMIC
      )})`
    : "";
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
sources.VAD.addListener({ next: _ => {} });

document.getElementById("run").onclick = () => {
  var code = `(async () => {${Blockly.JavaScript.workspaceToCode(editor)}})();`;
  eval(code);
};

//------------------------------------------------------------------------------
// Scratch
(async () => {
  console.log("started");
})();

//============================= Movement primitive fuctions =========================================

// helper function thaat calls the service and returns success or failure
function move(srv, client) {
  // print error if there is one
  if (callService(srv, client)) {
      console.log("success");
  } else {
    console.log("failure");
  }
}

/* format of pos paramater: 

var poss = {
  x : 0.25,
  y : 0.0,
  z : 0.2045
}; */

/*
 Moves the end effector by pos in dur seconds.
 If specified pos is out of range, end effector will not move.
 Params:
    pos: struct that specifies which x, y, z coordinates to move to
    dur: movement duration.
*/
function moveEndEffector(pos, dur) {
  endEffector.kinematics_pose.pose.position = pos;
  endEffector.path_time = dur;
  move(endEffector, endEffectorClient);
}

/*
  Rotates screen along Y axis by angle in dur seconds.
  If specified pos is out of range, end effector will not move.
  Params:
    angle: radians to rotate by. min -1.67, max 1.53.
    dur: movement duration.
*/
function tilt(angle, dur) {
  tiltAndPan.joint_position.position[3] = angle;
  tiltAndPan.path_time = dur;
  move(tiltAndPan, tiltAndPanClient);
}

/*
  Rotates screen along Z axis by angle in dur seconds.
  If specified pos is out of range, end effector will not move.
  Params:
    angle: radians to rotate by. min -3.14, max 3.14.
    dur: movement duration.
*/
function pan(angle, dur) {
  tiltAndPan.joint_position.position[0] = angle;
  tiltAndPan.path_time = dur;
  move(tiltAndPan, tiltAndPanClient);
}

/*
  Rotates screen along X axis by angle in dur seconds.
  Params:
    angle: meters to rotate by. min -0.01, max 0.01.
    dur: movement duration.
*/
function pitch(angle, dur) {
  pitchSrv.joint_position.position[0] = angle;
  pitchSrv.path_time = dur;
  move(pitchSrv, pitchClient);
}

//move(poss, 2);
//pan(1.5, 2);
//tilt(1.0, 2)
//pitch(0.01, 2);