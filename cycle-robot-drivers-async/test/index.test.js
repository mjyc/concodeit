window.HTMLCanvasElement.prototype.getContext = () => {};
console.warn = jest.fn(); // hide warn outputs
const { promisify } = require("util");
const xs = require("xstream").default;
const { mockTimeSource } = require("@cycle/time");
const { createStreamEventListener } = require("../");

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

// test("createStreamEventListener - test2", async () => {

//   // const p = promisify(cb => setInterval(cb, 1000));
//   // console.error(1);
//   // await p();
//   // console.error(2);

//   const Time = mockTimeSource();
//   const stream = Time.diagram(`-0-1-1-2-|`);

//   let listener;
//   const p = promisify(cb => {
//     listener = createStreamEventListener(val => {
//         console.error('pred', val);
//         return val === 1
//       }, (v) => {
//         console.error('cb', v);
//         cb(null, v);
//       })
//     stream.addListener(
//       listener
//     )
//   });

//   Time.run();
//   // try {
//     a = await p();
//   // } catch (err) {
//   //   console.error('err', err);
//   // }
//   // p().then(console.error);
//   console.error("=======a", a);
//   stream.removeListener(listener);

//   // expect(true).toBe(true);
// });
