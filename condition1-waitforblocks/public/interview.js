
async function interview() {
    var result;
    result = (await setMessage('What does a typical day look like for you?'));
    await waitForSpecificEvent(String("IsSpeakingTrue"));
    await startFollowingFace();
    await waitForAll(promisify2(async cb => {
      await waitForSpecificEvent(String("FaceDirectionCenter"));
      cb(null, null);
    })(), promisify2(async cb => {
      await waitForSpecificEvent(String("IsSpeakingFalse"));
      cb(null, null);
    })());
    result = (await setMessage('What sorts of vacations do you like to take?'));
    await waitForSpecificEvent(String("IsSpeakingTrue"));
    await waitForAll(promisify2(async cb => {
      await waitForSpecificEvent(String("IsSpeakingFalse"));
      cb(null, null);
    })(), promisify2(async cb => {
      await waitForSpecificEvent(String("FaceDirectionCenter"));
      cb(null, null);
    })());
    result = (await setMessage('We are done. Thank you'));
  
  }
  