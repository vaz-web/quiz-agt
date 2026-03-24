import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, CheckCircle } from "lucide-react";
import { bonusMetadata } from "@/data/bonusSystem";

interface Props {
  bonusId: string;
  onDone: () => void;
}

/**
 * Inline banner that appears between quiz questions when a bonus is unlocked.
 * Auto-dismisses after 2s. Non-blocking — the quiz flow continues automatically.
 */
export default function BonusUnlockBanner({ bonusId, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const meta = bonusMetadata[bonusId];

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300); // wait for exit animation
    }, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  // Haptic + sound effect
  useEffect(() => {
    navigator.vibrate?.(60);
  }, []);

  if (!meta) return null;

  const tierColors = {
    bronze: { bg: "bg-amber-900/30", border: "border-amber-600/40", text: "text-amber-400", glow: "shadow-amber-500/20" },
    silver: { bg: "bg-slate-400/10", border: "border-slate-400/30", text: "text-slate-300", glow: "shadow-slate-400/15" },
    gold: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
  };
  const colors = tierColors[meta.tier];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed inset-x-4 bottom-8 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md"
        >
          <div className={`rounded-2xl ${colors.bg} border ${colors.border} p-4 shadow-xl ${colors.glow} backdrop-blur-md`}>
            <div className="flex items-center gap-3">
              {/* Animated icon */}
              <motion.div
                initial={{ rotate: -30, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.1 }}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} border ${colors.border}`}
              >
                <span className="text-2xl">{meta.icon}</span>
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Gift className={`h-3.5 w-3.5 ${colors.text}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                    Bônus Desbloqueado!
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight truncate">
                  {meta.title}
                </p>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
              >
                <CheckCircle className={`h-6 w-6 ${colors.text}`} />
              </motion.div>
            </div>

            {/* Progress bar that drains over 2s */}
            <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full`}
                style={{ background: meta.tierColor }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 2, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
