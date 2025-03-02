import React, { useState, useEffect, useRef, useCallback } from 'react';
import micIcon from '../assets/mic.svg'; // Make sure this path is correct
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

  // Set up volume analyzer function - wrap in useCallback
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
        
        // Calculate volume level (0-100)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(Math.min(100, average * 2.5));
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
      setIsListening(false);
    }
  }, [isListening]); // Add isListening as dependency

  // Create toggleListening as a useCallback with setupVolumeAnalyzer in dependencies
  const toggleListening = useCallback(async () => {
    if (error === "Speech recognition is not supported in this browser." || disabled) {
      return;
    }
    
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      setVolume(0);
    } else {
      // Start listening
      setError(null);
      
      try {
        await setupVolumeAnalyzer();
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (err) {
        console.error("Error starting recognition:", err);
        setError("Failed to start speech recognition.");
        return;
      }
    }
    
    setIsListening(prev => !prev);
  }, [isListening, error, disabled, setupVolumeAnalyzer]); // Added setupVolumeAnalyzer to dependencies

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        if (event.results[current].isFinal && onTranscript) {
          onTranscript(transcriptText);
          toggleListening(); // Stop listening after final result
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setError(event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    } else {
      setError("Speech recognition is not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onTranscript, toggleListening, isListening]);

  return (
    <div className={`voice-prompt ${isListening ? 'active' : ''}`}>
      <button
        onClick={toggleListening}
        disabled={error === "Speech recognition is not supported in this browser." || disabled}
        className="voice-button"
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        <div className="voice-icon-container">
          {/* Ripple effects (visible when active) */}
          {isListening && (
            <>
              <div className="ripple ripple-1" style={{ opacity: volume / 300 + 0.2 }}></div>
              <div className="ripple ripple-2" style={{ opacity: volume / 400 + 0.1 }}></div>
            </>
          )}
          
          {/* Dynamic waveform dots */}
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
          
          {/* Mic icon */}
          <img 
            src={micIcon} 
            alt="Microphone" 
            className="mic-icon"
          />
        </div>
      </button>
    </div>
  );
};

export default VoicePrompt;