export interface Question {
  id: number;
  title: string;
  options: { label: string; value: string }[];
  multiSelect?: boolean;
}

export const questions: Question[] = [
  {
    id: 1,
    title: "Quando alguém fala 'bolsa de valores', o que vem na cabeça?",
    options: [
      { label: "Medo. Conheço gente que se deu mal.", value: "A" },
      { label: "Curiosidade. Sei que tem gente ganhando, mas não sei como começar.", value: "B" },
      { label: "Desânimo. Já tentei e não deu certo.", value: "C" },
      { label: "Animação. Já lucrei e quero ir além.", value: "D" },
    ],
  },
  {
    id: 3,
    title: "Seu histórico com investimentos:",
    options: [
      { label: "Zero experiência. Dinheiro na conta ou poupança.", value: "A" },
      { label: "Já investi em ações, fundos, renda fixa — mas sem plano.", value: "B" },
      { label: "Já opero, mas sem consistência.", value: "C" },
    ],
  },
  {
    id: 7,
    title: "O que te impede de dar a sua grande tacada agora?",
    options: [
      { label: "Medo de investir e não saber a hora de sair.", value: "A" },
      { label: "Excesso de informação. Fico perdido.", value: "B" },
      { label: "Falta de método. Preciso de algo sério.", value: "C" },
      { label: "Já tenho método, mas quero escalar.", value: "D" },
    ],
  },
  {
    id: 2,
    title: "Se fosse investir R$ 500 agora, qual o primeiro pensamento?",
    options: [
      { label: '"Não posso perder esse dinheiro."', value: "A" },
      { label: '"Será que eu entendo o que estou fazendo?"', value: "B" },
      { label: '"Como transformo isso em R$ 5.000 rápido?"', value: "C" },
      { label: '"Já sei onde colocar — quero otimizar."', value: "D" },
    ],
  },
  {
    id: 9,
    title: "Na hora de uma decisão grande na vida, como você age?",
    options: [
      { label: "Analiso tudo antes. Só vou com segurança.", value: "A" },
      { label: "Pergunto pra quem já passou por isso.", value: "B" },
      { label: "Vou no instinto. Decido e corrijo depois.", value: "C" },
    ],
  },
  {
    id: 4,
    title: "Quanto tem investido no Mercado Financeiro hoje?",
    options: [
      { label: "Menos de R$ 10.000 (ou zero)", value: "A" },
      { label: "Entre R$ 10.000 e R$ 100.000", value: "B" },
      { label: "Entre R$ 100.000 e R$ 500.000", value: "C" },
      { label: "Entre R$ 500.000 e R$ 1.000.000", value: "D" },
      { label: "Acima de R$ 1.000.000", value: "E" },
    ],
  },
  {
    id: 5,
    title: "Sua renda mensal total:",
    options: [
      { label: "Até R$ 3.000/mês", value: "A" },
      { label: "Até R$ 10.000/mês", value: "B" },
      { label: "Até R$ 20.000/mês", value: "C" },
      { label: "Acima de R$ 20.000/mês", value: "D" },
    ],
  },
  {
    id: 8,
    title: "Quanto tempo por dia pra aprender algo novo?",
    options: [
      { label: "Muito pouco. Preciso de algo prático.", value: "A" },
      { label: "30 min a 1h por dia. Consigo me organizar.", value: "B" },
      { label: "Tenho tempo. Se der resultado, dedico o que precisar.", value: "C" },
    ],
  },
  {
    id: 10,
    title: 'Que resultado em 6 meses te faria pensar: "valeu a pena"?',
    options: [
      { label: "Renda extra de R$ 500 a R$ 2.000/mês, com segurança.", value: "A" },
      { label: "Dominar um método que me dê independência financeira.", value: "B" },
      { label: "Multiplicar meu capital e construir patrimônio real.", value: "C" },
    ],
  },
  {
    id: 11,
    title: "Onde seu dinheiro tá aplicado hoje?",
    options: [
      { label: "Poupança / CDB / Tesouro Direto", value: "A" },
      { label: "Ações", value: "B" },
      { label: "Fundos Imobiliários (FIIs)", value: "C" },
      { label: "Opções", value: "D" },
      { label: "Criptomoedas", value: "E" },
      { label: "Nunca coloquei dinheiro em nada", value: "F" },
    ],
    multiSelect: true,
  },
];

export type ProfileType = 1 | 2 | 3;

// Per-question answer → profile mapping
// P6 removed; Q11/Q12 are informational only
const scoredQuestionIds = [1, 2, 3, 4, 5, 7, 8, 9, 10];

const answerToProfile: Record<number, Record<string, ProfileType>> = {
  1: { A: 1, B: 2, C: 3, D: 3 },
  2: { A: 1, B: 2, C: 3, D: 3 },
  3: { A: 1, B: 2, C: 3 },
  4: { A: 1, B: 2, C: 3, D: 3, E: 3 },
  5: { A: 1, B: 2, C: 3, D: 3 },
  7: { A: 1, B: 2, C: 3, D: 3 },
  8: { A: 1, B: 2, C: 3 },
  9: { A: 1, B: 2, C: 3 },
  10: { A: 1, B: 2, C: 3 },
};

