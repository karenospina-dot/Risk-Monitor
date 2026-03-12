import { NK } from "../constants";
import { fmtM } from "../utils/dataUtils";
import { Badge, Num, FieldBlock } from "./atoms";

export function Drawer({ risk, onClose, t }) {
  if (!risk) return null;
  const c = NK[risk.nivel] || NK.BAJO;
  const cc = risk.cobertura >= 60 ? "#15803D" : risk.cobertura >= 40 ? "#B45309" : "#B91C1C";
  const dr = t.dr;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex" }}>
      <div
        style={{ flex: 1, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      <div style={{ width: 520, background: "#fff", overflowY: "auto", boxShadow: "-12px 0 40px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{
          padding: "22px 26px 18px", borderBottom: "1px solid #F3F4F6",
          background: c.light, position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ flex: 1, paddingRight: 16, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 5, display: "flex", gap: 8 }}>
                <span style={{ fontFamily: "monospace" }}>{risk.id}</span>
                <span>·</span><span>{risk.pais}</span>
              </div>
              <h2 style={{
                margin: 0, fontSize: 17, fontWeight: 700, color: "#111827",
                lineHeight: 1.4, fontFamily: "'Playfair Display',Georgia,serif",
              }}>
                {risk.riesgo || risk.escenario || risk.proceso}
              </h2>
              {risk.escenario && risk.riesgo && risk.escenario !== risk.riesgo && (
                <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>
                  {risk.escenario}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 7, background: "rgba(0,0,0,0.06)",
                border: "none", cursor: "pointer", fontSize: 15, color: "#6B7280",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Badge nivel={risk.nivel} t={t} />
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px",
              borderRadius: 20, fontSize: 11, fontWeight: 600, color: c.color,
              background: "rgba(0,0,0,0.04)", border: "1px solid " + c.border,
            }}>
              Score {risk.score} (P{risk.prob}×I{risk.impacto})
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px" }}>
          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              [dr.gross, fmtM(risk.monetario), "#111827"],
              [dr.net, fmtM(risk.residual), cc],
              [dr.coverage, `${risk.cobertura}%`, cc],
            ].map(([l, v, cl]) => (
              <div key={l} style={{
                background: "#F9FAFB", borderRadius: 9,
                padding: "12px 14px", border: "1px solid #E5E7EB",
              }}>
                <div style={{
                  fontSize: 20, fontWeight: 700, color: cl, lineHeight: 1,
                  fontFamily: "'Playfair Display',Georgia,serif",
                }}>
                  {v}
                </div>
                <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 5 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Coverage bar */}
          <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, marginBottom: 18 }}>
            <div style={{ width: `${risk.cobertura}%`, height: "100%", background: cc, borderRadius: 3 }} />
          </div>

          {/* Detail fields */}
          <FieldBlock label={dr.fields.tipoExp}       value={risk.tipoExp} />
          <FieldBlock label={dr.fields.consecuencias} value={risk.consecuencias} />
          <FieldBlock label={dr.fields.refNorm}       value={risk.refNorm} />
          <FieldBlock label={dr.fields.control}       value={risk.control} />
          <FieldBlock label={dr.fields.kpi}           value={risk.kpi} />
          <FieldBlock label={dr.fields.mejora}        value={risk.mejora} />
          <FieldBlock label={dr.fields.cambioCtx}     value={risk.cambioCtx} />
          <FieldBlock label={dr.fields.observaciones} value={risk.observaciones} />

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              [dr.meta.owner, risk.responsable],
              [dr.meta.form, risk.formaControl],
              [dr.meta.team, risk.equipo],
              [dr.meta.lastRev, risk.fechaRev || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{
                background: "#F9FAFB", borderRadius: 8,
                padding: "10px 12px", border: "1px solid #E5E7EB",
              }}>
                <div style={{
                  fontSize: 10, color: "#9CA3AF", textTransform: "uppercase",
                  letterSpacing: "0.07em", marginBottom: 3,
                }}>
                  {k}
                </div>
                <div style={{ fontSize: 12.5, color: "#111827", fontWeight: 600 }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
