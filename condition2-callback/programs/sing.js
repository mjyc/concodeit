var i;


(async () => {
  i = 0;
  startSaying(String('rain rain go away'));
  sendActionGoalCallback("FacialExpressionAction", String("SAD"));
})();

when(51306157, "sayDone", (res, err) => {
  if (i == 0) {
    i = 1;
    startSaying(String('little johnny wants to play'));
    sendActionGoalCallback("FacialExpressionAction", String("HAPPY"));
  }
})