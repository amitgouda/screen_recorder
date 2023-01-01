// In the preload script.
const { contextBridge, ipcRenderer } = require("electron");
const remote = require("electron").remote;

let stream = null;
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

ipcRenderer.on("SET_SOURCE", async (event, sourceId) => {
  console.log("reached");
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720,
        },
      },
    });
    ipcRenderer.sendSync("HAS_INITIATED_CAPTURE_SCREEN");

    handleStream();
  } catch (e) {
    handleError(e);
  }
});

function handleStream() {
  const video = document.querySelector("video");
  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();
return
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  chunks = [];
  console.log(recorder);
  recorder.onstart = (event) => {
    console.log("onstart");
    // ...
  };
  recorder.ondataavailable = (event) => {
    console.log("data adding up");

    chunks.push(event.data);
  };
  recorder.onstop = async (event) => {
    console.log("stop");
    let fileName = `audiofile_${Date.now().toString()}.webm`;
    download(chunks, fileName); // <== This works at downloading the file to disk, but this is not a stream. Use to prove that audio is being recorded and that it can be saved.
    //save(chunks, fileName);     // <== Trying to save using a stream
    chunks = [];
  };
}

function stopStream() {
  const video = document.querySelector("video");
  video.srcObject = null;
}

function handleError(e) {
  console.log(e);
}

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, params = {}) => ipcRenderer.send(channel, params),
  receive: (channel, callback) => {
    const listener = (event, ...args) => {
      callback(...args);
    };

    ipcRenderer.on(channel, listener);
  },
});

ipcRenderer.on("STOP_CAPTURE_SCREEN", async (event) => {
  console.log('stopping')
  if (stream) {
    console.log(stream);
    stream.getTracks().forEach((track) => {
      console.log(track.stop)
      track.stop();
    });
    console.log(stream)
    stream = null;
  }
});

const download = (audioToSave, fName) => {
  let audioBlob = new Blob(audioToSave, {
    type: "video/webm",
  });
  let url = URL.createObjectURL(audioBlob);
  let a = document.createElement("a");
  a.style = "display: none";
  a.href = url;
  document.body.appendChild(a);
  a.download = fName;
  a.click();

  // release / remove
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
