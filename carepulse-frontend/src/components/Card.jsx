export default function Card({ icon, title, subtitle, right, children }) {
  const hasHeader = icon || title || right;

  return (
    <section className="card">
      {hasHeader && (
        <div className="card-header">
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {icon && <div className="card-icon">{icon}</div>}
            {(title || subtitle) && (
              <div>
                {title && <h2>{title}</h2>}
                {subtitle && <p>{subtitle}</p>}
              </div>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
