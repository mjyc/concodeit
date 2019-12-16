(async () => {
  //----------------------------------------------------------------------------
  // Interview Program -- test works!!

  async function interview() {
    setMessage("What does a typical day look like for you?");
    // user hasn't said anything yet
    var isHumanSpeaking = await getState("isHumanSpeaking");
    while (!isHumanSpeaking) {
      await sleep(1);
      isHumanSpeaking = await getState("isHumanSpeaking");
    }
    // started talking
    startFollowingFace();
    var dir = await getHumanFaceDirection();
    while (isHumanSpeaking || dir !== "center") {
      await sleep(1);
      isHumanSpeaking = await getState("isHumanSpeaking");
      dir = await getHumanFaceDirection();
    }
    // finished talking
    stopFollowingFace();
    // prompt next question
    setMessage("What sort of vacations do you like to take?");
    startFollowingFace();
    // wait to start talking
    isHumanSpeaking = await getState("isHumanSpeaking");
    while (!isHumanSpeaking) {
      await sleep(1);
      isHumanSpeaking = await getState("isHumanSpeaking");
    }
    // wait till finish talking
    dir = await getHumanFaceDirection();
    while (isHumanSpeaking || dir !== "center") {
      await sleep(1);
      isHumanSpeaking = await getState("isHumanSpeaking");
      dir = await getHumanFaceDirection();
    }
    stopFollowingFace();
    // finish
    setMessage("We are done. Thank you.");
  }

  interview();
})();
