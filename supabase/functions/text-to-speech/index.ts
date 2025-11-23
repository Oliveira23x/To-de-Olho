import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text) {
      throw new Error("Texto é obrigatório");
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY não configurada");
    }

    console.log("Gerando áudio para:", text.substring(0, 50) + "...");

    // Usando voz Aria (9BWtsMINqrJLrRacOk9x) com modelo multilíngue turbo
    const voiceId = "9BWtsMINqrJLrRacOk9x"; // Aria - voz feminina natural
    const modelId = "eleven_turbo_v2_5"; // Modelo multilíngue, baixa latência

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API ElevenLabs:", response.status, errorText);
      throw new Error(`Erro ao gerar áudio: ${response.status}`);
    }

    // Obter o áudio como array buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Converter para base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log("Áudio gerado com sucesso");

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Erro no text-to-speech:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar áudio";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
