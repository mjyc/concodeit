# Tasks

## Analysis

| CC Types \ EM Type     | wait-for-all (WA)                                          | wait-for-one (WO)                                                                           |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **action-action (AA)** | \* multi-modal expression (e.g., say & gesture)            | concurrent actions error handling (e.g., moveArm1 & moveArm2)                               |
| **action-event (AE)**  | action-prompted event monitoring (e.g., question-answer)   | \* high-priority event monitoring (e.g., arrival/departure, master command, error handling) |
| **event-event (EE)**   | complex event monitoring (e.g., not-speaking & not-moving) | \* multi-modal sensing (e.g., touchscreen & laser & camera)                                 |

## Example Social Robot Task Descriptions

### Storytelling

- greeting
  - The robot should wait until a face is detected and the human is not speaking (EE + WA)
- storytelling
  - The robot should read a line and make a gesture (AA + WA)
- departure handling
  - The robot should stop reading if the person leaves the robot (AE + WO)

<!-- Consider splitting this task into the two tasks: (i) greeting/goodbye using (AE + WO) pattern and (ii) reading using (AA + WA) pattern -->

### Instruction

1. The robot should instruct the human to look to the right
2. The robot should wait until the human is looking to the right or to the left (EE + WO)
   - If the human is looking to the left, the robot should say "please look to the right" and go to 1.
   - If the human is looking to the right, the robot should say "now look to the left"

### Notes

- The example above do not use (AA + WO) and (AE + WA) patterns
