import React, { useState, useEffect } from 'react';
import { Mic, Eye, X, Volume2, ThumbsUp, ThumbsDown, Activity, ChevronRight, Zap, Trophy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { useToast } from '@/hooks/use-toast';

// --- MOCK DATA (Base de dados simulada - 22 itens para garantir o corte Top 10) ---
const MOCK_BILLS = [
  // --- RELEVANTES (Alto Impacto) ---
  { id: 1, code: "PL 999/2024", title: "Fim do Foro Privilegiado", author: "Iniciativa Popular", summary: "Extingue foro especial para crimes comuns de políticos. Todos serão julgados pela justiça comum.", relevance: 99, category: "Justiça", status: "Parado", sentiment: "positive", aiAnalysis: "Papo reto: A lei é pra todos. Político vai responder processo igual eu e você, sem juiz especial escolhido a dedo." },
  { id: 2, code: "PL 452/2024", title: "Saneamento Básico em Favelas", author: "Dep. Silva", summary: "Redireciona 15% do fundo de infraestrutura para áreas de risco.", relevance: 98, category: "Saúde", status: "Urgência", sentiment: "positive", aiAnalysis: "Papo reto: Dinheiro carimbado pra esgoto e água na favela. Prioridade máxima pra saúde pública." },
  { id: 3, code: "PEC 12/2025", title: "Reforma Tributária Solidária", author: "Comissão Mista", summary: "Zera impostos federais da cesta básica para cadastrados no CadÚnico.", relevance: 96, category: "Economia", status: "Senado", sentiment: "positive", aiAnalysis: "Papo reto: Comida mais barata pra quem precisa. Zera imposto do arroz e feijão pra quem é baixa renda." },
  { id: 4, code: "PL 333/2024", title: "IA na Triagem do SUS", author: "Frente Digital", summary: "Sistemas preditivos para reduzir filas de oncologia.", relevance: 94, category: "Tech", status: "Tramitação", sentiment: "positive", aiAnalysis: "Papo reto: Computador organizando a fila do SUS pra ninguém morrer esperando tratamento de câncer." },
  { id: 5, code: "PL 890/2024", title: "Internet como Direito Fundamental", author: "Sen. Conectado", summary: "Garante acesso gratuito de 5GB para estudantes de escola pública.", relevance: 91, category: "Educação", status: "Aprovado", sentiment: "positive", aiAnalysis: "Papo reto: Internet de graça pro estudante pobre não ficar pra trás nos estudos e na vida." },
  { id: 6, code: "PL 111/2025", title: "Piso Salarial da Enfermagem 2.0", author: "Dep. Saúde", summary: "Reajuste automático atrelado à inflação da saúde.", relevance: 89, category: "Trabalho", status: "Votação", sentiment: "positive", aiAnalysis: "Papo reto: Valoriza quem cuida da gente. O salário da enfermeira sobe junto com os preços." },
  { id: 7, code: "PL 777/2024", title: "Combate ao Feminicídio", author: "Bancada Feminina", summary: "Aumenta pena e cria fundo de amparo aos órfãos.", relevance: 88, category: "Segurança", status: "Sanção", sentiment: "positive", aiAnalysis: "Papo reto: Cadeia mais dura pra agressor e dinheiro do estado pra criar os filhos da vítima." },
  { id: 8, code: "PL 444/2024", title: "Escola em Tempo Integral", author: "MEC", summary: "Obrigatoriedade gradual até 2030 em todos municípios.", relevance: 87, category: "Educação", status: "Votação", sentiment: "positive", aiAnalysis: "Papo reto: Criança na escola o dia todo, aprendendo e comendo bem, pros pais poderem trabalhar tranquilos." },
  { id: 9, code: "PL 555/2024", title: "Energia Solar Popular", author: "Dep. Verde", summary: "Subsídio de 100% para painéis solares no Minha Casa Minha Vida.", relevance: 85, category: "Ambiente", status: "Comissão", sentiment: "positive", aiAnalysis: "Papo reto: Conta de luz zerada pra quem mora em casa popular, usando o sol pra gerar energia." },
  { id: 10, code: "PL 222/2025", title: "Transporte Gratuito Desempregados", author: "Dep. Mobilidade", summary: "Passe livre por 6 meses para quem perdeu emprego formal.", relevance: 82, category: "Social", status: "Análise", sentiment: "positive", aiAnalysis: "Papo reto: Ônibus de graça pra quem tá sem emprego conseguir ir nas entrevistas sem gastar o que não tem." },
  { id: 21, code: "PL 010/2025", title: "Incentivo à Leitura", author: "Dep. Cultura", summary: "Vale-livro anual para estudantes.", relevance: 75, category: "Educação", status: "Tramitação", sentiment: "positive", aiAnalysis: "Bom projeto, mas ficou fora do Top 10 hoje." },

  // --- IRRELEVANTES (Baixo Impacto / Ruído) ---
  { id: 11, code: "PL 987/2024", title: "Obrigação de Sorrir", author: "Dep. Feliz", summary: "Atendentes devem sorrir sob pena de multa administrativa.", relevance: 0, category: "Absurdo", status: "Arquivado", sentiment: "negative", aiAnalysis: "Papo reto: Quer obrigar a felicidade por lei. Completamente maluco e autoritário." },
  { id: 12, code: "PL 321/2025", title: "Moção de Aplauso BBB", author: "Dep. Reality", summary: "Homenagem oficial ao vencedor do reality show na câmara.", relevance: 1, category: "Homenagem", status: "Aprovado", sentiment: "negative", aiAnalysis: "Papo reto: Gastando tempo e dinheiro oficial pra bater palma pra programa de TV." },
  { id: 13, code: "PL 102/2024", title: "Dia do Hot Dog sem Purê", author: "Dep. Genérico", summary: "Cria data comemorativa no calendário oficial.", relevance: 2, category: "Cultura?", status: "Comissão", sentiment: "negative", aiAnalysis: "Papo reto: O deputado quer criar feriado pra discutir comida. Pura perda de tempo." },
  { id: 14, code: "PL 456/2024", title: "Dia do Surfista de Trem", author: "Dep. Radical", summary: "Reconhecimento cultural duvidoso de prática perigosa.", relevance: 3, category: "Bizarro", status: "Arquivado", sentiment: "negative", aiAnalysis: "Papo reto: Homenageando crime e perigo. Totalmente sem noção." },
  { id: 15, code: "PL 123/2025", title: "Proibição de Canudo Azul", author: "Dep. Cores", summary: "Permite apenas canudos vermelhos por estética.", relevance: 4, category: "Bizarro", status: "Análise", sentiment: "negative", aiAnalysis: "Papo reto: Discutindo cor de canudo enquanto falta água na torneira da população." },
  { id: 16, code: "PL 088/2024", title: "Nome de Ponte km 45", author: "Dep. Sobrinho", summary: "Homenagem ao avô do autor.", relevance: 5, category: "Homenagem", status: "Aprovado", sentiment: "negative", aiAnalysis: "Papo reto: Trocando placa de ponte pra agradar a família dele. Gasto de papel." },
  { id: 17, code: "PL 789/2024", title: "Mudança Nome Rua 15", author: "Vereador X", summary: "Altera nome de rua sem saída.", relevance: 6, category: "Urbano", status: "Tramitação", sentiment: "negative", aiAnalysis: "Papo reto: Mais uma troca de placa irrelevante que não melhora a rua." },
  { id: 18, code: "PL 001/2024", title: "Gravata Rosa às Quartas", author: "Dep. Fashion", summary: "Código de vestimenta em repartições.", relevance: 8, category: "Admin", status: "Arquivado", sentiment: "negative", aiAnalysis: "Papo reto: Fiscal de roupa. Quer mandar no que o funcionário veste em vez de ver se ele trabalha." },
  { id: 19, code: "PL 666/2024", title: "Dia do Influencer Mirim", author: "Dep. Likes", summary: "Sessão solene para premiar crianças tiktokers.", relevance: 12, category: "Homenagem", status: "Votação", sentiment: "negative", aiAnalysis: "Papo reto: Político querendo aparecer na internet usando crianças famosas." },
  { id: 20, code: "PL 654/2024", title: "Título Cidadão Honorário", author: "Dep. Amigo", summary: "Para empresário financiador de campanha.", relevance: 15, category: "Lobby", status: "Votação", sentiment: "negative", aiAnalysis: "Papo reto: Afago no ego de quem pagou a campanha dele. Troca de favores." },
  { id: 22, code: "PL 000/2024", title: "Dia do Ornitorrinco", author: "Dep. Animal", summary: "Data comemorativa.", relevance: 18, category: "Homenagem", status: "Arquivado", sentiment: "negative", aiAnalysis: "Irrelevante, mas não entrou no Top 10 da vergonha." }
];

// --- COMPONENTS ---

const VoiceOverlay = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.5)]">
          <Mic className="w-12 h-12 text-black animate-pulse" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-white text-center tracking-tight">{message}</h2>
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-75"></div>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
      </div>
      <button onClick={onClose} className="mt-12 px-8 py-3 border border-white/20 rounded-full text-white hover:bg-white/10 transition-colors uppercase font-bold tracking-widest text-xs">
        Cancelar Escuta
      </button>
    </div>
  );
};

