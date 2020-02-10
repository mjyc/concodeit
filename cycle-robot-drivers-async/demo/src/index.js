import { promisify } from "util";
import { initialize, makeSendGoal } from "cycle-robot-drivers-async";

initialize();

(async () => {
  const result = await promisify(makeSendGoal("DisplayButtonAction"))({
    HumanSpeechbubbleAction: ["Hi", "Bye"],
    DisplayButtonSleepAction: 3000
  });
  promisify(makeSendGoal("DisplayTextAction"))({
    RobotSpeechbubbleAction: `I got "${result.result}"`,
    DisplayTextSleepAction: 3000
  });
})();
