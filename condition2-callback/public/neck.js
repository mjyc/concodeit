function runNeckExerciseApp() {
  var result, posX, posY, faceDir, tt, tt2, id;

/**
 * Describe this function...
 */
function handle_display_message_done(result) {
  sleep(1, _ => {
  });
}

/**
 * Describe this function...
 */
function handle_face_event(posX, posY, faceDir) {
  if (tt == 0) {
    if (faceDir == 'left') {
      tt = 1;
      tt2 = 0;
      sendActionGoalCallback("RobotSpeechbubbleAction", String('GJ'), (result) => {
        handle_display_message_done(tt);
      });
    }
    if (faceDir == 'right') {
      sendActionGoalCallback("RobotSpeechbubbleAction", String('move left'), (result) => {
      });
    }
  }
  else if (tt2 == 0) {
    if (posX > '0.3') {
      tt2 = 1;
      sendActionGoalCallback("RobotSpeechbubbleAction", String('GJ2'), (result) => {
        handle_display_message_done(tt);
      });
    }
    if (posX < '0.2') {
      sendActionGoalCallback("RobotSpeechbubbleAction", String('move right'), (result) => {
      });
    }
  }
  else {
    sendActionGoalCallback("RobotSpeechbubbleAction", String('done with exercise'), (result) => {
    });
  }
}


// beg start_program
cancelActionGoals();
// end start_program
tt = 0;
tt2 = -1;
sendActionGoalCallback("RobotSpeechbubbleAction", String('Turn your neck left, then move it right'), (result) => {
});
id = (detectFace(63338757, (posX, posY, faceDir) => {
  handle_face_event(posX, posY, faceDir);
  }));
}
