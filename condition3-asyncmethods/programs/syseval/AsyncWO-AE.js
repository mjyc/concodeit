var sayFinished, state;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Hello there, my name is Meebo. Goodbye now!'));
startFollowingFace();
while (!sayFinished && state != 'face not found') {
  await sleep(0.1);
  sayFinished = (await isSayFinished());
  state = (await getState("faceDirection"));
}
setMessage(String('On standby'));
