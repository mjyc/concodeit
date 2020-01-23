var alreadyDone, gestureDone, sayDone;

/**
 * Describe this function...
 */
function finish() {
  if (!alreadyDone && sayDone && gestureDone) {
    startSaying(String('My name is Meebo'));
    startGesturing(String("HAPPY"));
    alreadyDone = true;
  }
}


(async () => {
  alreadyDone = false;
  startSaying(String('Hello there!'));
  startGesturing(String("HAPPY"));
})();

when(91118398, "gestureDone", (res, err) => {
  gestureDone = true;
  finish();
})
when(50201359, "sayDone", (res, err) => {
  sayDone = true;
  finish();
})