var face_appear, no_speak;


// beg start_program
cancelActionGoals();
// end start_program
waitUntil(String("humanFaceLookingAtCenter"), () => {
  face_appear = true;
});
waitUntil(String("isHumanSpeakingFalse"), () => {
  no_speak = true;
});
while (!face_appear || !no_speak) {
  await sleep(0.1);console.log('sleep');
}
startSaying(String('Hello'), (result) => {
});
