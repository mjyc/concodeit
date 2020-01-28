import "./styles.css";

import { initialize, makeSendGoal } from "cycle-robot-drivers-async";
import { promisify } from "util";

initialize();

const handles = {};

const sendRobotSpeechbubbleActionGoal = promisify((goal, callback) => {
  handles["RobotSpeechbubbleAction"] = makeSendGoal("RobotSpeechbubbleAction")(
    goal,
    callback
  );
});
const sendHumanSpeechbubbleActionGoal = promisify(
  makeSendGoal("HumanSpeechbubbleAction")
);

(async () => {
  const outputs = await Promise.race([
    sendRobotSpeechbubbleActionGoal("Hello"),
    sendHumanSpeechbubbleActionGoal(["Hi"])
  ]);
  console.log(outputs);
})();
