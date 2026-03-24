import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProfileType,
  profiles,
  getPatrimonioLabel,
  getRendaLabel,
  getAssetAnalysis,
  classifyPotential,
  FinancialPotential,
} from "@/data/quizData";
import { generateBonusCode, bonusMetadata } from "@/data/bonusSystem";
import { supabase } from "@/integrations/supabase/client";
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
  ChevronDown,
  Gift,
  Clock,
  Flame,
} from "lucide-react";

interface Props {
  profile: ProfileType;
  answers: Record<number, string>;
  leadName: string;
  onRestart?: () => void;
  leadDbId?: string | null;
  leadShortId?: string | null;
  bonuses?: string[];
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
function useCountUp(target: number, duration = 1200, delay = 300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now() + delay;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}

function CircleGauge({ value, max, label, color, id }: { value: number; max: number; label: string; color: string; id: string }) {
  const pct = Math.round((value / max) * 100);
  const animated = useCountUp(pct, 1200, 400);
  const radius = 40;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative w-24 h-24"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id={`gauge-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" strokeOpacity="0.5" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none" stroke={`url(#gauge-${id})`}
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * animated) / 100}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold tabular-nums">{animated}<span className="text-xs text-muted-foreground">%</span></span>
        </div>
      </motion.div>
      <span className="text-[11px] text-muted-foreground text-center leading-tight font-medium tracking-wide uppercase">{label}</span>
    </div>
  );
}

