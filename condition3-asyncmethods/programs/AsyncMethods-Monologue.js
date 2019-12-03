var state, sayFinished;


// beg start_program
cancelActionGoals();
// end start_program
setMessage(String('Hello there!'));
state = (await getState("faceDirection"));
while (state == 'face not found') {
  await sleep(1);
  state = (await getState("faceDirection"));
}
setMessage(String('My name is Meebo'));
sendActionGoal("SpeechSynthesisAction", String('My name is Meebo'));
startGesturing("HAPPY")sayFinished = (await isSayFinished());
while (!sayFinished) {
  await sleep(1);
  sayFinished = (await isSayFinished());
}
if (state != 'face not found') {
  setMessage(String('I\'m made of a touch monitor and a robot arm'));
  sendActionGoal("SpeechSynthesisAction", String('I\'m made of a touch monitor and a robot arm'));
  sayFinished = (await isSayFinished());
  while (!sayFinished) {
    await sleep(1);
    sayFinished = (await isSayFinished());
  }
  if (state != 'face not found') {
    setMessage(String('Nice to meet you'));
    sendActionGoal("SpeechSynthesisAction", String('Nice to meet you'));
    sayFinished = (await isSayFinished());
    while (!sayFinished) {
      await sleep(1);
      sayFinished = (await isSayFinished());
    }
  } else {
    setMessage(String('Goodbye'));
    sendActionGoal("SpeechSynthesisAction", String('Goodbye'));
    startGesturing("SAD")}
} else {
  setMessage(String('Goodbye'));
  sendActionGoal("SpeechSynthesisAction", String('Goodbye'));
  startGesturing("SAD")}
