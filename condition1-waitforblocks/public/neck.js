async function neckExercise() {
  var instructions, result, i, right, wrong;

  right = [FaceDirectionChanged.RIGHT, FaceDirectionChanged.LEFT];
  wrong = [FaceDirectionChanged.LEFT, FaceDirectionChanged.RIGHT];
  instructions = [
    "Now slowly rotate to your right",
    "Now slowly rotate to your left"
  ];

  // beg start_program
  cancelActionGoals();
  // end start_program
  await Promise.race([
    promisify2(async cb => {
      result = await sendActionGoal(
        "RobotSpeechbubbleAction",
        String("Let's start from looking forward")
      );
      cb(null, null);
    })(),
    promisify2(async cb => {
      cb(null, null);
    })()
  ]);

  await sleep(2);
  var direction = await checkFaceDirection(100);
  while (direction != FaceDirectionChanged.CENTER) {
    direction = await checkFaceDirection(100);
  }

  for (var i_index in instructions) {
    i = instructions[i_index];
    console.log(i);
    result = await sendActionGoal("RobotSpeechbubbleAction", String(i));
    var correct = false;
    var dir = await checkFaceDirection(1000);
    await Promise.race([
      promisify2(async cb => {
        // Branch that checks for right direction
        while (dir != right[i_index]) {
          dir = await checkFaceDirection(1000);
        }
        correct = true;
        cb(null, null);
      })(),
      promisify2(async cb => {
        // Branch that checks and prints wrong direction
        var dir2 = await checkFaceDirection(111);
        while (!correct) {
          // If face is not facing right direction, print and say descriptive comment
          if (dir2 == wrong[i_index]) {
            await printFalseDir(i);
          }
          await sleep(1);
          dir2 = await checkFaceDirection(111);
        }
        cb(null, null);
      })()
    ]);
    result = await sendActionGoal("RobotSpeechbubbleAction", "Good Job!");
    await sleep(2);
  }
  result = await sendActionGoal(
    "RobotSpeechbubbleAction",
    String("You're all done!")
  );
}

/*
  Displays and says "try again!" and redisplays instruction i on the screen.

*/
async function printFalseDir(i) {
  var result;
  await Promise.all([
    promisify2(async cb => {
      result = await sendActionGoal(
        "SpeechSynthesisAction",
        String("Try again!")
      );
      cb(null, null);
    })(),
    promisify2(async cb => {
      result = await sendActionGoal(
        "RobotSpeechbubbleAction",
        String("Try again!")
      );
      cb(null, null);
    })()
  ]);
  await sleep(1);
  result = await sendActionGoal("RobotSpeechbubbleAction", String(i));
}
