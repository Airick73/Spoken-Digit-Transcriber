
const recordButton = document.getElementById('recordButton') as HTMLButtonElement;
const transcriptionElement = document.getElementById('transcription') as HTMLParagraphElement;

let mediaRecorder: MediaRecorder;
let audioChunks: Blob[] = [];

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

function sendAudioChunk(audioBlob: Blob) {
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
