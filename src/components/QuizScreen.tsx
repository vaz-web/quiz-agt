import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "@/data/quizData";
import { calculateBonuses } from "@/data/bonusSystem";
import BonusUnlockBanner from "@/components/BonusUnlockBanner";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGTLogo } from "@/components/AGTLogo";
import { playPop, playMilestone, playToggle } from "@/utils/sounds";

interface Props {
  onComplete: (answers: Record<number, string>) => void;
}

/* ── Animated SVG Checkmark ─────────────────────────────── */
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <motion.path
        d="M5 13l4 4L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ── Stagger timing constants ───────────────────────────── */
const STAGGER_BASE_DELAY = 0.4;   // seconds before first option appears
const STAGGER_INTERVAL = 0.12;    // seconds between each option
const STAGGER_BACK_DELAY = 0;     // no delay when going back
const STAGGER_BACK_INTERVAL = 0.04; // fast stagger when going back

/* ════════════════════════════════════════════════════════════ */

export default function QuizScreen({ onComplete }: Props) {
  // Save state: restore quiz progress from localStorage
  const [current, setCurrent] = useState(() => {
    try {
      const saved = localStorage.getItem("quiz_progress_index");
      if (saved) return Math.min(Number(saved), questions.length - 1);
    } catch (_) {}
    return 0;
  });
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem("quiz_progress_answers");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {};
  });
  const [showResume, setShowResume] = useState(() => {
    try {
      const savedIdx = localStorage.getItem("quiz_progress_index");
      return savedIdx !== null && Number(savedIdx) > 0;
    } catch (_) { return false; }
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showMicroWin, setShowMicroWin] = useState(false);

  // Bonus unlock banners — tracks which bonuses have been shown
  const [shownBonuses, setShownBonuses] = useState<Set<string>>(new Set());
  const [activeBonusBanner, setActiveBonusBanner] = useState<string | null>(null);

  // Persist progress on every answer
  useEffect(() => {
    try {
      localStorage.setItem("quiz_progress_index", String(current));
      localStorage.setItem("quiz_progress_answers", JSON.stringify(answers));
    } catch (_) {}
  }, [current, answers]);

  const q = questions[current];
  const isMulti = q.multiSelect === true;
  const linear = (current + 1) / questions.length;
  const progress = Math.round(Math.pow(linear, 0.6) * 80);

  const isMilestone = current === 5 || current === 8;

  // Stagger timing based on direction
  const baseDelay = direction === -1 ? STAGGER_BACK_DELAY : STAGGER_BASE_DELAY;
  const staggerInterval = direction === -1 ? STAGGER_BACK_INTERVAL : STAGGER_INTERVAL;

  const progressHint =
    current === 0 ? "Vamos montar seu perfil..." :
    current <= 2 ? "Padrão identificado. Continue..." :
    current <= 4 ? "Seu perfil está ficando interessante..." :
    current <= 6 ? "Já temos dados suficientes pra surpreender você." :
    current <= 8 ? "Quase lá — falta pouco pro diagnóstico completo." :
    "Última pergunta. Seu resultado está quase pronto.";

  const doAdvance = useCallback(() => {
    setDirection(1);
    setCurrent((c) => c + 1);
    setSelected(null);
    setMultiSelected(new Set());
  }, []);

  const advance = (newAnswers: Record<number, string>) => {
    if (current === questions.length - 1) {
      try {
        localStorage.removeItem("quiz_progress_index");
        localStorage.removeItem("quiz_progress_answers");
      } catch (_) {}
      onComplete(newAnswers);
      return;
    }

    // Check for bonus unlocks at transition points
    // Bonus 1 shows after index 6 (renda), Bonus 2 shows after index 7 (tempo)
    // Now non-blocking: advance immediately, show banner as toast overlay
    if (current === 6 || current === 7) {
      const currentBonuses = calculateBonuses(newAnswers);
      const newBonus = currentBonuses.find((b) => !shownBonuses.has(b));
      if (newBonus) {
        setShownBonuses((prev) => new Set([...prev, newBonus]));
        setActiveBonusBanner(newBonus);
        // DON'T block — advance immediately, banner is just a toast
      }
    }

    doAdvance();
  };

  const handleBonusDone = () => {
    setActiveBonusBanner(null);
  };

  const handleSelect = (value: string) => {
    if (isMulti) {
      setMultiSelected((prev) => {
        const next = new Set(prev);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        return next;
      });
      playToggle();
      navigator.vibrate?.(15);
      return;
    }

    setSelected(value);
    setShowMicroWin(true);

    if (isMilestone) {
      playMilestone();
      navigator.vibrate?.(50);
    } else {
      playPop();
      navigator.vibrate?.(30);
    }

    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    const delay = isMilestone ? 750 : 650;
    setTimeout(() => {
      setShowMicroWin(false);
      advance(newAnswers);
    }, delay);
  };

  const handleMultiConfirm = () => {
    if (multiSelected.size === 0) return;
    const val = Array.from(multiSelected).join(",");
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    playPop();
    navigator.vibrate?.(30);
    advance(newAnswers);
  };

  const handleBack = () => {
    if (current === 0) return;
    setDirection(-1);
    const prevQ = questions[current - 1];
    setCurrent((c) => c - 1);
    if (prevQ.multiSelect) {
      const prev = answers[prevQ.id];
      setMultiSelected(new Set(prev ? prev.split(",") : []));
      setSelected(null);
    } else {
      setSelected(answers[prevQ.id] || null);
      setMultiSelected(new Set());
    }
  };

  const isSelectedOpt = (value: string) => {
    if (isMulti) return multiSelected.has(value);
    return selected === value;
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-[100svh] flex flex-col px-4 py-6 relative overflow-hidden sm:min-h-screen">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* AGT Branding */}
      <div className="w-full max-w-2xl mx-auto mb-4 text-center relative z-10">
        <AGTLogo className="mx-auto opacity-60" />
      </div>

      {/* Resume prompt */}
      <AnimatePresence>
        {showResume && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl mx-auto mb-4 relative z-10"
          >
            <div className="rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-sm p-4 flex flex-col sm:flex-row items-center gap-3">
              <p className="text-sm text-foreground/80 flex-1 text-center sm:text-left">
                Você parou na pergunta {current + 1}. Quer continuar?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowResume(false)}
                  className="h-9 px-4 rounded-lg text-xs font-semibold gradient-gold text-primary-foreground"
                >
                  Continuar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrent(0);
                    setAnswers({});
                    setSelected(null);
                    setMultiSelected(new Set());
                    setShowResume(false);
                    try {
                      localStorage.removeItem("quiz_progress_index");
                      localStorage.removeItem("quiz_progress_answers");
                    } catch (_) {}
                  }}
                  className="h-9 px-4 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                >
                  Recomeçar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="w-full max-w-2xl mx-auto mb-2 relative z-10">
        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {current > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-0.5 text-muted-foreground/70 hover:text-accent transition-colors text-xs rounded-lg px-3 py-2.5 -ml-3 hover:bg-accent/5 active:bg-accent/10"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </button>
            )}
            <span>Pergunta {current + 1} de {questions.length}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2.5 bg-white/[0.06] rounded-full shadow-inner" />
        <AnimatePresence mode="wait">
          <motion.p
            key={progressHint}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-[11px] text-accent/50 mt-1.5 text-center"
          >
            {progressHint}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center relative z-10">

        {/* ── FLASH — tela toda ao clicar ── */}
        <AnimatePresence>
          {showMicroWin && !isMulti && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <motion.div
                className="fixed inset-0 bg-accent/[0.07]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 80,
                  height: 80,
                  background: isMilestone
                    ? "radial-gradient(circle, rgba(200,130,30,0.25) 0%, rgba(200,130,30,0.08) 40%, transparent 70%)"
                    : "radial-gradient(circle, hsla(28,80%,50%,0.2) 0%, hsla(28,80%,50%,0.06) 40%, transparent 70%)",
                }}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: isMilestone ? 4 : 3, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Question content ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-lg"
          >
            {/* Question title with animated underline */}
            <div className="text-center mb-8">
              <h2 className="font-heading text-xl sm:text-2xl font-bold leading-relaxed inline">
                {q.title}
              </h2>
              {/* Animated underline — draws L→R synced with option delay */}
              <motion.div
                className="mx-auto mt-3 h-[2px] rounded-full bg-accent/30"
                style={{ transformOrigin: "left", maxWidth: "80%" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: baseDelay || 0.3, ease: "easeOut", delay: 0.1 }}
              />
            </div>

            {isMulti ? (
              <>
                {/* ── Multi-select: Chip grid layout ── */}
                <motion.div
                  className="flex items-center justify-center gap-2 mb-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: baseDelay * 0.5, duration: 0.3 }}
                >
                  <div className="flex -space-x-1">
                    <span className="w-2 h-2 rounded-full bg-accent/60" />
                    <span className="w-2 h-2 rounded-full bg-accent/40" />
                    <span className="w-2 h-2 rounded-full bg-accent/20" />
                  </div>
                  <p className="text-sm text-accent/70 font-medium">
                    Toque em todos que se aplicam
                  </p>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
                  {q.options.map((opt, i) => {
                    const optDelay = baseDelay + i * staggerInterval;
                    return (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, scale: 0.85, pointerEvents: "none" as const }}
                        animate={{ opacity: 1, scale: 1, pointerEvents: "auto" as const }}
                        transition={{
                          delay: optDelay,
                          duration: 0.25,
                          type: "spring",
                          stiffness: 300,
                          // pointer-events transitions instantly at the end of the animation
                          pointerEvents: { delay: optDelay + 0.15 },
                        }}
                        onClick={() => handleSelect(opt.value)}
                        className={`px-4 py-3 sm:px-5 sm:py-3 rounded-full border-2 text-sm sm:text-base font-medium transition-all duration-200 touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                          isSelectedOpt(opt.value)
                            ? "border-accent bg-accent/15 text-accent shadow-md shadow-accent/20 scale-[1.05]"
                            : "border-white/[0.12] bg-white/[0.04] text-foreground/70 hover:border-accent/30 hover:bg-white/[0.07] active:scale-[0.96]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelectedOpt(opt.value) && <AnimatedCheck />}
                          {opt.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Confirm button */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: baseDelay + q.options.length * staggerInterval + 0.1, duration: 0.3 }}
                >
                  <Button
                    onClick={handleMultiConfirm}
                    disabled={multiSelected.size === 0}
                    className={`h-14 px-10 rounded-xl font-bold text-base transition-all duration-300 ${
                      multiSelected.size > 0
                        ? "gradient-gold text-primary-foreground shadow-lg shadow-accent/30 animate-pulse-glow hover:scale-[1.02]"
                        : "bg-white/[0.06] text-white/30 border border-white/[0.08] cursor-not-allowed"
                    }`}
                  >
                    {multiSelected.size > 0
                      ? `Confirmar (${multiSelected.size} selecionado${multiSelected.size > 1 ? "s" : ""})`
                      : "Selecione pelo menos 1"}
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                {/* ── Single-select: Classic vertical list with stagger ── */}
                <div className="space-y-3">
                  {q.options.map((opt, i) => {
                    const optDelay = baseDelay + i * staggerInterval;
                    return (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, y: 16, pointerEvents: "none" as const }}
                        animate={{ opacity: 1, y: 0, pointerEvents: "auto" as const }}
                        transition={{
                          delay: optDelay,
                          duration: 0.25,
                          ease: "easeOut",
                          pointerEvents: { delay: optDelay + 0.15 },
                        }}
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background backdrop-blur-sm group ${
                          isSelectedOpt(opt.value)
                            ? "border-accent/60 bg-accent/12 shadow-lg shadow-accent/20 scale-[1.02] ring-1 ring-accent/15"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-accent/30 hover:bg-white/[0.06] hover:shadow-md hover:shadow-black/20 active:scale-[0.98] active:bg-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                              isSelectedOpt(opt.value)
                                ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/30"
                                : "border-muted-foreground/40 text-muted-foreground"
                            }`}
                          >
                            {isSelectedOpt(opt.value) ? <AnimatedCheck /> : String.fromCharCode(65 + i)}
                          </span>
                          <span className={`text-sm sm:text-base transition-colors duration-200 ${
                            isSelectedOpt(opt.value) ? "text-foreground" : "text-foreground/80"
                          }`}>{opt.label}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bonus Unlock Banner — non-blocking toast overlay */}
      <AnimatePresence>
        {activeBonusBanner && (
          <BonusUnlockBanner
            key={activeBonusBanner}
            bonusId={activeBonusBanner}
            onDone={handleBonusDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
