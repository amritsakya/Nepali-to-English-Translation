import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Blob, Modality } from "@google/genai";
import { translateNepaliToEnglish } from './services/geminiService';
import Header from './components/Header';
import TranslationCard from './components/TranslationCard';
import ActionButton from './components/ActionButton';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

// Helper function to encode audio data
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to create a PCM blob for the API
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


const App: React.FC = () => {
  const [nepaliText, setNepaliText] = useState<string>('');
  const [englishText, setEnglishText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const liveSessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptRef = useRef('');

  const stopRecording = useCallback(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setIsConnecting(false);
  }, []);
  
  const handleToggleRecording = useCallback(async () => {
    if (isRecording || isConnecting) {
      stopRecording();
    } else {
      setIsConnecting(true);
      setError(null);
      setNepaliText('');
      transcriptRef.current = '';

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              console.log('Live session opened.');
              setIsConnecting(false);
              setIsRecording(true);

              const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
              audioContextRef.current = context;
              const source = context.createMediaStreamSource(stream);
              const processor = context.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = processor;

              processor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(processor);
              processor.connect(context.destination);
            },
            onmessage: (message) => {
              if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                transcriptRef.current += text;
                setNepaliText(transcriptRef.current);
              }
              if (message.serverContent?.turnComplete) {
                transcriptRef.current += ' ';
                setNepaliText(transcriptRef.current);
              }
            },
            onerror: (e) => {
              console.error('Live session error:', e);
              setError('A recording error occurred. Please try again.');
              stopRecording();
            },
            onclose: () => {
              console.log('Live session closed.');
              stopRecording();
            },
          },
          config: {
            responseModalities: [Modality.AUDIO], // Required, even if we ignore the output
            inputAudioTranscription: {},
            systemInstruction: 'You are an expert multilingual transcriptionist. Transcribe the user\'s speech from Nepali into Nepali text. Do not add any commentary or attempt to respond to the user.'
          },
        });

        liveSessionRef.current = await sessionPromise;

      } catch (err) {
        console.error('Failed to start recording:', err);
        setError('Could not start recording. Please ensure microphone permissions are granted.');
        stopRecording();
      }
    }
  }, [isRecording, isConnecting, stopRecording]);

  const handleTranslate = useCallback(async () => {
    if (!nepaliText.trim()) {
      setError('Please enter some Nepali text to translate.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEnglishText('');

    try {
      const translation = await translateNepaliToEnglish(nepaliText);
      setEnglishText(translation);
    } catch (err) {
      setError('An error occurred during translation. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [nepaliText]);

  return (
    <div className="bg-slate-900 min-h-screen font-sans text-white p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <Header />
      <main className="w-full max-w-4xl flex-grow flex flex-col items-center justify-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
          <TranslationCard
            language="Nepali"
            text={nepaliText}
            onTextChange={setNepaliText}
            isInput={true}
            placeholder="यहाँ नेपाली पाठ प्रविष्ट गर्नुहोस् or click the mic to speak..."
            isRecording={isRecording}
            isConnecting={isConnecting}
            onToggleRecording={handleToggleRecording}
          />
          <TranslationCard
            language="English"
            text={englishText}
            isLoading={isLoading}
            error={error}
            isInput={false}
          />
        </div>
        <div className="mt-6">
          <ActionButton
            onClick={handleTranslate}
            disabled={isLoading || isRecording || !nepaliText}
          >
            {isLoading ? (
              'Translating...'
            ) : (
              <>
                <SparklesIcon />
                Translate
                <ArrowRightIcon />
              </>
            )}
          </ActionButton>
        </div>
      </main>
      <footer className="w-full text-center py-4 mt-8">
        <p className="text-slate-500 text-sm">Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
