/** Compact AGT logo — LOGO TEXTO PRETO (A preto, G vermelho, T preto) */
export function AGTLogo({ className, size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const h = size === "md" ? "h-10 sm:h-12" : "h-7 sm:h-8";
  return (
    <img
      src="/images/logo-agt.png"
      alt="AGT"
      className={`${h} object-contain ${className ?? ""}`}
    />
  );
}

/** Full AGT logo — LOGO TEXTO BRANCO (A preto, G vermelho, T preto + "A GRANDE TACADA") */
export function AGTLogoFull({ className }: { className?: string }) {
  return (
    <img
      src="/images/logo-agt-full.png"
      alt="AGT — A Grande Tacada"
      className={`h-16 sm:h-20 object-contain ${className ?? ""}`}
    />
  );
}
