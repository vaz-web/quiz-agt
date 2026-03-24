# Skill: Quiz Diagnóstico — Guia Completo para Criar Diagnósticos Interativos

Este documento é um guia prático e replicável para criar aplicações de quiz diagnóstico como funil de captura de leads. Contém templates de código copiáveis, decisões de arquitetura, padrões de UX e copy, e um passo-a-passo para criar um novo diagnóstico do zero.

**Referência original:** Quiz AGT — A Grande Tacada (diagnóstico de perfil de investidor).
**Repositório:** github.com/vaz-web/quiz-agt

---

## 1. Visão Geral do Produto

**O que é:** Uma SPA (Single Page Application) que funciona como funil de captura de leads via quiz diagnóstico. O usuário responde perguntas, é classificado em um perfil, e recebe um resultado personalizado que gera desejo de falar com um consultor.

**Fluxo completo:**
```
Welcome → Quiz (8-12 perguntas) → Transição → Captura de Lead → Processamento → Resultado
```

**Métricas de design:**
- Tempo total do quiz: ~2 minutos
- Perguntas de scoring: 8-10 (+ opcionais informacionais)
- Perfis possíveis: 3 (pode adaptar para 2-5)
- Objetivo final: clique no CTA (WhatsApp, calendário, etc.)

---

## 2. PASSO A PASSO — Criar um Novo Diagnóstico

### Passo 1: Clonar o projeto base
```bash
git clone https://github.com/vaz-web/quiz-agt.git meu-novo-quiz
cd meu-novo-quiz
rm -rf .git
git init
npm install
```

### Passo 2: Definir os perfis
Antes de tocar no código, defina no papel:
- 3 perfis com nomes, emojis, posicionamento (conservador → arrojado)
- Para cada perfil: 3 parágrafos persuasivos, 3 stats, superpower, reframe, gap, contraste

### Passo 3: Configurar as variáveis do projeto
Todas as variáveis que mudam entre projetos estão centralizadas. Veja a seção "Variáveis Centralizadas" abaixo.

### Passo 4: Escrever as perguntas
Use o template de `quizData.ts` (seção 5). Regras:
- 8-12 perguntas, títulos ≤8 palavras
- 3-5 opções por pergunta, values "A" a "E"
- Última pergunta pode ser multi-select (informacional)

### Passo 5: Montar a tabela de scoring
Cada resposta vota em 1 perfil. Monte a tabela `answerToProfile`.

### Passo 6: Trocar assets visuais
- Background: WebP, ≤100KB, ≤1280px de largura
- Logos: PNG transparente, ≤50KB cada
- Colocar em `public/images/`

### Passo 7: Ajustar cores e fontes
No `tailwind.config.ts` e `index.css`. Trocar accent, primary, destructive.

### Passo 8: Configurar Supabase
Criar tabela de leads com campos: name, whatsapp, email, profile, answers_json.

### Passo 9: Ajustar meta tags
No `index.html`: título, descrição, OG image, theme-color.

### Passo 10: Testar e publicar
```bash
npx tsc --noEmit          # Zero erros de tipo
npm run dev               # Testar local
npx vite build            # Build de produção
```

---

## 3. VARIÁVEIS CENTRALIZADAS — O que trocar entre projetos

### 3.1 Arquivo: `index.html`
```html
<!-- TROCAR: título, descrição, OG image, theme-color, fontes -->
<meta name="theme-color" content="#050507" />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Sora:wght@400;700&display=swap" rel="stylesheet" />
<title>NOME DO DIAGNÓSTICO</title>
<meta name="description" content="DESCRIÇÃO EM 1 LINHA" />
<meta property="og:image" content="URL_DA_IMAGEM_OG">
```

### 3.2 Arquivo: `src/pages/Index.tsx`
```typescript
// TROCAR: URL do background
backgroundImage: "url('/images/bg-trading.webp')"

// TROCAR: opacidade do overlay (0.7 a 0.9)
<div className="fixed inset-0 bg-black/80" />

// TROCAR: ordem das perguntas (IDs na ordem desejada)
const questionOrder = [1, 3, 7, 2, 9, 4, 5, 8, 10, 11];

// TROCAR: índices de milestone (0-based na ordem acima)
const milestoneIndices = [5, 8];

// TROCAR: configuração do Supabase
const { error } = await supabase.from("NOME_DA_TABELA").insert({ ... });
```