/* ── Collapsible section ────────────────────────────────── */
function CollapsibleSection({ title, icon, children, preview }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  preview?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 sm:p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-base font-bold">{title}</h3>
          {!open && preview && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{preview}</p>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Loss frame copy per potential ──────────────────────── */
function getLossFrameCopy(potential: FinancialPotential, profile: ProfileType): { headline: string; body: string } {
  const lossFrames: Record<FinancialPotential, { headline: string; body: string }> = {
    elite: {
      headline: "Seu patrimônio está rendendo abaixo do potencial",
      body: "78% dos investidores com patrimônio acima de R$ 100k rendem abaixo da inflação real. Sem assimetria, cada mês parado é patrimônio perdendo valor.",
    },
    alto: {
      headline: "Sua renda permite mais do que você está aproveitando",
      body: "Investidores com sua renda que aplicam sem método perdem em média 2 a 3 anos antes de encontrar consistência. Com o método certo, esse caminho encurta para meses.",
    },
    medio: {
      headline: "85% dos investidores com seu perfil ficam travados",
      body: "A maioria fica anos circulando entre poupança e renda fixa, sem nunca multiplicar de verdade. O que separa quem sai desse ciclo é ter um sistema claro de decisão.",
    },
    baixo: {
      headline: "Quem começa sem método perde tempo — e dinheiro",
      body: "89% dos iniciantes perdem nos primeiros 6 meses por operar sem sistema. Começar certo economiza capital e acelera resultados em até 3x.",
    },
  };
  return lossFrames[potential];
}

/* ── Ranking social per potential ──────────────────────── */
function getRankingPct(potential: FinancialPotential): number {
  const map: Record<FinancialPotential, number> = { elite: 5, alto: 15, medio: 40, baixo: 70 };
  return map[potential];
}

/* ── Asset card ──────────────────────────────────────────── */
function AssetCard({ asset, verdict, explanation }: { asset: string; verdict: "low" | "medium" | "high"; explanation: string }) {
  const verdictConfig = {
    low: { label: "Sem assimetria", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: "❌" },
    medium: { label: "Assimetria parcial", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "⚠️" },
    high: { label: "Assimetria real", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: "✅" },
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

/* ── Score meter (horizontal) ───────────────────────────── */
function ScoreMeter({ label, value, maxLabel, color }: { label: string; value: number; maxLabel: string; color: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t); }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ color }}>{maxLabel}</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: show ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 10px ${color}55`,
            transition: "width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
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
          <motion.div
            key={i} className="flex flex-col items-center gap-1 flex-1"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 * i }}
          >
            <motion.div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                l.active ? "bg-accent text-accent-foreground" : "bg-white/10 text-muted-foreground"
              }`}
              animate={l.active ? { scale: [1, 1.25, 1.1], boxShadow: ["0 0 0px hsla(28,90%,55%,0)", "0 0 14px hsla(28,90%,55%,0.4)", "0 0 8px hsla(28,90%,55%,0.25)"] } : {}}
              transition={l.active ? { delay: 0.15 * i + 0.2, duration: 0.5 } : {}}
            >{i + 1}</motion.div>
            <span className={`text-[10px] sm:text-xs text-center leading-tight ${l.active ? "text-accent font-semibold" : "text-muted-foreground"}`}>{l.label}</span>
          </motion.div>
        ))}
      </div>
      <div className="h-1.5 bg-white/5 rounded-full mx-4 overflow-hidden">
        <motion.div className="h-full bg-accent rounded-full" style={{ boxShadow: "0 0 8px hsla(28,90%,55%,0.4)" }}
          initial={{ width: "0%" }} animate={{ width: posMap[answer] || "10%" }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
/* ══  MAIN COMPONENT  ═══════════════════════════════════ */
/* ════════════════════════════════════════════════════════ */

export default function ResultScreen({ profile, answers, leadName, onRestart, leadDbId, leadShortId, bonuses = [] }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const data = profiles[profile];
  const firstName = leadName.split(" ")[0];
  const colors = profileColors[profile];
  const potential = classifyPotential(answers);

  useEffect(() => {
    const t = setTimeout(() => playReveal(), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setShowStickyCTA(scrollPct > 0.15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // WhatsApp coded message
  const bonusCode = leadShortId
    ? generateBonusCode(profile, potential, bonuses, leadShortId)
    : `AGT-${profile === 1 ? "C" : profile === 2 ? "M" : "A"}-${potential === "baixo" ? "BX" : potential === "medio" ? "MD" : potential === "alto" ? "AL" : "EL"}`;
  const whatsappMessage = encodeURIComponent(
    `Olá! Sou ${firstName}, fiz o Diagnóstico AGT 🎯\nCódigo: ${bonusCode}`
  );
  const WHATSAPP_URL = `https://wa.me/551152865840?text=${whatsappMessage}`;

  const [ctaLoading, setCtaLoading] = useState(false);

  const handleCTA = () => {
    setCtaLoading(true);
    setShowConfirmation(true);
    try { localStorage.setItem("quiz_whatsapp_sent", "true"); } catch (_) {}
    if (leadDbId) {
      supabase.from("leads").update({ whatsapp_clicked: true }).eq("id", leadDbId)
        .then(({ error }) => { if (error) console.error("[Supabase] Erro ao trackear clique:", error.message); });
    }
    setTimeout(() => { window.location.href = WHATSAPP_URL; }, 800);
  };

  if (showConfirmation) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center px-4 sm:min-h-screen">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}>
            <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
          </motion.div>
          <h2 className="font-heading text-3xl font-bold mb-2">Excelente, {firstName}!</h2>
          <p className="text-muted-foreground text-lg mb-2">Abrindo WhatsApp...</p>
          <p className="text-accent font-semibold text-sm mb-6">Um especialista vai montar sua estratégia agora!</p>
          <a href={WHATSAPP_URL} className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors">
            <MessageCircle className="h-4 w-4" /> Toque aqui se não abriu automaticamente
          </a>
        </motion.div>
      </div>
    );
  }

  const riskAwareness = profile === 1 ? 95 : profile === 2 ? 70 : 50;
  const marketReadiness = profile === 1 ? 30 : profile === 2 ? 60 : 85;
  const growthPotential = profile === 1 ? 60 : profile === 2 ? 80 : 95;
  const lossFrame = getLossFrameCopy(potential, profile);
  const rankingPct = getRankingPct(potential);
  const assetAnalysis = answers[11] ? getAssetAnalysis(answers[11]) : [];

  const statIcons = [<TrendingUp className="h-5 w-5" />, <Trophy className="h-5 w-5" />, <Star className="h-5 w-5" />];

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div className="min-h-[100svh] px-4 py-8 pb-28 sm:py-12 sm:pb-32">
      <motion.div className="max-w-3xl mx-auto space-y-6" variants={staggerContainer} initial="hidden" animate="visible">

        {/* AGT Branding */}
        <motion.div variants={fadeUp} className="text-center">
          <AGTLogo className="mx-auto opacity-60" size="md" />
        </motion.div>

        {/* ── 1. HERO — Profile Card + Gauges ──────────────── */}
        <motion.div variants={fadeUp} className="glass-card-hero rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b ${colors.ring} opacity-10 blur-3xl`} />
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-[0.3em] relative">Seu Diagnóstico</p>

          <div className="relative inline-flex items-center justify-center mb-5">
            <div className={`absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br ${colors.ring} opacity-20 animate-pulse`} />
            <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${colors.ring} p-[3px] shadow-xl ${colors.glow}`}>
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-accent">{profileIcons[profile]}</div>
            </div>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-2 relative">{firstName}, você é</h1>
          <h2 className={`font-heading text-2xl sm:text-3xl font-bold ${colors.accent} mb-3 relative`}>{data.emoji} {data.title}</h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Perfil: {data.profileLabel} · {data.experience}
          </div>

          {/* Ranking social */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 text-xs font-semibold text-accent">
            <Trophy className="h-3.5 w-3.5" />
            Top {rankingPct}% dos perfis diagnosticados
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 relative">
            <CircleGauge value={riskAwareness} max={100} label="Risco" color="hsl(var(--primary))" id="risk" />
            <CircleGauge value={marketReadiness} max={100} label="Prontidão" color="hsl(var(--accent))" id="ready" />
            <CircleGauge value={growthPotential} max={100} label="Crescimento" color="hsl(var(--destructive))" id="growth" />
          </div>
        </motion.div>

        {/* ── 2. LOSS FRAME ────────────────────────────────── */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="font-heading text-lg font-bold text-destructive leading-tight pt-1.5">{lossFrame.headline}</h3>
          </div>
          <p className="text-sm text-foreground/75 leading-relaxed ml-[52px]">{lossFrame.body}</p>
        </motion.div>

        {/* ── 3. BONUS CARDS ───────────────────────────────── */}
        {bonuses.length > 0 && (
          <motion.div variants={fadeUp} className="glass-card-elevated rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-accent" />
              <h3 className="font-heading text-lg font-bold">
                {bonuses.length} Bônus{bonuses.length > 1 ? "" : ""} Desbloqueado{bonuses.length > 1 ? "s" : ""}
              </h3>
            </div>
            <div className="space-y-3">
              {bonuses.map((bonusId, i) => {
                const meta = bonusMetadata[bonusId];
                if (!meta) return null;
                return (
                  <motion.div
                    key={bonusId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
                    className="flex items-start gap-3 rounded-xl p-3 border"
                    style={{ borderColor: `${meta.tierColor}33`, backgroundColor: `${meta.tierColor}08` }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                      style={{ backgroundColor: `${meta.tierColor}15`, border: `1px solid ${meta.tierColor}30` }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.tierColor }}>
                          {meta.tier === "bronze" ? "Bronze" : meta.tier === "silver" ? "Prata" : "Ouro"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold leading-tight">{meta.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{meta.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Seus bônus serão entregues pelo WhatsApp junto com seu plano de ação.
            </p>
          </motion.div>
        )}

        {/* ── 4. TWO PATHS ─────────────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card-elevated rounded-2xl p-6 sm:p-8">
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

        {/* ── 5. CTA PRIMARY (visible without scroll on mobile) ── */}
        <motion.div variants={fadeUp} className="text-center py-2">
          <div className="glass-card-hero rounded-2xl p-6 sm:p-8">
            <p className="text-sm text-muted-foreground mb-3">Pronto pra dar o próximo passo?</p>
            <Button
              onClick={handleCTA}
              className="gradient-gold text-primary-foreground h-16 w-full sm:w-auto sm:px-12 rounded-2xl text-base sm:text-lg font-bold hover:opacity-90 transition-all hover:scale-[1.03] animate-pulse-glow gap-2"
            >
              <MessageCircle className="h-6 w-6" />
              Quero meu plano de ação gratuito
            </Button>
            <p className="text-muted-foreground text-xs mt-3">Atendimento gratuito via WhatsApp</p>
          </div>
        </motion.div>

        {/* ── 6. DEEP DIVE (collapsible secondary sections) ── */}
        <motion.div variants={fadeUp} className="space-y-3">
          {/* Why AGT */}
          <CollapsibleSection
            title="Como Multiplicar Seu Capital"
            icon={<Rocket className="h-5 w-5" />}
            preview={data.whyAgt[0]?.slice(0, 80) + "..."}
          >
            <div className="space-y-4">
              {data.whyAgt.map((paragraph, i) => {
                const isHighlight = paragraph.includes("regra dos 10 tiros") || paragraph.includes("assimetria") || paragraph.startsWith("O AGT ");
                return (
                  <p key={i} className={`text-sm sm:text-base leading-relaxed ${isHighlight ? "font-bold text-foreground" : "text-foreground/85"}`}>
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* Raio-X Financeiro */}
          <CollapsibleSection
            title="Seu Raio-X Financeiro"
            icon={<BarChart3 className="h-5 w-5" />}
            preview={`Patrimônio: ${getPatrimonioLabel(answers[4])} · Renda: ${getRendaLabel(answers[5])}`}
          >
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-medium">Patrimônio Investido</p>
              <PatrimonioScale answer={answers[4]} />
              <p className="text-center text-sm font-semibold text-accent mt-3">{getPatrimonioLabel(answers[4])}</p>
            </div>
            <ScoreMeter
              label="Renda Mensal"
              value={answers[5] === "A" ? 20 : answers[5] === "B" ? 45 : answers[5] === "C" ? 70 : 95}
              maxLabel={getRendaLabel(answers[5])}
              color="hsl(var(--accent))"
            />
          </CollapsibleSection>

          {/* Asset Asymmetry */}
          {assetAnalysis.length > 0 && (
            <CollapsibleSection
              title="Análise de Assimetria"
              icon={<BarChart3 className="h-5 w-5" />}
              preview={`${assetAnalysis.length} ativo${assetAnalysis.length > 1 ? "s" : ""} analisado${assetAnalysis.length > 1 ? "s" : ""}`}
            >
              <p className="text-sm text-muted-foreground mb-4">Assimetria = risco pequeno, ganho grande. Veja seus ativos:</p>
              <div className="space-y-3">
                {assetAnalysis.map((a, i) => (
                  <AssetCard key={i} asset={a.asset} verdict={a.verdict} explanation={a.explanation} />
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-accent/10 border border-accent/20 p-4">
                <p className="text-sm font-bold text-accent">No AGT usamos opções: risco definido antes de entrar, ganho muito maior.</p>
              </div>
            </CollapsibleSection>
          )}

          {/* Comparação vs Média */}
          <CollapsibleSection
            title="Você vs Média do Brasil"
            icon={<TrendingUp className="h-5 w-5" />}
            preview={data.stats[0]?.slice(0, 60) + "..."}
          >
            <div className="space-y-3">
              {data.stats.map((stat, i) => {
                const pctMatch = stat.match(/(\d+(?:,\d+)?)\s*%/);
                const pct = pctMatch ? pctMatch[1] : null;
                return (
                  <div key={i} className="rounded-xl bg-black/30 border border-white/10 p-4 flex gap-4 items-start">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                      {statIcons[i]}
                    </div>
                    <div className="flex-1">
                      {pct && <span className="text-2xl font-bold text-accent">{pct}%</span>}
                      <p className="text-sm text-foreground/85 leading-relaxed">{stat}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* Ponto Forte + Reframe */}
          <CollapsibleSection
            title="Seu Ponto Forte"
            icon={<Lightbulb className="h-5 w-5" />}
            preview={data.superpower.slice(0, 70) + "..."}
          >
            <div className="rounded-xl bg-accent/5 border border-accent/10 p-5 mb-4">
              <p className="text-foreground/90 text-sm sm:text-base leading-relaxed italic">"{data.superpower}"</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Novo Olhar</p>
              <p className="text-foreground/85 text-sm leading-relaxed">{data.reframe}</p>
            </div>
          </CollapsibleSection>

          {/* O Que Falta */}
          <CollapsibleSection
            title="O Que Falta Agora"
            icon={<Map className="h-5 w-5" />}
            preview={data.whatsMissing.slice(0, 70) + "..."}
          >
            <p className="text-foreground/85 text-sm sm:text-base leading-relaxed">{data.whatsMissing}</p>
          </CollapsibleSection>
        </motion.div>

        {/* ── 7. PATTERN RESULTS ───────────────────────────── */}
        <motion.div variants={fadeUp} className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="h-5 w-5 text-accent" />
            <h2 className="font-heading text-xl font-bold">Resultados do Perfil {data.profileLabel}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Quem segue o método vs quem tenta sozinho:</p>
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

        {/* ── 8. CTA SECONDARY (urgente) ───────────────────── */}
        <motion.div variants={fadeUp} className="text-center py-2">
          <p className="text-sm text-muted-foreground mb-3">Quer aplicar esse método ao seu perfil?</p>
          <Button
            onClick={handleCTA}
            className="gradient-gold text-primary-foreground h-14 px-8 sm:px-10 rounded-xl text-base font-bold hover:opacity-90 transition-all hover:scale-[1.02] gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Garantir minha estratégia personalizada
          </Button>
        </motion.div>

        {/* ── 9. CTA FINAL (FOMO) ─────────────────────────── */}
        <motion.div variants={fadeUp} className="text-center pt-4 pb-8">
          <div className="rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/10 to-accent/5 p-6 sm:p-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Flame className="h-5 w-5 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Vagas limitadas</span>
              <Flame className="h-5 w-5 text-accent" />
            </div>
            <p className="text-foreground/85 text-sm sm:text-base leading-relaxed mb-4 max-w-md mx-auto">
              {firstName}, só abrimos <span className="text-accent font-semibold">poucas vagas por semana</span> para atendimento personalizado. Garanta a sua agora.
            </p>
            <Button
              onClick={handleCTA}
              className="gradient-gold text-primary-foreground h-16 w-full sm:w-auto sm:px-12 rounded-2xl text-base sm:text-lg font-bold hover:opacity-90 transition-all hover:scale-105 animate-pulse-glow gap-2"
            >
              <MessageCircle className="h-6 w-6" />
              Falar com especialista agora
            </Button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Atendimento em menos de 5 minutos
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* ── Sticky Floating CTA ────────────────────────────── */}
      <AnimatePresence>
        {showStickyCTA && !showConfirmation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
            style={{
              paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))",
              background: "linear-gradient(to top, hsl(220 35% 4% / 0.95) 0%, hsl(220 35% 4% / 0.8) 60%, transparent 100%)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="max-w-3xl mx-auto">
              <Button
                onClick={handleCTA}
                className="gradient-gold text-primary-foreground h-14 w-full rounded-2xl text-base font-bold hover:opacity-90 transition-all gap-2 shadow-xl shadow-accent/30 animate-pulse-glow"
              >
                <MessageCircle className="h-5 w-5" />
                Quero minha estratégia personalizada
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
