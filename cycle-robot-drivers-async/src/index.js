// import "./styles.css";

// import { initialize, makeSendGoal, makeCancelGoal } from "./lib";
// import { promisify } from "util";

// initialize();

// const handles = {};

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

import xs from "xstream";
import { runTabletRobotFaceApp } from "@cycle-robot-drivers/run";
import {
  GoalID,
  Goal,
  Status,
  GoalStatus,
  Result,
  ActionSources,
  ActionSinks,
  initGoal,
  generateGoalStatus,
  isEqualGoalStatus,
  isEqualGoalID
} from "@cycle-robot-drivers/action";

const goals$ = xs.create();
const cancels$ = xs.create();

function main(sources) {
  return {
    FacialExpressionAction: {
      goal: goals$
        .filter(goals => goals.type === "FacialExpressionAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "FacialExpressionAction")
        .map(cancels => cancels.value)
    },
    RobotSpeechbubbleAction: {
      goal: goals$
        .filter(goals => goals.type === "RobotSpeechbubbleAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "RobotSpeechbubbleAction")
        .map(cancels => cancels.value)
    },
    HumanSpeechbubbleAction: {
      goal: goals$
        .filter(goals => goals.type === "HumanSpeechbubbleAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "HumanSpeechbubbleAction")
        .map(cancels => cancels.value)
    },
    AudioPlayerAction: {
      goal: goals$
        .filter(goals => goals.type === "AudioPlayerAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "AudioPlayerAction")
        .map(cancels => cancels.value)
    },
    SpeechSynthesisAction: {
      goal: goals$
        .filter(goals => goals.type === "SpeechSynthesisAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "SpeechSynthesisAction")
        .map(cancels => cancels.value)
    },
    SpeechRecognitionAction: {
      goal: goals$
        .filter(goals => goals.type === "SpeechRecognitionAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "SpeechRecognitionAction")
        .map(cancels => cancels.value)
    }
  };
}

let sources;

export function initialize() {
  runTabletRobotFaceApp(s => {
    sources = s;
    return main();
  });
}

export function makeSendGoal(actionName) {
  return (g, callback) => {
    const goal = initGoal(g);
    const goal_id = goal.goal_id;
    sources[actionName].result.addListener({
      next: i => callback(null, i),
      error: err => callback(err)
    });
    goals$.shamefullySendNext({
      type: actionName,
      value: goal
    });
    const handle = {
      goal_id
    };
    return handle;
  };
}

export function makeCancelGoal(actionName) {
  return h => {
    const goal_id = h.goal_id;
    cancels$.shamefullySendNext({
      type: actionName,
      value: goal_id
    });
  };
}
