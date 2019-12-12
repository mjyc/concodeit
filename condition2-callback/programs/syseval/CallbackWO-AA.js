var say_done, sleep_done;


// beg start_program
cancelActionGoals();
// end start_program
startSaying(String('Hello'), (result) => {
  say_done = true;
});
startSleeping(3, _ => {
  sleep_done = true;
});
while (!say_done && !sleep_done) {
  await sleep(0.1);console.log('sleep');
}
startSaying(String('Timed out'), (result) => {
});
