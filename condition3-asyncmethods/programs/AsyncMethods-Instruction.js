var sayFinished, state;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Let\'s start from looking forward'));
sayFinished = (await isSayFinished());
state = (await getState("humanFaceDirection"));
while (!sayFinished || state != 'center') {
  await sleep(3);
  sayFinished = (await isSayFinished());
  state = (await getState("humanFaceDirection"));
}
sendActionGoal("SpeechSynthesisAction", String('and now slowly rotate to your right'));
sayFinished = (await isSayFinished());
while (!sayFinished) {
  await sleep(1);
  sayFinished = (await isSayFinished());
}
state = (await getState("humanFaceDirection"));
while (state != 'right') {
  await sleep(3);
  sendActionGoal("SpeechSynthesisAction", String('Warning'));
  setMessage(String(state));
  state = (await getState("humanFaceDirection"));
}
sendActionGoal("SpeechSynthesisAction", String('and now slowly rotate to your left'));
sayFinished = (await isSayFinished());
while (!sayFinished) {
  await sleep(1);
  sayFinished = (await isSayFinished());
}
state = (await getState("humanFaceDirection"));
while (state != 'left') {
  await sleep(3);
  sendActionGoal("SpeechSynthesisAction", String('Warning'));
  setMessage(String(state));
  state = (await getState("humanFaceDirection"));
}
sendActionGoal("SpeechSynthesisAction", String('You are done!'));
