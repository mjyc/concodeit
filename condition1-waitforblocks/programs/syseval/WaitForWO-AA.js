var result;


_stop["47*52.1kG:oXlAQp|RnQ"] = false;
await waitForOne(promisify2(async cb => {
  result = (await say('Hello')); if (_stop["47*52.1kG:oXlAQp|RnQ"]) return;
  cb(null, null);
})(), promisify2(async cb => {
  await sleep(3); if (_stop["47*52.1kG:oXlAQp|RnQ"]) return;
  cb(null, null);
})());
_stop["47*52.1kG:oXlAQp|RnQ"] = true;
result = (await say('Timed out'));
