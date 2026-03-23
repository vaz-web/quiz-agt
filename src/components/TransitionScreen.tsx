import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";

interface Props {
  onDone: () => void;
}

export default function TransitionScreen({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="min-h-[100svh] px-4 flex flex-col items-center justify-center sm:min-h-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 inline-flex items-center justify-center h-20 w-20 rounded-full bg-accent/20 backdrop-blur-sm shadow-lg shadow-accent/20"
        >
          <CheckCircle className="h-10 w-10 text-accent" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-heading text-2xl sm:text-3xl font-bold mb-3"
        >
          Respostas registradas!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-base sm:text-lg flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4 text-accent" />
          Preparando seu diagnóstico…
        </motion.p>
      </motion.div>
    </div>
  );
}