export function classifyProfile(answers: Record<number, string>): ProfileType {
  const count = { 1: 0, 2: 0, 3: 0 };

  for (const qId of scoredQuestionIds) {
    const answer = answers[qId];
    if (!answer) continue;

    const mapping = answerToProfile[qId];
    const profile = mapping?.[answer];
    if (profile) count[profile]++;
  }

  const max = Math.max(count[1], count[2], count[3]);
  const tied = ([1, 2, 3] as ProfileType[]).filter((p) => count[p] === max);

  if (tied.length === 1) return tied[0];

  // Tiebreaker: Q4 (patrimônio), Q5 (renda), Q10 (ambição)
  for (const q of [4, 5, 10]) {
    const a = answers[q];
    if (!a) continue;
    const profile = answerToProfile[q]?.[a];
    if (profile && tied.includes(profile)) return profile;
  }

  return tied[0];
}

export function getPatrimonioLabel(answer: string): string {
  if (answer === "A") return "Menos de R$ 10.000";
  if (answer === "B") return "Entre R$ 10.000 e R$ 100.000";
  if (answer === "C") return "Entre R$ 100.000 e R$ 500.000";
  if (answer === "D") return "Entre R$ 500.000 e R$ 1.000.000";
  return "Acima de R$ 1.000.000";
}

export function getRendaLabel(answer: string): string {
  if (answer === "A") return "Até R$ 3.000/mês";
  if (answer === "B") return "Até R$ 10.000/mês";
  if (answer === "C") return "Até R$ 20.000/mês";
  return "Acima de R$ 20.000/mês";
}

/* ── Asset asymmetry analysis ──────────────────────────── */
export interface AssetAnalysis {
  asset: string;
  verdict: "low" | "medium" | "high";
  explanation: string;
}

export function getAssetAnalysis(assetsAnswer: string): AssetAnalysis[] {
  // assetsAnswer can be comma-separated for multi-select
  const selected = assetsAnswer.split(",").map((s) => s.trim());
  const results: AssetAnalysis[] = [];

  const map: Record<string, AssetAnalysis> = {
    A: {
      asset: "Poupança / CDB / Tesouro",
      verdict: "low",
      explanation:
        "Rende menos que a inflação. Pra quem tem menos de R$ 1M, não vai mudar sua vida.",
    },
    B: {
      asset: "Ações",
      verdict: "medium",
      explanation:
        "Bom potencial, mas sem estratégia você arrisca muito pra ganhar pouco.",
    },
    C: {
      asset: "Fundos Imobiliários",
      verdict: "low",
      explanation:
        "Bom pra renda passiva — mas só com muito capital. R$ 100k em FIIs rende ~R$ 700/mês.",
    },
    D: {
      asset: "Opções",
      verdict: "high",
      explanation:
        "Único ativo com assimetria real: risco definido antes de entrar, ganho muito maior.",
    },
    E: {
      asset: "Criptomoedas",
      verdict: "medium",
      explanation:
        "Ganho grande, mas volatilidade sem controle. Sem estratégia, é cassino.",
    },
    F: {
      asset: "Nenhum investimento",
      verdict: "low",
      explanation:
        "Dinheiro parado perde valor todo mês. Você tá no lugar certo pra mudar isso.",
    },
  };

  for (const key of selected) {
    if (map[key]) results.push(map[key]);
  }

  return results;
}

export interface ProfileData {
  title: string;
  emoji: string;
  experience: string;
  profileLabel: string;
  whyAgt: string[];
  stats: string[];
  superpower: string;
  reframe: string;
  whatsMissing: string;
  traderWithout: string[];
  traderWith: string[];
  patternResults: string[];
}

