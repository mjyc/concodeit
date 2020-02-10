var i;


(async () => {
  i = 0;
})();

when(21100249, "humanFaceLookingAtCenter", (res, err) => {
  if (i == 0) {
    startSaying(String('My name is Meebo'));
    i = 1;
  }
})
when(24181825, "sayDone", (res, err) => {
  if (i == 1) {
    setMessage(String('Nice to meet you'));
    i = 2;
  }
})
when(50455123, "noHumanFaceFound", (res, err) => {
  if (i != 100) {
    i = 100;
    startSaying(String('Bye'));
  }
})