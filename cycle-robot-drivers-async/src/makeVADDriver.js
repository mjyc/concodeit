const xs = require("xstream").default;
const dropRepeats = require("xstream/extra/dropRepeats").default;
const vad = require("@mjyc/voice-activity-detection");

const makeVADDriver = function() {
  let audioContext;

  return function voiceActivityDetectionDriver() {
    const output$ = xs.create({
      start: listener => {
        function handleUserMediaError() {
          listener.error("Mic input is not supported by the browser.");
        }

        function handleMicConnectError() {
          listener.error(
            "Could not connect microphone. Possible rejected by the user or is blocked by the browser."
          );
        }
        function requestMic() {
          try {
            window.AudioContext =
              window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#audiovideo_elements
            if (audioContext.state === "suspended") {
              console.warn(
                `audioContext.state is "suspended"; will attempt to resume every 1s`
              );
              const handle = setInterval(() => {
                if (!!audioContext && audioContext.state === "suspended") {
                  audioContext.resume();
                } else if (audioContext.state === "running") {
                  console.debug(
                    `audioContext.state is "running"; stopping resuming attempts`
                  );
                  clearInterval(handle);
                }
              }, 1000);
            }

            navigator.getUserMedia =
              navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia;
            navigator.getUserMedia(
              { audio: true },
              startUserMedia,
              handleMicConnectError
            );
          } catch (e) {
            handleUserMediaError();
          }
        }
        function startUserMedia(stream) {
          const opts = {
            useNoiseCapture: true,
            avgNoiseMultiplier: 1.5,
            activityCounterThresh: 30,
            activityCounterMax: 80,
            useDefaultActivityCounting: false,
            onVoiceStart: function() {
              listener.next(true);
            },
            onVoiceStop: function() {
              listener.next(false);
            }
          };
          vad(audioContext, stream, opts);
        }
        requestMic();
      },
      stop: () => {}
    });

    return output$
      .startWith(false)
      .compose(dropRepeats())
      .remember();
  };
};

export default makeVADDriver;
