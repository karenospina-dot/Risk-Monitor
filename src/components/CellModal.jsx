import { cellZone } from "../constants";
import { fmtM } from "../utils/dataUtils";
import { Num, CovDot } from "./atoms";

export function CellModal({ cellKey, risks, onClose, onSelectRisk, t }) {
  if (!cellKey || !risks.length) return null;
  const [p, i] = cellKey.split(",").map(Number);
  const z = cellZone(p, i);
  const cm = t.cm;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 600,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 14,
        width: 580, maxHeight: "78vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)", zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px 16px", borderBottom: "1px solid #F3F4F6",
          background: z.bg, borderRadius: "14px 14px 0 0", flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{
                fontSize: 11, color: z.accent, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3,
              }}>
                P{p} × I{i} · {cm.score} {p * i}
              </div>
              <h3 style={{
                margin: 0, fontSize: 18, fontWeight: 700, color: "#111827",
                fontFamily: "'Playfair Display',Georgia,serif",
              }}>
                {risks.length} {risks.length === 1 ? cm.risk : cm.risks} {cm.inCell}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, background: "rgba(0,0,0,0.06)",
                border: "none", cursor: "pointer", fontSize: 16, color: "#6B7280",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Risk list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {risks.map((r, idx) => {
            const cc = r.cobertura >= 60 ? "#15803D" : r.cobertura >= 40 ? "#B45309" : "#B91C1C";
            return (
              <div
                key={r.id}
                onClick={() => { onClose(); onSelectRisk(r); }}
                style={{ padding: "13px 22px", cursor: "pointer", borderBottom: "1px solid #F9FAFB" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, background: z.bg,
                    border: `1px solid ${z.border}`, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: z.accent,
                      fontFamily: "'Playfair Display',Georgia,serif",
                    }}>
                      {idx + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", lineHeight: 1.35, marginBottom: 3 }}>
                      {r.riesgo || r.escenario || r.proceso}
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 11.5, color: "#6B7280", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontFamily: "monospace", color: "#9CA3AF" }}>{r.id}</span>
                      <span>{r.equipo}</span>
                      <span>·</span>
                      <CovDot pct={r.cobertura} t={t} />
                      <span>·</span>
                      <span style={{ color: "#374151" }}>
                        {fmtM(r.monetario)}
                        <span style={{ color: "#9CA3AF" }}> → </span>
                        <span style={{ color: cc, fontWeight: 600 }}>{fmtM(r.residual)}</span>
                      </span>
                    </div>
                  </div>
                  <span style={{ color: "#D1D5DB", fontSize: 14, flexShrink: 0 }}>→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 22px", borderTop: "1px solid #F3F4F6",
          background: "#F9FAFB", borderRadius: "0 0 14px 14px",
          display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280",
          flexShrink: 0,
        }}>
          <span>
            {cm.bruta}: <b style={{ color: "#111827" }}>{fmtM(risks.reduce((s, r) => s + r.monetario, 0))}</b>
            {" · "}{cm.residual}: <b style={{ color: "#B45309" }}>{fmtM(risks.reduce((s, r) => s + r.residual, 0))}</b>
          </span>
          <span style={{ color: "#9CA3AF" }}>{cm.clickFicha}</span>
        </div>
      </div>
    </div>
  );
}
