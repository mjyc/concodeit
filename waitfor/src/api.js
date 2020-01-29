require("util.promisify/shim")();
const { promisify } = require("util");
const {
  sendActionGoal,
  cancelActionGoal,
  once,
  getActionStatus
} = require("cycle-robot-drivers-async");

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
  return once(eventName);
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
  isDisplayingButton
};
