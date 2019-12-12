var result;


await waitForAll(promisify2(async cb => {
  result = (await say('Hello there!'));
  cb(null, null);
})(), promisify2(async cb => {
  await waitForSpecificEvent(String("FaceDirectionCenter"));
  cb(null, null);
})());
result = (await say('Nice to meet you!'));
