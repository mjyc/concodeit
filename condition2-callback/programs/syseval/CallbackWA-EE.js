var alreadyDone, doneSpeaking, lookingAtCenter;

/**
 * Describe this function...
 */
function finish() {
  if (!alreadyDone && lookingAtCenter && doneSpeaking) {
    startSaying(String('Hello'));
    alreadyDone = true;
  }
}


(async () => {
  alreadyDone = false;
})();

when(45859501, "isHumanSpeakingFalse", (res, err) => {
  doneSpeaking = true;
  finish();
})
when(79396169, "humanFaceLookingAtCenter", (res, err) => {
  lookingAtCenter = true;
  finish();
})