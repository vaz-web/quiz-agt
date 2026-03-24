import { useEffect, useRef, useState } from "react";

/**
 * AnimatedBackground — Gradient mesh blobs + floating particles with scroll parallax.
 * Renders behind all content via fixed positioning + z-index: 0.
 * Performance-conscious: uses CSS animations for blobs, canvas for particles.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight * 3); // tall enough for scroll

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = Math.max(window.innerHeight * 3, document.documentElement.scrollHeight);
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Generate particles
    const PARTICLE_COUNT = 45;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.15 + 0.05,
      parallax: Math.random() * 0.3 + 0.1, // 0.1–0.4 parallax factor
      opacity: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.3 - 0.15,
    }));

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      time += 0.008;

      const scroll = scrollRef.current;

      for (const p of particles) {
        // Parallax offset — each particle moves at different rate
        const py = p.y - scroll * p.parallax;
        // Gentle floating motion
        const ox = Math.sin(time + p.phase) * 12 * p.parallax;
        const oy = Math.cos(time * 0.7 + p.phase) * 8 * p.parallax;

        const drawX = p.x + ox + p.drift * time * 10;
        const drawY = py + oy;

        // Pulse opacity
        const pulse = 0.6 + 0.4 * Math.sin(time * 1.5 + p.phase);
        const alpha = p.opacity * pulse;

        // Warm amber glow
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.r * 2.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.r * 2.5);
        grad.addColorStop(0, `hsla(28, 80%, 60%, ${alpha * 0.4})`);
        grad.addColorStop(1, `hsla(28, 80%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(28, 70%, 75%, ${alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // Small delay to let page settle
    const t = setTimeout(() => {
      handleResize();
      draw();
    }, 100);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Gradient mesh blobs — CSS animated for performance */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, hsl(28 80% 50%) 0%, transparent 70%)",
          top: "-10%",
          left: "20%",
          animation: "blobFloat1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, hsl(220 60% 40%) 0%, transparent 70%)",
          top: "30%",
          right: "-5%",
          animation: "blobFloat2 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[450px] h-[450px] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, hsl(28 70% 45%) 0%, transparent 70%)",
          bottom: "10%",
          left: "-5%",
          animation: "blobFloat3 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, hsl(210 50% 35%) 0%, transparent 70%)",
          top: "60%",
          left: "50%",
          animation: "blobFloat1 28s ease-in-out infinite reverse",
        }}
      />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
