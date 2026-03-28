type Props = { name: string; className?: string; fill?: boolean };

/** Google Material Symbols Outlined — wymaga linku fontów w layout.tsx */
export function MaterialIcon({ name, className = "", fill = false }: Props) {
  return (
    <span
      className={`material-symbols-outlined align-middle ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden
    >
      {name}
    </span>
  );
}
