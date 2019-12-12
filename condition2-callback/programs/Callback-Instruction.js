var event;


// beg start_program
cancelActionGoals();
// end start_program
startSaying(String('Let\'s start from looking forward'), (result) => {
  waitUntil(String("humanFaceLookingCenter"), () => {
    startSaying(String('And now slowly rotate to your right'), (result) => {
      waitForEvent(String("humanFaceDirectionChanged"), (err, res) => {
        event = res;
        setMessage(String(event));
        if (event != 'right') {
          startSaying(String('Warning'), (result) => {
          });
        }
        waitUntil(String("humanFaceLookingRight"), () => {
          startSaying(String('And now slowly rotate to your left'), (result) => {
            waitForEvent(String("humanFaceDirectionChanged"), (err, res) => {
              event = res;
              setMessage(String(event));
              if (event != 'left') {
                startSaying(String('Warning'), (result) => {
                });
              }
              waitUntil(String("humanFaceLookingLeft"), () => {
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
