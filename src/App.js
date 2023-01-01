import React, { useState, useEffect } from "react";
import EVENT from "./events";
import Screen from "./Screen";
//const electron  =  require('electron')
import "./App.css";

const App = () => {
  const [screenList, setScreenList] = useState([]);
  const [currentStage, setCurrentStage] = useState(1);
  const handleOnStartRecording = () => {
    window.electronAPI.send(EVENT.INITIATE_CAPTURE);
    window.electronAPI.receive(EVENT.INITIATE_CAPTURE, (data) => {
      if (Array.isArray(data)) {
        setScreenList(data);
        setCurrentStage(2);
      } else {
        setScreenList([]);
      }
    });
  };

  const handleOnSelectedScreenView = (id) => {
    window.electronAPI.send(EVENT.SELECT_CAPTURE_SCREEN, id);
  };

  const hasStoppedCaptureScreen = () => {
    setCurrentStage(1);
    setScreenList([]);
  };

  const handleOnStopRecording = () => {
    window.electronAPI.send(EVENT.STOP_CAPTURE_SCREEN);
  };

  useEffect(() => {
    window.electronAPI.receive(
      EVENT.HAS_INITIATED_CAPTURE_SCREEN,
      hasIntiatedcaptureScreen
    );
    window.electronAPI.receive(
      EVENT.STOP_CAPTURE_SCREEN,
      hasStoppedCaptureScreen
    );
  }, []);

  const hasIntiatedcaptureScreen = () => {
    setCurrentStage(3);
  };

 /*  const onloadedmetadata = () => {

    const video = document.querySelector("video");
   recorder = video.captureStream()
    recorder = new MediaRecorder(stream, {mimeType: 'video/webm'});
    chunks = [];
    console.log(recorder)
    recorder.onstart = (event) => {
      console.log('onstart')
        // ...
    }
    recorder.ondataavailable = (event) => {     
      console.log('data adding up')

        chunks.push(event.data);
    }
    recorder.onstop = async (event) => {
      console.log('stop')
        let fileName = `audiofile_${Date.now().toString()}.webm`;
         download(chunks, fileName); // <== This works at downloading the file to disk, but this is not a stream. Use to prove that audio is being recorded and that it can be saved.
        //save(chunks, fileName);     // <== Trying to save using a stream 
        chunks = [];
    }
  } */

  return (
    <div className="App">
      Screen recorder
      <div className="preview">
        <video className="video" />
      </div>
      {currentStage == 1 ? (
        <div className="button" onClick={handleOnStartRecording}>
          click to start recording
        </div>
      ) : currentStage == 2 ? (
        <>
          {screenList.map((screenItem) => (
            <Screen
              key={screenItem.id}
              id={screenItem.id}
              name={screenItem.name}
              handleOnClick={handleOnSelectedScreenView}
            />
          ))}
        </>
      ) : (
        <div className="button" onClick={handleOnStopRecording}>
          click to stop recording
        </div>
      )}
    </div>
  );
};

export default App;
