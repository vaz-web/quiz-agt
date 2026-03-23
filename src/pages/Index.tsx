import { useState, useCallback, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import QuizScreen from "@/components/QuizScreen";
import TransitionScreen from "@/components/TransitionScreen";
import LeadCapture from "@/components/LeadCapture";
import ProcessingScreen from "@/components/ProcessingScreen";
import ResultScreen from "@/components/ResultScreen";
import DebugPanel from "@/components/DebugPanel";
import { classifyProfile, ProfileType, questions } from "@/data/quizData";
import { supabase } from "@/integrations/supabase/client";

type Stage = "welcome" | "quiz" | "transition" | "lead" | "processing" | "result";

interface LeadData {
  name: string;
  whatsapp: string;
  email: string;
}

/** Gera respostas fake (tudo A) pra simular um perfil rápido */
function fakeAnswersForProfile(target: ProfileType): Record<number, string> {
  const scoredIds = [1, 2, 3, 4, 5, 7, 8, 9, 10];
  const letter = target === 1 ? "A" : target === 2 ? "B" : "C";
  const ans: Record<number, string> = {};
  scoredIds.forEach((id) => (ans[id] = letter));
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
    // Se indo pro result sem dados, simula perfil 2
    if (target === "result") {
      const fakeAns = fakeAnswersForProfile(2);
      setAnswers(fakeAns);
      setProfile(classifyProfile(fakeAns));
      setLead({ name: "Teste AGT", whatsapp: "11999999999", email: "teste@agt.com" });
      localStorage.setItem("quiz_answers", JSON.stringify(fakeAns));
      localStorage.setItem("quiz_lead", JSON.stringify({ name: "Teste AGT", whatsapp: "11999999999", email: "teste@agt.com" }));
    }
    if (target === "processing") {
      const fakeAns = fakeAnswersForProfile(2);
      setAnswers(fakeAns);
      setProfile(classifyProfile(fakeAns));
    }
    setStage(target);
  }, []);

  const handleSimulateProfile = useCallback((targetProfile: ProfileType) => {
    const fakeAns = fakeAnswersForProfile(targetProfile);
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
    const fullTextAnswers = mapAnswersToFullText(answers);

    await supabase.from("leads").insert({
      name: data.name,
      whatsapp: data.whatsapp,
      email: data.email,
      answers: fullTextAnswers,
      profile_type: p,
    });
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
    <div className="relative min-h-[100svh] overflow-hidden bg-[#050507]">
      {/* ── Persistent background — trading desk photo across ALL stages ── */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/bg-trading.png')",
          filter: "blur(3px)",
        }}
      />
      {/* Black translucent overlay */}
      <div className="fixed inset-0 bg-black/80" />

      {/* ── Stage content — floats above background ── */}
      <div className="relative z-10">
        {stage === "welcome" && <WelcomeScreen onStart={() => setStage("quiz")} />}
        {stage === "quiz" && <QuizScreen onComplete={handleQuizComplete} />}
        {stage === "transition" && <TransitionScreen onDone={handleTransitionDone} />}
        {stage === "lead" && <LeadCapture onSubmit={handleLead} />}
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
