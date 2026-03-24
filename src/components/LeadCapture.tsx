import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, TrendingUp, CheckCircle, Lock, Target, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AGTLogo } from "@/components/AGTLogo";
import { ProfileType, profiles } from "@/data/quizData";
import { bonusMetadata } from "@/data/bonusSystem";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório").max(100),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "WhatsApp inválido. Digite apenas os números: DDD + número"),
  email: z.string().trim().email("Email inválido").max(255),
});

interface Props {
  onSubmit: (data: { name: string; whatsapp: string; email: string }) => void;
  profile: ProfileType;
  answers: Record<number, string>;
  bonuses?: string[];
}

const profileIcons: Record<ProfileType, React.ReactNode> = {
  1: <Shield className="h-8 w-8" />,
  2: <Target className="h-8 w-8" />,
  3: <Zap className="h-8 w-8" />,
};

const profileColors: Record<ProfileType, { ring: string; accent: string }> = {
  1: { ring: "from-blue-400 to-sky-400", accent: "text-blue-400" },
  2: { ring: "from-orange-400 to-amber-400", accent: "text-orange-400" },
  3: { ring: "from-red-400 to-orange-500", accent: "text-red-400" },
};

export default function LeadCapture({ onSubmit, profile, answers, bonuses = [] }: Props) {
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Conta campos preenchidos para blur progressivo
  const filledCount = [form.name.trim().length >= 2, form.whatsapp.length >= 10, form.email.includes("@")].filter(Boolean).length;
  // blur(20) → 14 (nome) → 8 (whatsapp) → 2 (email) — dramático e visível
  const blurLevel = showForm ? Math.max(20 - filledCount * 6, 2) : 20;

  const data = profiles[profile];
  const colors = profileColors[profile];

  // Gauges estáticos para preview borrado
  const riskAwareness = profile === 1 ? 95 : profile === 2 ? 70 : 50;
  const marketReadiness = profile === 1 ? 30 : profile === 2 ? 60 : 85;
  const growthPotential = profile === 1 ? 60 : profile === 2 ? 80 : 95;

  // Auto-focus nome quando form aparece
  useEffect(() => {
    if (showForm && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 400);
    }
  }, [showForm]);

  // VisualViewport handling — scroll active input into view on iOS/Android keyboard
  useEffect(() => {
    if (!showForm) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
        setTimeout(() => {
          (active as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    };

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, [showForm]);

  const handleWhatsappChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setForm({ ...form, whatsapp: digits });
  };

  // Máscara visual: 11999887766 → (11) 99988-7766
  const formatWhatsapp = (digits: string): string => {
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data as { name: string; whatsapp: string; email: string });
  };

  return (
    <div className="min-h-[100svh] px-4 py-6 sm:flex sm:min-h-screen sm:items-center sm:justify-center sm:py-8">
      <div className="mx-auto w-full max-w-lg animate-fade-up">
        {/* AGT Branding */}
        <div className="mb-4 flex justify-center">
          <AGTLogo className="mx-auto opacity-60" />
        </div>

        {/* Stepper visual — mostra que é o passo 2 de 3 */}
        <div className="mx-auto mb-6 flex items-center justify-center gap-3 sm:gap-4">
          {/* Passo 1 — Concluído */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="hidden sm:inline text-xs text-accent font-medium">Diagnóstico</span>
          </div>
          <div className="h-[2px] w-6 sm:w-8 bg-accent" />
          {/* Passo 2 — Ativo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-accent bg-accent/20 text-accent animate-pulse">
              <span className="text-[10px] sm:text-xs font-bold">2</span>
            </div>
            <span className="hidden sm:inline text-xs text-accent font-semibold">Seus dados</span>
          </div>
          <div className="h-[2px] w-6 sm:w-8 bg-white/15" />
          {/* Passo 3 — Pendente */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-white/20 text-white/30">
              <span className="text-[10px] sm:text-xs font-bold">3</span>
            </div>
            <span className="hidden sm:inline text-xs text-white/30 font-medium">Resultado</span>
          </div>
        </div>

        <h1 className="mb-2 text-center font-heading text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
          Seu diagnóstico revelou algo{" "}
          <span className="text-accent">surpreendente.</span>
        </h1>

        <p className="mx-auto mb-3 max-w-md text-center text-sm sm:text-base text-muted-foreground">
          Preencha abaixo para ver seu resultado completo.
        </p>

        {/* Bonus counter — shows how many bonuses were unlocked */}
        {bonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mx-auto mb-5 max-w-sm rounded-xl border border-accent/20 bg-accent/5 p-3"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">
                Seu diagnóstico + {bonuses.length} bônus{bonuses.length > 1 ? "" : ""} desbloqueado{bonuses.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-1.5">
              {bonuses.map((bonusId) => {
                const meta = bonusMetadata[bonusId];
                if (!meta) return null;
                return (
                  <div
                    key={bonusId}
                    className="flex items-center gap-2 text-xs text-foreground/60"
                    style={{ filter: showForm ? `blur(${Math.max(8 - filledCount * 3, 0)}px)` : "blur(6px)" }}
                  >
                    <span>{meta.icon}</span>
                    <span className="truncate">{meta.title}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Blurred Result Preview Card ─────────────────────── */}
        <div className="relative mb-5 rounded-2xl glass-card p-4 sm:p-5 overflow-hidden">
          {/* Lock icon centered over card */}
          {!showForm && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 border-2 border-accent/40"
              >
                <Lock className="h-6 w-6 text-accent" />
              </motion.div>
            </div>
          )}

          {/* Actual result content — blur applied directly on content */}
          <div
            className="relative text-center select-none pointer-events-none transition-all duration-700 ease-out"
            style={{ filter: `blur(${blurLevel}px)` }}
            aria-hidden="true"
          >
            {/* Mini gauges only */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Risco", value: riskAwareness, color: "hsl(220, 70%, 60%)" },
                { label: "Prontidão", value: marketReadiness, color: "hsl(28, 90%, 55%)" },
                { label: "Crescimento", value: growthPotential, color: "hsl(0, 70%, 55%)" },
              ].map((g) => (
                <div key={g.label} className="flex flex-col items-center gap-1">
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={g.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - g.value / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold tabular-nums">{g.value}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA Button (before form) or Form (after click) ── */}
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Button
                onClick={() => setShowForm(true)}
                className="gradient-gold h-14 sm:h-16 w-full rounded-xl text-base sm:text-lg font-bold text-primary-foreground transition-all hover:opacity-90 hover:scale-[1.02] animate-pulse-glow"
              >
                <Lock className="h-5 w-5 mr-2" />
                Quero ver meu diagnóstico
              </Button>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> Dados protegidos</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-accent" /> +10.000 diagnósticos</span>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmit}
              className="glass-card-elevated space-y-4 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/20 overflow-hidden"
              style={{ overflowAnchor: "none" }}
            >
              <p className="text-center text-sm text-muted-foreground mb-1">
                Preencha para liberar seu resultado
              </p>

              {/* Nome — floating label style via placeholder */}
              <div>
                <Input
                  ref={nameRef}
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 bg-black/40 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50"
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* WhatsApp com máscara visual */}
              <div>
                <Input
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  value={formatWhatsapp(form.whatsapp)}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  className="h-12 bg-black/40 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50"
                />
                {errors.whatsapp && <p className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>}
              </div>

              {/* Email */}
              <div>
                <Input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Seu melhor email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 bg-black/40 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                className="gradient-gold h-14 w-full rounded-xl text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 animate-pulse-glow"
              >
                Revelar meu resultado agora
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                🔒 Seus dados estão seguros e não serão compartilhados.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
