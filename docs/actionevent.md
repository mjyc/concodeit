# Action and Event

### Action

- robot actions, e.g.,
  - social robot actions: `setMessage`, `say`, etc.
  - mobile robot actions: `goTo`, `callElevator`, `moveLid`, etc.
  - manipulator robot actions: `moveArmTo`, `grasp`, etc.
- can be `instantaneous` or `durative`
- ends with `succeeded` or `failed`

<!-- "actionFinished" is an internal event -->

### Event

- exogenous and external state change events, e.g.,
  - social robot events: `faceDetected`, `buttonClicked`, etc.
  - mobile robot events: `elevatorArrived`, etc.
  - manipulator robot events: `objectDetected`, etc.
