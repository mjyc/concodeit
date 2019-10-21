// beg start_program
cancelActionGoals();
// end start_program
setMessage(String('Hello there!'));
waitUntil(String("FaceDirectionCenter"), () => {
  setMessage(String('My name is Meebo'));
  startSaying(String('My name is Meebo'), (result) => {
    waitUntil(String("NoFace"), () => {
      sendActionGoalCallback("FacialExpressionAction", String("CONFUSED"), (result) => {
        startSaying(String('Goodbye'), (result) => {
          setMessage(String('Goodbye'));
        });
      });
    });
    setMessage(String('I\'m made of a touch monitor and a robot arm'));
    startSaying(String('I\'m made of a touch monitor and a robot arm'), (result) => {
      waitUntil(String("NoFace"), () => {
        sendActionGoalCallback("FacialExpressionAction", String("CONFUSED"), (result) => {
          startSaying(String('Goodbye'), (result) => {
            setMessage(String('Goodbye'));
          });
        });
      });
      setMessage(String('Nice to meet you'));
      startSaying(String('Nice to meet you'), (result) => {
        sendActionGoalCallback("FacialExpressionAction", String("CONFUSED"), (result) => {
          startSaying(String('Goodbye'), (result) => {
            setMessage(String('Goodbye'));
          });
        });
      });
    });
  });
});s