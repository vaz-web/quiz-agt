import { Button } from "@/components/ui/button";
import { AGTLogoFull } from "@/components/AGTLogo";
import { initAudio } from "@/utils/sounds";

interface Props {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const handleStart = () => {
    initAudio();
    onStart();
  };

  return (
    <div className="relative min-h-[100svh] px-4 py-8 flex flex-col items-center justify-center sm:min-h-screen overflow-hidden">
      {/* Content */}
      <div className="relative mx-auto w-full max-w-lg animate-fade-up text-center">
        {/* AGT Logo — imagem real */}
        <div className="mb-8">
          <AGTLogoFull className="mx-auto" />
        </div>

        {/* Decorative divider */}
        <div className="mx-auto mb-6 w-16 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        {/* Headline — loss aversion framing */}
        <h1 className="mb-4 font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl text-white">
          Descubra o que seu perfil{" "}
          <span className="text-accent">está deixando na mesa</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-6 max-w-md text-base text-white/55 sm:text-lg leading-relaxed">
          Faça o diagnóstico e veja como seu perfil se compara a +10.000 investidores.
          <br />
          <span className="text-white/40 text-sm">Leva menos de 2 minutos. Resultado imediato.</span>
        </p>

        {/* Journey overview — prepara a pessoa para os 3 passos */}
        <div className="mx-auto mb-10 flex items-center justify-center gap-3 text-xs text-white/40 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">1</span>
            Responda
          </span>
          <span className="text-white/20">→</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">2</span>
            Preencha
          </span>
          <span className="text-white/20">→</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">3</span>
            Receba seu perfil
          </span>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleStart}
          className="gradient-gold text-primary-foreground h-16 px-10 sm:px-14 rounded-2xl text-base sm:text-lg font-bold transition-all hover:opacity-90 hover:scale-[1.03] animate-pulse-glow-red gap-2 shadow-lg shadow-accent/25"
        >
          Quero descobrir meu perfil
        </Button>

      </div>
    </div>
  );
}
