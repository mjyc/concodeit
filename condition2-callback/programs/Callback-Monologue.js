// beg start_program
cancelActionGoals();
// end start_program
setMessage(String('Hello there!'));
startSaying(String('Hello there'), (result) => {
  waitUntil(String("humanFaceLookingAtCenter"), () => {
    setMessage(String('My name is Meebo'));
    startSaying(String('My name is Meebo'), (result) => {
      sendActionGoalCallback("FacialExpressionAction", String("HAPPY"), (result) => {
        waitUntil(String("noface"), () => {
          startSaying(String('Goodbye'), (result) => {
            setMessage(String('Goodbye'));
          });
        });
      });
      setMessage(String('I\'m made of a touch monitor and a robot arm'));
      startSaying(String('I\'m made of a touch monitor and a robot arm'), (result) => {
        waitUntil(String("noface"), () => {
          startSaying(String('Goodbye'), (result) => {
            setMessage(String('Goodbye'));
          });
        });
        setMessage(String('Nice to meet you'));
        startSaying(String('Nice to meet you'), (result) => {
          waitUntil(String("noface"), () => {
            startSaying(String('Goodbye'), (result) => {
              setMessage(String('Goodbye'));
            });
          });
        });
      });
    });
  });
});
