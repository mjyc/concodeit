
async function monologue() {
    var result;
    await waitForAll(promisify2(async cb => {
      result = (await setMessage('Hello there!'));
      cb(null, null);
    })(), promisify2(async cb => {
      await waitForSpecificEvent(String("humanFaceLookingAtCenter"));
      cb(null, null);
    })());
    _stop["gUh:n@dt:J|J}=mm9PL6"] = false;
    await waitForOne(promisify2(async cb => {
      result = (await setMessage('My name is Meebo')); if (_stop["gUh:n@dt:J|J}=mm9PL6"]) return;
      result = (await say('My name is Meebo')); if (_stop["gUh:n@dt:J|J}=mm9PL6"]) return;
      result = (await gesture("HAPPY")); if (_stop["gUh:n@dt:J|J}=mm9PL6"]) return;
      cb(null, null);
    })(), promisify2(async cb => {
      await waitForSpecificEvent(String("noHumanFaceFound")); if (_stop["gUh:n@dt:J|J}=mm9PL6"]) return;
      cb(null, null);
    })());
    _stop["gUh:n@dt:J|J}=mm9PL6"] = true;
    _stop["xZU=Yv8U2F+z5yrfX(%I"] = false;
    await waitForOne(promisify2(async cb => {
      result = (await setMessage('I\'m made of a tablet display and a robot arm')); if (_stop["xZU=Yv8U2F+z5yrfX(%I"]) return;
      result = (await say('I\'m made of a tablet display and a robot arm')); if (_stop["xZU=Yv8U2F+z5yrfX(%I"]) return;
      cb(null, null);
    })(), promisify2(async cb => {
      await waitForSpecificEvent(String("noHumanFaceFound")); if (_stop["xZU=Yv8U2F+z5yrfX(%I"]) return;
      cb(null, null);
    })());
    _stop["xZU=Yv8U2F+z5yrfX(%I"] = true;
    _stop["[ASNieSoS^Sn9R}S#f0J"] = false;
    await waitForOne(promisify2(async cb => {
      result = (await setMessage('Nice to meet you ')); if (_stop["[ASNieSoS^Sn9R}S#f0J"]) return;
      result = (await say('Nice to meet you')); if (_stop["[ASNieSoS^Sn9R}S#f0J"]) return;
      result = (await gesture("HAPPY")); if (_stop["[ASNieSoS^Sn9R}S#f0J"]) return;
      cb(null, null);
    })(), promisify2(async cb => {
      await waitForSpecificEvent(String("noHumanFaceFound")); if (_stop["[ASNieSoS^Sn9R}S#f0J"]) return;
      cb(null, null);
    })());
    _stop["[ASNieSoS^Sn9R}S#f0J"] = true;
    result = (await setMessage('Goodbye!'));
    result = (await say('Goodbye!'));
      result = (await gesture("HAPPY"));
  }
