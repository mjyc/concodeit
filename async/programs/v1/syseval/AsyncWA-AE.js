var sayFinished, state;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Hello there!'));
startFollowingFace();
while (!sayFinished || state != 'center') {
  await sleep(0.1);
  sayFinished = (await isSayFinished());
  state = (await getState("humanFaceDirection"));
}
stopFollowingFace();
sendActionGoal("SpeechSynthesisAction", String('Nice to meet you!'));
