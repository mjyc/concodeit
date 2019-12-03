(async () => {
  //----------------------------------------------------------------------------
  // Monologue Program

  async function monologue() {
    setMessage("Hello there!");
    var faceDir = await getHumanFaceDirection();
    while (faceDir === "face not found") {
      await sleep(1);
      faceDir = await getHumanFaceDirection();
    }
    // after waiting for face to appear, introduce yourself
    await communicate("My name is Meebo", "Happy");

    var isSaying = !(await isSayFinished());
    //console.log("1." + isSaying + " " + faceDir);
    while (isSaying) {
      await sleep(1);
      isSaying = !(await isSayFinished());
    }

    await communicate("I'm made of a touch monitor and a robot arm", "n/a");
    //console.log("2." + isSaying + " " + faceDir);
    // if face exists and still talking
    faceDir = await getHumanFaceDirection();
    isSaying = !(await isSayFinished());
    while (isSaying && faceDir !== "face not found") {
      await sleep(1);
      faceDir = await getHumanFaceDirection();
      isSaying = !(await isSayFinished());
    }

    if (faceDir === "face not found") {
      await exit();
      return;
    }

    communicate("Nice to meet you", "Happy"); // what is the goodbye gesture?
    isSaying = !(await isSayFinished());
    faceDir = await getHumanFaceDirection();
    while (isSaying && faceDir !== "face not found") {
      await sleep(1);
      isSaying = !(await isSayFinished());
      faceDir = await getHumanFaceDirection();
    }
    exit();
  }

  async function communicate(message, gesture) {
    setMessage(message);
    startSaying(message);
    startGesturing(gesture);
  }

  async function exit() {
    setMessage("Goodbye!");
    startSaying("Goodbye!");
    startGesturing("Happy");
  }

  monologue();
})();
