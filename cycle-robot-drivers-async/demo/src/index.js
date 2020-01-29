import "./styles.css";

// import { initialize, makeSendGoal, once } from "cycle-robot-drivers-async";
import robot from "cycle-robot-drivers-async/api";
import { promisify } from "util";

// initialize();

robot.init();

// (async () => {
//   promisify(makeSendGoal("DisplayText"))({ text: "Hello", duration: 3 });
//   const result = await promisify(makeSendGoal("DisplayButton"))({
//     text: ["Hi", "Bye"],
//     duration: 3
//   });
//   promisify(makeSendGoal("DisplayText"))({
//     text: `I got "${result}"`,
//     duration: 3
//   });
// })();
