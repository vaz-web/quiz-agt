import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProfileType,
  profiles,
  getPatrimonioLabel,
  getRendaLabel,
  getAssetAnalysis,
} from "@/data/quizData";
import { Button } from "@/components/ui/button";
import { AGTLogo } from "@/components/AGTLogo";
import { playReveal } from "@/utils/sounds";
import {
  Shield,
  Target,
  Zap,
  TrendingUp,
  MessageCircle,
  BarChart3,
  Lightbulb,
  CheckCircle2,
  Users,
  AlertTriangle,
  Rocket,
  Star,
  Trophy,
  Map,
  XCircle,
  Check,
} from "lucide-react";

interface Props {
  profile: ProfileType;
  answers: Record<number, string>;
  leadName: string;
  onRestart?: () => void;
}

const profileIcons: Record<ProfileType, React.ReactNode> = {
  1: <Shield className="h-10 w-10" />,
  2: <Target className="h-10 w-10" />,
  3: <Zap className="h-10 w-10" />,
};

const profileColors: Record<ProfileType, { ring: string; glow: string; accent: string }> = {
  1: { ring: "from-blue-400 to-sky-400", glow: "shadow-blue-500/30", accent: "text-blue-400" },
  2: { ring: "from-orange-400 to-amber-400", glow: "shadow-orange-500/30", accent: "text-orange-400" },
  3: { ring: "from-red-400 to-orange-500", glow: "shadow-red-500/30", accent: "text-red-400" },
};

/* ── Animated circular gauge ────────────────────────────── */
function CircleGauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const [animated, setAnimated] = useState(0);
  const pct = Math.round((value / max) * 100);
  const radius = 40;
  const circ = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * animated) / 100}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{animated}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

/* ── Score meter (horizontal) ───────────────────────────── */
function ScoreMeter({ label, value, maxLabel, color }: { label: string; value: number; maxLabel: string; color: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ color }}>{maxLabel}</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: show ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