### 3.3 Arquivo: `src/data/quizData.ts`
Este é o arquivo principal — contém TODO o conteúdo do quiz. Veja template completo na seção 5.

### 3.4 Arquivo: `tailwind.config.ts`
```typescript
// TROCAR: cores do tema
accent: "hsl(28 90% 55%)",      // Cor principal de CTA
primary: "hsl(217 72% 50%)",    // Cor de destaque secundária
destructive: "hsl(0 72% 51%)",  // Cor de alerta / marca

// TROCAR: fontes
fontFamily: {
  sans: ["DM Sans", "sans-serif"],      // Body
  heading: ["Sora", "sans-serif"],       // Títulos
},
```

### 3.5 Arquivo: `src/index.css`
```css
/* TROCAR: cores das variáveis CSS (formato HSL sem parênteses) */
--background: 220 35% 6%;
--foreground: 215 20% 96%;
--accent: 28 90% 55%;
--primary: 217 72% 50%;

/* TROCAR: glass-card se mudar a paleta */
.glass-card {
  background: hsl(220 28% 8% / 0.75);
  border: 1px solid hsl(220 18% 20% / 0.4);
}
```

### 3.6 Arquivo: `src/components/ResultScreen.tsx`
```typescript
// TROCAR: número do WhatsApp
window.open("https://wa.me/5511XXXXXXXX", "_blank");

// TROCAR: cores por perfil
const profileColors = {
  1: { ring: "from-blue-400 to-sky-400", glow: "shadow-blue-500/30", accent: "text-blue-400" },
  2: { ring: "from-orange-400 to-amber-400", glow: "shadow-orange-500/30", accent: "text-orange-400" },
  3: { ring: "from-red-400 to-orange-500", glow: "shadow-red-500/30", accent: "text-red-400" },
};

// TROCAR: ícones por perfil
const profileIcons = {
  1: <Shield className="h-10 w-10" />,
  2: <Target className="h-10 w-10" />,
  3: <Zap className="h-10 w-10" />,
};

// TROCAR: valores dos gauges por perfil
const gaugeValues = {
  1: { risk: 95, readiness: 30, growth: 60 },
  2: { risk: 70, readiness: 60, growth: 80 },
  3: { risk: 50, readiness: 85, growth: 95 },
};
```

### 3.7 Arquivo: `src/components/WelcomeScreen.tsx`
```tsx
// TROCAR: textos da tela inicial
<h1>HEADLINE PRINCIPAL</h1>
<p>SUBTÍTULO — ex: "10 perguntas rápidas. Resultado na hora."</p>
<Button>TEXTO DO CTA — ex: "Descobrir meu perfil"</Button>
```

### 3.8 Arquivo: `src/components/LeadCapture.tsx`
```tsx
// TROCAR: textos do formulário
<h2>HEADLINE — ex: "Seu resultado está pronto!"</h2>
<p>SUBTÍTULO — ex: "Preencha pra ver seu resultado."</p>
<Button>TEXTO DO CTA — ex: "Ver meu resultado"</Button>
```

---

## 4. Stack Tecnológica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Framework | React 18 + TypeScript | Componentes reativos, type-safety |
| Build | Vite 8 | Hot reload rápido, bundle otimizado |
| Estilos | Tailwind CSS 3.4 | Utility-first, responsivo, tema custom |
| Animações | Framer Motion 12 | AnimatePresence, stagger, spring physics |
| Validação | Zod + React Hook Form | Schema validation com UX de erro em tempo real |
| Backend | Supabase | Armazenamento de leads sem servidor |
| Ícones | Lucide React | Ícones SVG leves e consistentes |
| Áudio | Web Audio API (nativo) | Zero arquivos externos, síntese programática |
| UI Primitives | Radix UI | Componentes acessíveis (botões, inputs, etc.) |

---

## 5. TEMPLATE: quizData.ts — Perguntas, Scoring, Perfis

Este é o template completo e copiável. Substitua o conteúdo entre `/* TROCAR */`.

