# ConCodeIt APIs

## Async API

```
function sleep(duration: number): void  // blocking
function setMessage(message: string): void
function startFollowingFace(): void
function stopFollowingFace(): void
// TODO: make sure below action functions don't need to return "ID"
function startSaying(text: string): void
function startGesturing(name: string): void

function isSayFinished(): boolean
function isGestureFinished(): boolean

type State {
  faceDirection,
  isSpeaking,
}
type FaceDirection {
  noFace,
  center,
  left,
  right,
}
type IsSpeaking {
  speaking,
  notSpeaking,
}
function getState(state: State): FaceDirection | IsSpeaking
```

<!--
function setButtons(buttons: [string]): void
lastClickedButton,
function resetLastClickedButton(): void // set lastClickedButton to ""
-->

## Callback API

```
function startSleeping(duration: number, callback: function): void // durative
function setMessage(message: string): void  // instantaneous
function startFollowingFace(): void  // instantaneous
function stopFollowingFace(): void  // instantaneous
function startSaying(text: string, callback: function): void  // durative
function startGesturing(name: string, callback: function): void  // durative

type Event {
  faceDirectionChanged,
  isSpeakingChanged,
}
type FaceDirectionChanged {
  none,
  center,
  left,
  right,
}
type IsSpeakingChanged {
  speaking,
  notSpeaking,
}
function waitForEvent(event: Event, setResultTo: string, callback: function): FaceDirectionChanged | IsSpeakingChanged
```

## WaitFors API

```
function sleep(duration: number): void // durative
function setMessage(message: string): void  // instantaneous
function startFollowingFace(): void  // instantaneous
function stopFollowingFace(): void  // instantaneous
function say(message: string): void  // durative
function gesture(name: string): void  // durative

type Event {
  faceDirectionChanged,
  isSpeakingChanged,
}
type FaceDirectionChanged {
  noFace,
  center,
  left,
  right,
}
type IsSpeakingChanged {
  speaking,
  notSpeaking,
}
function waitForEvent(event: Event): FaceDirectionChanged | IsSpeakingChanged  // durative

function waitForAll(subprogram1: function, subprogram2: function): [any]
function waitForOne(subprogram1: function, subprogram2: function): any
```

## Notes

1. For `startGesturing` or `gesture`, use:

```
sendActionGoal("FacialExpressionAction", "HAPPY") // "SAD", "ANGRY", "FOCUSED", "CONFUSED"
sendActionGoalCallback("FacialExpressionAction", "HAPPY", callback)
```

2. For `isSpeaking` or `IsSpeakingChanged`, start by checking out the below functions:

```
await waitUntilVAD(); // waitFors
detectVADChange(id, callback); // callback
getVADState(id, callback); // async
```
