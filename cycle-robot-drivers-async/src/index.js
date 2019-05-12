import "./styles.css";

import { initialize, makeSendGoal, makeCancelGoal } from "./lib";
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
  makeCancelGoal("RobotSpeechbubbleAction")(handles["RobotSpeechbubbleAction"]);
  console.log(outputs);
})();
