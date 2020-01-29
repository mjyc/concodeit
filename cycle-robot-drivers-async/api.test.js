// hide errors and warnings from @cycle-robot-drivers/cycle-posenet-driver, a
//   pkg this pkg is dependent on
window.HTMLCanvasElement.prototype.getContext = () => {}; // hide
console.warn = jest.fn(); // hide webgl outputs
const { promisify } = require("util");
const xs = require("xstream").default;
const { mockTimeSource } = require("@cycle/time");
const { hello } = require("./api");
console.error(hello);

console.debug = jest.fn(); // when debugging, comment this line out

test("test", async () => {
  const Time = mockTimeSource();
  expect(1).toBe(1);
});
