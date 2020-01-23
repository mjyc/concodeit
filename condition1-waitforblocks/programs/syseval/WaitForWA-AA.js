var result;


await waitForAll(promisify2(async cb => {
  result = (await say('Hello there!'));
  cb(null, null);
})(), promisify2(async cb => {
  result = (await gesture("HAPPY"));
  cb(null, null);
})());
await waitForAll(promisify2(async cb => {
  result = (await say('My name is Meebo'));
  cb(null, null);
})(), promisify2(async cb => {
  result = (await gesture("HAPPY"));
  cb(null, null);
})());
