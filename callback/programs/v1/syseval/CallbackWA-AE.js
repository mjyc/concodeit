var alreadyDone, lookingCenter, sayDone;

/**
 * Describe this function...
 */
function finish() {
  if (!alreadyDone && lookingCenter && sayDone) {
    startSaying(String('Nice to meet you'));
    alreadyDone = true;
  }
}


(async () => {
  alreadyDone = false;
  startSaying(String('Hello there!'));
})();

when(72768791, "humanFaceLookingAtCenter", (res, err) => {
  lookingCenter = true;
  finish();
})
when(34295151, "sayDone", (res, err) => {
  sayDone = true;
  finish();
})