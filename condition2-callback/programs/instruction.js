var event;


// beg start_program
cancelActionGoals();
// end start_program
startSaying(String('Let\'s start from looking forward'), (result) => {
  waitUntil(String("FaceDirectionCenter"), () => {
    startSaying(String('Now slowly rotate to your right'), (result) => {
      waitForEvent(String("FaceDirectionChanged"), (err, res) => {
        event = res;
        setMessage(String(event));
        if (event == 'left') {
          startSaying(String('Warning'), (result) => {
          });
        }
        waitUntil(String("FaceDirectionRight"), () => {
          startSleeping(2, _ => {
            setMessage(String(event));
            if (event == 'right') {
              startSaying(String('Warning'), (result) => {
              });
            }
          });
          startSaying(String('Now slowly rotate to your left'), (result) => {
            waitForEvent(String("FaceDirectionChanged"), (err, res) => {
              event = res;
              setMessage(String(event));
              if (event == 'right') {
                startSaying(String('Warning'), (result) => {
                });
              }
              waitUntil(String("FaceDirectionLeft"), () => {
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