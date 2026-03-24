import { useState, useCallback, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import QuizScreen from "@/components/QuizScreen";
import TransitionScreen from "@/components/TransitionScreen";
import LeadCapture from "@/components/LeadCapture";
import ProcessingScreen from "@/components/ProcessingScreen";
import ResultScreen from "@/components/ResultScreen";
import DebugPanel from "@/components/DebugPanel";
import AnimatedBackground from "@/components/AnimatedBackground";
import { classifyProfile, classifyPotential, ProfileType, FinancialPotential, questions } from "@/data/quizData";
import { supabase } from "@/integrations/supabase/client";

type Stage = "welcome" | "quiz" | "transition" | "lead" | "processing" | "result";

interface LeadData {
  name: string;
  whatsapp: string;
  email: string;
}

/** Gera respostas fake pra simular um perfil + potencial financeiro */
function fakeAnswersForProfile(target: ProfileType, potential: FinancialPotential = "medio"): Record<number, string> {
  const scoredIds = [1, 2, 3, 7, 8, 9, 10];
  const letter = target === 1 ? "A" : target === 2 ? "B" : "C";
  const ans: Record<number, string> = {};
  scoredIds.forEach((id) => (ans[id] = letter));

  // Q4 (capital) e Q5 (renda) — controlam o potencial financeiro
  switch (potential) {
    case "elite":
      ans[4] = "D"; // 500k-1M
      ans[5] = "D"; // >20k
      break;
    case "alto":
      ans[4] = "B"; // 10k-100k
      ans[5] = "D"; // >20k
      break;
    case "medio":
      ans[4] = "A"; // <10k
      ans[5] = "B"; // ≤10k
      break;
    case "baixo":
      ans[4] = "A"; // <10k
      ans[5] = "A"; // ≤3k
      break;
  }

  // Q11 (multi-select) — simula uma seleção
  ans[11] = "A,B";
  return ans;
}

function mapAnswersToFullText(answers: Record<number, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [qIdStr, letter] of Object.entries(answers)) {
    const qId = Number(qIdStr);
    const question = questions.find((q) => q.id === qId);
    if (!question) continue;

    if (letter.includes(",")) {
      const labels = letter.split(",").map((v) => {
        const opt = question.options.find((o) => o.value === v.trim());
        return opt ? opt.label : v;
      });
      result[question.title] = labels.join(", ");
    } else {
      const option = question.options.find((o) => o.value === letter);
      result[question.title] = option ? option.label : letter;
    }
  }
  return result;
}

const Index = () => {
  const [stage, setStage] = useState<Stage>(() => {
    const savedAnswers = localStorage.getItem("quiz_answers");
    const savedLead = localStorage.getItem("quiz_lead");
    if (savedAnswers && savedLead) return "result";
    return "welcome";
  });
  const [lead, setLead] = useState<LeadData>(() => {
    const saved = localStorage.getItem("quiz_lead");
    return saved ? JSON.parse(saved) : { name: "", whatsapp: "", email: "" };
  });
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem("quiz_answers");
    return saved ? JSON.parse(saved) : {};
  });
  const [profile, setProfile] = useState<ProfileType>(() => {
    const saved = localStorage.getItem("quiz_answers");
    if (saved) return classifyProfile(JSON.parse(saved));
    return 1;
  });

  /* ── Debug Panel ─────────────────────────────────────────── */
  const [debugOpen, setDebugOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "F9") {
        e.preventDefault();
        setDebugOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleGoToStage = useCallback((target: Stage) => {
    // Se indo pro result/lead sem dados, simula perfil 2 + medio
    if (target === "result" || target === "lead") {
      const fakeAns = fakeAnswersForProfile(2, "medio");
      setAnswers(fakeAns);
      setProfile(classifyProfile(fakeAns));
      if (target === "result") {
        setLead({ name: "Teste AGT", whatsapp: "11999999999", email: "teste@agt.com" });
        localStorage.setItem("quiz_answers", JSON.stringify(fakeAns));
        localStorage.setItem("quiz_lead", JSON.stringify({ name: "Teste AGT", whatsapp: "11999999999", email: "teste@agt.com" }));
      }
    }
    if (target === "processing") {
      const fakeAns = fakeAnswersForProfile(2, "medio");
      setAnswers(fakeAns);
      setProfile(classifyProfile(fakeAns));
    }
    setStage(target);
  }, []);

  const handleSimulateProfile = useCallback((targetProfile: ProfileType, potential: FinancialPotential = "medio") => {
    const fakeAns = fakeAnswersForProfile(targetProfile, potential);
    const fakeLead = { name: "Teste AGT", whatsapp: "11999999999", email: "teste@agt.com" };
    setAnswers(fakeAns);
    setProfile(targetProfile);
    setLead(fakeLead);
    localStorage.setItem("quiz_answers", JSON.stringify(fakeAns));
    localStorage.setItem("quiz_lead", JSON.stringify(fakeLead));
    setStage("result");
  }, []);

  /* ── Quiz Flow Handlers ──────────────────────────────────── */
  const handleQuizComplete = (ans: Record<number, string>) => {
    setAnswers(ans);
    localStorage.setItem("quiz_answers", JSON.stringify(ans));
    const p = classifyProfile(ans);
    setProfile(p);
    setStage("transition");
  };

  const handleTransitionDone = useCallback(() => {
    setStage("lead");
  }, []);

  const handleLead = async (data: LeadData) => {
    setLead(data);
    localStorage.setItem("quiz_lead", JSON.stringify(data));
    setStage("processing");

    const p = classifyProfile(answers);
    const fp = classifyPotential(answers);
    const fullTextAnswers = mapAnswersToFullText(answers);

    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        answers: fullTextAnswers,
        profile_type: p,
        financial_potential: fp,
      });
      if (error) {
        console.error("[Supabase] Erro ao salvar lead:", error.message);
      } else {
        console.log("[Supabase] Lead salvo com sucesso:", data.name);
      }
    } catch (err) {
      console.error("[Supabase] Falha na conexão:", err);
    }
  };

  const handleProcessingDone = useCallback(() => {
    setStage("result");
  }, []);

  const handleRestart = useCallback(() => {
    localStorage.removeItem("quiz_answers");
    localStorage.removeItem("quiz_lead");
    setAnswers({});
    setLead({ name: "", whatsapp: "", email: "" });
    setProfile(1);
    setStage("welcome");
  }, []);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-background">
      <AnimatedBackground />

      {/* ── Stage content — floats above background ── */}
      <div className="relative z-10">
        {stage === "welcome" && <WelcomeScreen onStart={() => setStage("quiz")} />}
        {stage === "quiz" && <QuizScreen onComplete={handleQuizComplete} />}
        {stage === "transition" && <TransitionScreen onDone={handleTransitionDone} />}
        {stage === "lead" && <LeadCapture onSubmit={handleLead} profile={profile} answers={answers} />}
        {stage === "processing" && <ProcessingScreen onDone={handleProcessingDone} answers={answers} />}
        {stage === "result" && (
          <ResultScreen profile={profile} answers={answers} leadName={lead.name} onRestart={handleRestart} />
        )}
      </div>

      {/* Debug Panel — F9 toggle, invisível pro cliente */}
      <DebugPanel
        open={debugOpen}
        onClose={() => setDebugOpen(false)}
        stage={stage}
        profile={profile}
        answers={answers}
        onRestart={handleRestart}
        onGoToStage={handleGoToStage}
        onSimulateProfile={handleSimulateProfile}
      />
    </div>
  );
};

export default Index;
