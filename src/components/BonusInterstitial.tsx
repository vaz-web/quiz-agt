/**
 * BonusInterstitial — Dedicated screen shown between quiz questions
 * when a bonus is unlocked. Replaces the old toast overlay.
 *
 * - Takes the full quiz content area (not a floating overlay)
 * - Shows bonus details with rich animation
 * - "Continuar" button appears after a delay (2.5s first bonus, 1.5s second+)
 * - User controls when to proceed
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, ArrowRight, Sparkles } from "lucide-react";
import { bonusMetadata } from "@/data/bonusSystem";
import { Button } from "@/components/ui/button";

interface Props {
  bonusId: string;
  /** How many bonuses have been shown before this one (0 = first) */
  bonusIndex: number;
  onContinue: () => void;
}

export default function BonusInterstitial({ bonusId, bonusIndex, onContinue }: Props) {
  const [showButton, setShowButton] = useState(false);
  const meta = bonusMetadata[bonusId];

  // Progressive timing: first bonus = 2.5s, subsequent = 1.5s
  const delay = bonusIndex === 0 ? 2500 : 1500;

  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  // Haptic feedback
  useEffect(() => {
    navigator.vibrate?.([30, 50, 60]);
  }, []);

  if (!meta) return null;

  const tierConfig = {
    bronze: {
      gradient: "from-amber-900/40 to-amber-800/20",
      border: "border-amber-600/40",
      badge: "bg-amber-900/50 text-amber-400 border-amber-600/30",
      icon: "bg-amber-900/40 border-amber-600/30",
      glow: "shadow-amber-500/20",
      label: "Bronze",
    },
    silver: {
      gradient: "from-slate-500/20 to-slate-400/10",
      border: "border-slate-400/30",
      badge: "bg-slate-700/50 text-slate-300 border-slate-400/30",
      icon: "bg-slate-700/40 border-slate-400/30",
      glow: "shadow-slate-400/15",
      label: "Prata",
    },
    gold: {
      gradient: "from-yellow-600/25 to-yellow-500/10",
      border: "border-yellow-500/30",
      badge: "bg-yellow-900/50 text-yellow-400 border-yellow-500/30",
      icon: "bg-yellow-900/40 border-yellow-500/30",
      glow: "shadow-yellow-500/20",
      label: "Ouro",
    },
  };

  const tier = tierConfig[meta.tier];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center px-6 py-8 min-h-[400px]"
    >
      {/* Floating sparkles background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl" style={{ background: meta.tierColor + "30" }} />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full blur-2xl" style={{ background: meta.tierColor + "20" }} />
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="relative mb-5"
      >
        <div
          className={`w-20 h-20 rounded-2xl ${tier.icon} border flex items-center justify-center shadow-xl ${tier.glow}`}
        >
          <span className="text-4xl">{meta.icon}</span>
        </div>
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: meta.tierColor + "40" }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
        />
      </motion.div>

      {/* "Bônus desbloqueado" label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center gap-1.5 mb-3"
      >
        <Sparkles className="h-4 w-4" style={{ color: meta.tierColor }} />
        <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: meta.tierColor }}>
          Bônus Desbloqueado
        </span>
        <Sparkles className="h-4 w-4" style={{ color: meta.tierColor }} />
      </motion.div>

      {/* Tier badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={`inline-flex items-center gap-1.5 rounded-full ${tier.badge} border px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4`}
      >
        <Gift className="h-3 w-3" />
        {tier.label}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="font-heading text-xl sm:text-2xl font-bold leading-tight mb-3 max-w-sm"
      >
        {meta.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6"
      >
        {meta.description}
      </motion.p>

      {/* Guarantee note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className={`rounded-xl bg-gradient-to-r ${tier.gradient} border ${tier.border} px-4 py-2.5 mb-6`}
      >
        <p className="text-xs text-foreground/70">
          ✓ Garantido — entregue no final do diagnóstico
        </p>
      </motion.div>

      {/* Continue button (appears after delay) */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Button
              onClick={onContinue}
              variant="outline"
              className="rounded-xl border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 px-6 py-5 text-sm font-semibold gap-2"
            >
              Continuar diagnóstico
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
