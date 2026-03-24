/**
 * Financial projection logic for the ResultScreen evolution chart.
 *
 * CDI rate: 0.85% / month (~10.7% annual — SELIC baseline)
 * AGT rate: 1.8% / month (~23.9% annual — conservative structured options)
 *
 * Values are calculated from the patrimônio answer (Q6, answers[4]).
 */

import { FinancialPotential, ProfileType } from "@/data/quizData";

/* ── Base patrimônio values from Q6 answers ──────────── */

const patrimonioBase: Record<string, number> = {
  A: 5_000,      // < R$ 10k
  B: 50_000,     // R$ 10k–100k
  C: 250_000,    // R$ 100k–500k
  D: 750_000,    // R$ 500k–1M
  E: 1_500_000,  // > R$ 1M
};

/* ── Monthly renda estimates from Q7 answers ─────────── */

const rendaBase: Record<string, number> = {
  A: 2_500,   // ≤ R$ 3k
  B: 7_000,   // ≤ R$ 10k
  C: 15_000,  // ≤ R$ 20k
  D: 30_000,  // > R$ 20k
};

/* ── Rates ────────────────────────────────────────────── */

const CDI_MONTHLY = 0.0085;  // 0.85%
const AGT_MONTHLY = 0.018;   // 1.8%

/* ── Projection data point ───────────────────────────── */

export interface ProjectionPoint {
  month: number;
  label: string;
  cdi: number;
  agt: number;
}

/**
 * Generate 13 data points (month 0–12) for CDI vs AGT projection.
 */
export function generateProjection(patrimonioAnswer: string): ProjectionPoint[] {
  const base = patrimonioBase[patrimonioAnswer] ?? patrimonioBase.A;
  const points: ProjectionPoint[] = [];

  for (let m = 0; m <= 12; m++) {
    points.push({
      month: m,
      label: m === 0 ? "Hoje" : `${m}m`,
      cdi: Math.round(base * Math.pow(1 + CDI_MONTHLY, m)),
      agt: Math.round(base * Math.pow(1 + AGT_MONTHLY, m)),
    });
  }

  return points;
}

/**
 * Calculate the 12-month gap between CDI and AGT strategies.
 */
export function calculateGap(patrimonioAnswer: string): {
  baseValue: number;
  cdi12m: number;
  agt12m: number;
  gap: number;
  gapPct: number;
} {
  const base = patrimonioBase[patrimonioAnswer] ?? patrimonioBase.A;
  const cdi12m = Math.round(base * Math.pow(1 + CDI_MONTHLY, 12));
  const agt12m = Math.round(base * Math.pow(1 + AGT_MONTHLY, 12));
  const gap = agt12m - cdi12m;
  const gapPct = Math.round(((agt12m - cdi12m) / base) * 100);

  return { baseValue: base, cdi12m, agt12m, gap, gapPct };
}

/**
 * Calculate how many months of income the gap represents.
 */
export function gapInMonthsOfIncome(gap: number, rendaAnswer: string): number {
  const renda = rendaBase[rendaAnswer] ?? rendaBase.A;
  return Math.round((gap / renda) * 10) / 10; // 1 decimal
}

/**
 * Get the "inaction cost" copy personalized by profile × potential.
 */
export function getInactionCopy(
  profile: ProfileType,
  potential: FinancialPotential,
  gap: number,
  gapPct: number,
  rendaMonths: number,
): string {
  // For low patrimônio, focus on % not R$
  if (potential === "baixo") {
    return `O maior custo agora não é perder dinheiro — é perder tempo. Cada mês sem método é um mês que seu capital não está compondo. A diferença entre CDI e uma estratégia estruturada é de ${gapPct}% em 12 meses. Parece pouco hoje, mas em 3 anos é o que separa quem construiu patrimônio de quem ficou parado.`;
  }

  if (potential === "medio") {
    if (profile === 1) {
      return `Com disciplina e método, sua renda vira patrimônio. Sem estratégia, cada mês de aporte rende menos da metade do possível. Em 12 meses isso são ${formatBRL(gap)} que ficam na mesa — quase ${rendaMonths} meses da sua renda. Você tem a capacidade, só falta o sistema.`;
    }
    return `Você já tem capacidade financeira pra construir algo sério. O que falta é direção. Sem método estruturado, cada mês de aporte rende menos da metade do possível. Em 12 meses: ${formatBRL(gap)} que ficam na mesa.`;
  }

  if (potential === "alto") {
    if (profile === 3) {
      return `Com o capital e a experiência que você já tem, cada mês operando sem assimetria é patrimônio que deixa de crescer. Em 12 meses, a diferença entre CDI e uma estratégia com opções é de ${formatBRL(gap)} — ${rendaMonths} meses da sua renda.`;
    }
    return `Sua renda te dá uma vantagem que poucos têm: capacidade de aportar com consistência. Sem método, cada aporte rende CDI. Com estratégia estruturada, o mesmo dinheiro trabalha ${gapPct}% mais forte. Em 12 meses: ${formatBRL(gap)} de diferença.`;
  }

  // Elite
  if (profile === 3) {
    return `Com o patrimônio que você construiu, cada mês sem proteção estruturada é rentabilidade que evapora. A diferença entre deixar no CDI e usar assimetria com opções: ${formatBRL(gap)} em 12 meses. Isso são ${rendaMonths} meses da sua renda — todo mês.`;
  }
  return `Seu patrimônio já é significativo. Sem uma estratégia de proteção com opções, cada mês ele rende uma fração do possível. Em 12 meses, a diferença é de ${formatBRL(gap)} — equivalente a ${rendaMonths} meses da sua renda. O capital existe, o método faz ele trabalhar.`;
}

/**
 * Label for the AGT curve, personalized by profile.
 */
export function getAgtCurveLabel(profile: ProfileType): string {
  const labels: Record<ProfileType, string> = {
    1: "Com proteção + método",
    2: "Com estratégia estruturada",
    3: "Com assimetria otimizada",
  };
  return labels[profile];
}

/* ── Helpers ──────────────────────────────────────────── */

export function formatBRL(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  }
  return `R$ ${value.toLocaleString("pt-BR")}`;
}
