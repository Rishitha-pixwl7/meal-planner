export default function CuisineFilter({ cuisines, value, onChange }: { cuisines: string[]; value: string; onChange: (c: string) => void }) {
  if (cuisines.length < 2) return null;
  return (
    <div className="filters" role="group" aria-label="Filter by cuisine">
      {["All", ...cuisines].map((c) => (
        <button key={c} type="button" className="filter-chip" aria-pressed={value === c} onClick={() => onChange(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}
