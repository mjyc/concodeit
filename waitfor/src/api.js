import {
  actionNames,
  initialize,
  makeSendGoal,
  makeCancelGoal,
  createStreamEventListener
} from "cycle-robot-drivers-async";

// function sendActionGoal(actionName, goal) {
//   return promisify((g, callback) => {
//     handles[actionName] = makeSendGoal(actionName)(g, (err, val) => {
//       if (!err && val.status.status === "SUCCEEDED") {
//         callback(null, val.result);
//       } else {
//         callback(null, null);
//       }
//     });
//   })(goal);
// }

const say = text => {
  return sendActionGoal("SpeechSynthesisAction", String(message));
};

const express = expression => {};

const displayText = (text, duration) => {}; //

const displayButton = (buttons, duration) => {};

const sleep = duration => {};

const waitForOne = subprogs => {};

const waitForAll = subprogs => {};

// // const waitForEventHandles = {
// //   speechDetected: null,
// //   buttonPressed: null,
// // }
// const waitForEvent = (eventName) => {
//   // can it wait for action results? yes it should, test it.
//   // speechDetected
//   // buttonPressed
//   // consider using ID
//   if (waitForEventHandles[eventName]) {
//     waitForEventHandles[eventName].stream.removeListener(eventHandles[id].listener);
//   }
//   // sources.DOM.events().
//   return promisify((pred, cb) => {
//     eventHandles[id].listener = createStreamEventListener(
//       poses => {
//         const faceFeatures = extractFaceFeatures(poses);
//         return pred(
//           !faceFeatures.isVisible
//             ? "noface"
//             : faceFeatures.noseAngle < -NOSE_ANGLE_THRESHOLD
//             ? "right"
//             : faceFeatures.noseAngle > NOSE_ANGLE_THRESHOLD
//             ? "left"
//             : "center"
//         );
//       },
//       (err, val) => {
//         eventHandles[id].stream.removeListener(eventHandles[id].listener);
//         cb(err, direction);
//       }
//     );
//     eventHandles[id].stream.addListener(eventHandles[id].listener);
//   });
// };

module.export = {};
