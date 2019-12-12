var state, speak_state;


// beg start_program
cancelActionGoals();
// end start_program
startFollowingFace();
while (state != 'Center' || speak_state) {
  await sleep(0.1);
  state = (await getState("faceDirection"));
  speak_state = (await getState("isSpeaking"));
}
stopFollowingFace();
sendActionGoal("SpeechSynthesisAction", String('Hello'));
