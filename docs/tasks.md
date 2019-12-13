# Tasks

## Analysis

| CC Types \ EM Type     | wait-for-all (WA)                                          | wait-for-one (WO)                                                                           |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **action-action (AA)** | \* multi-modal expression (e.g., say & gesture)            | concurrent actions error handling (e.g., moveArm1 & moveArm2)                               |
| **action-event (AE)**  | action-prompted event monitoring (e.g., question-answer)   | \* high-priority event monitoring (e.g., arrival/departure, master command, error handling) |
| **event-event (EE)**   | complex event monitoring (e.g., not-speaking & not-moving) | \* multi-modal sensing (e.g., touchscreen & laser & camera)                                 |

## Social Robot Task Descriptions

### Example

1. The robot should say "Brown bear, brown bear, what do you see?" and do the engage gesture. (AA + WA)
2. When the robot is finished with 1., it should say "I see a red bird looking at me." and do the happy gesture. (AA + WA)

### Interview

1. The robot should display "What does a typical day look like for you?" and start waiting for the human to start speaking.
2. If the human started speaking, it should start following the human's face, start waiting for the human to look to the center, and start waiting for the human to stop speaking. (AE + WA)
3. When the robot is finished with 2., it should stop following the human's face, display "What sort of vacations do you like to take?" and start waiting for the human to start speaking.
4. If the human started speaking, it should start following the human's face, start waiting for the human to look to the center, and start waiting for the human to stop speaking. (AE + WA)
5. When the robot is finished with 4., it should stop following the human's face and display "We are done. Thank you."

### Instruction

1. The robot should say "Let's start from looking forward".
2. When the robot is done with 1., it should start waiting for the human to look to the center.
3. When the robot is finished with 2., it should say "and now slowly rotate to your right".
4. When the robot is finished with 3., it should start waiting for the human to look to the left or right. (EE + WO)
5. If the human looks to the left, it should say "please rotate to your right" sound and repeat 3. (AA + WA)
6. If the human looks to the right, it should say "and now slowly rotate to your left".
7. When the robot is finished with 6., it should start waiting for the human to look to the left or right. (EE + WO)
8. If the human looks to the right, it should say "please rotate to your left" sound and repeat 6. (AA + WA)
9. If the human looks to the left, it should say "You are done!"

### Monologue

1. The robot should display "Hello there!" and start waiting for the human's face to appear in its field of view. (AE + WO or AE + WA)
2. If the face appears, the robot should display "My name is Meebo.", say "My name is Meebo.", do the happy gesture, and start waiting for the human's face to disappear in its field of view. (AE + WO)
3. If the robot finished saying "My name is Meebo.", it should display "I'm made of a touch monitor and a robot arm.", do the confused gesture, say "I'm made of a touch monitor and a robot arm.", and start waiting for the human's face to disappear in its field of view. (AE + WO)
4. If the robot finished saying "I'm made of a tablet display and a robot arm.", it should display "Nice to meet you." say "Nice to meet you.", do goodbye gesture, and start waiting for the human's face to disappear in its field of view. (AE + WO)
5. If the face disappears after 3., 4. or 5., the robot should display "Goodbye!", say "Goodbye!", and do goodbye gesture.

### Notes

- All examples above do not use (AA + WO) and (EE + WA) patterns
