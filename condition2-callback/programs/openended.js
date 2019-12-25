var i;

/**
 * Describe this function...
 */
function do_something() {
  if (i == 1) {
    setMessage(String('What does a typical day look like for you'));
  }
  if (i == 0) {
    i = 1;
  }
}


when(92239487, "isHumanSpeakingFalse", (res, err) => {
  if (i != 5) {
    do_something();
  }
})
(async () => {
  i = 0;
})();

when(71731452, "noHumanFaceFound", (res, err) => {
  if (i != 0) {
    if (i == 5) {
      setMessage(String('All done'));
    }
    if (i != 5) {
      setMessage(String('bye'));
    }
  }
})
when(23241023, "humanFaceLookingAtCenter", (res, err) => {
  if (i != 5) {
    do_something();
  }
})
when(54520976, "isHumanSpeakingTrue", (res, err) => {
  if (i != 5) {
    startFollowingFace();
    i = 5;
  }
})