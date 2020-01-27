// hide errors and warnings from @cycle-robot-drivers/cycle-posenet-driver, a
//   pkg this pkg is dependent on
window.HTMLCanvasElement.prototype.getContext = () => {}; // hide
console.warn = jest.fn(); // hide webgl outputs
const { promisify } = require("util");
const xs = require("xstream").default;
const { mockTimeSource } = require("@cycle/time");
const {
  actionNames,
  mockInitialize,
  makeSendGoal,
  createStreamEventListener
} = require("../");

console.debug = jest.fn(); // when debugging, comment this line out

test("makeSendGoal", async done => {
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
  makeSendGoal("SpeechSynthesisAction")(expected, (err, val) => {
    expect(val.result).toBe(expected);
    done();
  });

  Time.run();
});

test("createStreamEventListener", async () => {
  const Time = mockTimeSource();
  const stream = Time.diagram(`-0-1-2-3-|`);
  const p = promisify(cb => {
    stream.addListener(createStreamEventListener(val => val === 2, cb));
  });
  Time.run();
  const out = await p();
  expect(out).toBe(2);
});

test("createStreamEventListener - multiple events", async done => {
  const Time = mockTimeSource();
  const stream = Time.diagram(`-0-1-1-1-2-|`);
  const p = promisify(cb =>
    stream.addListener(
      createStreamEventListener(
        val => {
          console.debug("predicate", val);
          if (val === 2) {
            done();
          }
          return val === 1;
        },
        (err, val) => {
          console.debug("callback", val);
          cb(err, val);
        }
      )
    )
  );
  Time.run();
  const out = await p();
  expect(out).toBe(1);
});

test("createStreamEventListener - remove events", async done => {
  const Time = mockTimeSource();
  const stream = Time.diagram(`-0-1-2-3-4-|`);
  let listener;
  const p = promisify(cb => {
    listener = createStreamEventListener(val => {
      console.debug("predicate", val);
      done.fail(new Error("Should not be called!"));
      return false;
    }, cb);
    stream.addListener(listener);
    stream.addListener({
      next: val => {
        console.debug("next", val);
        if (val === 4) done();
      }
    });
  });
  p();
  stream.removeListener(listener);
  Time.run();
});
