export default function StatusBanner({ tone = "pending", children }) {
  return <div className={`banner ${tone}`}>{children}</div>;
}
