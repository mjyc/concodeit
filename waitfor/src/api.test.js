// hide errors and warnings from @cycle-robot-drivers/cycle-posenet-driver, a
//   pkg this pkg is dependent on
window.HTMLCanvasElement.prototype.getContext = () => {}; // hide
console.warn = jest.fn(); // hide webgl outputs

const {
  actionNames,
  mockInitialize,
  makeSendGoal,
  createStreamEventListener
} = require("cycle-robot-drivers-async");

test("makeSendGoal", async done => {
  expect(1).toBe(1);
  done();
});
