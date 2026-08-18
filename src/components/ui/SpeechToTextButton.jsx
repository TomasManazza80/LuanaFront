import React, { useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '../../services/hooks/useSpeechToText';

export default function SpeechToTextButton({ onTranscript, className = '' }) {
  const handleText = useCallback((text) => {
    onTranscript(text);
  }, [onTranscript]);

  const { isListening, toggleListening, isSupported } = useSpeechToText(handleText);

  if (!isSupported) return null;

  return (
    <button 
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${
        isListening 
          ? 'bg-red-100 text-red-500 hover:bg-red-200 shadow-inner' 
          : 'bg-blue-50 text-[#0A58CA] hover:bg-blue-100'
      } ${className}`}
      title={isListening ? "Detener dictado" : "Dictar por voz"}
    >
      {isListening ? (
        <>
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <MicOff size={18} />
        </>
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}