```typescript
export interface Question {
  id: number;
  title: string;
  options: { label: string; value: string }[];
  multiSelect?: boolean;
}

/* ══════════════════════════════════════════════════
   PERGUNTAS
   - IDs não precisam ser sequenciais
   - A ordem de exibição é definida em Index.tsx
   - Última pode ser multiSelect (informacional)
   ══════════════════════════════════════════════════ */
export const questions: Question[] = [
  /* TROCAR: adapte perguntas ao seu nicho */
  {
    id: 1,
    title: "Pergunta curta aqui? (máx 8 palavras)",
    options: [
      { label: "Opção que indica perfil 1 (conservador)", value: "A" },
      { label: "Opção que indica perfil 2 (moderado)", value: "B" },
      { label: "Opção que indica perfil 3 (avançado)", value: "C" },
      { label: "Opção extra (também perfil 3)", value: "D" },
    ],
  },
  // ... repita para 8-12 perguntas ...
  {
    id: 11,
    title: "Pergunta informacional multi-select?",
    options: [
      { label: "Opção A", value: "A" },
      { label: "Opção B", value: "B" },
      { label: "Opção C", value: "C" },
    ],
    multiSelect: true,
  },
];

/* ══════════════════════════════════════════════════
   SCORING
   ══════════════════════════════════════════════════ */
export type ProfileType = 1 | 2 | 3;

// IDs das perguntas que contam pra classificação (excluir multi-select e informacionais)
const scoredQuestionIds = [1, 2, 3, 4, 5, 7, 8, 9, 10]; /* TROCAR */

// Tabela: para cada pergunta, qual perfil cada resposta vota
const answerToProfile: Record<number, Record<string, ProfileType>> = {
  /* TROCAR: mapeie cada resposta ao perfil correspondente */
  1:  { A: 1, B: 2, C: 3, D: 3 },
  2:  { A: 1, B: 2, C: 3, D: 3 },
  3:  { A: 1, B: 2, C: 3 },
  4:  { A: 1, B: 2, C: 3, D: 3, E: 3 },
  5:  { A: 1, B: 2, C: 3, D: 3 },
  7:  { A: 1, B: 2, C: 3, D: 3 },
  8:  { A: 1, B: 2, C: 3 },
  9:  { A: 1, B: 2, C: 3 },
  10: { A: 1, B: 2, C: 3 },
};

export function classifyProfile(answers: Record<number, string>): ProfileType {
  const count = { 1: 0, 2: 0, 3: 0 };

  for (const qId of scoredQuestionIds) {
    const answer = answers[qId];
    if (!answer) continue;
    const profile = answerToProfile[qId]?.[answer];
    if (profile) count[profile]++;
  }

  const max = Math.max(count[1], count[2], count[3]);
  const tied = ([1, 2, 3] as ProfileType[]).filter((p) => count[p] === max);

  if (tied.length === 1) return tied[0];

  // Tiebreaker: perguntas de desempate (patrimônio, renda, ambição)
  for (const q of [4, 5, 10]) { /* TROCAR: IDs de desempate */
    const a = answers[q];
    if (!a) continue;
    const profile = answerToProfile[q]?.[a];
    if (profile && tied.includes(profile)) return profile;
  }

  return tied[0];
}

/* ══════════════════════════════════════════════════
   HELPERS DE LABEL (para o Raio-X Financeiro)
   ══════════════════════════════════════════════════ */
/* TROCAR: adapte os labels ao contexto do seu quiz */
export function getPatrimonioLabel(answer: string): string {
  const map: Record<string, string> = {
    A: "Menos de R$ 10.000",
    B: "Entre R$ 10.000 e R$ 100.000",
    C: "Entre R$ 100.000 e R$ 500.000",
    D: "Entre R$ 500.000 e R$ 1.000.000",
    E: "Acima de R$ 1.000.000",
  };
  return map[answer] || "Não informado";
}

export function getRendaLabel(answer: string): string {
  const map: Record<string, string> = {
    A: "Até R$ 3.000/mês",
    B: "Até R$ 10.000/mês",
    C: "Até R$ 20.000/mês",
    D: "Acima de R$ 20.000/mês",
  };
  return map[answer] || "Não informado";
}

/* ══════════════════════════════════════════════════
   ANÁLISE DE ATIVOS (opcional, para multi-select)
   ══════════════════════════════════════════════════ */
export interface AssetAnalysis {
  asset: string;
  verdict: "low" | "medium" | "high";
  explanation: string;
}

export function getAssetAnalysis(assetsAnswer: string): AssetAnalysis[] {
  const selected = assetsAnswer.split(",").map((s) => s.trim());
  const results: AssetAnalysis[] = [];

  /* TROCAR: adapte os ativos e análises ao seu nicho */
  const map: Record<string, AssetAnalysis> = {
    A: { asset: "Ativo 1", verdict: "low",    explanation: "Análise curta de 1 linha." },
    B: { asset: "Ativo 2", verdict: "medium", explanation: "Análise curta de 1 linha." },
    C: { asset: "Ativo 3", verdict: "high",   explanation: "Análise curta de 1 linha." },
  };

  for (const key of selected) {
    if (map[key]) results.push(map[key]);
  }
  return results;
}

/* ══════════════════════════════════════════════════
   PERFIS — Dados completos de resultado
   ══════════════════════════════════════════════════ */
export interface ProfileData {
  title: string;           // Nome do perfil (CAIXA ALTA)
  emoji: string;           // Emoji representativo
  experience: string;      // Frase curta de contexto
  profileLabel: string;    // Rótulo (Conservador / Moderado / Arrojado)
  whyAgt: string[];        // 3 parágrafos persuasivos (por que seu produto)
  stats: string[];         // 3 estatísticas comparativas
  superpower: string;      // Ponto forte detectado (1 frase)
  reframe: string;         // Reframing psicológico (2 frases)
  whatsMissing: string;    // O que falta (1-2 frases, gera desejo)
  traderWithout: string[]; // 4 itens: sem método (dor)
  traderWith: string[];    // 4 itens: com método (solução)
  patternResults: string[];// 3 resultados típicos do método
}

export const profiles: Record<ProfileType, ProfileData> = {
  /* TROCAR: todo o conteúdo abaixo é específico do seu produto */
  1: {
    title: "NOME DO PERFIL 1",
    emoji: "🛡️",
    experience: "Frase de contexto curta",
    profileLabel: "Conservador",
    whyAgt: [
      "Parágrafo 1: gancho emocional — conecte a dor ao produto.",
      "Parágrafo 2: mecanismo — explique COMO resolve.",
      "Parágrafo 3: reforço — benefício de começar agora.",
    ],
    stats: [
      "Stat 1: posicione vs média (ex: 'Você tá na frente de 67% das pessoas')",
      "Stat 2: crie senso de elite (ex: 'Só 3% fazem isso')",
      "Stat 3: crie urgência (ex: '89% perdem porque não têm método')",
    ],
    superpower: "Frase curta sobre o ponto forte detectado.",
    reframe: "Reframing: 'Seu [traço que parece fraqueza] na verdade é [força]. [Dado que comprova].'",
    whatsMissing: "O que falta: descreva a solução em 1-2 frases que gerem desejo.",
    traderWithout: [
      "Dor 1 sem método",
      "Dor 2 sem método",
      "Dor 3 sem método",
      "Dor 4 sem método",
    ],
    traderWith: [
      "Benefício 1 com método",
      "Benefício 2 com método",
      "Benefício 3 com método",
      "Benefício 4 com método",
    ],
    patternResults: [
      "Resultado típico 1 (ex: '2x mais velocidade')",
      "Resultado típico 2 (ex: 'Capital preservado')",
      "Resultado típico 3 (ex: '4x mais chance de manter')",
    ],
  },
  2: {
    /* ... mesmo formato para perfil 2 ... */
    title: "NOME DO PERFIL 2",
    emoji: "🎯",
    experience: "Frase de contexto curta",
    profileLabel: "Moderado",
    whyAgt: ["Parágrafo 1", "Parágrafo 2", "Parágrafo 3"],
    stats: ["Stat 1", "Stat 2", "Stat 3"],
    superpower: "Ponto forte.",
    reframe: "Reframing.",
    whatsMissing: "O que falta.",
    traderWithout: ["Dor 1", "Dor 2", "Dor 3", "Dor 4"],
    traderWith: ["Benefício 1", "Benefício 2", "Benefício 3", "Benefício 4"],
    patternResults: ["Resultado 1", "Resultado 2", "Resultado 3"],
  },
  3: {
    /* ... mesmo formato para perfil 3 ... */
    title: "NOME DO PERFIL 3",
    emoji: "⚡",
    experience: "Frase de contexto curta",
    profileLabel: "Arrojado",
    whyAgt: ["Parágrafo 1", "Parágrafo 2", "Parágrafo 3"],
    stats: ["Stat 1", "Stat 2", "Stat 3"],
    superpower: "Ponto forte.",
    reframe: "Reframing.",
    whatsMissing: "O que falta.",
    traderWithout: ["Dor 1", "Dor 2", "Dor 3", "Dor 4"],
    traderWith: ["Benefício 1", "Benefício 2", "Benefício 3", "Benefício 4"],
    patternResults: ["Resultado 1", "Resultado 2", "Resultado 3"],
  },
};
```

