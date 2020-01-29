require("util.promisify/shim")();
const { promisify } = require("util");
const {
  sendActionGoal,
  cancelActionGoal,
  once
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

module.exports = {
  sleep,
  say,
  express,
  displayText,
  displayButton,
  waitForOne,
  waitForAll,
  waitForEvent
};
