import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { questions } from "@/data/quizData";
import { AGTLogo } from "@/components/AGTLogo";

interface Props {
  onDone: () => void;
  answers?: Record<number, string>;
}

function buildMessages(answers?: Record<number, string>): string[] {
  const msgs: string[] = ["Cruzando suas respostas com nosso banco de dados..."];

  if (answers) {
    const exp = answers[3];
    if (exp === "A") {
      msgs.push("Identificando oportunidades para seu momento...");
    } else if (exp === "B") {
      msgs.push("Comparando seu perfil com investidores como você...");
    } else if (exp === "C") {
      msgs.push("Analisando padrões no seu histórico...");
    }

    const assets = answers[11];
    if (assets) {
      const selected = assets.split(",").map((s) => s.trim());
      if (selected.includes("D")) {
        msgs.push("Calculando assimetria dos seus ativos...");
      } else if (selected.includes("B") || selected.includes("C")) {
        msgs.push("Avaliando potencial oculto nos seus investimentos...");
      } else {
        msgs.push("Mapeando seu ponto de partida ideal...");
      }
    } else {
      msgs.push("Mapeando seu ponto de partida ideal...");
    }
  } else {
    msgs.push("Comparando com +10.000 perfis analisados...");
    msgs.push("Calculando assimetria de risco...");
  }

  msgs.push("Finalizando seu diagnóstico personalizado...");
  return msgs;
}

export default function ProcessingScreen({ onDone, answers }: Props) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = useMemo(() => buildMessages(answers), [answers]);

  useEffect(() => {
    const stepDuration = 4800 / messages.length;

    const interval = setInterval(() => {
      setStep((s) => {
        if (s < messages.length - 1) return s + 1;
        return s;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 2;
      });
    }, 100);

    const timeout = setTimeout(onDone, 5200);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [onDone, messages.length]);

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-4 sm:min-h-screen">
      <div className="w-full max-w-md text-center">
        {/* AGT Branding */}
        <div className="mb-8">
          <AGTLogo className="mx-auto opacity-60" />
        </div>

        <div className="mx-auto mb-8 h-20 w-20 rounded-full border-4 border-white/10 border-t-accent animate-spin shadow-lg shadow-accent/10" />

        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xl sm:text-2xl font-semibold mb-6 min-h-[2em]"
          >
            {messages[step]}
          </motion.p>
        </AnimatePresence>

        <Progress value={progress} className="h-2 bg-white/10 mb-3" />
        <p className="text-sm text-muted-foreground">{Math.min(progress, 100)}% completo</p>
      </div>
    </div>
  );
}
