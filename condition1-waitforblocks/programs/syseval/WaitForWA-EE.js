var result;


await waitForAll(promisify2(async cb => {
  await waitForSpecificEvent(String("FaceDirectionCenter"));
  cb(null, null);
})(), promisify2(async cb => {
  await waitForSpecificEvent(String("IsSpeakingFalse"));
  cb(null, null);
})());
result = (await say('Hello'));
