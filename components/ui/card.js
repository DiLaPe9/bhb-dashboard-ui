export function Card({ children, className }) {
  return <div className={`rounded border bg-white shadow ${className}`}>{children}</div>;
}
export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}