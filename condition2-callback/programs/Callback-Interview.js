// beg start_program
cancelActionGoals();
// end start_program
setMessage(String('What does a typical day look like for you?'));
waitUntil(String("IsSpeakingTrue"), () => {
  startFollowingFace();
  waitUntil(String("FaceDirectionCenter"), () => {
    waitUntil(String("IsSpeakingFalse"), () => {
      setMessage(String('What sort of vacations do you like to take?'));
      waitUntil(String("IsSpeakingTrue"), () => {
        waitUntil(String("FaceDirectionCenter"), () => {
          waitUntil(String("IsSpeakingFalse"), () => {
            setMessage(String('We are done. Thank you'));
            stopFollowingFace();
          });
        });
      });
    });
  });
});
