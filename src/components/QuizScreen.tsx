import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { questions } from "@/data/quizData";
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

/* ════════════════════════════════════════════════════════════ */

export default function QuizScreen({ onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showMicroWin, setShowMicroWin] = useState(false);

  const q = questions[current];
  const isMulti = q.multiSelect === true;
  // Quiz ocupa 0-80% da barra. Lead capture será ~90%, resultado 100%.
  // Isso evita que a pessoa ache que "acabou" ao ver 100% na última pergunta.
  const linear = (current + 1) / questions.length;
  const progress = Math.round(Math.pow(linear, 0.6) * 80);

  // Milestone = perguntas nos índices 5 e 8
  const isMilestone = current === 5 || current === 8;

  // Curiosity hooks
  const progressHint =
    current === 0 ? "Vamos montar seu perfil..." :
    current <= 2 ? "Padrão identificado. Continue..." :
    current <= 4 ? "Seu perfil está ficando interessante..." :
    current <= 6 ? "Já temos dados suficientes pra surpreender você." :
    current <= 8 ? "Quase lá — falta pouco pro diagnóstico completo." :
    "Última pergunta. Seu resultado está quase pronto.";

  const advance = (newAnswers: Record<number, string>) => {
    if (current === questions.length - 1) {
      onComplete(newAnswers);
      return;
    }
    setDirection(1);
    setCurrent((c) => c + 1);
    setSelected(null);
    setMultiSelected(new Set());
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

      {/* Progress */}
      <div className="w-full max-w-2xl mx-auto mb-2 relative z-10">
        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {current > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-0.5 text-muted-foreground/70 hover:text-accent transition-colors text-xs rounded-lg px-3 py-2 -ml-3 hover:bg-accent/5 active:bg-accent/10"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </button>
            )}
            <span>Pergunta {current + 1} de {questions.length}</span>
          </div>
          {/* Percentual removido — evita que a pessoa calcule mentalmente e ache que acabou */}
        </div>
        <Progress value={progress} className="h-2.5 bg-white/[0.06] rounded-full shadow-inner" />
        {/* Curiosity hook */}
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
              {/* Flash pulse — tela toda */}
              <motion.div
                className="fixed inset-0 bg-accent/[0.07]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />

              {/* Ring burst — centro da tela */}
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
            className="w-full max-w-2xl"
          >
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8 leading-snug">
              {q.title}
            </h2>

            {isMulti ? (
              <>
                {/* ── Multi-select: Chip grid layout — visually distinct from single-select ── */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="flex -space-x-1">
                    <span className="w-2 h-2 rounded-full bg-accent/60" />
                    <span className="w-2 h-2 rounded-full bg-accent/40" />
                    <span className="w-2 h-2 rounded-full bg-accent/20" />
                  </div>
                  <p className="text-sm text-accent/70 font-medium">
                    Toque em todos que se aplicam
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
                  {q.options.map((opt, i) => (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.2, type: "spring", stiffness: 300 }}
                      onClick={() => handleSelect(opt.value)}
                      className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-full border-2 text-sm sm:text-base font-medium transition-all duration-200 touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
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
                  ))}
                </div>

                {/* Confirm button — always visible, disabled when nothing selected */}
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
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
                {/* ── Single-select: Classic vertical list ── */}
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
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
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
