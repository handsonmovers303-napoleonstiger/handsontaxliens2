import type { ButtonHTMLAttributes, ReactNode } from "react";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export function buttonClass(variant: "gold" | "ghost" | "quiet" = "ghost"): string {
  const base = `inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-medium ${focus} disabled:cursor-not-allowed disabled:opacity-50`;
  if (variant === "gold") return `${base} bg-gold text-gold-fg`;
  if (variant === "quiet") return `${base} bg-transparent px-2 text-muted`;
  return `${base} border border-line bg-bg-elev text-fg`;
}

export function Button({
  variant = "ghost",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "gold" | "ghost" | "quiet" }) {
  return <button type={type} className={`${buttonClass(variant)} ${className}`} {...props} />;
}

export function Chip({
  on,
  children,
  onClick,
}: {
  on?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex h-11 items-center px-3 text-sm ${focus} ${
        on ? "bg-gold text-gold-fg" : "border border-line bg-bg text-fg"
      }`}
    >
      {children}
    </button>
  );
}

export function LevelMark({ level }: { level: string }) {
  const tone =
    level === "opened"
      ? "text-ok"
      : level === "gap" || level === "derived" || level === "workbook"
        ? "text-subtle"
        : "text-muted";
  return <span className={`font-mono text-xs uppercase tracking-wide ${tone}`}>{level}</span>;
}
