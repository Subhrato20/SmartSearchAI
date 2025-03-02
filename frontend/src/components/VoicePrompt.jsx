import React, { useState, useEffect, useRef, useCallback } from 'react';
import micIcon from '../assets/mic.svg';
import './VoicePrompt.css';

const VoicePrompt = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const setupVolumeAnalyzer = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      
      const updateVolume = () => {
        if (!analyserRef.current || !isListening) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(100, average * 2.5));
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access required. Please check permissions.");
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(async () => {
    if (disabled || error) return;

    try {
      if (!isListening) {
        await setupVolumeAnalyzer();
        recognitionRef.current?.start();
        console.log("Recognition started");
      } else {
        recognitionRef.current?.stop();
        console.log("Recognition stopped");
      }
      setIsListening(!isListening);
    } catch (err) {
      console.error("Recognition error:", err);
      setError("Failed to start voice recognition");
    }
  }, [isListening, disabled, error, setupVolumeAnalyzer]);

  useEffect(() => {
    const initRecognition = () => {
      if (!('webkitSpeechRecognition' in window)) {
        setError("Speech recognition not supported");
        return;
      }

      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        console.log("Interim transcript:", transcript);

        if (event.results[0].isFinal) {
          console.log("Final transcript:", transcript);
          onTranscript?.(transcript.trim());
          toggleListening();
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Recognition error:", event.error);
        setError(event.error);
        setIsListening(false);
      };
    };

    initRecognition();

    return () => {
      recognitionRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [onTranscript, toggleListening]);

  return (
    <div className={`voice-prompt ${isListening ? 'active' : ''}`}>
      {error && <div className="voice-error">{error}</div>}
      <button
        onClick={toggleListening}
        disabled={!!error || disabled}
        className="voice-button"
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        <div className="voice-icon-container">
          {isListening && (
            <>
              <div className="ripple ripple-1" style={{ opacity: volume / 300 + 0.2 }}></div>
              <div className="ripple ripple-2" style={{ opacity: volume / 400 + 0.1 }}></div>
            </>
          )}
          {isListening && (
            <div className="waveform">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="waveform-bar"
                  style={{ 
                    height: `${5 + (volume / 8) * (1 + Math.sin(Date.now() / 200 + i))}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          )}
          <img 
            src={micIcon} 
            alt="Microphone" 
            className={`mic-icon ${isListening ? 'pulsing' : ''}`}
          />
        </div>
      </button>
    </div>
  );
};

export default VoicePrompt;