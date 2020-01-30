require("util.promisify/shim")();
import { promisify } from "util";
import xs from "xstream";
import get from "lodash.get";
import sampleCombine from "xstream/extra/sampleCombine";
import { div, label, input, makeDOMDriver } from "@cycle/dom";
import isolate from "@cycle/isolate";
import { withState } from "@cycle/state";
import { run } from "@cycle/run";
import { timeDriver } from "@cycle/time";
import { makeTabletFaceDriver } from "@cycle-robot-drivers/screen";
import {
  initializeTabletFaceRobotDrivers,
  withTabletFaceRobotActions
} from "@cycle-robot-drivers/run";
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
  isEqualGoalID,
  selectActionResult
} from "@cycle-robot-drivers/action";
import {
  SleepAction,
  DisplayTextAction,
  DisplayButtonAction,
  selectSleepActionStatus,
  selectDisplayTextActionStatus,
  selectDisplayButtonActionStatus
} from "@cycle-robot-drivers/actionbank";

const goals$ = xs.create();
const cancels$ = xs.create();

export let actionNames = [
  "FacialExpressionAction",
  "RobotSpeechbubbleAction",
  "HumanSpeechbubbleAction",
  "AudioPlayerAction",
  "SpeechSynthesisAction",
  "SpeechRecognitionAction",
  "SleepAction",
  "DisplayTextAction",
  "DisplayButtonAction"
];

function selectAction(actionName) {
  return in$ => in$.filter(s => !!s && !!s[actionName]).map(s => s[actionName]);
}

function main(sources) {
  const videoWidth = 640;
  const videoHeight = 480;
  const buttonPressed$ = sources.HumanSpeechbubbleAction.result
    .filter(r => r.status.status === "SUCCEEDED")
    .map(r => r.result);
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

  // set up extra action
  const sleepGoalProxy$ = xs.create();
  const sleepCancelProxy$ = xs.create();
  const sleepAction = isolate(SleepAction, "SleepAction")({
    state: sources.state,
    goal: xs.merge(
      sleepGoalProxy$,
      goals$
        .filter(goals => goals.type === "SleepAction")
        .map(goals => goals.value)
    ),
    cancel: xs.merge(
      sleepCancelProxy$,
      cancels$
        .filter(cancels => cancels.type === "SleepAction")
        .map(cancels => cancels.value)
    ),
    Time: sources.Time
  });

  const displayText = DisplayTextAction({
    state: sources.state,
    DisplayTextAction: {
      goal: goals$
        .filter(goals => goals.type === "DisplayTextAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "DisplayTextAction")
        .map(cancels => cancels.value)
    }
  });
  displayText.RobotSpeechbubbleAction.goal.addListener({
    next: goal =>
      goals$.shamefullySendNext({
        type: "RobotSpeechbubbleAction",
        value: goal
      })
  });
  displayText.RobotSpeechbubbleAction.cancel.addListener({
    next: cancel =>
      cancels$.shamefullySendNext({
        type: "RobotSpeechbubbleAction",
        value: cancel
      })
  });

  const displayButton = DisplayButtonAction({
    state: sources.state,
    DisplayButtonAction: {
      goal: goals$
        .filter(goals => goals.type === "DisplayButtonAction")
        .map(goals => goals.value),
      cancel: cancels$
        .filter(cancels => cancels.type === "DisplayButtonAction")
        .map(cancels => cancels.value)
    }
  });
  displayButton.HumanSpeechbubbleAction.goal.addListener({
    next: goal => {
      goals$.shamefullySendNext({
        type: "HumanSpeechbubbleAction",
        value: goal
      });
    }
  });
  displayButton.HumanSpeechbubbleAction.cancel.addListener({
    next: cancel => {
      cancels$.shamefullySendNext({
        type: "HumanSpeechbubbleAction",
        value: cancel
      });
    }
  });

  sleepGoalProxy$.imitate(
    xs.merge(displayText.SleepAction.goal, displayButton.SleepAction.goal)
  );
  sleepCancelProxy$.imitate(
    xs.merge(displayText.SleepAction.cancel, displayButton.SleepAction.cancel)
  );

  return Object.assign(
    {
      state: xs.merge(
        sleepAction.state,
        displayText.state,
        displayButton.state
      ),
      buttonPressed: buttonPressed$,
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

  run(
    withState(
      withTabletFaceRobotActions(s => {
        sources = s;
        sinks = main(s);
        // treat the below two as sources for "../api.js"
        sources.buttonPressed = sinks.buttonPressed;
        sources.speechDetected = sinks.speechDetected;
        sources.SleepAction = {
          status: sources.state.stream
            .compose(selectAction("SleepAction"))
            .compose(selectSleepActionStatus),
          result: sources.state.stream.compose(
            selectActionResult("SleepAction")
          )
        };
        sources.DisplayTextAction = {
          status: sources.state.stream
            .compose(selectAction("DisplayTextAction"))
            .compose(selectDisplayTextActionStatus),
          result: sources.state.stream.compose(
            selectActionResult("DisplayTextAction")
          )
        };
        sources.DisplayButtonAction = {
          status: sources.state.stream
            .compose(selectAction("DisplayButtonAction"))
            .compose(selectDisplayButtonActionStatus),
          result: sources.state.stream.compose(
            selectActionResult("DisplayButtonAction")
          )
        };
        return sinks;
      }, options)
    ),
    Object.assign(initializeTabletFaceRobotDrivers(), {
      DOM: makeDOMDriver(options.container),
      TabletFace: makeTabletFaceDriver(options.TabletFace),
      Time: timeDriver
    })
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
  sources.buttonPressed = sinks.buttonPressed;
  sources.speechDetected = sinks.speechDetected;
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

export function addListener(sourceName, listener) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (listenerHandles[id]) {
    throw new Error(`listners[${id}] is not "undefined"`);
  }
  listenerHandles[id] = {
    _id: id,
    stream: get(sources, sourceName),
    listener: {
      next: val => {
        listener(null, val);
      },
      error: err => listener(err, null)
    }
  };
  listenerHandles[id].stream.addListener(listenerHandles[id].listener);
}

export function removeListeners() {
  for (const k in listenerHandles) {
    const listenerHandle = listenerHandles[k];
    listenerHandle.stream.removeListener(listenerHandle.listener);
    delete listenerHandles[k];
  }
}

const onceHandles = {};

export function once(sourceName) {
  const id = Math.floor(Math.random() * Math.pow(10, 8));
  if (onceHandles[id]) {
    throw new Error(`onceHandles[${id}] is not "undefined"`);
  }
  onceHandles[id] = {
    _id: id,
    stream: get(sources, sourceName),
    listener: null,
    stop: () => {
      get(sources, sourceName).removeListener(onceHandles[id].listener);
    }
  };

  return promisify(cb => {
    onceHandles[id].listener = {
      next: val => {
        onceHandles[id].stream.removeListener(onceHandles[id].listener);
        cb(null, val);
      },
      error: err => {
        onceHandles[id].stream.removeListener(onceHandles[id].listener);
        cb(err, null);
      }
    };
    onceHandles[id].stream.addListener(onceHandles[id].listener);
  })();
}

export function off(onceHandle) {
  if (typeof onceHandle === "undefined") {
    for (const k in onceHandles) {
      onceHandle = onceHandles[k];
      onceHandle.stream.removeListener(onceHandle.listener);
      delete onceHandles[onceHandle.id];
    }
  } else {
    onceHandle.stream.removeListener(onceHandle.listener);
    delete onceHandles[onceHandle.id];
  }
}
