var alreadyDone;

/**
 * Describe this function...
 */
function finish() {
  if (!alreadyDone) {
    startSaying(String('On standby'));
    alreadyDone = true;
  }
}


(async () => {
  alreadyDone = false;
  startSaying(String('Hello there, my name is Meebo. Goodbye now!'));
})();

when(80338303, "sayDone", (res, err) => {
  finish();
})
when(22871058, "noHumanFaceFound", (res, err) => {
  finish();
})