/**
 * Micro-reward sound effects via Web Audio API.
 * Zero external files — sons gerados matematicamente.
 * Volume baixo e elegante. Fail-safe: se áudio não funcionar, falha silenciosamente.
 */

let ctx: AudioContext | null = null;

/** Cria/resume AudioContext sob demanda (exige user gesture no browser) */
function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

/** Helper: toca uma nota com envelope suave */
function playTone(
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = "sine",
  delayMs = 0
) {
  const audio = getCtx();
  if (!audio) return;

  const startTime = audio.currentTime + delayMs / 1000;

  const osc = audio.createOscillator();
  const gainNode = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Envelope suave: attack rápido, decay natural
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.008); // 8ms attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // decay

  osc.connect(gainNode);
  gainNode.connect(audio.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Pop suave — a cada resposta selecionada.
 * Onda senoidal breve, como um "click" satisfatório.
 */
export function playPop() {
  playTone(880, 0.06, 0.08, "sine");
  // Harmônica sutil pra dar "corpo"
  playTone(1320, 0.04, 0.03, "sine", 5);
}

/**
 * Milestone — perguntas 6 e 9.
 * Dois tons ascendentes rápidos, sensação de "level up".
 */
export function playMilestone() {
  playTone(660, 0.1, 0.09, "sine");
  playTone(990, 0.12, 0.09, "sine", 100);
  // Brilho sutil no segundo tom
  playTone(1980, 0.08, 0.025, "sine", 110);
}

/**
 * Toggle — multi-select (Q11).
 * Click curtíssimo, quase imperceptível.
 */
export function playToggle() {
  playTone(1100, 0.03, 0.05, "sine");
}

/**
 * Reveal — revelação do resultado.
 * Acorde ascendente em 3 notas: sensação de "ta-da!", celebração contida.
 */
export function playReveal() {
  playTone(523, 0.15, 0.09, "sine");       // C5
  playTone(659, 0.15, 0.09, "sine", 120);  // E5
  playTone(784, 0.25, 0.10, "sine", 240);  // G5 (mais longo, resolve)
  // Brilho na oitava
  playTone(1568, 0.15, 0.03, "sine", 260);
}

/**
 * Inicializa o AudioContext (chamar em qualquer user gesture antes de precisar dos sons).
 * Não é obrigatório — getCtx() faz lazy init — mas garante que está pronto.
 */
export function initAudio() {
  getCtx();
}
