var sayFinished, gestureFinished;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Hello there!'));
startGesturing("HAPPY");
while (!sayFinished || !gestureFinished) {
  await sleep(0.1);
  sayFinished = (await isSayFinished());
  gestureFinished = (await isGestureFinished());
}
sendActionGoal("SpeechSynthesisAction", String('My name is Meebo'));
startGesturing("HAPPY");
