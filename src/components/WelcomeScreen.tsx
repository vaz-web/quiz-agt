import { Shield, TrendingUp, Clock, Zap } from "lucide-react";
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
        <div className="mx-auto mb-6 w-16 h-[2px] bg-gradient-to-r from-transparent via-[#E02020]/40 to-transparent" />

        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E02020]/25 bg-[#E02020]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#E02020]">
            <Zap className="h-3.5 w-3.5" /> Diagnóstico Gratuito
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-4 font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-5xl text-white">
          Descubra seu{" "}
          <span className="text-[#E02020]">perfil de investidor</span>{" "}
          em 2 minutos
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-md text-base text-white/55 sm:text-lg leading-relaxed">
          10 perguntas rápidas. Resultado na hora.
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleStart}
          className="bg-[#E02020] hover:bg-[#C41818] text-white h-16 px-10 sm:px-14 rounded-2xl text-base sm:text-lg font-bold transition-all hover:scale-105 animate-pulse-glow-red gap-2 shadow-lg shadow-[#E02020]/20"
        >
          Descobrir meu perfil
        </Button>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-white/40 sm:gap-6">
          <span className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-[#E02020]/60" /> Gratuito
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#E02020]/60" /> 2 minutos
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#E02020]/60" /> +10.000 diagnósticos
          </span>
        </div>
      </div>
    </div>
  );
}
