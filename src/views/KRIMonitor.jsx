import { NK, cardStyle } from "../constants";
import { fmtM } from "../utils/dataUtils";
import { Badge, Num } from "../components/atoms";

function KCard({ r, onSelect, t }) {
  const c = NK[r.nivel] || NK.BAJO;
  const cc = r.cobertura >= 60 ? "#15803D" : r.cobertura >= 40 ? "#B45309" : "#B91C1C";
  const k = t.kri;
  return (
    <div
      onClick={() => onSelect(r)}
      style={{ ...cardStyle, borderTop: `3px solid ${c.color}`, padding: "18px 20px", cursor: "pointer", transition: "all .15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = cardStyle.boxShadow; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4, fontFamily: "monospace" }}>
            {r.id} · {r.pais}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
            {r.area || r.equipo}
          </div>
        </div>
        <Badge nivel={r.nivel} t={t} />
      </div>
      <p style={{ fontSize: 12.5, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.6, minHeight: 36 }}>
        {r.kpi || r.control || k.kpiPending}
      </p>
      <div style={{ height: 4, background: "#F3F4F6", borderRadius: 3, marginBottom: 10 }}>
        <div style={{ width: `${r.cobertura}%`, height: "100%", background: cc, borderRadius: 3 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "#F9FAFB", borderRadius: 7, padding: "8px 10px" }}>
          <div style={{ fontSize: 9.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.bruta}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{fmtM(r.monetario)}</div>
        </div>
        <div style={{ background: "#FFFBEB", borderRadius: 7, padding: "8px 10px" }}>
          <div style={{ fontSize: 9.5, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.residual}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: cc }}>{fmtM(r.residual)}</div>
        </div>
      </div>
    </div>
  );
}

export function KRIMonitor({ risks, onSelect, t }) {
  const k = t.kri;
  const altos = risks.filter((r) => r.nivel === "ALTO");
  const medios = risks.filter((r) => r.nivel === "MEDIO");

  return (
    <div>
      {altos.length > 0 && (
        <>
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "13px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠</span>
            <div>
              <p style={{ fontWeight: 700, color: "#B91C1C", fontSize: 13.5, margin: 0 }}>
                {k.alertBanner(altos.length)}
              </p>
              <p style={{ fontSize: 12, color: "#DC2626", margin: "2px 0 0" }}>
                {k.alertSub(fmtM(altos.reduce((s, r) => s + r.residual, 0)))}
              </p>
            </div>
          </div>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: "#B91C1C", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            {k.highTitle}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
            {altos.map((r) => <KCard key={r.id} r={r} onSelect={onSelect} t={t} />)}
          </div>
        </>
      )}
      {medios.length > 0 && (
        <>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: "#B45309", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            {k.medTitle}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {medios.map((r) => <KCard key={r.id} r={r} onSelect={onSelect} t={t} />)}
          </div>
        </>
      )}
      {!altos.length && !medios.length && (
        <div style={{ ...cardStyle, textAlign: "center", padding: 56, color: "#9CA3AF" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>{k.empty}</p>
        </div>
      )}
    </div>
  );
}
