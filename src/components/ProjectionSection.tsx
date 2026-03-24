/**
 * ProjectionSection — Fused chart + inaction cost block.
 *
 * Shows a Recharts AreaChart with CDI vs AGT curves, followed by
 * the calculated gap in R$ and a personalized emotional copy.
 * Replaces the old generic loss frame.
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { ProfileType, FinancialPotential } from "@/data/quizData";
import {
  generateProjection,
  calculateGap,
  gapInMonthsOfIncome,
  getInactionCopy,
  getAgtCurveLabel,
  formatBRL,
} from "@/data/projections";

interface Props {
  profile: ProfileType;
  potential: FinancialPotential;
  patrimonioAnswer: string;
  rendaAnswer: string;
}

/* ── Animated count-up hook ──────────────────────────── */
function useCountUp(target: number, duration = 1400, delay = 800) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const start = performance.now() + delay;
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay, started]);

  return { val, start: () => setStarted(true) };
}

/* ── Custom dot for the endpoint ─────────────────────── */
function EndDot({ cx, cy, index, total, color }: any) {
  if (index !== total - 1) return null;
  return (
    <circle cx={cx} cy={cy} r={5} fill={color} stroke="hsl(var(--background))" strokeWidth={2}>
      <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
    </circle>
  );
}

/* ── Format Y axis ───────────────────────────────────── */
function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

/* ════════════════════════════════════════════════════════ */

export default function ProjectionSection({ profile, potential, patrimonioAnswer, rendaAnswer }: Props) {
  const data = generateProjection(patrimonioAnswer);
  const { baseValue, gap, gapPct } = calculateGap(patrimonioAnswer);
  const rendaMonths = gapInMonthsOfIncome(gap, rendaAnswer);
  const copy = getInactionCopy(profile, potential, gap, gapPct, rendaMonths);
  const agtLabel = getAgtCurveLabel(profile);
  const isLowPatrimonio = patrimonioAnswer === "A";

  // Intersection observer — animate when visible
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const gapCounter = useCountUp(isLowPatrimonio ? gapPct : gap, 1400, 400);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          gapCounter.start();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card-hero rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 sm:px-8 sm:pt-8 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="font-heading text-lg font-bold">Sua Projeção em 12 Meses</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Patrimônio inicial: {formatBRL(baseValue)}
        </p>
      </div>

      {/* Chart */}
      <div className="px-2 sm:px-4" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCdi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7280" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6b7280" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradAgt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(28, 90%, 55%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(28, 90%, 55%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "hsla(0,0%,100%,0.4)" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: "hsla(0,0%,100%,0.4)" }}
              axisLine={false}
              tickLine={false}
              width={50}
            />

            {/* CDI curve (gray) */}
            <Area
              type="monotone"
              dataKey="cdi"
              stroke="#6b7280"
              strokeWidth={2}
              fill="url(#gradCdi)"
              dot={false}
              activeDot={false}
              name="Sem método (CDI)"
              isAnimationActive={inView}
              animationDuration={1200}
              animationBegin={200}
            />

            {/* AGT curve (accent/gold) */}
            <Area
              type="monotone"
              dataKey="agt"
              stroke="hsl(28, 90%, 55%)"
              strokeWidth={2.5}
              fill="url(#gradAgt)"
              dot={false}
              activeDot={false}
              name={agtLabel}
              isAnimationActive={inView}
              animationDuration={1200}
              animationBegin={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-5 pb-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[2px] rounded-full bg-gray-500" />
          <span className="text-muted-foreground">Sem método (CDI)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[2px] rounded-full bg-accent" />
          <span className="text-accent font-medium">{agtLabel}</span>
        </div>
      </div>

      {/* Gap highlight */}
      <div className="mx-5 sm:mx-8 mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              Rentabilidade que fica na mesa em 12 meses
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              {isLowPatrimonio ? (
                <span className="text-3xl sm:text-4xl font-bold text-destructive tabular-nums">
                  {gapCounter.val}%
                </span>
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-destructive tabular-nums">
                  {formatBRL(gapCounter.val)}
                </span>
              )}
              {!isLowPatrimonio && rendaMonths > 0.5 && (
                <span className="text-sm text-muted-foreground">
                  ≈ {rendaMonths} {rendaMonths === 1 ? "mês" : "meses"} da sua renda
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/75 leading-relaxed">{copy}</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/50 text-center px-5 pb-4">
        Projeção ilustrativa. CDI 0,85%/mês · Estratégia 1,8%/mês. Resultados variam conforme mercado e disciplina.
      </p>
    </motion.div>
  );
}
