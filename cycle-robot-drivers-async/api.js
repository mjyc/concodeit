require("util.promisify/shim")();
const { promisify } = require("util");
const {
  initialize,
  sendActionGoal,
  cancelActionGoal,
  cancelActionGoals,
  addListener,
  removeListeners,
  once,
  off,
  getActionStatus
} = require("./");

const sleep = duration => {
  return sendActionGoal("SleepAction", 1000 * duration).then(r => undefined);
};

const say = text => {
  return sendActionGoal("SpeechSynthesisAction", String(text)).then(
    r => undefined
  );
};

const gesture = type => {
  return sendActionGoal("FacialExpressionAction", String(type)).then(
    r => undefined
  );
};

const displayText = (text, duration) => {
  return sendActionGoal("DisplayTextAction", {
    RobotSpeechbubbleAction: String(text),
    SleepAction: 1000 * duration
  }).then(r => undefined);
};

const displayButton = (buttons, duration) => {
  return sendActionGoal("DisplayButtonAction", {
    HumanSpeechbubbleAction: buttons,
    SleepAction: 1000 * duration
  }).then(r => undefined);
};

const waitForOne = subprogs => {
  return Promise.race(subprogs);
};

const waitForAll = subprogs => {
  return Promise.all(subprogs);
};

const waitForEvent = eventName => {
  if (
    [
      "speechDetected",
      "buttonPressed",
      "sayDone",
      "gestureDone",
      "displayTextDone",
      "displayButtonDone"
    ].indexOf(eventName) === -1
  ) {
    throw new Error(`Invalid input "eventName" ${eventName}`);
  }

  const sourceNameMap = {
    sayDone: ["SpeechSynthesisAction", "result"],
    gestureDone: ["FacialExpressionAction", "result"],
    displayTextDone: ["DisplayTextAction", "result"],
    displayButtonDone: ["DisplayButtonAction", "result"]
  };
  return once(
    typeof sourceNameMap[eventName] === "undefined"
      ? eventName
      : sourceNameMap[eventName]
  );
};

const isSaying = () => {
  return getActionStatus("SpeechSynthesisAction").then(r => {
    return r !== null && r === "ACTIVE";
  });
};

const isExpressing = () => {
  return getActionStatus("FacialExpressionAction").then(r => {
    return r !== null && r === "ACTIVE";
  });
};

const isDisplayingText = () => {
  return getActionStatus("DisplayTextAction").then(r => {
    return r !== null && r === "ACTIVE";
  });
};

const isDisplayingButton = () => {
  return getActionStatus("DisplayButtonAction").then(r => {
    return r !== null && r === "ACTIVE";
  });
};

const isSleeping = () => {
  return Promise.all([
    getActionStatus("SleepAction").then(r => {
      console.warn("SleepAction", r);
      return r !== null && r === "ACTIVE";
    }),
    getActionStatus("DisplayTextAction").then(r => {
      console.warn("DisplayTextAction", r);
      return r !== null && r === "ACTIVE";
    }),
    getActionStatus("DisplayButtonAction").then(r => {
      console.warn("DisplayButtonAction", r);
      return r !== null && r === "ACTIVE";
    })
  ]).then(([isSleeping, isDisplayingText, isDisplayingButton]) => {
    console.error(isSleeping, isDisplayingText, isDisplayingButton);
    return isSleeping && !isDisplayingText && !isDisplayingButton;
  });
};

const addEventCallback = (eventName, callback) => {
  if (
    [
      "speechDetected",
      "buttonPressed",
      "sayDone",
      "gestureDone",
      "displayTextDone",
      "displayButtonDone"
    ].indexOf(eventName) === -1
  ) {
    throw new Error(`Invalid input "eventName" ${eventName}`);
  }

  const sourceNameMap = {
    sayDone: ["SpeechSynthesisAction", "result"],
    gestureDone: ["FacialExpressionAction", "result"],
    displayTextDone: ["DisplayTextAction", "result"],
    displayButtonDone: ["DisplayButtonAction", "result"]
  };
  return addListener(
    typeof sourceNameMap[eventName] === "undefined"
      ? eventName
      : sourceNameMap[eventName],
    callback
  );
};

const init = options => {
  initialize(options);
};

const reset = () => {
  removeListeners();
  off();
  cancelActionGoals();
};

module.exports = {
  sleep,
  say,
  gesture,
  displayText,
  displayButton,
  waitForOne,
  waitForAll,
  waitForEvent,
  isSaying,
  isExpressing,
  isDisplayingText,
  isDisplayingButton,
  isSleeping,
  addEventCallback,
  init,
  reset
};
