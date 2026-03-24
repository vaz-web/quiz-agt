/** Compact AGT logo — uses the full brand logo image */
export function AGTLogo({ className, size = "sm" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const heights: Record<string, string> = {
    sm: "h-7 sm:h-8",
    md: "h-10 sm:h-12",
    lg: "h-16 sm:h-20",
  };
  return (
    <img
      src="/images/logo-agt-full.png"
      alt="AGT — A Grande Tacada"
      className={`${heights[size]} object-contain ${className ?? ""}`}
    />
  );
}

/** Full AGT logo — same image, larger size */
export function AGTLogoFull({ className }: { className?: string }) {
  return (
    <img
      src="/images/logo-agt-full.png"
      alt="AGT — A Grande Tacada"
      className={`h-16 sm:h-20 object-contain ${className ?? ""}`}
    />
  );
}