---

## 6. Estrutura de Arquivos

```
src/
├── pages/
│   └── Index.tsx              # Orquestrador principal (stages, state, background)
├── components/
│   ├── WelcomeScreen.tsx      # Tela de entrada
│   ├── QuizScreen.tsx         # Perguntas + animações + flash
│   ├── TransitionScreen.tsx   # Tela de milestone
│   ├── LeadCapture.tsx        # Formulário nome/whatsapp/email
│   ├── ProcessingScreen.tsx   # Loading animado
│   ├── ResultScreen.tsx       # Resultado completo (10+ seções)
│   ├── AGTLogo.tsx            # Componente de logo
│   ├── DebugPanel.tsx         # Painel debug (F9)
│   └── ui/                    # Radix UI primitives
├── data/
│   └── quizData.ts            # Perguntas, perfis, scoring, textos
├── utils/
│   └── sounds.ts              # Efeitos sonoros sintetizados
├── index.css                  # Variáveis CSS, glass-card, gradients
└── App.tsx                    # Router wrapper
public/
└── images/
    ├── bg-[NOME].webp         # Background (≤1280x720, ≤100KB WebP)
    ├── logo-full.png          # Logo com subtítulo
    └── logo.png               # Logo compacto
index.html                     # Meta tags, OG, fonts, theme-color
tailwind.config.ts             # Tema, cores, fontes, animações
```