/* ── Patrimônio position indicator ──────────────────────── */
function PatrimonioScale({ answer }: { answer: string }) {
  const levels = [
    { label: "< R$ 10k", active: answer === "A" },
    { label: "R$ 10k-100k", active: answer === "B" },
    { label: "R$ 100k-500k", active: answer === "C" },
    { label: "R$ 500k-1M", active: answer === "D" },
    { label: "> R$ 1M", active: answer === "E" },
  ];

  const posMap: Record<string, string> = { A: "10%", B: "30%", C: "50%", D: "70%", E: "90%" };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        {levels.map((l, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                l.active
                  ? "bg-accent text-accent-foreground scale-125 shadow-lg shadow-accent/40"
                  : "bg-white/10 text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-[10px] sm:text-xs text-center leading-tight ${l.active ? "text-accent font-semibold" : "text-muted-foreground"}`}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1 bg-secondary/30 rounded-full mx-4">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700"
          style={{ width: posMap[answer] || "10%" }}
        />
      </div>
    </div>
  );
}

/* ── Asset asymmetry card ────────────────────────────────── */
function AssetCard({ asset, verdict, explanation }: { asset: string; verdict: "low" | "medium" | "high"; explanation: string }) {
  const verdictConfig = {
    low: { label: "Sem assimetria", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: "❌" },
    medium: { label: "Assimetria parcial", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "⚠️" },
    high: { label: "Assimetria real ✓", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: "✅" },
  };
  const config = verdictConfig[verdict];

  return (
    <div className={`rounded-xl ${config.bg} border ${config.border} p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{asset}</span>
        <span className={`text-xs font-bold ${config.color}`}>{config.icon} {config.label}</span>
      </div>
      <p className="text-xs text-foreground/70 leading-relaxed">{explanation}</p>
    </div>
  );
}

/* ── Stat card with icon ────────────────────────────────── */
function StatVisualCard({ stat, icon, delay }: { stat: string; icon: React.ReactNode; delay: number }) {
  const pctMatch = stat.match(/(\d+(?:,\d+)?)\s*%/);
  const pct = pctMatch ? pctMatch[1] : null;

  return (
    <div
      className="rounded-xl bg-black/30 border border-white/10 backdrop-blur-sm p-4 opacity-0 animate-fade-up flex gap-4 items-start"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div className="flex-1">
        {pct && (
          <span className="text-2xl font-bold text-accent">{pct}%</span>
        )}
        <p className="text-sm text-foreground/85 leading-relaxed">{stat}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
/* ══  MAIN COMPONENT  ═══════════════════════════════════ */
/* ════════════════════════════════════════════════════════ */

export default function ResultScreen({ profile, answers, leadName, onRestart }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const data = profiles[profile];
  const firstName = leadName.split(" ")[0];
  const colors = profileColors[profile];

  // Som de revelação — toca com delay pra coincidir com animação de entrada
  useEffect(() => {
    const t = setTimeout(() => playReveal(), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setShowStickyCTA(scrollPct > 0.25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const WHATSAPP_URL = "https://wa.me/551152865840";

  const handleCTA = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      window.open(WHATSAPP_URL, "_blank");
    }, 2000);
  };

  if (showConfirmation) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center px-4 sm:min-h-screen">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
          </motion.div>
          <h2 className="font-heading text-3xl font-bold mb-2">Excelente, {firstName}!</h2>
          <p className="text-muted-foreground text-lg mb-2">Redirecionando para o WhatsApp...</p>
          <p className="text-accent font-semibold text-sm">Atendimento gratuito — um especialista vai te responder agora!</p>
        </motion.div>
      </div>
    );
  }

  const riskAwareness = profile === 1 ? 95 : profile === 2 ? 70 : 50;
  const marketReadiness = profile === 1 ? 30 : profile === 2 ? 60 : 85;
  const growthPotential = profile === 1 ? 60 : profile === 2 ? 80 : 95;

  const statIcons = [
    <TrendingUp className="h-5 w-5" />,
    <Trophy className="h-5 w-5" />,
    <Star className="h-5 w-5" />,
  ];

  // Asset analysis from Q11
  const assetAnalysis = answers[11] ? getAssetAnalysis(answers[11]) : [];

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="min-h-[100svh] px-4 py-8 pb-24 sm:py-12 sm:pb-28">
      <motion.div
        className="max-w-3xl mx-auto space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >

        {/* AGT Branding */}
        <motion.div variants={fadeUp} className="text-center">
          <AGTLogo className="mx-auto opacity-60" size="md" />
        </motion.div>

        {/* ── 1. Profile Hero Card ──────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b ${colors.ring} opacity-10 blur-3xl`} />

          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-[0.3em] relative">Seu Diagnóstico</p>

          <div className="relative inline-flex items-center justify-center mb-5">
            <div className={`absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br ${colors.ring} opacity-20 animate-pulse`} />
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${colors.ring} p-[3px] shadow-xl ${colors.glow}`}>
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-accent">
                {profileIcons[profile]}
              </div>
            </div>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-2 relative">
            {firstName}, você é
          </h1>
          <h2 className={`font-heading text-2xl sm:text-3xl font-bold ${colors.accent} mb-3 relative`}>
            {data.emoji} {data.title}
          </h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Perfil: {data.profileLabel} · {data.experience}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 relative">
            <CircleGauge value={riskAwareness} max={100} label="Risco" color="hsl(var(--primary))" />
            <CircleGauge value={marketReadiness} max={100} label="Prontidão" color="hsl(var(--accent))" />
            <CircleGauge value={growthPotential} max={100} label="Crescimento" color="hsl(var(--destructive))" />
          </div>
        </motion.div>

        {/* ── 1b. Por Que o AGT Foi Feito Para Você ─────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${colors.ring} opacity-5 blur-2xl`} />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-destructive/20 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Seu Caminho</p>
              <h2 className="font-heading text-xl font-bold">Como Multiplicar Seu Capital</h2>
            </div>
          </div>
          <div className="space-y-4">
            {data.whyAgt.map((paragraph, i) => {
              const isHighlight = paragraph.startsWith("O AGT ") || paragraph.startsWith("Mas esse") || paragraph.includes("regra dos 10 tiros") || paragraph.includes("assimetria");
              const isClosing = paragraph.includes("\n");
              if (isClosing) {
                const parts = paragraph.split("\n");
                return parts.map((part, j) => (
                  <p key={`${i}-${j}`} className="text-sm sm:text-base font-bold text-accent leading-relaxed">
                    {part}
                  </p>
                ));
              }
              return (
                <p
                  key={i}
                  className={`text-sm sm:text-base leading-relaxed ${
                    isHighlight
                      ? "font-bold text-foreground"
                      : "text-foreground/85"
                  }`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </motion.div>

        {/* ── Asset Asymmetry Analysis ──────────────────────── */}
        {assetAnalysis.length > 0 && (
          <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Análise de Assimetria</p>
                <h2 className="font-heading text-xl font-bold">Seus Investimentos Atuais</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Assimetria = risco pequeno, ganho grande. Veja seus ativos:
            </p>
            <div className="space-y-3">
              {assetAnalysis.map((a, i) => (
                <AssetCard key={i} asset={a.asset} verdict={a.verdict} explanation={a.explanation} />
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-accent/10 border border-accent/20 p-4">
              <p className="text-sm font-bold text-accent">
                📌 No AGT usamos opções: risco definido antes de entrar, ganho muito maior.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── 2. Raio-X Financeiro ──────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-bold">Seu Raio-X Financeiro</h2>
          </div>

          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">Patrimônio Investido</p>
            <PatrimonioScale answer={answers[4]} />
            <p className="text-center text-sm font-semibold text-accent mt-3">{getPatrimonioLabel(answers[4])}</p>
          </div>

          <div className="mb-4">
            <ScoreMeter
              label="Renda Mensal"
              value={answers[5] === "A" ? 20 : answers[5] === "B" ? 45 : answers[5] === "C" ? 70 : 95}
              maxLabel={getRendaLabel(answers[5])}
              color="hsl(var(--accent))"
            />
          </div>
        </motion.div>

        {/* ── 3. Comparação vs Média ──────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-bold">Você vs Média do Brasil</h2>
          </div>
          <div className="space-y-3">
            {data.stats.map((stat, i) => (
              <StatVisualCard key={i} stat={stat} icon={statIcons[i]} delay={i * 150} />
            ))}
          </div>
        </motion.div>

        {/* ── 4. Superpoder ────────────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${colors.ring} opacity-5 blur-2xl`} />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Descoberta</p>
              <h2 className="font-heading text-xl font-bold">Seu Ponto Forte</h2>
            </div>
          </div>
          <div className="rounded-xl bg-accent/5 border border-accent/10 p-5">
            <p className="text-foreground/90 text-sm sm:text-base leading-relaxed italic">
              "{data.superpower}"
            </p>
          </div>
        </motion.div>

        {/* ── 5. Reframe ────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-destructive/20 flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Novo Olhar</p>
              <h2 className="font-heading text-xl font-bold">O Que Você Achava Ser Fraqueza</h2>
            </div>
          </div>
          <p className="text-foreground/85 text-sm sm:text-base leading-relaxed">{data.reframe}</p>
        </motion.div>

        {/* ── 6. O Que Falta ────────────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Map className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Próximo Passo</p>
              <h2 className="font-heading text-xl font-bold">O Que Falta Agora</h2>
            </div>
          </div>
          <p className="text-foreground/85 text-sm sm:text-base leading-relaxed">{data.whatsMissing}</p>
        </motion.div>

        {/* ── CTA Intermediário ─────────────────────────────── */}
        <motion.div variants={fadeUp} className="text-center py-2">
          <p className="text-sm text-muted-foreground mb-3">Quer aplicar isso ao seu caso?</p>
          <Button
            onClick={handleCTA}
            variant="outline"
            className="border-accent/40 text-accent hover:bg-accent/10 h-12 px-8 rounded-xl font-semibold gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Falar com um Consultor AGT
          </Button>
        </motion.div>

        {/* ── 7. Dois Caminhos ──────────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-bold">Dois Caminhos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-bold text-destructive">Sem método</span>
              </div>
              {data.traderWithout.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive/70 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/70 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="h-4 w-4 text-accent" />
                <span className="text-sm font-bold text-accent">Com o AGT</span>
              </div>
              {data.traderWith.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent/70 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/70 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 8. Padrão de Resultados ──────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-bold">Resultados do Perfil {data.profileLabel}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Quem segue o método vs quem tenta sozinho:
          </p>
          <div className="space-y-3">
            {data.patternResults.map((result, i) => (
              <div key={i} className="flex items-start gap-3 opacity-0 animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed pt-1">{result}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 9. CTA Final ────────────────────────────────── */}
        <motion.div variants={fadeUp} className="text-center pt-4 pb-8">
          <div className="glass-card rounded-2xl p-6 sm:p-10">
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">Próximo Passo</p>
            <div className="max-w-lg mx-auto mb-6">
              <p className="text-foreground/85 text-sm sm:text-base leading-relaxed">
                {firstName}, fale <span className="text-accent font-semibold">gratuitamente</span> com um especialista AGT e descubra como aplicar o método ao seu perfil <span className="text-accent font-semibold">{data.profileLabel}</span>.
              </p>
            </div>
            <Button
              onClick={handleCTA}
              className="gradient-gold text-primary-foreground h-16 px-8 sm:px-12 rounded-2xl text-base sm:text-lg font-bold hover:opacity-90 transition-all hover:scale-105 animate-pulse-glow gap-2"
            >
              <MessageCircle className="h-6 w-6" />
              Falar com um Consultor
            </Button>
            <p className="text-muted-foreground text-xs mt-3">
              💬 Atendimento gratuito
            </p>
          </div>
        </motion.div>

      </motion.div>

      {/* ── Sticky Floating CTA ────────────────────────────── */}
      <AnimatePresence>
        {showStickyCTA && !showConfirmation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/90 via-black/80 to-transparent"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}
          >
            <div className="max-w-3xl mx-auto">
              <Button
                onClick={handleCTA}
                className="gradient-gold text-primary-foreground h-14 w-full rounded-2xl text-base font-bold hover:opacity-90 transition-all gap-2 shadow-xl shadow-accent/20"
              >
                <MessageCircle className="h-5 w-5" />
                Falar com um Consultor AGT
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
