var i;


(async () => {
  i = 0;
})();

when(27266062, "humanFaceLookingAtLeft", (res, err) => {
  if (i == 2) {
    startSaying(String('Slowly rotate your head to the right'));
    setMessage(String('b'));
  }
})
when(28252385, "sayDone", (res, err) => {
  if (i == 0) {
    i = 2;
  }
})
when(21228483, "humanFaceLookingAtCenter", (res, err) => {
  if (i == 0) {
    startSaying(String('Slowly rotate your head to the right'));
    setMessage(String('a'));
  }
})
when(75275656, "humanFaceLookingAtRight", (res, err) => {
  startSaying(String('Great Job'));
  setMessage(String('c'));
  i = 1;
})