---

## 7. Arquitetura do Fluxo (Index.tsx)

### 7.1 Stages
O componente Index.tsx gerencia 6 estágios via state `stage`:

```
"welcome" → "quiz" → "transition" → "lead" → "processing" → "result"
```

### 7.2 Template do Background Persistente
Uma única camada de background fixa que cobre TODAS as telas:

```tsx
<div className="relative min-h-[100svh] overflow-hidden bg-[#050507]">
  {/* Background: imagem fixa com blur */}
  <div className="fixed inset-0 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('/images/bg-NOME.webp')", filter: "blur(3px)" }} />
  {/* Overlay escuro — ajuste opacidade (0.7 a 0.9) */}
  <div className="fixed inset-0 bg-black/80" />
  {/* Conteúdo acima do background */}
  <div className="relative z-10">
    {/* Componentes de cada stage renderizam aqui */}
  </div>
</div>
```

**Decisão:** Ter o background no Index (pai) em vez de duplicar em cada componente garante consistência visual e transições suaves entre telas.

### 7.3 Persistência
- `localStorage` guarda respostas e dados do lead entre reloads
- Supabase recebe os dados do lead no estágio "processing"

### 7.4 Debug
- Tecla F9 abre painel de debug
- Permite simular perfis específicos e pular direto para qualquer stage

---

## 8. Componentes — Padrões e Decisões

### 8.1 WelcomeScreen
- Layout centralizado, max-w-lg
- Logo + badge de credibilidade + headline + CTA
- CTA com gradiente de marca + glow pulsante (`animate-pulse-glow`)
- Inicializa AudioContext no clique (lazy, obrigatório pra Web Audio)
- Trust badges abaixo do CTA (3 itens)

### 8.2 QuizScreen

**Transições entre perguntas:** Slide horizontal (esquerda/direita), Framer Motion `AnimatePresence` com `mode="wait"`

