var sayFinished;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Hello'));
await sleep(3);
while (!sayFinished) {
  await sleep(0.1);
  sayFinished = (await isSayFinished());
}
sendActionGoal("SpeechSynthesisAction", String('Timed out'));
