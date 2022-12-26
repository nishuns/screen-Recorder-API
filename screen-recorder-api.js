// Basic functions

// fetching Element
function fetchElem(id) {
  return document.getElementById(id);
}

// Adding DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  // Configs
  const MIMEType = "video/webm";
  let recorder = null;

  // fetching controller Element
  const startBtn = fetchElem("recorder-start");
  const stopBtn = fetchElem("recorder-stop");
  const status = fetchElem("recorder-status");
  const preview = fetchElem("preview");
  stopBtn.disabled = true;

  // call start and stop methods

  startBtn.onclick = async () => {
    const myStream = await screenRecorder();
    recorder = createRecorder(myStream, MIMEType);
    status.classList.add("recording");
    status.innerHTML = "Recording has started.......";
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  stopBtn.onclick = () => {
    recorder.stopRecording().then((data) => {
      if (data.isCompleted) {
        status.innerHTML = "Recording is completed";
        status.classList.remove("recording");
        status.classList.add("recorded");
        preview.src = data.url;
        setTimeout(() => {
          status.innerHTML = "Recording hasn't started Yet";
          status.classList.remove("recorded");
        }, 5000);

        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
    });
  };
});

// fn -> createAudioStream()
async function createAudioStream() {
  const audioStream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch((e) => {
      throw e;
    });
  return audioStream;
}

// fn -> get audioTrack()
function getAudioTrack(audioStream) {
  return audioStream.getAudioTracks()[0];
}

// fn -> screenRecorder()
async function screenRecorder() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: { mediaSource: "screen" },
  });

  // get the audio from microphone
  const audioStream = await createAudioStream();
  console.log(audioStream);
  stream.addTrack(getAudioTrack(audioStream));

  return stream;
}

// fn -> createRecorder()
function createRecorder(stream, mimeType) {
  // the stream data is stored in this array
  let recorderChunks = [];

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recorderChunks.push(e.data);
    }
  };

  mediaRecorder.stopRecording = () => {
    return new Promise((resolve, reject) => {
      const blob = new Blob(recorderChunks, {
        type: mimeType,
      });
    //   recorderChunks = [];
      mediaRecorder.stop();
      const tracks = mediaRecorder.stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      const url = window.URL.createObjectURL(blob);
      resolve({ url: url, isCompleted: true });
    });
  };

  mediaRecorder.start(200);
  // For every 200ms the stream data will be stored in a seperate chunk.

  return mediaRecorder;
}
