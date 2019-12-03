(async () => {
  //----------------------------------------------------------------------------
  // Simple Concurrent Neck Exercise
  async function conNeckSimple() {
    var faceDirection, cont;
    // beg start_program
    cancelActionGoals();
    // end start_program
    faceDirection = null;
    cont = null;
    sendActionGoal(
      "RobotSpeechbubbleAction",
      String("Are you ready? Turn left!")
    );
    while (faceDirection !== "Left" && cont !== "yes") {
      faceDirection = await getHumanFaceDirection();
      sendActionGoal("HumanSpeechbubbleAction", ["yes"]);
      await sleep(1);
      cont = await getActionResult("HumanSpeechbubbleAction");
    }
    cancelActionGoal("HumanSpeechbubbleAction");
    sendActionGoal("RobotSpeechbubbleAction", String("done"));
  }

  //----------------------------------------------------------------------------
  // Full Concurrent Neck Exercise
  async function fullNeckExercise() {
    var result;
    var action_list, i, face_direct, index;
    cancelActionGoals();
    sendActionGoal("RobotSpeechbubbleAction", String("Are you ready?"));
    result = null;
    while (result != "yes") {
      sendActionGoal("HumanSpeechbubbleAction", ["yes", "no"]);
      await sleep(1);
      result = await getActionResult("HumanSpeechbubbleAction");
    }
    index = 0;
    sendActionGoal("RobotSpeechbubbleAction", String("Let's get started!"));
    await sleep(2);
    action_list = [
      "Get ready for a neck exercise! Look forward and keep your neck straight!",
      "Stretch your shoulder to the left as far as possible!",
      "hold a bit longer!",
      "Bring your face back center",
      "Stretch your shoulder to the right as far as possible!",
      "keep going!"
    ];
    face_direct = ["Center", "Left", "Left", "Center", "Right", "Right"];
    var cont = "yes";
    do {
      for (var i_index in action_list) {
        i = action_list[i_index];
        sendActionGoal("RobotSpeechbubbleAction", String(i));
        await sleep(2);
        var direction = face_direct[index];
        var faceDirection;
        faceDirection = null;
        while (faceDirection !== direction) {
          faceDirection = await getHumanFaceDirection();
          await sleep(1);
          if (direction === "Right" || direction === "Left") {
            if (faceDirection === "Center") {
              sendActionGoal(
                "RobotSpeechbubbleAction",
                "Stretch the neck more to the " + direction + " ! You got this!"
              );
              await sleep(2);
            }
          }
        }
        index++;
      }
      sendActionGoal("RobotSpeechbubbleAction", "You did it!");
      await sleep(2);
      cont = null;
      var options = ["yes", "no"];
      sendActionGoal("RobotSpeechbubbleAction", "Do you want to continue?");
      cont = await YesOrNo();
    } while (cont === "yes");
  }

  // Simple helper function to get yes or no response from user
  async function YesOrNo() {
    var result;
    result = null;
    var options = ["yes", "no"];
    sendActionGoal("HumanSpeechbubbleAction", options);
    while (options.indexOf(result) === -1) {
      sendActionGoal("HumanSpeechbubbleAction", options);
      await sleep(1);
      result = await getActionResult("HumanSpeechbubbleAction");
    }
    cancelActionGoal("RobotSpeechbubbleAction");
    return result;
  }

  fullNeckExercise();
})();
