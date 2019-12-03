(async () => {
  //----------------------------------------------------------------------------
  // Interview Program -- test works!!

  async function interview() {
    setMessage("What does a typical day look like for you?");
    // user hasn't said anything yet
    var isSpeaking = await getState("isSpeaking");
    while (!isSpeaking) {
      await sleep(1);
      isSpeaking = await getState("isSpeaking");
    }
    // started talking
    startFollowingFace();
    var dir = await getHumanFaceDirection();
    while (isSpeaking || dir !== "Center") {
      await sleep(1);
      isSpeaking = await getState("isSpeaking");
      dir = await getHumanFaceDirection();
    }
    // finished talking
    stopFollowingFace();
    // prompt next question
    setMessage("What sort of vacations do you like to take?");
    startFollowingFace();
    // wait to start talking
    isSpeaking = await getState("isSpeaking");
    while (!isSpeaking) {
      await sleep(1);
      isSpeaking = await getState("isSpeaking");
    }
    // wait till finish talking
    dir = await getHumanFaceDirection();
    while (isSpeaking || dir !== "Center") {
      await sleep(1);
      isSpeaking = await getState("isSpeaking");
      dir = await getHumanFaceDirection();
    }
    stopFollowingFace();
    // finish
    setMessage("We are done. Thank you.");
  }

  interview();
})();
