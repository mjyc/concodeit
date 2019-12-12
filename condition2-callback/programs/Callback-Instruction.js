var event;


// beg start_program
cancelActionGoals();
// end start_program
startSaying(String('Let\'s start from looking forward'), (result) => {
  waitUntil(String("humanFaceLookingAtCenter"), () => {
    startSaying(String('And now slowly rotate to your right'), (result) => {
      waitForEvent(String("humanFaceDirectionChanged"), (err, res) => {
        event = res;
        setMessage(String(event));
        if (event != 'right') {
          startSaying(String('Warning'), (result) => {
          });
        }
        waitUntil(String("humanFaceLookingAtRight"), () => {
          startSaying(String('And now slowly rotate to your left'), (result) => {
            waitForEvent(String("humanFaceDirectionChanged"), (err, res) => {
              event = res;
              setMessage(String(event));
              if (event != 'left') {
                startSaying(String('Warning'), (result) => {
                });
              }
              waitUntil(String("humanFaceLookingAtLeft"), () => {
                startSaying(String('You are done'), (result) => {
                });
              });
            });
          });
        });
      });
    });
  });
});
