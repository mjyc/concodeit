var alreadyDone;

/**
 * Describe this function...
 */
function finish() {
  if (!alreadyDone) {
    startSaying(String('Timed out'));
    alreadyDone = true;
  }
}


(async () => {
  alreadyDone = false;
  startSaying(String('Hello'));
  startSleeping(3);
})();

when(56626658, "sayDone", (res, err) => {
  finish();
})
when(77385923, "sleepDone", (res, err) => {
  finish();
})