var look_left, look_right;


// beg start_program
cancelActionGoals();
// end start_program
waitUntil(String("FaceDirectionLeft"), () => {
  look_left = true;
});
waitUntil(String("FaceDirectionRight"), () => {
  look_right = true;
});
while (!look_left && !look_right) {
  await sleep(0.1);console.log('sleep');
}
setMessage(String('Bye now!'));
