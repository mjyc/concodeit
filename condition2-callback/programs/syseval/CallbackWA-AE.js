var say_done, face_appear;


// beg start_program
cancelActionGoals();
// end start_program
startSaying(String('Hello there!'), (result) => {
  say_done = true;
});
waitUntil(String("humanFaceLookingAtCenter"), () => {
  face_appear = true;
});
while (!say_done || !face_appear) {
  await sleep(0.1);console.log('sleep');
}
startSaying(String('Nice to meet you!'), (result) => {
});
