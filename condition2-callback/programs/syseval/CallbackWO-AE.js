var say_done, no_face;


// beg start_program
cancelActionGoals();
// end start_program
startSaying(String('Hello there, my name is Meebo. Goodbye now!'), (result) => {
  say_done = true;
});
waitUntil(String("noHumanFaceFound"), () => {
  no_face = true;
});
while (!say_done && !no_face) {
  await sleep(0.1);console.log('sleep');
}
setMessage(String('On standby'));
