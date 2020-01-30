// hide errors and warnings from @cycle-robot-drivers/cycle-posenet-driver, a
//   pkg this pkg is dependent on
window.HTMLCanvasElement.prototype.getContext = () => {}; // hide
console.warn = jest.fn(); // hide webgl outputs
const { promisify } = require("util");
const xs = require("xstream").default;
const { mockTimeSource } = require("@cycle/time");
const { mockDOMSource } = require("@cycle/dom");
const { actionNames, mockInitialize, makeSendGoal, once } = require("../");

console.debug = jest.fn(); // when debugging, comment this line out

test("makeSendGoal", async done => {
  const Time = mockTimeSource();

  // setup main
  const { sources, sinks } = mockInitialize({
    mockSources: Object.assign(
      {
        state: { stream: xs.never() },
        DOM: mockDOMSource({
          ".speech": {
            keypress: xs.never()
          }
        })
      },
      {},
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
  makeSendGoal("SpeechSynthesisAction")(expected, (err, val) => {
    expect(val.result).toBe(expected);
    done();
  });

  Time.run();
});
