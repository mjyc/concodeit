var state, faceDir;


// beg start_program
cancelActionGoals();
// end start_program
setMessage(String('What does a typical day look like for you?'));
state = (await getState("isHumanSpeaking"));
while (!state) {
  await sleep(1);
  state = (await getState("isHumanSpeaking"));
}
startFollowingFace();
state = (await getState("isHumanSpeaking"));
faceDir = (await getState("humanFaceDirection"));
while (state && faceDir != 'center') {
  await sleep(1);
  state = (await getState("isHumanSpeaking"));
  faceDir = (await getState("humanFaceDirection"));
}
setMessage(String('What sort of vacations do you like to take?'));
state = (await getState("isHumanSpeaking"));
while (!state) {
  await sleep(1);
  state = (await getState("isHumanSpeaking"));
}
state = (await getState("isHumanSpeaking"));
faceDir = (await getState("humanFaceDirection"));
while (state && faceDir != 'center') {
  await sleep(1);
  state = (await getState("isHumanSpeaking"));
  faceDir = (await getState("humanFaceDirection"));
}
setMessage(String('We are done thank you'));
