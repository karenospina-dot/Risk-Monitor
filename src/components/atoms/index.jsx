import { NK } from "../../constants";

export const Badge = ({ nivel, t }) => {
  const c = NK[nivel] || NK.BAJO;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: c.color, background: c.light, border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
      {t.levels[nivel] || nivel}
    </span>
  );
};

export const Num = ({ v, size = 32, color = "#111827" }) => (
  <span style={{
    fontSize: size, fontWeight: 700, color, lineHeight: 1,
    fontFamily: "'Playfair Display',Georgia,serif",
  }}>
    {v}
  </span>
);

export const CovDot = ({ pct, t }) => {
  const color = pct >= 60 ? "#15803D" : pct >= 40 ? "#B45309" : "#B91C1C";
  const label = pct >= 60 ? t.ctrl.effective : pct >= 40 ? t.ctrl.partial : t.ctrl.none;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ color, fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#9CA3AF" }}>{pct}%</span>
    </span>
  );
};

export const FieldBlock = ({ label, value }) =>
  !value ? null : (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#6B7280", marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 13, color: "#374151", lineHeight: 1.7, background: "#F9FAFB",
        borderRadius: 8, padding: "10px 14px", borderLeft: "3px solid #E5E7EB",
      }}>
        {value}
      </div>
    </div>
  );

export function TranslationBanner({ state, t }) {
  if (state === "idle" || state === "done") return null;
  const isError = state === "error";
  const bg = isError ? "#FEF2F2" : "#EFF6FF";
  const border = isError ? "#FECACA" : "#BFDBFE";
  const color = isError ? "#B91C1C" : "#1D4ED8";
  const text = isError ? t.translationError : t.translating;
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 8,
      padding: "10px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
    }}>
      {!isError && (
        <div style={{
          width: 16, height: 16, border: "2px solid #BFDBFE",
          borderTop: "2px solid #1D4ED8", borderRadius: "50%",
          animation: "spin .7s linear infinite", flexShrink: 0,
        }} />
      )}
      <span style={{ fontSize: 13, color, fontWeight: 500 }}>{text}</span>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20, background: "#F9FAFB",
    }}>
      <style>{`
        @keyframes dot-bounce {
          0%,80%,100%{transform:scale(0.6);opacity:0.3}
          40%{transform:scale(1);opacity:1}
        }
      `}</style>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: "50%",
            background: "#00C4B4",
            animation: "dot-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

export function ErrorScreen({ msg, onRetry }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
      background: "#F9FAFB", padding: 32, textAlign: "center",
    }}>
      <div style={{ fontSize: 36 }}>⚠️</div>
      <p style={{ fontWeight: 700, color: "#B91C1C", fontSize: 15, margin: 0 }}>
        No se pudo cargar la hoja
      </p>
      <p style={{ fontSize: 13, color: "#6B7280", maxWidth: 400, lineHeight: 1.7, margin: 0 }}>
        {msg}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "9px 22px", background: "#1D4ED8", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer",
          fontWeight: 600, fontSize: 13, fontFamily: "inherit",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
