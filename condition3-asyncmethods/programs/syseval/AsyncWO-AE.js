var sayFinished, state;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Hello there, my name is Meebo. Goodbye now!'));
startFollowingFace();
while (!sayFinished && state != 'noface') {
  await sleep(0.1);
  sayFinished = (await isSayFinished());
  state = (await getState("humanFaceDirection"));
}
setMessage(String('On standby'));
