# ConCodeIt APIs

## Async API

```
function sleep(duration: number): void
function setMessage(message: string): void
function setButtons(buttons: [string]): void
function say(message: string): void

type Action {
  sleep,
  setMessage,
  setButtons,
  say,
}
function getLastActionResult(action: Action): any

type State {
  //,
  isFaceDetected,
  isPersonSpeaking,
}
```
function getState(event: State): any

## Callback API

```
...
```

## WaitFors API

```
function sleep(duration: number):  // durative
function setMessage(message: string): (string | null)  // instantaneous
function setButtons(message: string): (string | null)  // instantaneous
function say(message: string): (string | null)  // durative

type Event {
  buttonClicked,
  faceDetected,
  voiceActivityDetected,
}
function waitForEvent(event: Event): any  // durative

function waitForAll(subprogram1: function, subprogram2: function): [any]
function waitForOne(subprogram1: function, subprogram2: function): any
```
