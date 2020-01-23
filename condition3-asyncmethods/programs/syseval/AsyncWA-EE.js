var state, speak_state;


// beg start_program
cancelActionGoals();
// end start_program
startFollowingFace();
while (state != 'center' || speak_state) {
  await sleep(0.1);
  state = (await getState("humanFaceDirection"));
  speak_state = (await getState("isHumanSpeaking"));
}
stopFollowingFace();
sendActionGoal("SpeechSynthesisAction", String('Hello'));
