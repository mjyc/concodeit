import "./styles.css";

import { initialize, makeSendGoal, once } from "cycle-robot-drivers-async";
import { promisify } from "util";

initialize();

const sendRobotSpeechbubbleActionGoal = promisify(
  makeSendGoal("RobotSpeechbubbleAction")
);
const sendHumanSpeechbubbleActionGoal = promisify((goal, callback) => {
  makeSendGoal("HumanSpeechbubbleAction")(goal, (err, val) =>
    callback(err, val.result)
  );
});

(async () => {
  const result = await Promise.race([
    sendRobotSpeechbubbleActionGoal("Hello"),
    sendHumanSpeechbubbleActionGoal(["Hi"]),
    once("speechDetected")
  ]);
  sendRobotSpeechbubbleActionGoal(`I got "${result}"`);
})();
