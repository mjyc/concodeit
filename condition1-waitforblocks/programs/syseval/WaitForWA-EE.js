var result;


await waitForAll(promisify2(async cb => {
  await waitForSpecificEvent(String("humanFaceLookingAtCenter"));
  cb(null, null);
})(), promisify2(async cb => {
  await waitForSpecificEvent(String("isHumanSpeakingFalse"));
  cb(null, null);
})());
result = (await say('Hello'));
