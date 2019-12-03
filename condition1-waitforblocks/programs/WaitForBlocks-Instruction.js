var result, correctDir;


result = (await say('Let\'s start from looking forward'));
await waitForSpecificEvent(String("FaceDirectionCenter"));
correctDir = false;
result = (await say('And now slowly rotate to your right'));
while (!correctDir) {
  _stop["Irv,p~4(.Y8.P^U!!nr9"] = false;
  await waitForOne(promisify2(async cb => {
    await waitForSpecificEvent(String("FaceDirectionRight")); if (_stop["Irv,p~4(.Y8.P^U!!nr9"]) return;
    correctDir = true; if (_stop["Irv,p~4(.Y8.P^U!!nr9"]) return;
    cb(null, null);
  })(), promisify2(async cb => {
    await waitForSpecificEvent(String("FaceDirectionLeft")); if (_stop["Irv,p~4(.Y8.P^U!!nr9"]) return;
    result = (await say('warning')); if (_stop["Irv,p~4(.Y8.P^U!!nr9"]) return;
    correctDir = false; if (_stop["Irv,p~4(.Y8.P^U!!nr9"]) return;
    cb(null, null);
  })());
  _stop["Irv,p~4(.Y8.P^U!!nr9"] = true;
}
correctDir = false;
result = (await say('And now slowly rotate to your left'));
while (!correctDir) {
  _stop["vv*Gx05?{DAHn%x-,b=x"] = false;
  await waitForOne(promisify2(async cb => {
    await waitForSpecificEvent(String("FaceDirectionLeft")); if (_stop["vv*Gx05?{DAHn%x-,b=x"]) return;
    correctDir = true; if (_stop["vv*Gx05?{DAHn%x-,b=x"]) return;
    cb(null, null);
  })(), promisify2(async cb => {
    await waitForSpecificEvent(String("FaceDirectionRight")); if (_stop["vv*Gx05?{DAHn%x-,b=x"]) return;
    result = (await say('warning')); if (_stop["vv*Gx05?{DAHn%x-,b=x"]) return;
    correctDir = false; if (_stop["vv*Gx05?{DAHn%x-,b=x"]) return;
    cb(null, null);
  })());
  _stop["vv*Gx05?{DAHn%x-,b=x"] = true;
}
result = (await say('You are done'));
