var sayFinished, state;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Hello there!'));
startFollowingFace();
while (!sayFinished || state != 'Center') {
  await sleep(0.1);
  sayFinished = (await isSayFinished());
  state = (await getState("faceDirection"));
}
stopFollowingFace();
sendActionGoal("SpeechSynthesisAction", String('Nice to meet you!'));
