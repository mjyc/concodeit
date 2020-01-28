// hide errors and warnings from @cycle-robot-drivers/cycle-posenet-driver, a
//   pkg this pkg is dependent on
window.HTMLCanvasElement.prototype.getContext = () => {}; // hide
console.warn = jest.fn(); // hide webgl outputs

const xs = require("xstream").default;
const { mockTimeSource } = require("@cycle/time");
const { mockDOMSource } = require("@cycle/dom");
const { actionNames, mockInitialize } = require("cycle-robot-drivers-async");
const {
  sleep,
  say,
  express,
  displayText,
  displayButton,
  waitForEvent
} = require("./api");

test("say", async () => {
  const Time = mockTimeSource();

  // setup main
  const { sources, sinks } = mockInitialize({
    mockSources: Object.assign(
      {
        DOM: mockDOMSource({
          ".speech": {
            keypress: xs.never()
          }
        })
      },
      {
        PoseDetection: {
          events: () => xs.create()
        }
      },
      actionNames.reduce((prev, actionName) => {
        prev[actionName] = {
          status: xs.create(),
          result: xs.create()
        };
        return prev;
      }, {})
    )
  });

  sinks.SpeechSynthesisAction.goal.addListener({
    next: goal => {
      sources.SpeechSynthesisAction.result.shamefullySendNext({
        status: {
          goal_id: goal.goal_id,
          status: "SUCCEEDED"
        },
        result: goal.goal
      });
    }
  });

  const expected = "hello";
  const actual = await say(expected);
  expect(actual).toBe(expected);
});

test("express", async () => {
  const Time = mockTimeSource();

  // setup main
  const { sources, sinks } = mockInitialize({
    mockSources: Object.assign(
      {
        DOM: mockDOMSource({
          ".speech": {
            keypress: xs.never()
          }
        })
      },
      {
        PoseDetection: {
          events: () => xs.create()
        }
      },
      actionNames.reduce((prev, actionName) => {
        prev[actionName] = {
          status: xs.create(),
          result: xs.create()
        };
        return prev;
      }, {})
    )
  });

  sinks.FacialExpressionAction.goal.addListener({
    next: goal => {
      sources.FacialExpressionAction.result.shamefullySendNext({
        status: {
          goal_id: goal.goal_id,
          status: "SUCCEEDED"
        },
        result: goal.goal
      });
    }
  });

  const expected = "HAPPY";
  const actual = await express(expected);
  expect(actual).toBe(expected);
});

test("displayText", async () => {
  const Time = mockTimeSource();

  // setup main
  const { sources, sinks } = mockInitialize({
    mockSources: Object.assign(
      {
        DOM: mockDOMSource({
          ".speech": {
            keypress: xs.never()
          }
        })
      },
      {
        PoseDetection: {
          events: () => xs.create()
        }
      },
      actionNames.reduce((prev, actionName) => {
        prev[actionName] = {
          status: xs.create(),
          result: xs.create()
        };
        return prev;
      }, {})
    )
  });

  sinks.RobotSpeechbubbleAction.goal.addListener({
    next: goal => {
      sources.RobotSpeechbubbleAction.result.shamefullySendNext({
        status: {
          goal_id: goal.goal_id,
          status: "SUCCEEDED"
        },
        result: null
      });
    }
  });

  const expected = null;
  const actual = await displayText("Hello world!", 0.1);
  expect(actual).toBe(expected);
});

test("displayButton", async () => {
  const Time = mockTimeSource();

  // setup main
  const { sources, sinks } = mockInitialize({
    mockSources: Object.assign(
      {
        DOM: mockDOMSource({
          ".speech": {
            keypress: xs.never()
          }
        })
      },
      {
        PoseDetection: {
          events: () => xs.create()
        }
      },
      actionNames.reduce((prev, actionName) => {
        prev[actionName] = {
          status: xs.create(),
          result: xs.create()
        };
        return prev;
      }, {})
    )
  });

  sinks.HumanSpeechbubbleAction.goal.addListener({
    next: goal => {
      sources.HumanSpeechbubbleAction.result.shamefullySendNext({
        status: {
          goal_id: goal.goal_id,
          status: "SUCCEEDED"
        },
        result: goal.goal[0]
      });
    }
  });

  const expected = null;
  const actual = await displayButton(["Blue", "Red"], 1);
  expect(actual).toBe(expected);
});

test("waitForEvent - buttonPressed", async () => {
  const Time = mockTimeSource();

  // setup main
  const { sources, sinks } = mockInitialize({
    mockSources: Object.assign(
      {
        DOM: mockDOMSource({
          ".speech": {
            keypress: xs.never()
          }
        })
      },
      {
        PoseDetection: {
          events: () => xs.create()
        }
      },
      actionNames.reduce((prev, actionName) => {
        prev[actionName] = {
          status: xs.create(),
          result: xs.create()
        };
        return prev;
      }, {})
    )
  });

  sinks.HumanSpeechbubbleAction.goal.addListener({
    next: goal => {
      setTimeout(() => {
        sources.HumanSpeechbubbleAction.result.shamefullySendNext({
          status: {
            goal_id: goal.goal_id,
            status: "SUCCEEDED"
          },
          result: goal.goal[0]
        });
      }, 100); // sleep tiny bit so waitForEvent can be called
    }
  });

  const expected = "Blue";
  displayButton(["Blue", "Red"], 2);
  const actual = await waitForEvent("buttonPressed");
  expect(actual).toBe(expected);
});
