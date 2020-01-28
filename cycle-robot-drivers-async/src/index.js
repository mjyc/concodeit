require("util.promisify/shim")();
import { promisify } from "util";
import xs from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { div, label, input, makeDOMDriver } from "@cycle/dom";
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
  // fake speech input
  const speechDetected$ = sources.DOM.select(".speech")
    .events("keypress")
    .filter(ev => ev.key === "Enter")
    .map(ev => ev.target.value);
  const vdom$ = xs.of(
    div([
      label("type and press enter:"),
      input(".speech", { attr: { type: "text" } })
    ])
  );

  return Object.assign(
    {
      tabletFace: tabletFace$,
      speechDetected: speechDetected$,
      dom: vdom$
    },
    actionNames.reduce((prev, actionName) => {
      prev[actionName] = {
        goal: goals$
          .filter(goals => goals.type === actionName)
          .map(goals => goals.value),
        cancel: cancels$
          .filter(cancels => cancels.type === actionName)
          .map(cancels => cancels.value)
      };
      return prev;
    }, {})
  );
}

let sources;
let sinks;

export function initialize(options = {}) {
  if (typeof options.container === "undefined") {
    options.container = document.body.getElementsByTagName("div")[0];
  }
  if (typeof options.hidePoseViz === "undefined") {
    options.hidePoseViz = true;
  }
  runTabletRobotFaceApp(
    s => {
      s.followFace = xs.create();
      sources = s;
      sinks = main(s);
      return sinks;
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

export function mockInitialize({ mockSources = {} } = {}) {
  sources = mockSources;
  sinks = main(sources);
  return { sources, sinks };
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

export let sendActionGoalHandles = actionNames.reduce((prev, actionName) => {
  prev[actionName] = null;
  return prev;
}, {});

export function sendActionGoal(actionName, goal) {
  return promisify((g, callback) => {
    sendActionGoalHandles[actionName] = makeSendGoal(actionName)(
      g,
      (err, val) => {
        if (!err && val.status.status === "SUCCEEDED") {
          callback(null, val.result);
        } else {
          callback(null, null);
        }
      }
    );
  })(goal);
}

const onceHandles = {};

export function once(eventName) {
  if (["speechDetected", "buttonPressed"].indexOf(eventName) === -1) {
    throw new Error(`Invalid input "eventName" ${eventName}`);
  }
  const id = Math.floor(Math.random() * Math.pow(10, 8));

  const stream =
    eventName === "speechDetected"
      ? sinks.speechDetected
      : sources.HumanSpeechbubbleAction.result
          .filter(result => {
            return result.status.status === "SUCCEEDED";
          })
          .map(r => {
            return r.result;
          });
  const eventHandler = (val, cb) => {
    onceHandles[id].stream.removeListener(onceHandles[id].listener);
    cb(null, val.result);
  };

  onceHandles[id] = {
    listener: null,
    stream,
    stop: () => {
      onceHandles[id].stream.removeListener(onceHandles[id].listener);
    }
  };

  return promisify(cb => {
    onceHandles[id].listener = {
      next: val => {
        onceHandles[id].stream.removeListener(onceHandles[id].listener);
        cb(null, val);
      }
    };
    onceHandles[id].stream.addListener(onceHandles[id].listener);
  })();
}