**Barra de progresso:** Easing não-linear: `Math.pow(linearProgress, 0.6)` — cresce rápido no início, desacelera. Curiosity hooks mudam conforme progresso.

**Flash ao responder:** Full-screen (`fixed inset-0`), sem texto — só efeito visual. Milestone: burst dourado (scale 4). Normal: burst sutil (scale 3).

**Opções:** Selecionada: `border-accent bg-accent/15` + scale 1.02. Stagger de 60ms entre opções no fade-in.

**Multi-select:** Toggle sem avançar, botão "Confirmar" sticky aparece quando tem seleção.

### 8.3 LeadCapture
- 3 campos: Nome, WhatsApp (só dígitos, 10-11), Email
- Validação Zod em português
- Progress visual: "3 de 3 etapas completas" (Efeito Zeigarnik)

### 8.4 ProcessingScreen
- Mensagens dinâmicas baseadas nas respostas
- Spinner + barra de progresso (0→100% em 5.2s)
- Auto-avança para resultado

### 8.5 ResultScreen — Seções do Resultado (ordem)
1. **Hero Card:** perfil + 3 gauges circulares animados (countUp)
2. **Por que [Produto]:** 3 parágrafos persuasivos
3. **Análise de Ativos:** cards por item selecionado no multi-select (low/medium/high)
4. **Raio-X:** escala visual (patrimônio, renda, ou métricas do nicho)
5. **Você vs Média:** 3 stats comparativos com ícones
6. **Ponto Forte:** superpoder detectado
7. **Reframe:** reframing psicológico
8. **O que Falta:** próximo passo (gera desejo)
9. **Dois Caminhos:** sem método vs com método (contraste visual)
10. **Resultados Padrão:** 3 outcomes do método

**Sticky CTA:** Aparece após 25% scroll, spring animation, safe-area padding.
**Confirmação:** Clique → overlay com checkmark → 2s delay → abre WhatsApp/calendário.

---

## 9. Animações Dopaminérgicas — Receitas

### 9.1 CountUp (números de 0 ao valor)
```typescript
function useCountUp(target: number, duration = 1200, delay = 300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now() + delay;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}
```

### 9.2 Stagger Container (seções aparecem em cascata)
```tsx
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.18 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

<motion.div variants={stagger} initial="hidden" animate="visible">
  <motion.div variants={fadeUp}>Seção 1</motion.div>
  <motion.div variants={fadeUp}>Seção 2</motion.div>
  {/* ... */}
</motion.div>
```

### 9.3 CircleGauge (gauge circular SVG)
```tsx
function CircleGauge({ value, max, label, color }) {
  const pct = Math.round((value / max) * 100);
  const animated = useCountUp(pct, 1200, 400);
  const radius = 40;
  const circ = 2 * Math.PI * radius;

  return (
    <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ - (circ * animated) / 100}
          style={{ filter: `drop-shadow(0 0 3px ${color}88)` }} />
      </svg>
      <span className="tabular-nums">{animated}%</span>
    </motion.div>
  );
}
```

### 9.4 Barra de Progresso Animada
```tsx
function ScoreMeter({ label, value, maxLabel, color }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t); }, []);

  return (
    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
      <div style={{
        width: show ? `${value}%` : "0%",
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: `0 0 10px ${color}55`,
        transition: "width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }} />
    </div>
  );
}
```

### 9.5 Cascata de Itens (PatrimonioScale)
```tsx
{items.map((item, i) => (
  <motion.div key={i}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 * i }}>
    {/* conteúdo do item */}
  </motion.div>
))}
```

