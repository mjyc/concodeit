// beg start_program
cancelActionGoals();
// end start_program
setMessage(String('What does a typical day look like for you'));
waitUntil(String("isHumanSpeakingTrue"), () => {
  startFollowingFace();
  waitUntil(String("humanFaceLookingCenter"), () => {
    waitUntil(String("IsHumanSpeakingFalse"), () => {
      stopFollowingFace();
      setMessage(String('What sort of vacations do you like to take'));
      waitUntil(String("isHumanSpeakingTrue"), () => {
        startFollowingFace();
        waitUntil(String("humanFaceLookingCenter"), () => {
          waitUntil(String("IsHumanSpeakingFalse"), () => {
            setMessage(String('We are done thank you'));
          });
        });
      });
    });
  });
});