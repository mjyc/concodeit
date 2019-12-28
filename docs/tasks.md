# Tasks

## Analysis

| CC Types \ EM Type     | wait-for-all (WA)                                          | wait-for-one (WO)                                                                           |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **action-action (AA)** | \* multi-modal expression (e.g., say & gesture)            | concurrent actions error handling (e.g., moveArm1 & moveArm2)                               |
| **action-event (AE)**  | action-prompted event monitoring (e.g., question-answer)   | \* high-priority event monitoring (e.g., arrival/departure, master command, error handling) |
| **event-event (EE)**   | complex event monitoring (e.g., not-speaking & not-moving) | \* multi-modal sensing (e.g., touchscreen & laser & camera)                                 |

## Social Robot Task Descriptions

### Singing (AA + WA)

1. On start, the robot should say "rain rain go away" and do "sad" gesture.

2. When the robot finished saying "rain rain go away" and doing "sad" gesture, it should say "little johnny wants to play" and do "happy" gesture.

### Open-ended Q&A (EE + WA && EE + WO)

1. On start, the robot should start waiting for the human's face to appear and start waiting for the human to not speak. (EE + WA)

2. If the human's face appeared and the human stopped speaking, the robot should display "what does a typical day look like for you?", start waiting for the human to speak, and start waiting for the human's face to disappear. (EE + WO)

3. If the human started speaking, it should start following the human's face, start waiting for the human to stop speaking, and start waiting for the human's face to disappear. (EE + WO)

4. If the human stopped speaking, it should display "all done" and stop following the face.

5. If the face disappears after 2., 3., the robot should display "bye".

### Neck Exercise (AE + WA)

1. On start, the robot should start waiting for the human to look to the center.

2. If the human looked at the center, the robot should say "slowly rotate to your head to the right", start waiting for it to finish saying "slowly rotate to your head to the right", and start waiting for the human to look to the left or right. (AE + WA)

3. If the robot is finished saying "slowly rotate to your head to the right" and the human looked at the right, the robot should say "great job".

4. If the robot is finished saying "slowly rotate to your head to the right" and the human looked at the left, the robot should repeat 1.

### Introduction (AE + WO)

1. On start, the robot should start waiting for the human's face to appear in its field of view.

2. If the human's face appeared, the robot should say "my name is meebo" and start waiting for the human's face to disappear in its field of view. (AE + WO)

3. If the robot finished saying "my name is meebo", it should display "nice to meet you" and start waiting for the human's face to disappear in its field of view. (AE + WO)

4. If the face disappears after 2., 3., the robot should say "bye".

### Notes

- All examples above do not use (AA + WO) and (EE + WA) patterns
