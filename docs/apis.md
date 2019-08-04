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
  isHumanSpeaking,
}
type FaceDetectedEvent {
  none,
  center,
  left,
  right,
}
type SpeakingStateChanged {
  speaking,
  notSpeaking,
}
function getState(state: State): FaceDetectedEvent | SpeakingStateChanged
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
  faceDetected,
  speakingStateChanged,
}
type FaceDetectedEvent {
  none,
  center,
  left,
  right,
}
type SpeakingStateChanged {
  speaking,
  notSpeaking,
}
function waitForEvent(event: Event, setResultTo: string, callback: function): FaceDetectedEvent | SpeakingStateChanged
```

## WaitFors API

```
function sleep(duration: number): void // durative
function setMessage(message: string): void  // instantaneous
function followFace(): void  // durative
function stopFollowingFace(): void  // instantaneous
function say(message: string): void  // durative
function gesture(name: string): void  // durative

type Event {
  faceDetected,
  speakingStateChanged,
}
type FaceDetectedEvent {
  none,
  center,
  left,
  right,
}
type SpeakingStateChanged {
  speaking,
  notSpeaking,
}
function waitForEvent(event: Event): FaceDetectedEvent | SpeakingStateChanged  // durative

function waitForAll(subprogram1: function, subprogram2: function): [any]
function waitForOne(subprogram1: function, subprogram2: function): any
```
