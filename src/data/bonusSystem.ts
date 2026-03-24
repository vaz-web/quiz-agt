import { ProfileType, FinancialPotential, classifyPotential } from "@/data/quizData";

/* ── Bonus Definitions ────────────────────────────────────── */

export interface BonusMetadata {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  tierColor: string;
  qualification: string;
}

export const bonusMetadata: Record<string, BonusMetadata> = {
  bonus_1: {
    id: "bonus_1",
    title: "Os 3 Erros Que Custam Caro a Investidores Iniciantes",
    description:
      "Vídeo exclusivo revelando os 3 erros que custam mais caro — e como evitá-los desde o começo.",
    icon: "🎯",
    tier: "bronze",
    tierColor: "#CD7F32",
    qualification: "Todos que responderam o quiz",
  },
  bonus_2: {
    id: "bonus_2",
    title: "Aula Exclusiva: A Regra dos 10 Tiros",
    description:
      "A estratégia que transforma a bolsa em uma operação com risco controlado — erre 7, acerte 3, lucre no total.",
    icon: "🎲",
    tier: "silver",
    tierColor: "#C0C0C0",
    qualification:
      "Investidores com patrimônio significativo ou renda forte (70% dos leads)",
  },
  bonus_3: {
    id: "bonus_3",
    title: "Sessão Estratégica 1-a-1 com Especialista",
    description:
      "Consultoria privada pra estruturar sua estratégia de investimento personalizada — apenas 15-20% dos leads.",
    icon: "👑",
    tier: "gold",
    tierColor: "#FFD700",
    qualification: "Apenas para high-value prospects (potencial alto ou elite)",
  },
};

/* ── Bonus Calculation Logic ────────────────────────────────── */

/**
 * Calculate which bonuses a lead qualifies for based on their quiz answers.
 *
 * Bonus 1: Everyone qualifies (answered patrimônio + renda questions)
 * Bonus 2: patrimônio > 10k (Q4 >= "B") OR renda > 3k (Q5 >= "B") OR investment experience (Q3 >= "B")
 * Bonus 3: Only financial potential "alto" or "elite"
 *
 * @param answers - Record of question ID to answer value (e.g., { 3: "B", 4: "C", 5: "B" })
 * @returns Array of bonus IDs the lead qualifies for
 */
export function calculateBonuses(answers: Record<number, string>): string[] {
  const bonuses: string[] = [];

  // Bonus 1: Always qualifies (answered Q4 and Q5)
  const hasPatrimonio = answers[4];
  const hasRenda = answers[5];
  if (hasPatrimonio && hasRenda) {
    bonuses.push("bonus_1");
  }

  // Bonus 2: patrimônio > 10k (B+) OR renda > 3k (B+) OR experience (B+)
  const experience = answers[3];
  const patrimonio = answers[4];
  const renda = answers[5];

  const hasGoodExperience = experience && experience >= "B"; // B or C
  const hasGoodPatrimonio = patrimonio && patrimonio >= "B"; // B, C, D, E
  const hasGoodRenda = renda && renda >= "B"; // B, C, D

  if (hasGoodExperience || hasGoodPatrimonio || hasGoodRenda) {
    bonuses.push("bonus_2");
  }

  // Bonus 3: Only alto or elite potential
  const potential = classifyPotential(answers);
  if (potential === "alto" || potential === "elite") {
    bonuses.push("bonus_3");
  }

  return bonuses;
}

/* ── Bonus Code Generation ──────────────────────────────────── */

/**
 * Generate a formatted bonus code for the lead.
 *
 * Format: AGT-{PERFIL}-{POTENCIAL}-B{BÔNUS}-{LEAD_ID}
 *
 * Profile encoding:
 *   1 → "C" (Conservative)
 *   2 → "M" (Moderate)
 *   3 → "A" (Aggressive)
 *
 * Potential encoding:
 *   "baixo" → "BX"
 *   "medio" → "MD"
 *   "alto" → "AL"
 *   "elite" → "EL"
 *
 * Bonuses encoding (count of bonuses):
 *   ["bonus_1"] → "B1"
 *   ["bonus_1", "bonus_2"] → "B12"
 *   ["bonus_1", "bonus_2", "bonus_3"] → "B123"
 *
 * Example: AGT-M-AL-B12-J4K9X2
 *
 * @param profile - Profile type (1, 2, or 3)
 * @param potential - Financial potential classification
 * @param bonuses - Array of bonus IDs the lead qualifies for
 * @param leadShortId - Short ID for the lead (e.g., "J4K9X2")
 * @returns Formatted bonus code string
 */
export function generateBonusCode(
  profile: ProfileType,
  potential: FinancialPotential,
  bonuses: string[],
  leadShortId: string
): string {
  // Encode profile
  const profileMap: Record<ProfileType, string> = {
    1: "C",
    2: "M",
    3: "A",
  };
  const profileCode = profileMap[profile];

  // Encode potential
  const potentialMap: Record<FinancialPotential, string> = {
    baixo: "BX",
    medio: "MD",
    alto: "AL",
    elite: "EL",
  };
  const potentialCode = potentialMap[potential];

  // Encode bonuses (count and order)
  // Extract bonus numbers: bonus_1, bonus_2, bonus_3 → 1, 2, 3
  const bonusNumbers = bonuses
    .map((b) => b.replace("bonus_", ""))
    .sort()
    .join("");

  const bonusCode = `B${bonusNumbers}`;

  // Assemble final code
  return `AGT-${profileCode}-${potentialCode}-${bonusCode}-${leadShortId}`;
}

/* ── Export Types ───────────────────────────────────────────── */
export type { BonusMetadata };
