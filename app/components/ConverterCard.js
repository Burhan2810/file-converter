"use client";

export default function ConverterCard({
  icon,
  title,
  description,
  badge,
  gradient,
  accentColor,
  active,
  onClick,
}) {
  return (
    <div
      className={`converter-card${active ? " active" : ""}`}
      style={{
        "--card-gradient": gradient,
        "--card-accent": accentColor,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {badge && <span className="badge">{badge}</span>}
    </div>
  );
}
