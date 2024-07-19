"use strict";
const recordButton = document.getElementById('recordButton');
const transcriptionElement = document.getElementById('transcription');
let mediaRecorder;
let audioChunks = [];
recordButton.onmousedown = startRecording;
recordButton.onmouseup = stopRecording;
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
            if (mediaRecorder.state === "inactive") {
                sendAudioChunk(new Blob(audioChunks));
                audioChunks = [];
            }
        });
        mediaRecorder.addEventListener("stop", () => {
            sendAudioChunk(new Blob(audioChunks));
            audioChunks = [];
        });
    });
}
function stopRecording() {
    mediaRecorder.stop();
}
function sendAudioChunk(audioBlob) {
    const formData = new FormData();
    formData.append('audio_data', audioBlob, 'chunk.wav');
    fetch('/transcribe', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
        transcriptionElement.textContent = 'Transcription: ' + data.transcription;
    });
}
