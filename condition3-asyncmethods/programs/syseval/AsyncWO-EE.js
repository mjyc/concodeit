var state;


// beg start_program
cancelActionGoals();
// end start_program
startFollowingFace();
while (state != 'Left' && state != 'Right') {
  await sleep(0.1);
  state = (await getState("faceDirection"));
}
setMessage(String('Bye now!'));
