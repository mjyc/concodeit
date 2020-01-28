// hide errors and warnings from @cycle-robot-drivers/cycle-posenet-driver, a
//   pkg this pkg is dependent on
window.HTMLCanvasElement.prototype.getContext = () => {}; // hide
console.warn = jest.fn(); // hide webgl outputs

const xs = require("xstream").default;
const { mockTimeSource } = require("@cycle/time");
const { actionNames, mockInitialize } = require("cycle-robot-drivers-async");
const { say, express } = require("./api");

test("say", async () => {
  const Time = mockTimeSource();

  // setup main
  const { sources, sinks } = mockInitialize({
    mockSources: Object.assign(
      {},
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
      {},
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

  const expected = "happy";
  const actual = await express(expected);
  expect(actual).toBe(expected);
});
