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
  const linear = (current + 1) / questions.length;
  const progress = Math.round(Math.pow(linear, 0.6) * 100);

  // Milestone = perguntas nos índices 5 e 8
  const isMilestone = current === 5 || current === 8;

  // Curiosity hooks
  const progressHint =
    current === 0 ? "Vamos descobrir seu perfil" :
    current <= 2 ? "Bom começo!" :
    current <= 4 ? "Seu perfil está se formando..." :
    current <= 6 ? "Passamos da metade!" :
    current <= 8 ? "Falta pouco pro diagnóstico..." :
    "Última pergunta!";

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
          <span className="text-accent font-semibold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-white/10" />
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
                    : "radial-gradient(circle, rgba(224,32,32,0.2) 0%, rgba(224,32,32,0.06) 40%, transparent 70%)",
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

            {isMulti && (
              <p className="text-center text-sm text-muted-foreground mb-4">
                Selecione todos que se aplicam
              </p>
            )}

            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background backdrop-blur-sm ${
                    isSelectedOpt(opt.value)
                      ? "border-accent bg-accent/15 shadow-lg shadow-accent/30 scale-[1.02] ring-1 ring-accent/20"
                      : "border-white/10 bg-black/30 hover:border-accent/40 hover:bg-black/40 active:scale-[0.98] active:bg-black/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Badge: letra → checkmark animado quando selecionado */}
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                        isSelectedOpt(opt.value)
                          ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/30"
                          : "border-muted-foreground/40 text-muted-foreground"
                      }`}
                    >
                      {isSelectedOpt(opt.value) ? <AnimatedCheck /> : (
                        isMulti ? "" : String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className={`text-sm sm:text-base transition-colors duration-200 ${
                      isSelectedOpt(opt.value) ? "text-foreground" : "text-foreground/80"
                    }`}>{opt.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Sticky confirm for multi-select (P11) */}
            {isMulti && multiSelected.size > 0 && (
              <div className="sticky bottom-4 mt-6 text-center z-20">
                <Button
                  onClick={handleMultiConfirm}
                  className="gradient-gold text-primary-foreground h-14 px-10 rounded-xl font-bold text-base shadow-lg shadow-accent/30 animate-pulse-glow"
                >
                  Confirmar ({multiSelected.size} selecionado{multiSelected.size > 1 ? "s" : ""})
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