const Modal = ({ bill, onClose }: { bill: any; onClose: () => void }) => {
  const { toast } = useToast();
  const [vote, setVote] = useState<'support' | 'oppose' | null>(null);
  
  if (!bill) return null;

  const speakSummary = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(bill.aiAnalysis);
    utterance.lang = "pt-BR";
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSupport = () => {
    setVote('support');
    toast({
      title: "✅ Voto registrado!",
      description: `Você apoiou: ${bill.title}`,
    });
  };

  const handleOppose = () => {
    setVote('oppose');
    toast({
      title: "❌ Voto registrado!",
      description: `Você discordou de: ${bill.title}`,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-0 sm:p-4 animate-in zoom-in-95 duration-200">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        
        {/* Header do Modal */}
        <div className={`p-6 relative overflow-hidden ${bill.relevance > 50 ? 'bg-emerald-950' : 'bg-red-950'}`}>
          <div className={`absolute top-0 right-0 p-32 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 ${bill.relevance > 50 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
          
          <div className="flex justify-between items-start relative z-10">
            <span className="px-3 py-1 rounded-full bg-black/40 text-xs font-mono border border-white/10 text-white backdrop-blur-md">
              {bill.code}
            </span>
            <button onClick={onClose} className="p-2 bg-black/20 hover:bg-white/10 rounded-full text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-4 leading-tight relative z-10 uppercase tracking-tight">
            {bill.title}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-slate-300 text-sm relative z-10">
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {bill.author.charAt(0)}
            </div>
            {bill.author}
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          
          {/* Bloco da IA */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-2 text-yellow-400">
                <Zap size={20} className="fill-current" />
                <h3 className="font-bold text-sm tracking-wider uppercase">Papo Reto da IA</h3>
              </div>
              <button 
                onClick={speakSummary}
                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-yellow-400 transition-colors"
                title="Ouvir explicação"
              >
                <Volume2 size={18} />
              </button>
            </div>
           
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              "{bill.aiAnalysis}"
            </p>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Relevância Social</span>
              <div className="flex items-center gap-2 mt-2">
                <Activity size={24} className={bill.relevance > 50 ? "text-emerald-500" : "text-red-500"} />
                <span className={`text-3xl font-black ${bill.relevance > 50 ? "text-white" : "text-slate-200"}`}>
                  {bill.relevance}%
                </span>
              </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Situação</span>
              <span className="text-white font-bold mt-2 block text-lg">{bill.status}</span>
            </div>
          </div>
          
           <div>
              <h4 className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-bold">Resumo Oficial</h4>
              <p className="text-slate-400 text-sm leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                {bill.summary}
              </p>
            </div>
        </div>

        {/* Footer do Modal */}
        <div className="p-4 sm:p-6 border-t border-slate-800 flex gap-3 bg-slate-900">
          <button 
            onClick={handleSupport}
            disabled={vote === 'support'}
            className={`flex-1 font-black py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
              vote === 'support' 
                ? 'bg-emerald-500 text-white shadow-emerald-500/50' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20'
            }`}
          >
            <ThumbsUp size={20} strokeWidth={3} />
            {vote === 'support' ? 'APOIADO ✓' : 'APOIAR'}
          </button>
          <button 
            onClick={handleOppose}
            disabled={vote === 'oppose'}
            className={`flex-1 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              vote === 'oppose'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <ThumbsDown size={20} />
            {vote === 'oppose' ? 'DISCORDADO ✗' : 'DISCORDAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RankedBillCard = ({ bill, rank, onClick, type }: { bill: any; rank: number; onClick: (bill: any) => void; type: string }) => {
  const isRelevant = type === 'relevant';
  
  const getRankStyle = (r: number) => {
    if (r === 1) return "bg-yellow-400 text-black border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110 z-10";
    if (r === 2) return "bg-slate-300 text-slate-900 border-slate-400 shadow-[0_0_10px_rgba(203,213,225,0.4)]";
    if (r === 3) return "bg-orange-700 text-orange-100 border-orange-600 shadow-[0_0_10px_rgba(194,65,12,0.4)]";
    return "bg-slate-800/80 text-slate-400 border-slate-700";
  };

  return (
    <div 
      className={`group relative flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-700 ${rank === 1 ? 'my-6 bg-slate-900/80' : 'my-2'}`}
      onClick={() => onClick(bill)}
    >
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl border-2 transition-transform group-hover:scale-110 ${getRankStyle(rank)}`}>
        {rank}º
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isRelevant ? 'text-emerald-400' : 'text-red-400'}`}>
            {bill.category}
          </span>
          {rank === 1 && <Trophy size={16} className="text-yellow-500 animate-bounce" />}
        </div>
        
        <h3 className={`font-bold leading-tight truncate ${rank === 1 ? 'text-xl text-white' : 'text-base text-slate-200'}`}>
          {bill.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 truncate">{bill.summary}</p>
      </div>

      <div className="text-right hidden sm:block">
        <div className={`font-black text-lg ${isRelevant ? 'text-emerald-500' : 'text-red-500'}`}>
          {bill.relevance}%
        </div>
        <span className="text-[10px] text-slate-600 font-bold uppercase">Impacto</span>
      </div>

      <div className="sm:hidden text-slate-600">
         <ChevronRight size={20} />
      </div>
    </div>
  );
};

export default function Index() {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [activeTab, setActiveTab] = useState('relevant');
  const { isListening, transcript, startListening, stopListening, speak } = useVoiceCommand();

  const top10Relevant = MOCK_BILLS
    .filter(b => b.relevance >= 50)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);

  const top10Irrelevant = MOCK_BILLS
    .filter(b => b.relevance < 50)
    .sort((a, b) => a.relevance - b.relevance)
    .slice(0, 5);

  useEffect(() => {
    if (transcript) {
      setVoiceMessage(`Procurando "${transcript}"...`);
      
      const searchTerm = transcript.toLowerCase();
      const allBills = [...top10Relevant, ...top10Irrelevant];
      const foundBill = allBills.find(bill => 
        bill.title.toLowerCase().includes(searchTerm) ||
        bill.summary.toLowerCase().includes(searchTerm) ||
        bill.category.toLowerCase().includes(searchTerm)
      );

      if (foundBill) {
        setTimeout(() => {
          setSelectedBill(foundBill);
          speak(`Encontrei: ${foundBill.title}. ${foundBill.aiAnalysis}`);
          stopListening();
        }, 1000);
      } else {
        setTimeout(() => {
          const randomBill = top10Relevant[Math.floor(Math.random() * top10Relevant.length)];
          setSelectedBill(randomBill);
          speak(`Não encontrei essa lei específica. Aqui está uma lei relevante: ${randomBill.title}. ${randomBill.aiAnalysis}`);
          stopListening();
        }, 1000);
      }
    }
  }, [transcript]);

  const handleVoiceCommand = () => {
    setVoiceMessage("Qual lei você quer fiscalizar?");
    startListening();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-yellow-500 selection:text-black pb-12">
      
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="relative transform group-hover:rotate-12 transition-transform duration-500">
              <Eye className="text-yellow-400 w-10 h-10" strokeWidth={2.5} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none">
                TÔ DE <span className="text-yellow-400">OLHO!</span>
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Ranking Legislativo</span>
            </div>
          </div>

          <button 
            onClick={handleVoiceCommand}
            className="bg-yellow-400 hover:bg-yellow-300 text-black rounded-full pl-4 pr-6 py-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.3)] flex items-center gap-3"
          >
            <div className="bg-black/10 p-1.5 rounded-full">
               <Mic size={18} strokeWidth={3} />
            </div>
            <span className="font-bold text-sm tracking-wide hidden sm:block">FALAR AGORA</span>
            <span className="font-bold text-sm tracking-wide sm:hidden">FALAR</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
             Placar da <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Verdade</span>.
          </h2>
          <p className="text-slate-400 text-sm sm:text-lg leading-relaxed">
            Sem juridiquês. A Inteligência Artificial processou <span className="text-white font-bold">4.203 leis</span> esta semana.
            Aqui estão as <span className="text-emerald-400 font-bold">Top 5 que salvam vidas</span> e as <span className="text-red-400 font-bold">Top 5 que jogam dinheiro fora</span>.
          </p>
        </div>

        <div className="lg:hidden grid grid-cols-2 gap-2 mb-8 p-1 bg-slate-900/80 rounded-xl border border-slate-800 sticky top-24 z-20 backdrop-blur-md shadow-xl">
          <button 
            className={`py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'relevant' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('relevant')}
          >
            <ArrowUp size={14} strokeWidth={3} />
            Top 5 Úteis
          </button>
          <button 
            className={`py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'irrelevant' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('irrelevant')}
          >
             <Trash2 size={14} strokeWidth={3} />
             Top 5 Inúteis
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative">
          
          <section className={`transition-opacity duration-300 ${activeTab === 'irrelevant' ? 'hidden lg:block lg:opacity-100 opacity-0 absolute lg:static' : 'block opacity-100'}`}>
            <div className="sticky top-24 z-10 bg-slate-950/95 pb-4 border-b border-emerald-900/30 mb-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <Trophy size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic">HALL DA FAMA</h3>
                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Leis que mudam o Brasil</p>
                  </div>
                </div>
                <div className="text-emerald-500/20 text-4xl font-black">#TOP5</div>
              </div>
            </div>
            
            <div className="space-y-2 pb-10">
              {top10Relevant.map((bill, index) => (
                <RankedBillCard 
                  key={bill.id} 
                  bill={bill} 
                  rank={index + 1} 
                  type="relevant" 
                  onClick={setSelectedBill} 
                />
              ))}
            </div>
          </section>

          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-800 via-slate-800 to-transparent -ml-px"></div>

          <section className={`transition-opacity duration-300 ${activeTab === 'relevant' ? 'hidden lg:block lg:opacity-100 opacity-0 absolute lg:static' : 'block opacity-100'}`}>
            <div className="sticky top-24 z-10 bg-slate-950/95 pb-4 border-b border-red-900/30 mb-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                    <Trash2 size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic">HALL DA VERGONHA</h3>
                    <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Leis que gastam seu dinheiro</p>
                  </div>
                </div>
                <div className="text-red-500/20 text-4xl font-black">#TOP5</div>
              </div>
            </div>

            <div className="space-y-2 pb-10">
              {top10Irrelevant.map((bill, index) => (
                <RankedBillCard 
                  key={bill.id} 
                  bill={bill} 
                  rank={index + 1} 
                  type="irrelevant" 
                  onClick={setSelectedBill} 
                />
              ))}
            </div>
          </section>

        </div>
      </main>

      <Modal bill={selectedBill} onClose={() => setSelectedBill(null)} />
      <VoiceOverlay isOpen={isListening} onClose={stopListening} message={voiceMessage} />

      <footer className="mt-16 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Eye className="text-yellow-400 w-6 h-6" strokeWidth={2.5} />
              <div>
                <p className="text-white font-bold text-sm">Tô de Olho!</p>
                <p className="text-slate-500 text-xs">Ranking Legislativo</p>
              </div>
            </div>
            <div className="text-slate-500 text-xs">
              © {new Date().getFullYear()} • Todos os direitos reservados
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
