import { useState, useRef, useEffect } from "react";

const COLORS = {
  NEW: { bg: "#fae9df", color: "#bf552c", border: "#e8a17a" },
  IN_PROGRESS: { bg: "#e3f1f0", color: "#0b5f5e", border: "#8ec5c3" },
  COMPLETED: { bg: "#e2f5ec", color: "#1a7a4f", border: "#7ecfa8" },
  CANCELLED: { bg: "#f0f0f0", color: "#6c807e", border: "#c8cece" },
};

export default function StatusBadge({ value, options, labels, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const c = COLORS[value] || COLORS.NEW;

  return (
    <div className="status-badge" ref={ref}>
      <button
        className="status-badge__current"
        style={{ background: c.bg, color: c.color, borderColor: c.border }}
        onClick={() => setOpen(!open)}
      >
        <span className="status-badge__dot" style={{ background: c.color }} />
        {labels[value]}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 4 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="status-badge__dropdown">
          {options.map((s) => {
            const sc = COLORS[s] || COLORS.NEW;
            return (
              <button
                key={s}
                className={"status-badge__option" + (s === value ? " is-active" : "")}
                style={{ color: sc.color }}
                onClick={() => { onChange(s); setOpen(false); }}
              >
                <span className="status-badge__dot" style={{ background: sc.color }} />
                {labels[s]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
