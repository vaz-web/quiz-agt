/**
 * Painel de debug secreto — ativado com F9.
 * Invisível para o cliente. Permite:
 * - Reiniciar quiz
 * - Pular para qualquer tela
 * - Simular resultado de qualquer perfil + potencial financeiro
 * - Ver estado atual (stage, respostas, perfil, potencial)
 */
import { useState, useEffect, useCallback } from "react";
import { X, RotateCcw, Eye, Zap, Shield, Target, Monitor, DollarSign } from "lucide-react";
import { ProfileType, FinancialPotential, classifyPotential } from "@/data/quizData";

type Stage = "welcome" | "quiz" | "transition" | "lead" | "processing" | "result";

interface DebugPanelProps {
  open: boolean;
  onClose: () => void;
  stage: Stage;
  profile: ProfileType;
  answers: Record<number, string>;
  onRestart: () => void;
  onGoToStage: (stage: Stage) => void;
  onSimulateProfile: (profile: ProfileType, potential: FinancialPotential) => void;
}

const stages: { value: Stage; label: string; icon: string }[] = [
  { value: "welcome", label: "Welcome", icon: "🏠" },
  { value: "quiz", label: "Quiz", icon: "❓" },
  { value: "transition", label: "Transition", icon: "⏳" },
  { value: "lead", label: "Lead Capture", icon: "📋" },
  { value: "processing", label: "Processing", icon: "⚙️" },
  { value: "result", label: "Resultado", icon: "📊" },
];

const profileInfo: { value: ProfileType; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 1, label: "Iniciante Estratégico", color: "text-blue-400 border-blue-500/40 bg-blue-500/10", icon: <Shield className="h-4 w-4" /> },
  { value: 2, label: "Operador em Construção", color: "text-orange-400 border-orange-500/40 bg-orange-500/10", icon: <Target className="h-4 w-4" /> },
  { value: 3, label: "Multiplicador", color: "text-red-400 border-red-500/40 bg-red-500/10", icon: <Zap className="h-4 w-4" /> },
];

const potentialInfo: { value: FinancialPotential; label: string; color: string }[] = [
  { value: "baixo", label: "Baixo", color: "text-gray-400 border-gray-500/40 bg-gray-500/10" },
  { value: "medio", label: "Médio", color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10" },
  { value: "alto", label: "Alto", color: "text-green-400 border-green-500/40 bg-green-500/10" },
  { value: "elite", label: "Elite", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
];

export default function DebugPanel({
  open,
  onClose,
  stage,
  profile,
  answers,
  onRestart,
  onGoToStage,
  onSimulateProfile,
}: DebugPanelProps) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(1);
  const [selectedPotential, setSelectedPotential] = useState<FinancialPotential>("medio");

  // ESC fecha
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!open) return null;

  const answeredCount = Object.keys(answers).length;
  const currentPotential = answeredCount > 0 ? classifyPotential(answers) : "—";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-[#E02020]/30 bg-[#0c0e14]/95 backdrop-blur-xl shadow-2xl shadow-[#E02020]/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Monitor className="h-4 w-4 text-[#E02020]" />
            <span className="text-sm font-bold text-white tracking-wide">DEBUG PANEL</span>
            <span className="text-[10px] text-white/30 font-mono">F9</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status bar */}
        <div className="px-5 py-3 bg-white/[0.03] border-b border-white/5">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono">
            <span className="text-white/40">
              stage: <span className="text-[#E02020]">{stage}</span>
            </span>
            <span className="text-white/40">
              perfil: <span className="text-[#E02020]">{profile}</span>
            </span>
            <span className="text-white/40">
              potencial: <span className="text-[#E02020]">{currentPotential}</span>
            </span>
            <span className="text-white/40">
              respostas: <span className="text-[#E02020]">{answeredCount}/10</span>
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Quick Actions */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">Ações Rápidas</p>
            <button
              onClick={() => { onRestart(); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-colors text-left group"
            >
              <RotateCcw className="h-4 w-4 text-[#E02020] group-hover:rotate-[-180deg] transition-transform duration-300" />
              <div>
                <span className="text-sm font-medium text-white">Reiniciar Quiz</span>
                <p className="text-[10px] text-white/35">Limpa tudo e volta pro Welcome</p>
              </div>
            </button>
          </div>

          {/* Jump to Stage */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">Ir para Tela</p>
            <div className="grid grid-cols-3 gap-2">
              {stages.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { onGoToStage(s.value); onClose(); }}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border transition-all text-center ${
                    stage === s.value
                      ? "border-[#E02020]/50 bg-[#E02020]/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-[10px] font-medium leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simulate Profile + Potential Result */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">Simular Resultado</p>

            {/* Profile selector */}
            <p className="text-[10px] text-white/50 mb-1.5">Perfil:</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {profileInfo.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedProfile(p.value)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-all text-center ${
                    selectedProfile === p.value
                      ? p.color + " ring-1 ring-white/20"
                      : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06]"
                  }`}
                >
                  {p.icon}
                  <span className="text-[10px] font-medium leading-tight">P{p.value}</span>
                </button>
              ))}
            </div>

            {/* Potential selector */}
            <p className="text-[10px] text-white/50 mb-1.5">Potencial Financeiro:</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {potentialInfo.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setSelectedPotential(pt.value)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-all text-center ${
                    selectedPotential === pt.value
                      ? pt.color + " ring-1 ring-white/20"
                      : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06]"
                  }`}
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium leading-tight">{pt.label}</span>
                </button>
              ))}
            </div>

            {/* Go button */}
            <button
              onClick={() => { onSimulateProfile(selectedProfile, selectedPotential); onClose(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#E02020]/40 bg-[#E02020]/10 hover:bg-[#E02020]/20 transition-all text-sm font-semibold text-[#E02020]"
            >
              <Eye className="h-4 w-4" />
              Ver P{selectedProfile} + {selectedPotential.charAt(0).toUpperCase() + selectedPotential.slice(1)}
            </button>
          </div>

          {/* Current Answers (collapsible) */}
          {answeredCount > 0 && (
            <details className="group">
              <summary className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2 cursor-pointer hover:text-white/50 transition-colors list-none flex items-center gap-1">
                <span className="text-white/20 group-open:rotate-90 transition-transform">▶</span>
                Respostas Atuais ({answeredCount})
              </summary>
              <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 font-mono text-[10px] text-white/50 space-y-0.5 max-h-32 overflow-y-auto">
                {Object.entries(answers).map(([qId, val]) => (
                  <div key={qId}>
                    Q{qId}: <span className="text-[#E02020]">{val}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02]">
          <p className="text-[9px] text-white/20 text-center font-mono">
            ESC ou F9 para fechar · Invisível para o cliente
          </p>
        </div>
      </div>
    </div>
  );
}
