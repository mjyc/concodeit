# Tasks

## Analysis

| CC Types \ EM Type     | wait-for-all (WA)                                          | wait-for-one (WO)                                                                           |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **action-action (AA)** | \* multi-modal expression (e.g., say & gesture)            | concurrent actions error handling (e.g., moveArm1 & moveArm2)                               |
| **action-event (AE)**  | action-prompted event monitoring (e.g., question-answer)   | \* high-priority event monitoring (e.g., arrival/departure, master command, error handling) |
| **event-event (EE)**   | complex event monitoring (e.g., not-speaking & not-moving) | \* multi-modal sensing (e.g., touchscreen & laser & camera)                                 |

## Example Social Robot Task Descriptions

### Monologue

1. The robot should read a line and make a gesture (AA + WA)
2. ...

### Handling arrival and departure

1. The robot should display "hello there" and sleep for 10 seconds and wait until a face appears (AE + WO)
   - If timed out, the robot should repeat 1.
   - If a face is detected the robot should do 2.
2. The robot should introduce itself and wait until the face disappears (AE + WO)
   - If the robot successfully finished introducing itself or the face disappeared, it should repeat 1.

### Instruction

1. The robot should instruct the human to look to the right
2. The robot should wait until the human is looking to the right or to the left (EE + WO)
   - If the human is looking to the left, the robot should say "please look to the right" and go to 1.
   - If the human is looking to the right, the robot should say "now look to the left"

### Notes

- The example above do not use (AA + WO) and (AE + WA) patterns