### 9.6 Flash Full-Screen ao Responder
```tsx
<AnimatePresence>
  {showFlash && (
    <motion.div className="fixed inset-0 pointer-events-none z-40"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <motion.div className="fixed inset-0 bg-accent/[0.07]"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 80, height: 80,
          background: "radial-gradient(circle, rgba(224,32,32,0.2) 0%, transparent 70%)" }}
        initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: 3, opacity: 0 }} />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 10. Sistema de Áudio (sounds.ts)

**Abordagem:** Zero arquivos. Tudo sintetizado via Web Audio API.

```typescript
// Helper base — copia pra qualquer projeto
function playTone(freq: number, dur: number, gain: number, type: OscillatorType, delay = 0) {
  const ctx = getCtx(); if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type; osc.frequency.value = freq;
  g.gain.setValueAtTime(0.001, ctx.currentTime + delay / 1000);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay / 1000 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + delay / 1000);
  osc.stop(ctx.currentTime + delay / 1000 + dur);
}
```

**Efeitos padrão:**

| Nome | Uso | Frequências | Volume |
|------|-----|-------------|--------|
| `playPop()` | Resposta normal | 880Hz + 1320Hz | 0.08 |
| `playMilestone()` | Pergunta milestone | 660→990→1980Hz | 0.10 |
| `playToggle()` | Multi-select | 1100Hz | 0.06 |
| `playReveal()` | Resultado | C5-E5-G5 chord | 0.08 |

---

## 11. Design System

### 11.1 Cores (HSL) — Template
| Token | Default | Descrição |
|-------|---------|-----------|
| Background | 220 35% 6% | Fundo base (muito escuro) |
| Foreground | 215 20% 96% | Texto principal (quase branco) |
| Accent | 28 90% 55% | CTAs, destaques (laranja/ouro) |
| Primary | 217 72% 50% | Cor secundária (azul) |
| Destructive | 0 72% 51% | Alertas, marca (vermelho) |

### 11.2 Glass Card
```css
.glass-card {
  background: hsl(220 28% 8% / 0.75);  /* TROCAR: matiz da paleta */
  backdrop-filter: blur(16px);
  border: 1px solid hsl(220 18% 20% / 0.4);
}
```

### 11.3 Gradientes
- **gradient-gold:** CTAs principais — `accent → destructive`
- **gradient-bg:** fallback de fundo — `background claro → background escuro`

---

## 12. Performance — Regras Obrigatórias

1. **Background WebP** — sempre converter pra WebP, ≤100KB. Se leva blur, reduzir resolução pra ≤1280px.
2. **Fontes no HTML** — nunca `@import` no CSS. Usar `<link>` com `preconnect` no `<head>`. Máximo 2 famílias, 5 pesos.
3. **`min-h-[100svh]`** — em TODAS as telas, com fallback `sm:min-h-screen`.
4. **Touch targets ≥44px** — todo botão clicável.
5. **`viewport-fit=cover`** — no meta viewport, pra iPhone notch.
6. **`theme-color`** — meta tag no head, com a cor mais escura da paleta.
7. **backdrop-filter com moderação** — glass-card e poucos elementos. Não em CADA opção de resposta.
8. **CSS transition > Framer Motion animate** para barras de progresso — mais confiável quando componente já tá montado.

---

## 13. Copy — Princípios e Diretrizes

### 13.1 Tom
- Segunda pessoa informal ("você", "seu", "quer")
- Direto, sem enrolação. Autoritativo mas acessível.

### 13.2 Regras de Brevidade
- Títulos de pergunta: máximo ~8 palavras
- Opções: 1 frase, sem explicação extra
- Resultado: parágrafos de 2-3 linhas
- CTAs: máximo 4 palavras

### 13.3 Palavras-chave que convertem
- "gratuitamente" (não "sem compromisso")
- "personalizado" / "seu caso"
- "na hora" / "agora"
- "especialista"
- Evitar: "imediato" (gera expectativa), "grátis" (desvaloriza)

### 13.4 Estrutura Persuasiva do Resultado
1. **Validação:** "Você é [perfil] — e isso é poderoso porque..."
2. **Estatísticas:** Comparação com média (gera senso de posição)
3. **Gap:** "O que falta é [X]" (gera desejo)
4. **Contraste:** Sem método vs Com método (visualiza a transformação)
5. **CTA:** Único, claro, com reforço de gratuidade

---

## 14. Lições Aprendidas

### O que funcionou
1. **Background persistente no pai** — transições entre telas ficam seamless
2. **Flash full-screen sem texto** — mais elegante que badges de "Boa!"
3. **Overlay bg-black/80** — garante legibilidade sem perder atmosfera
4. **CountUp nos números** — gera dopamina, sensação de "algo acontecendo"
5. **Stagger em cascata** — cada elemento aparecendo dá sensação de revelação
6. **Áudio sintetizado** — zero latência, zero dependência externa
7. **Glass-card com 0.75 de opacidade** — equilíbrio entre transparência e legibilidade
8. **Logos via `<img>` tag** — simples e funcional (SVG inline fracassou)

### O que evitar
1. **SVG inline para logos complexos** — difícil de manter, cores quebram
2. **`@import` de fontes no CSS** — bloqueia render
3. **PNG enorme para background com blur** — WebP com resolução menor é imperceptível
4. **Muitos pesos de fonte** — 3-5 bastam
5. **Texto motivacional no flash** — cansa rápido, basta o efeito visual
6. **`animate` do Framer Motion para barras** — pode não disparar se componente já montado; CSS transition com setTimeout é mais confiável
7. **Glow/drop-shadow exagerado** — 3px com opacidade 50% basta; mais que isso "estoura"

---

## 15. Customizações Comuns

### Se quiser 2 perfis em vez de 3
- Em `quizData.ts`: mudar `ProfileType = 1 | 2`
- Na tabela `answerToProfile`: só mapear pra 1 ou 2
- Em `classifyProfile`: ajustar o count e tiebreaker
- Em `ResultScreen.tsx`: remover referências ao perfil 3

### Se quiser 4-5 perfis
- Expandir `ProfileType = 1 | 2 | 3 | 4 | 5`
- Adicionar entradas em `answerToProfile`, `profiles`, `profileColors`, `profileIcons`
- Cada resposta pode votar em qualquer perfil

### Se quiser CTA de calendário em vez de WhatsApp
- Em `ResultScreen.tsx`: trocar `wa.me/...` por URL do Calendly/Cal.com
- Ajustar texto de confirmação

### Se quiser mais perguntas de scoring
- Adicionar IDs em `scoredQuestionIds`
- Adicionar entrada em `answerToProfile`

### Se quiser remover o Raio-X Financeiro
- Remover `PatrimonioScale` e `ScoreMeter` do ResultScreen
- Remover `getPatrimonioLabel` e `getRendaLabel` do quizData
- Usar o espaço pra outra seção relevante ao nicho

### Se quiser trocar o idioma
- Todo texto está em `quizData.ts`, `WelcomeScreen.tsx`, `LeadCapture.tsx`, `ProcessingScreen.tsx`, `ResultScreen.tsx`
- Não há i18n — é buscar e substituir

---

## 16. Checklist Final

### Preparação
- [ ] 3 perfis definidos (nome, emoji, posicionamento)
- [ ] 8-12 perguntas escritas (títulos ≤8 palavras)
- [ ] Tabela de scoring montada
- [ ] Textos de resultado por perfil completos
- [ ] CTA final definido (WhatsApp, calendário)

### Implementação
- [ ] Projeto clonado e dependências instaladas
- [ ] `quizData.ts` substituído com novo conteúdo
- [ ] Cores ajustadas em `tailwind.config.ts` e `index.css`
- [ ] Background e logos trocados em `public/images/`
- [ ] Supabase configurado
- [ ] Meta tags ajustadas no `index.html`
- [ ] WhatsApp/CTA URL atualizada no `ResultScreen.tsx`

### Otimização
- [ ] Background: WebP, ≤100KB
- [ ] Fontes: ≤2 famílias, ≤5 pesos, no HTML
- [ ] `npx tsc --noEmit` → zero erros
- [ ] Testado em iPhone SE
- [ ] Testado com 3G throttle
- [ ] Touch targets ≥44px

### Copy
- [ ] Perguntas ≤8 palavras
- [ ] Opções sem redundância
- [ ] Resultado: validação → stat → gap → contraste → CTA
- [ ] Leitura em voz alta sem travar

---

## 17. Referência Rápida de Comandos

```bash
npm install               # Instalar dependências
npm run dev               # Dev server
npx tsc --noEmit          # Type-check
npx vite build            # Build de produção

gh auth login -h github.com -p https -w   # Auth GitHub
git add -A && git commit -m "msg"         # Commit
git push origin main                       # Push
```

---

*Documento criado em março/2026 a partir do Quiz AGT — A Grande Tacada.*
*Para transformar em skill do Claude, usar como SKILL.md com triggers: "quiz", "diagnóstico", "funil", "lead capture", "perfil".*
