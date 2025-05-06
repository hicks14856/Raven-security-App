
export const startMediaRecording = async (): Promise<{
  recorder: MediaRecorder;
  stream: MediaStream;
  audioChunks: BlobPart[];
}> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  const audioChunks: BlobPart[] = [];
  
  recorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
  });
  
  return { recorder, stream, audioChunks };
};

export const stopMediaRecording = (mediaRecorder: MediaRecorder | null): void => {
  if (!mediaRecorder) return;
  
  mediaRecorder.stop();
  mediaRecorder.stream.getTracks().forEach((track) => track.stop());
};
