'use server';

import * as PlayHT from 'playht';

// Initialize client

PlayHT.init({
userId: '',
apiKey: '',
});


export default async function TextToSpeech() {
  // Generate audio on the server
  const audioStream = await PlayHT.stream('Hello my name is todd!', {voiceEngine: "Play3.0-mini", language: "indonesian"});

  // Convert the stream to a Buffer
  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  const audioBuffer = Buffer.concat(chunks);

  // Convert Buffer to base64
  const base64Audio = audioBuffer.toString('base64');

  // Create a data URL
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

  // Fetch available voices
  const voices = await PlayHT.listVoices();

  return (
    <div className="">
      <h1>Text to Speech</h1>
      <p>Audio is ready to play</p>
      <audio controls src={audioUrl}>
        Your browser does not support the audio element.
      </audio>

      <h2>Available Voices</h2>
      <ul>
        {voices.map((voice) => (
          <li key={voice.id}>
            {voice.name} ({voice.language} {voice.id})
          </li>
        ))}
      </ul>
    </div>
  );
}
