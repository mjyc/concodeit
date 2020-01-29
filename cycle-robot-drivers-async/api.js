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
  return promisify((s, cb) => setTimeout(cb, s * 1000))(duration);
};

const say = text => {
  return sendActionGoal("SpeechSynthesisAction", String(text));
};

const express = expression => {
  return sendActionGoal("FacialExpressionAction", String(expression));
};

const displayText = (text, duration) => {
  return Promise.race([
    sendActionGoal("RobotSpeechbubbleAction", String(text)),
    sleep(duration)
  ]).then(result => {
    if (typeof result === "undefined") {
      cancelActionGoal("RobotSpeechbubbleAction");
    }
    return null;
  });
};

const displayButton = (buttons, duration) => {
  return Promise.race([
    sendActionGoal("HumanSpeechbubbleAction", buttons),
    sleep(duration)
  ]).then(result => {
    if (typeof result === "undefined") {
      cancelActionGoal("HumanSpeechbubbleAction");
    }
    return null;
  });
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
      "expressDone",
      "displayTextDone",
      "displayButtonDone"
    ].indexOf(eventName) === -1
  ) {
    throw new Error(`Invalid input "eventName" ${eventName}`);
  }

  const sourceNameMap = {
    sayDone: ["SpeechSynthesisAction", "result"],
    expressDone: ["FacialExpressionAction", "result"],
    displayTextDone: ["RobotSpeechbubbleAction", "result"],
    displayButtonDone: ["HumanSpeechbubbleAction", "result"]
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
  return getActionStatus("RobotSpeechbubbleAction").then(r => {
    return r !== null && r === "ACTIVE";
  });
};

const isDisplayingButton = () => {
  return getActionStatus("HumanSpeechbubbleAction").then(r => {
    return r !== null && r === "ACTIVE";
  });
};

const addEventCallback = (eventName, callback) => {};

const init = (...args) => {
  initialize(...args);
};

const reset = () => {
  removeListeners();
  off();
  cancelActionGoals();
};

module.exports = {
  sleep,
  say,
  express,
  displayText,
  displayButton,
  waitForOne,
  waitForAll,
  waitForEvent,
  isSaying,
  isExpressing,
  isDisplayingText,
  isDisplayingButton,
  addEventListener,
  init,
  reset
};
