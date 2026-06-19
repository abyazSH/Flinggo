const MODES = [
  { id: "llama",   label: "Llama 3",      icon: "🦙" },
  { id: "gemma",   label: "Gemma 3",      icon: "💎" },
  { id: "compare", label: "Compare Both", icon: "⚖️" },
];

export default function ModelToggle({ mode, onChange }) {
  return (
    <div className="join">
      {MODES.map((m) => (
        <button
          key={m.id}
          className={`join-item btn btn-sm text-xs ${
            mode === m.id ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => onChange(m.id)}
        >
          <span>{m.icon}</span>
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
