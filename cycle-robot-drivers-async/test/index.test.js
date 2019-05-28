// hide errors and warnings from @cycle-robot-drivers/cycle-posenet-driver, a
//   pkg this pkg is dependent on
window.HTMLCanvasElement.prototype.getContext = () => {}; // hide
console.warn = jest.fn(); // hide webgl outputs
const { promisify } = require("util");
const xs = require("xstream").default;
const { mockTimeSource } = require("@cycle/time");
const { createStreamEventListener } = require("../");

console.debug = jest.fn(); // when debugging, comment this line out

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
