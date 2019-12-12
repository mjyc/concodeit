var result;


_stop["47*52.1kG:oXlAQp|RnQ"] = false;
await waitForOne(promisify2(async cb => {
  result = (await say('Hello there, my name is Meebo. Goodbye now!')); if (_stop["47*52.1kG:oXlAQp|RnQ"]) return;
  cb(null, null);
})(), promisify2(async cb => {
  await waitForSpecificEvent(String("NoFace")); if (_stop["47*52.1kG:oXlAQp|RnQ"]) return;
  cb(null, null);
})());
_stop["47*52.1kG:oXlAQp|RnQ"] = true;
result = (await setMessage('On standby'));
