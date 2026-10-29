export default function Badge({ tone = "neutral", children }) {
  return (
    <span className={`badge badge-${tone}`}>
      {tone !== "neutral" && <span className="badge-dot" />}
      {children}
    </span>
  );
}
