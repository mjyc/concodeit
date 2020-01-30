import { promisify } from "util";
import { initialize, makeSendGoal } from "cycle-robot-drivers-async";

initialize();

(async () => {
  // promisify(makeSendGoal("DisplayTextAction"))({
  //   RobotSpeechbubbleAction: "Hello",
  //   SleepAction: 3000
  // });
  const result = await promisify(makeSendGoal("DisplayButtonAction"))({
    HumanSpeechbubbleAction: ["Hi", "Bye"],
    SleepAction: 3000
  });
  promisify(makeSendGoal("DisplayTextAction"))({
    RobotSpeechbubbleAction: `I got "${result.result}"`,
    SleepAction: 3000
  });
})();
