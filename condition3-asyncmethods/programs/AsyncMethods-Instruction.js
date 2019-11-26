var sayFinished, state;


// beg start_program
cancelActionGoals();
// end start_program
sendActionGoal("SpeechSynthesisAction", String('Let\'s start from looking forward'));
sayFinished = (await isSayFinished());
state = (await getState("faceDirection"));
while (!sayFinished || state != 'Center') {
  await sleep(3);
  sayFinished = (await isSayFinished());
  state = (await getState("faceDirection"));
}
sendActionGoal("SpeechSynthesisAction", String('and now slowly rotate to your right'));
sayFinished = (await isSayFinished());
while (!sayFinished) {
  await sleep(1);
  sayFinished = (await isSayFinished());
}
state = (await getState("faceDirection"));
while (state != 'Right') {
  await sleep(3);
  sendActionGoal("SpeechSynthesisAction", String('Warning'));
  setMessage(String(state));
  state = (await getState("faceDirection"));
}
sendActionGoal("SpeechSynthesisAction", String('and now slowly rotate to your left'));
sayFinished = (await isSayFinished());
while (!sayFinished) {
  await sleep(1);
  sayFinished = (await isSayFinished());
}
state = (await getState("faceDirection"));
while (state != 'Left') {
  await sleep(3);
  sendActionGoal("SpeechSynthesisAction", String('Warning'));
  setMessage(String(state));
  state = (await getState("faceDirection"));
}
sendActionGoal("SpeechSynthesisAction", String('You are done!'));
