require("util.promisify/shim")();
import { promisify } from "util";
import xs from "xstream";
import get from "lodash.get";
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
      sources = s;
      sinks = main(s);
      sources.speechDetected = sinks.speechDetected;
      return sinks;
    },
    {
      DOM: makeDOMDriver(options.container),
      TabletFace: makeTabletFaceDriver(options.TabletFace),
      VAD: makeVADDriver()
    },
    options
  );
  // make sure "sources[actionName].status" does not get jammed
  actionNames.map(actionName =>
    sources[actionName].status.addListener(() => {})
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

export function cancelActionGoal(actionName) {
  if (sendActionGoalHandles[actionName])
    makeCancelGoal(actionName)(sendActionGoalHandles[actionName]);
}

export function cancelActionGoals() {
  actionNames.map(actionName => cancelActionGoal(actionName));
}

export function getActionStatus(actionName) {
  return promisify(callback => {
    const listener = {
      next: val => {
        sources[actionName].status.removeListener(listener);
        if (
          sendActionGoalHandles[actionName] &&
          sendActionGoalHandles[actionName].goal_id &&
          sendActionGoalHandles[actionName].goal_id.id === val.goal_id.id
        ) {
          callback(null, val.status);
        } else {
          callback(null, null);
        }
      }
    };
    sources[actionName].status.addListener(listener);
  })();
}

const listenerHandles = {};

export function addListener(eventName, listener) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (!listenerHandles[id]) {
    throw new Error(`listners[${id}] is not "undefined"`);
  }
  listenerHandles[id] = {
    _id: id,
    stream: get(sources, eventName),
    listener: {
      next: val => {
        listener(null, val);
      }
    }
  };
  listenerHandles[id].stream.addListener(listenerHandles[id].listener);
}

export function removeListeners() {
  for (const listenerHandle in listenerHandles) {
    listenerHandle.stream.removeListener(listenerHandle.listener);
  }
}
