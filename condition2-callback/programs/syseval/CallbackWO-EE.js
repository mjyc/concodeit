var alreadyDone;

/**
 * Describe this function...
 */
function finish() {
  if (!alreadyDone) {
    startSaying(String('Bye now!'));
    alreadyDone = true;
  }
}


(async () => {
  alreadyDone = false;
})();

when(36142940, "humanFaceLookingAtLeft", (res, err) => {
  finish();
})
when(18288486, "humanFaceLookingAtRight", (res, err) => {
  finish();
})