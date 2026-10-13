import React from "react";

const VARIANT = {
  primary: "",
  secondary: "quiet",
  ghost: "ghost",
  outline: "outline",
  destructive: "danger",
  success: "ok",
  icon: "icon",
};
const SIZE = { sm: "sm", md: "", lg: "lg", icon: "icon" };

export function buttonClass({ variant, size, pressed, loading, fullWidth, className = "" } = {}) {
  const hasBtn = /(^|\s)btn(\s|$)/.test(className);
  if (!variant && !hasBtn) return className;
  const parts = ["btn"];
  if (variant && VARIANT[variant]) parts.push(VARIANT[variant]);
  if (size && SIZE[size]) parts.push(SIZE[size]);
  if (pressed) parts.push("on");
  if (loading) parts.push("is-loading");
  if (fullWidth) parts.push("block");
  for (const token of String(className).split(/\s+/)) {
    if (!token || token === "btn" || parts.includes(token)) continue;
    parts.push(token);
  }
  return parts.join(" ");
}

export function cardClass({ variant = "default", clickable = false, className = "" } = {}) {
  const row = /(^|\s)(list-item|mkt-card|mnode)(\s|$)/.test(className);
  return [
    row ? "" : "icard",
    !row && variant && variant !== "default" ? variant : "",
    clickable ? "is-click" : "",
    className,
  ].filter(Boolean).join(" ");
}

/** One button for the product. Existing class names still work. New call sites should pass variant and size. */
export function Button({
  variant,
  size,
  pressed = false,
  loading = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  tooltip,
  href,
  className = "",
  children,
  disabled = false,
  type,
  title,
  ...rest
}) {
  const cls = buttonClass({ variant, size, pressed, loading, fullWidth, className });
  const off = disabled || loading;
  const label = tooltip || title;
  const shared = {
    className: cls,
    title: label,
    "aria-busy": loading || undefined,
    "aria-disabled": off || undefined,
    ...rest,
  };
  const body = (
    <>
      {loading ? <span className="btn-spin" aria-hidden="true" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </>
  );
  if (href) {
    return <a href={off ? undefined : href} {...shared} aria-label={rest["aria-label"] || (children ? undefined : label)}>{body}</a>;
  }
  return (
    <button type={type} disabled={off} {...shared} aria-label={rest["aria-label"] || (children ? undefined : label)}>
      {body}
    </button>
  );
}

/** One clickable panel. Nested buttons, links, and fields keep their own clicks. */
export function InteractiveCard({
  variant = "default",
  title,
  subtitle,
  badge,
  image,
  icon,
  actions,
  source,
  meta,
  onClick,
  disabled = false,
  className = "",
  children,
  type: _type,
  ...rest
}) {
  const clickable = typeof onClick === "function" && !disabled && variant !== "disabled";
  const onKeyDown = (e) => {
    if (!clickable || e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  };
  return (
    <article
      className={cardClass({ variant: disabled ? "disabled" : variant, clickable, className })}
      onClick={clickable ? (e) => {
        if (e.target.closest("button, a, input, textarea, select, label")) return;
        onClick(e);
      } : undefined}
      onKeyDown={clickable ? onKeyDown : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-disabled={disabled || variant === "disabled" || undefined}
      {...rest}
    >
      {image}
      {(icon || title || subtitle || badge) && (
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          {icon}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && <div className="icard-title">{title}</div>}
            {subtitle && <div className="icard-sub">{subtitle}</div>}
          </div>
          {badge}
        </div>
      )}
      {meta}
      {children}
      {source && <div className="icard-source">{source}</div>}
      {actions && <div className="row wrap icard-actions">{actions}</div>}
    </article>
  );
}
