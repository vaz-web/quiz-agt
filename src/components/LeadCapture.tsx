import { useState } from "react";
import { z } from "zod";
import { Shield, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AGTLogo } from "@/components/AGTLogo";

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
}

export default function LeadCapture({ onSubmit }: Props) {
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleWhatsappChange = (value: string) => {
    // Aceita apenas dígitos, máximo 11
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setForm({ ...form, whatsapp: digits });
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
        <div className="mb-6 flex justify-center">
          <AGTLogo className="mx-auto opacity-60" />
        </div>

        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
            <CheckCircle className="h-3.5 w-3.5" /> Falta pouco
          </span>
        </div>

        <h1 className="mb-4 text-center font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          Seu diagnóstico está{" "}
          <span className="text-accent">quase pronto</span>
        </h1>

        <p className="mx-auto mb-6 max-w-md text-center text-base text-muted-foreground sm:text-lg">
          Preencha pra ver seu resultado.
        </p>

        {/* Step progress — Zeigarnik: mostrar que já investiu tempo e falta só 1 passo */}
        <div className="mx-auto max-w-xs mb-6 space-y-2">
          <div className="flex items-center gap-2.5 text-xs text-accent/80">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span>10 perguntas respondidas</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-accent/80">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span>Perfil identificado</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-foreground font-semibold">
            <div className="h-4 w-4 rounded-full border-2 border-accent flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            </div>
            <span>Ver diagnóstico completo</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mb-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground sm:gap-6">
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-accent" /> Dados protegidos</span>
          <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-accent" /> +10.000 diagnósticos</span>
        </div>

        <form onSubmit={handleSubmit} className="glass-card space-y-5 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20" style={{ overflowAnchor: "none" }}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">Nome completo</label>
            <Input
              autoComplete="name"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12 bg-black/40 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">WhatsApp</label>
            <Input
              autoComplete="tel"
              inputMode="tel"
              placeholder="11999999999"
              value={form.whatsapp}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              className="h-12 bg-black/40 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50"
            />
            {errors.whatsapp && <p className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/80">Email</label>
            <Input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="seu@email.com"
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
            Ver meu resultado
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            🔒 Seus dados estão seguros e não serão compartilhados.
          </p>
        </form>
      </div>
    </div>
  );
}
