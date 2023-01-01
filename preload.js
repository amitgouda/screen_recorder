// In the preload script.
const { contextBridge, ipcRenderer } = require("electron");
const remote = require("electron").remote;

//let stream = null;
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
  console.log("reached",sourceId);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          minWidth: 280,
          maxWidth: 1280,
          minHeight: 120,
          maxHeight: 720,
        },
      },
    });
    console.log("streaming started");
   // ipcRenderer.sendSync("HAS_INITIATED_CAPTURE_SCREEN");

    handleStream(stream);
  } catch (e) {
    handleError(e);
  }
});

const getVideoElement = () => {
  const video = document.querySelector("video");
  return video;
};

function handleStream(stream) {
   
  const video = getVideoElement();
  video.srcObject = stream;
  video.autoplay = true
  video.onplay = (e) => {
    
    ipcRenderer.send("HAS_INITIATED_CAPTURE_SCREEN");
    //video.play();
  }
  
  return; 
  console.log('handle stream');
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
  let video = getVideoElement();
  video.srcObject = null;
}

function handleError(e) {
  console.log(e.message);
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
  console.log("stopping");
  const video = getVideoElement();
  const stream = video.srcObject;
  if (stream) {
    // window.location.reload(false)

    console.log(stream);
    stream.getTracks().forEach((track) => {
      console.log(track.stop);
      track.stop();
    });
    console.log(stream);
    stream = null;
  }
  stopStream();
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


window.onerror = function(error, url, line) {
  ipcRenderer.send('errorInWindow', error);
};

// window.on('unresponsive', function() {
//   console.log('window crashed');
// });
window.onunhandledrejection = (e) =>{
  console.log(e,'unhandled');
}
