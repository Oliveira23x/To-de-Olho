import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    try {
      // Cancelar qualquer áudio anterior
      window.speechSynthesis.cancel();
      
      // Chamar edge function para gerar áudio com ElevenLabs
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (error) {
        console.error('Erro ao gerar áudio:', error);
        // Fallback para voz nativa se falhar
        fallbackSpeak(text);
        return;
      }

      if (data?.audioContent) {
        // Converter base64 para blob e reproduzir
        const audioBlob = base64ToBlob(data.audioContent, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.play().catch(err => {
          console.error('Erro ao reproduzir áudio:', err);
          fallbackSpeak(text);
        });

        // Limpar URL quando terminar
        audio.onended = () => URL.revokeObjectURL(audioUrl);
      } else {
        fallbackSpeak(text);
      }
    } catch (err) {
      console.error('Erro no speak:', err);
      fallbackSpeak(text);
    }
  };

  // Função auxiliar para converter base64 em blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Fallback para voz nativa do navegador
  const fallbackSpeak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
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
