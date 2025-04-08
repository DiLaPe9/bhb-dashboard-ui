export function Select({ value, onValueChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="border px-3 py-2 rounded"
    >
      {children}
    </select>
  );
}
export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
export function SelectTrigger({ children }) {
  return <>{children}</>;
}
export function SelectValue({ placeholder }) {
  return <option disabled>{placeholder}</option>;
}
export function SelectContent({ children }) {
  return <>{children}</>;
}