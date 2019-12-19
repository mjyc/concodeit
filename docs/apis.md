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
  humanFaceDirection,
  isHumanSpeaking,
}
type FaceDirection {
  noface,
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

## Callback API

```
function startSleeping(duration: number): void // durative
function setMessage(message: string): void  // instantaneous
function startFollowingFace(): void  // instantaneous
function stopFollowingFace(): void  // instantaneous
function startSaying(text: string): void  // durative
function startGesturing(name: string): void  // durative

type ActionEvent {
  sleepDone,
  sayDone,
  gestureDone
}
type Event {
  humanFaceDirectionChanged,
  isHumanSpeakingChanged,
}
type FaceDirectionChanged {
  noface,
  center,
  left,
  right,
}
type IsSpeakingChanged {
  speaking,
  notSpeaking,
}
function waitForEvent(event: Event, setResultTo: string, callback: function): FaceDirectionChanged | IsSpeakingChanged | ActionEvent
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
  humanFaceDirectionChanged,
  isHumanSpeakingChanged,
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
