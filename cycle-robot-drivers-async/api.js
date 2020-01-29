require("util.promisify/shim")();
const { promisify } = require("util");
const {
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

// export function once(eventName) {
//   if (["speechDetected", "buttonPressed"].indexOf(eventName) === -1) {
//     throw new Error(`Invalid input "eventName" ${eventName}`);
//   }
//   const id = Math.floor(Math.random() * Math.pow(10, 8));

//   const stream =
//     eventName === "speechDetected"
//       ? sinks.speechDetected
//       : sources.HumanSpeechbubbleAction.result
//           .filter(result => {
//             return result.status.status === "SUCCEEDED";
//           })
//           .map(r => {
//             return r.result;
//           });

//   onceHandles[id] = {
//     id,
//     listener: null,
//     stream,
//     stop: () => {
//       onceHandles[id].stream.removeListener(onceHandles[id].listener);
//     }
//   };

//   return promisify(cb => {
//     onceHandles[id].listener = {
//       next: val => {
//         onceHandles[id].stream.removeListener(onceHandles[id].listener);
//         cb(null, val);
//       }
//     };
//     onceHandles[id].stream.addListener(onceHandles[id].listener);
//   })();
// }

const waitForEvent = eventName => {
  // return once(eventName);
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
  reset
};
