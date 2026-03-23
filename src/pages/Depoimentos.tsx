import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  { id: "HtGhzkf9bg0", title: "Depoimento 1" },
  { id: "lR74VP-tXU8", title: "Depoimento 2" },
  { id: "IRWK3Dq0z-0", title: "Depoimento 3" },
  { id: "gfuqeQ-LclM", title: "Depoimento 4" },
  { id: "ikgF4AR3b_4", title: "Depoimento 5" },
  { id: "xkATAfQLPhw", title: "Depoimento 6" },
  { id: "bZm0ST3Frxw", title: "Depoimento 7" },
  { id: "vpjyOQiRx2Q", title: "Depoimento 8" },
];

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md space-y-6"
      >
        {/* Animated dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Estamos escolhendo os depoimentos que mais combinam com você...
        </h2>

        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-muted-foreground">{progress}%</p>
      </motion.div>
    </div>
  );
}

function VideoCard({ videoId, index }: { videoId: string; index: number }) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {!playing ? (
        <div
          className="relative cursor-pointer group"
          onClick={() => setPlaying(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Depoimento"
            className="w-full aspect-video object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
              <Play className="h-7 w-7 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="Depoimento"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </motion.div>
  );
}

export default function Depoimentos() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} />;
  }

  return (
    <div className="gradient-bg min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-3">Resultados Reais</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
            Quem Aplicou as <span className="text-primary">3 Dimensões</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Veja depoimentos de pessoas que receberam o mapa personalizado e aplicaram as 3 Dimensões no perfil delas.
          </p>
        </motion.div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <VideoCard key={t.id} videoId={t.id} index={i} />
          ))}
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao diagnóstico
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
