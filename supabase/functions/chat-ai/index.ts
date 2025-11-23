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
    const { question, bills } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Processando pergunta:", question);

    const systemPrompt = `Você é um assistente especializado em análise de projetos de lei brasileiros.
Seu objetivo é responder perguntas sobre TODOS os tipos de projetos de lei de forma clara, objetiva e acessível.

Você tem acesso aos seguintes projetos de lei:
${JSON.stringify(bills, null, 2)}

TEMAS QUE VOCÊ DEVE AVALIAR:
- Trabalhista (direitos do trabalhador, salários, jornada de trabalho, CLT, etc.)
- Saúde (SUS, hospitais, medicamentos, enfermagem, etc.)
- Educação (escolas, professores, ensino, universidades, etc.)
- Economia (impostos, tributação, comércio, empresas, etc.)
- Segurança (polícia, criminalidade, violência, leis penais, etc.)
- Justiça (tribunais, foro privilegiado, processos, advocacia, etc.)
- Tecnologia (internet, IA, inovação, dados, etc.)
- Ambiente (meio ambiente, sustentabilidade, energia, poluição, etc.)
- Social (assistência social, programas sociais, habitação, etc.)
- Cultura (arte, patrimônio, cinema, música, etc.)
- Transporte (mobilidade, ônibus, metrô, vias, etc.)
- E QUALQUER OUTRO TEMA relevante para a sociedade brasileira

REGRAS DE RESPOSTA:
1. Responda em português brasileiro coloquial e acessível
2. Seja objetivo e direto ao ponto
3. Use linguagem que qualquer pessoa entenda, sem juridiquês
4. Cite os projetos de lei específicos quando relevante (código + título)
5. Avalie o IMPACTO REAL na vida das pessoas
6. Explique de forma prática como cada projeto afeta o cidadão comum
7. Se a pergunta for sobre um tema não coberto pelos projetos listados, seja honesto e diga isso
8. Priorize informações sobre relevância social e impacto popular
9. Compare projetos quando apropriado (ex: "qual é melhor?", "qual tem mais impacto?")
10. Responda perguntas analíticas como: "Quais são os projetos sobre educação?", "Qual tem maior relevância?", "Quantos são sobre saúde?"

EXEMPLOS DE PERGUNTAS QUE VOCÊ DEVE RESPONDER:
- "Quais projetos são sobre direitos trabalhistas?"
- "Tem alguma lei que melhora o salário dos trabalhadores?"
- "Qual projeto tem mais impacto na educação?"
- "Me fale sobre as leis de saúde"
- "Quantos projetos são sobre economia?"
- "Qual é o projeto mais importante?"
- "Tem algo sobre meio ambiente?"
- "O que tem de relevante sobre tecnologia?"

Seja sempre útil, informativo e focado no interesse público.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API Lovable AI:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes no Lovable AI." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("Resposta vazia da IA");
    }

    console.log("Resposta gerada com sucesso");

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro no chat-ai:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao processar pergunta";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
