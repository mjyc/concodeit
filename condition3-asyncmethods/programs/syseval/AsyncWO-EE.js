var state;


// beg start_program
cancelActionGoals();
// end start_program
startFollowingFace();
while (state != 'left' && state != 'left') {
  await sleep(0.1);
  state = (await getState("humanFaceDirection"));
}
setMessage(String('Bye now!'));
