var result;


await waitForAll(promisify2(async cb => {
  await waitForSpecificEvent(String("FaceDirectionCenter"));
  cb(null, null);
})(), promisify2(async cb => {
  await waitForSpecificEvent(String("FaceDirectionCenter"));
  cb(null, null);
})());
result = (await setMessage('A'));

result = 0;
