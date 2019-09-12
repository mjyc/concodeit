

//------------------------------------------------------------------------------
// Interview Program -- test works!!

async function interview() {
  setMessage("What does a typical day look like for you?");
  // user hasn't said anything yet
  var isSpeaking = await getState("isSpeaking");
  while (!isSpeaking) {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
  }
  // started talking
  startFollowingFace();
  var dir = await getHumanFaceDirection();
  while (isSpeaking || dir !== "Center") {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
    dir = await getHumanFaceDirection();
  }
  // finished talking
  stopFollowingFace();
  // prompt next question
  setMessage("What sort of vacations do you like to take?");
  startFollowingFace();
  // wait to start talking
  isSpeaking = await getState("isSpeaking");
  while (!isSpeaking) {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
  }
  // wait till finish talking
  dir = await getHumanFaceDirection();
  while (isSpeaking || dir !== "Center") {
    await sleep(1);
    isSpeaking = await getState("isSpeaking");
    dir = await getHumanFaceDirection();
  }
  stopFollowingFace();
  // finish
  setMessage("We are done. Thank you.");
}

//------------------------------------------------------------------------------
// Monologue Program

async function monologue() {
  setMessage("Hello there!");
  while (getHumanFaceDirection() === "face not found") {
    await sleep(1);
  }
  // after waiting for face to appear, introduce yourself
  await communicate("My name is Meebo", "Happy");

  while (!isSayFinished()) {
    await sleep(1);
  }

  await communicate("I'm made of a touch monitor and a robot arm", "n/a");
  // if face exists and still talking 
  while (!isSayFinished() && getHumanFaceDirection() !== "face not found") {
    await sleep(1);
  }

  if (getHumanFaceDirection() === "face not found") {
    await exit();
    return;
  } 

  communicate("Nice to meet you", "Happy"); // what is the goodbye gesture?
  while (!isSayFinished() && getHumanFaceDirection() !== "face not found") {
    await sleep(1);
  }
  exit();

}

async function communicate(message, gesture) {
  setMessage(message);
  startSaying(message);
  startGesturing(gesture);
}

async function exit() {
  setMessage("Goodbye!");
  startSaying("Goodbye!");
  startGesturing("Happy");
}