export const profiles: Record<ProfileType, ProfileData> = {
  1: {
    title: "INICIANTE ESTRATÉGICO",
    emoji: "🛡️",
    experience: "Começando do zero",
    profileLabel: "Conservador",
    whyAgt: [
      "Cada erro custa caro pra quem tem pouco capital. O AGT te ensina a operar com risco controlado desde o dia 1 — você define quanto pode perder ANTES de entrar.",
      "A regra dos 10 tiros: se errar 7, os 3 que acertam pagam todos os erros e ainda sobra lucro. Isso é assimetria.",
      "Quem começa com proteção aprende mais rápido — porque não perde tempo se recuperando.",
    ],
    stats: [
      "67% dos brasileiros têm menos de R$ 1.000 de reserva. Você já tá na frente.",
      "Só 3% da população investe na bolsa. Você tá mais ligado que 97% do país.",
      "89% dos iniciantes perdem nos primeiros meses — você não perdeu porque não entrou sem método.",
    ],
    superpower:
      "Você pensa antes de agir. Essa cautela vale mais que qualquer capital inicial.",
    reframe:
      "Investidores cautelosos têm 2x mais chance de lucro consistente que os impulsivos. Seu medo não é fraqueza — é o radar que 9 em 10 não têm.",
    whatsMissing:
      "O passo a passo: como usar opções pra multiplicar seu capital com risco controlado, no seu ritmo.",
    traderWithout: [
      "Testa coisa aleatória sem direção",
      "Demora 3x mais pra ter resultado",
      "Risco alto de desistir por frustração",
      "Perde dinheiro aprendendo na marra",
    ],
    traderWith: [
      "Roteiro claro pro seu momento",
      "Sabe o que fazer e quando",
      "Resultado mais rápido com risco controlado",
      "Capital protegido durante o aprendizado",
    ],
    patternResults: [
      "2x a 3x mais velocidade pra ter consistência",
      "Capital preservado durante o aprendizado",
      "4x mais chance de manter disciplina até dominar o método",
    ],
  },
  2: {
    title: "OPERADOR EM CONSTRUÇÃO",
    emoji: "📐",
    experience: "Já tem uma base",
    profileLabel: "Moderado",
    whyAgt: [
      "Seu problema não é falta de conhecimento — é excesso de informação sem sistema de decisão. Você trava na hora de operar.",
      "O AGT te dá o mapa: com esse capital, nesse momento, use isso. Se der errado, acione essa proteção. A regra dos 10 tiros garante que os acertos pagam os erros.",
      "É a diferença entre ter 50 ferramentas sem manual — e um passo a passo pra cada situação.",
    ],
    stats: [
      "Você ganha mais que 78% dos brasileiros. Tá na frente.",
      "Só 11% da população tem mais de R$ 10 mil investido. Você já construiu uma base.",
      "Mas 92% desse patrimônio rende menos que a inflação. Sem método, você perde poder de compra todo mês.",
    ],
    superpower:
      "Você equilibra estudo e execução. É disciplinado — só precisa de um sistema que funcione com essa disciplina.",
    reframe:
      "Investidores com seu perfil têm 71% de taxa de sucesso, contra 23% dos impulsivos. Sua cautela é o que separa quem lucra de quem perde.",
    whatsMissing:
      "Um método claro pra usar opções como ferramenta de multiplicação — com risco controlado e um caminho definido pro seu perfil.",
    traderWithout: [
      "Muita teoria, pouca execução",
      "Pula de estratégia em estratégia",
      "Nunca sabe se tá no caminho certo",
      "Resultado inconsistente mês a mês",
    ],
    traderWith: [
      "Sistema claro de decisão",
      "Sabe o que fazer em cada cenário",
      "Resultado previsível com risco controlado",
      "Cresce mês a mês com consistência",
    ],
    patternResults: [
      "2x a 3x mais velocidade pra ter consistência",
      "Capital preservado durante o aprendizado",
      "4x mais chance de manter disciplina até dominar o método",
    ],
  },
  3: {
    title: "MULTIPLICADOR",
    emoji: "⚡",
    experience: "Já opera",
    profileLabel: "Arrojado",
    whyAgt: [
      "Seu problema não é ganhar — é manter. Acerta várias, erra uma sem proteção, e o lucro evapora.",
      "A regra dos 10 tiros resolve: operações pequenas com risco definido. Erra 7, os 3 que acertam pagam tudo e sobra. Retorno de 3x, 5x, até 10x.",
      "É a diferença entre operar no impulso e operar com sistema.",
    ],
    stats: [
      "Você tá no top 5% de renda do Brasil.",
      "Menos de 1% tem mais de R$ 100k investido. Você construiu patrimônio.",
      "Mas 78% com seu perfil perdem operando sem sistema. Agressividade sem método destrói capital.",
    ],
    superpower:
      "Ambição + consciência de risco = DNA de quem multiplica. Só falta a trava certa na coragem.",
    reframe:
      "Ganhou e devolveu? Não é falta de talento — é falta de sistema. Traders com proteção estruturada têm 5x mais chance de lucro consistente.",
    whatsMissing:
      "O sistema de assimetria: opções com risco controlado, a regra dos 10 tiros, e um método que transforma agressividade em multiplicação consistente.",
    traderWithout: [
      "Opera no impulso sem proteção",
      "Ganha num mês, devolve no outro",
      "Ciclo de euforia e frustração",
      "Capital diminui ao longo do tempo",
    ],
    traderWith: [
      "Assimetria — risco pequeno, ganho grande",
      "Regra dos 10 tiros: erra 7, lucra nos 3",
      "Proteção automática em toda operação",
      "Capital cresce de forma consistente",
    ],
    patternResults: [
      "2x a 3x mais velocidade pra ter consistência",
      "Capital preservado mesmo nos erros",
      "5x mais chance de manter lucro no longo prazo",
    ],
  },
};

