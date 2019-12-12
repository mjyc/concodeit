var result;


result = (await setMessage('What does a typical day look like for you?'));
await waitForSpecificEvent(String("isHumanSpeakingTrue"));
await startFollowingFace();
await waitForAll(promisify2(async cb => {
  await waitForSpecificEvent(String("humanFaceLookingAtCenter"));
  cb(null, null);
})(), promisify2(async cb => {
  await waitForSpecificEvent(String("isHumanSpeakingFalse"));
  cb(null, null);
})());
result = (await setMessage('What sort of vacations do you like to take'));
await waitForSpecificEvent(String("isHumanSpeakingTrue"));
await waitForAll(promisify2(async cb => {
  await waitForSpecificEvent(String("humanFaceLookingAtCenter"));
  cb(null, null);
})(), promisify2(async cb => {
  await waitForSpecificEvent(String("isHumanSpeakingFalse"));
  cb(null, null);
})());
result = (await setMessage('We are done. Thank you'));
