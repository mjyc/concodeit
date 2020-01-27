import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { makeDOMDriver } from "@cycle/dom";
import { makeTabletFaceDriver } from "@cycle-robot-drivers/screen";
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
import makeVADDriver from "./makeVADDriver";

const goals$ = xs.create();
const cancels$ = xs.create();

export let actionNames = [
  "FacialExpressionAction",
  "RobotSpeechbubbleAction",
  "HumanSpeechbubbleAction",
  "AudioPlayerAction",
  "SpeechSynthesisAction",
  "SpeechRecognitionAction"
];

function main(sources) {
  const videoWidth = 640;
  const videoHeight = 480;
  const followFace$ = (sources.followFace || xs.never()).startWith(false);
  const tabletFace$ = xs.merge(
    sources.PoseDetection.events("poses")
      .filter(
        poses =>
          poses.length === 1 &&
          poses[0].keypoints.filter(kpt => kpt.part === "nose").length === 1
      )
      .compose(sampleCombine(followFace$))
      .filter(([_, followFace]) => !!followFace)
      .map(([poses, _]) => poses)
      .map(poses => {
        const nose = poses[0].keypoints.filter(kpt => kpt.part === "nose")[0];
        const eyePosition = {
          x: nose.position.x / videoWidth,
          y: nose.position.y / videoHeight
        };
        return {
          type: "SET_STATE",
          value: {
            leftEye: eyePosition,
            rightEye: eyePosition
          }
        };
      }),
    followFace$
      .filter(x => !x)
      .mapTo({
        type: "SET_STATE",
        value: {
          leftEye: { x: 0.5, y: 0.5 },
          rightEye: { x: 0.5, y: 0.5 }
        }
      })
  );

  // TODO: automatically generate the below
  return {
    tabletFace: tabletFace$,
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

export function initialize(options = {}) {
  if (typeof options.container === "undefined") {
    options.container = document.body.getElementsByTagName("div")[0];
  }
  runTabletRobotFaceApp(
    s => {
      s.followFace = xs.create();
      sources = s;
      return main(s);
    },
    {
      DOM: makeDOMDriver(options.container),
      TabletFace: makeTabletFaceDriver(options.TabletFace),
      VAD: makeVADDriver()
    },
    options
  );
  return sources;
}

export function initializeMock(options = {}) {
  return {};
  // if (typeof options.container === "undefined") {
  //   options.container = document.body.getElementsByTagName("div")[0];
  // }
  // runTabletRobotFaceApp(
  //   s => {
  //     s.followFace = xs.create();
  //     sources = s;
  //     return main(s);
  //   },
  //   {
  //     DOM: makeDOMDriver(options.container),
  //     TabletFace: makeTabletFaceDriver(options.TabletFace),
  //     VAD: makeVADDriver()
  //   },
  //   options
  // );
  // return sources;
}

export function makeSendGoal(actionName) {
  return (g, callback) => {
    const goal = initGoal(g);
    const goal_id = goal.goal_id;
    const subscriber = sources[actionName].result.subscribe({
      next: i => {
        if (!isEqualGoalID(goal_id, i.status.goal_id)) return;
        subscriber.unsubscribe();
        callback(null, i);
      },
      error: err => {
        if (!isEqualGoalID(goal_id, i.status.goal_id)) return;
        subscriber.unsubscribe();
        callback(err);
      }
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

export function createStreamEventListener(predicate, callback) {
  return {
    next: val => {
      if (predicate(val)) callback(null, val);
    }
  };
}
