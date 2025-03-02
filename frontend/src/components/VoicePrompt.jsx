import React, { useState, useRef, useEffect } from 'react';
import micIcon from '../assets/mic.svg';
import './VoicePrompt.css';

const VoicePrompt = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Ensure it stops after one command
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log("Recognized speech:", transcript);
      if (transcript && onTranscript) {
        onTranscript(transcript);
      }
      stopListening(); // Auto-stop after one phrase
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      stopListening(); // Ensure proper cleanup
    };

  }, [onTranscript]);

  const startListening = () => {
    if (!recognitionRef.current || disabled) return;
    setIsListening(true);
    recognitionRef.current.start();
    console.log("Listening started...");
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    console.log("Listening stopped.");
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  return (
    <div className="voice-prompt">
      <button
        onClick={toggleListening}
        disabled={disabled}
        className="voice-button"
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        <img src={micIcon} alt="Microphone" className="mic-icon" />
      </button>
    </div>
  );
};

export default VoicePrompt;
