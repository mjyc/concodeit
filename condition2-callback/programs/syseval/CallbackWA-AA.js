var say_done, gesture_done;


// beg start_program
cancelActionGoals();
// end start_program
startSaying(String('Hello there!'), (result) => {
  say_done = true;
});
sendActionGoalCallback("FacialExpressionAction", String("HAPPY"), (result) => {
  gesture_done = true;
});
while (!say_done || !gesture_done) {
  await sleep(0.1);console.log('sleep');
}
startSaying(String('My name is Meebo'), (result) => {
});
sendActionGoalCallback("FacialExpressionAction", String("ANGRY"), (result) => {
});
