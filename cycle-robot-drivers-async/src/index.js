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

export function addRobotEventListener(eventName, listener) {
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

  stream.addListener({
    next: val => {
      listener(null, val);
    }
  });
}

export function removeRobotEventListener(eventName, listener) {
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

  stream.removeListener({
    next: val => {
      listener(null, val);
    }
  });
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

  onceHandles[id] = {
    id,
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

export function off(onceHandle) {
  if (typeof onceHandle === "undefined") {
    for (const key in onceHandles) {
      onceHandle = onceHandles[key];
      onceHandle.stream.removeListener(onceHandle.listener);
      delete onceHandles[onceHandle.id];
    }
  } else {
    onceHandle.stream.removeListener(onceHandle.listener);
    delete onceHandles[onceHandle.id];
  }
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

// export function isSaying() {
//   return getActionStatus("SpeechSynthesisAction").then(r => {
//     return r !== null && r === "ACTIVE";
//   });
// };

// export function isExpressing() {
//   return getActionStatus("FacialExpressionAction").then(r => {
//     return r !== null && r === "ACTIVE";
//   });
// };

// export function isDisplayingText() {
//   return getActionStatus("RobotSpeechbubbleAction").then(r => {
//     return r !== null && r === "ACTIVE";
//   });
// };

// export function isDisplayingButton() {
//   return getActionStatus("HumanSpeechbubbleAction").then(r => {
//     return r !== null && r === "ACTIVE";
//   });
// };
