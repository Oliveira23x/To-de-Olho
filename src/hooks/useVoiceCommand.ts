import { useState, useRef, useEffect } from 'react';
export const useVoiceCommand = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'pt-BR';

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = async (text: string) => {
    // Usar voz nativa do navegador (funciona offline e sem API key)
    speakNative(text);
  };

  // Voz nativa do navegador com configurações otimizadas
  const speakNative = (text: string) => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0; // Velocidade natural
    utterance.pitch = 1.0; // Tom natural
    utterance.volume = 1.0; // Volume máximo
    
    // Tentar usar a melhor voz em português disponível
    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(voice => 
      voice.lang.startsWith('pt-BR') || voice.lang.startsWith('pt')
    );
    
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
  };
};
