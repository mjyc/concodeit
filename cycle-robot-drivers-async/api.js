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
  getLastEventValue,
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
    DisplayTextSleepAction: 1000 * duration
  }).then(r => undefined);
};

const displayButton = (buttons, duration) => {
  return sendActionGoal("DisplayButtonAction", {
    HumanSpeechbubbleAction: buttons,
    DisplayButtonSleepAction: 1000 * duration
  }).then(r => undefined);
};

const stopSay = () => {
  return cancelActionGoal("SpeechSynthesisAction");
};

const stopGesture = () => {
  return cancelActionGoal("FacialExpressionAction");
};

const stopDisplayText = () => {
  return cancelActionGoal("DisplayTextAction");
};

const stopDisplayButton = () => {
  return cancelActionGoal("DisplayButtonAction");
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
      "sleepDone",
      "sayDone",
      "gestureDone",
      "displayTextDone",
      "displayButtonDone"
    ].indexOf(eventName) === -1
  ) {
    throw new Error(`Invalid input "eventName" ${eventName}`);
  }

  const sourceNameMap = {
    sleepDone: ["SleepAction", "result"],
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

const isGesturing = () => {
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
  getActionStatus("SleepAction").then(r => {
    return r !== null && r === "ACTIVE";
  });
};

const lastDetectedSpeech = async () => {
  return getLastEventValue("lastSpeechDetected");
};
const lastDetectedButton = async () => {
  return getLastEventValue("lastButtonPressed");
};

const addEventCallback = (eventName, callback) => {
  if (
    [
      "speechDetected",
      "buttonPressed",
      "sleepDone",
      "sayDone",
      "gestureDone",
      "displayTextDone",
      "displayButtonDone"
    ].indexOf(eventName) === -1
  ) {
    throw new Error(`Invalid input "eventName" ${eventName}`);
  }

  const sourceNameMap = {
    sleepDone: ["SleepAction", "result"],
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
  stopSay,
  stopGesture,
  stopDisplayText,
  stopDisplayButton,
  waitForOne,
  waitForAll,
  waitForEvent,
  isSaying,
  isGesturing,
  isDisplayingText,
  isDisplayingButton,
  isSleeping,
  lastDetectedSpeech,
  lastDetectedButton,
  addEventCallback,
  init,
  reset
};
