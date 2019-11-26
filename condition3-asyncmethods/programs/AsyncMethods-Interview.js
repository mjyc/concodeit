var state, faceDir;


// beg start_program
cancelActionGoals();
// end start_program
setMessage(String('What does a typical day look like for you?'));
state = (await getState("isSpeaking"));
while (!state) {
  await sleep(1);
  state = (await getState("isSpeaking"));
}
startFollowingFace();
state = (await getState("isSpeaking"));
faceDir = (await getState("faceDirection"));
while (state && faceDir != 'center') {
  await sleep(1);
  state = (await getState("isSpeaking"));
  faceDir = (await getState("faceDirection"));
}
setMessage(String('What sort of vacations do you like to take?'));
state = (await getState("isSpeaking"));
while (!state) {
  await sleep(1);
  state = (await getState("isSpeaking"));
}
state = (await getState("isSpeaking"));
faceDir = (await getState("faceDirection"));
while (state && faceDir != 'center') {
  await sleep(1);
  state = (await getState("isSpeaking"));
  faceDir = (await getState("faceDirection"));
}
setMessage(String('We are done thank you'));
