import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { questions } from "@/data/quizData";
import { calculateBonuses } from "@/data/bonusSystem";
import { AGTLogo } from "@/components/AGTLogo";
import { Lock, Gift, BarChart3, Brain, Search, ShieldCheck } from "lucide-react";

interface Props {
  onDone: () => void;
  answers?: Record<number, string>;
}

interface ProcessStep {
  message: string;
  icon: React.ReactNode;
}

function buildSteps(answers?: Record<number, string>): ProcessStep[] {
  const steps: ProcessStep[] = [
    { message: "Cruzando suas respostas com nosso banco de dados...", icon: <Search className="h-5 w-5" /> },
  ];

  if (answers) {
    const exp = answers[3];
    if (exp === "A") {
      steps.push({ message: "Identificando oportunidades para seu momento...", icon: <Brain className="h-5 w-5" /> });
    } else if (exp === "B") {
      steps.push({ message: "Comparando seu perfil com investidores como você...", icon: <Brain className="h-5 w-5" /> });
    } else if (exp === "C") {
      steps.push({ message: "Analisando padrões no seu histórico...", icon: <Brain className="h-5 w-5" /> });
    }

    const assets = answers[11];
    if (assets) {
      const selected = assets.split(",").map((s) => s.trim());
      if (selected.includes("D")) {
        steps.push({ message: "Calculando assimetria dos seus ativos...", icon: <BarChart3 className="h-5 w-5" /> });
      } else if (selected.includes("B") || selected.includes("C")) {
        steps.push({ message: "Avaliando potencial oculto nos seus investimentos...", icon: <BarChart3 className="h-5 w-5" /> });
      } else {
        steps.push({ message: "Mapeando seu ponto de partida ideal...", icon: <BarChart3 className="h-5 w-5" /> });
      }
    } else {
      steps.push({ message: "Mapeando seu ponto de partida ideal...", icon: <BarChart3 className="h-5 w-5" /> });
    }

    // Bonus verification step
    const bonuses = calculateBonuses(answers);
    if (bonuses.length > 0) {
      steps.push({
        message: `Verificando seus ${bonuses.length} bônus desbloqueados...`,
        icon: <Gift className="h-5 w-5" />,
      });
    }
  } else {
    steps.push({ message: "Comparando com +10.000 perfis analisados...", icon: <Brain className="h-5 w-5" /> });
    steps.push({ message: "Calculando assimetria de risco...", icon: <BarChart3 className="h-5 w-5" /> });
  }

  steps.push({ message: "Finalizando seu diagnóstico personalizado...", icon: <ShieldCheck className="h-5 w-5" /> });
  return steps;
}

/* ── Mini analysis bars — visual flair during processing ── */
function AnalysisBars() {
  return (
    <div className="flex items-end justify-center gap-1.5 h-16 mb-6">
      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.75, 0.55, 0.85].map((target, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-full bg-accent/60"
          initial={{ height: "8%" }}
          animate={{
            height: [`${8 + Math.random() * 20}%`, `${target * 100}%`, `${20 + Math.random() * 40}%`, `${target * 100}%`],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

export default function ProcessingScreen({ onDone, answers }: Props) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = useMemo(() => buildSteps(answers), [answers]);

  // Total duration: 6.5s
  const TOTAL_DURATION = 6500;

  useEffect(() => {
    const stepDuration = (TOTAL_DURATION - 400) / steps.length;

    const interval = setInterval(() => {
      setStep((s) => {
        if (s < steps.length - 1) return s + 1;
        return s;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + (100 / (TOTAL_DURATION / 80));
      });
    }, 80);

    const timeout = setTimeout(onDone, TOTAL_DURATION);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [onDone, steps.length]);

  const currentStep = steps[step];

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-4 sm:min-h-screen">
      <div className="w-full max-w-md text-center">
        {/* AGT Branding */}
        <div className="mb-8">
          <AGTLogo className="mx-auto opacity-60" />
        </div>

        {/* Analysis bars animation */}
        <AnalysisBars />

        {/* Spinner with step icon in center */}
        <div className="relative mx-auto mb-8 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="text-accent"
              >
                {currentStep.icon}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Step message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xl sm:text-2xl font-semibold mb-6 min-h-[2em]"
          >
            {currentStep.message}
          </motion.p>
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-accent w-6" : "bg-white/15 w-3"
              }`}
              animate={i === step ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>

        <Progress value={Math.min(progress, 100)} className="h-2 bg-white/10 mb-3" />
        <p className="text-sm text-muted-foreground">{Math.min(Math.round(progress), 100)}% completo</p>
      </div>
    </div>
  );
}
