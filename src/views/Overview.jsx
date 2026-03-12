import { useState } from "react";
import { NK, cardStyle, T } from "../constants";
import { fmtM } from "../utils/dataUtils";
import { Badge, Num, CovDot } from "../components/atoms";

export function Overview({ risks, onSelect, t }) {
  const ov = t.ov;
  const [drillFilter, setDrillFilter] = useState(null);

  const totalBruta = risks.reduce((s, r) => s + r.monetario, 0);
  const totalResidual = risks.reduce((s, r) => s + r.residual, 0);
  const reduccion = totalBruta > 0 ? Math.round((1 - totalResidual / totalBruta) * 100) : 0;

  const byNivel = ["ALTO", "MEDIO", "BAJO"].map((n) => {
    const rs = risks.filter((r) => r.nivel === n);
    return {
      n, count: rs.length,
      bruta: rs.reduce((s, r) => s + r.monetario, 0),
      residual: rs.reduce((s, r) => s + r.residual, 0),
      conControl: rs.filter((r) => r.tieneControl).length,
      sinControl: rs.filter((r) => !r.tieneControl).length,
    };
  });

  const equipoMap = {};
  risks.forEach((r) => {
    if (!equipoMap[r.equipo]) equipoMap[r.equipo] = {
      equipo: r.equipo, alto: 0, medio: 0, bajo: 0, bruta: 0, residual: 0, count: 0,
    };
    const e = equipoMap[r.equipo];
    e.count++; e.bruta += r.monetario; e.residual += r.residual;
    if (r.nivel === "ALTO") e.alto++;
    else if (r.nivel === "MEDIO") e.medio++;
    else e.bajo++;
  });
  const equipos = Object.values(equipoMap).sort((a, b) => b.bruta - a.bruta);
  const criticos = [...risks].filter((r) => r.score >= 12).sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI strip */}
      <div style={{ ...cardStyle, padding: "24px 28px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr",
          alignItems: "center",
        }}>
          {[
            { label: ov.activeRisks, value: risks.length, sub: ov.activeRisksSub, color: "#111827" },
            null,
            { label: ov.grossExp, value: fmtM(totalBruta), sub: ov.grossSub, color: "#B91C1C" },
            null,
            { label: ov.netExp, value: fmtM(totalResidual), sub: ov.netSub, color: "#B45309" },
            null,
            { label: ov.reduction, value: `${reduccion}%`, sub: ov.redSub, color: "#15803D" },
          ].map((item, idx) =>
            item === null
              ? <div key={idx} style={{ width: 1, height: 52, background: "#F3F4F6", margin: "0 auto" }} />
              : (
                <div key={idx} style={{ padding: "0 24px", textAlign: "center" }}>
                  <Num v={item.value} size={34} color={item.color} />
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", marginTop: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{item.sub}</div>
                </div>
              )
          )}
        </div>
      </div>

      {/* By level */}
      <div style={{ ...cardStyle, padding: "22px 28px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 18 }}>
          {ov.byLevel}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {byNivel.map(({ n, count, bruta, residual, conControl, sinControl }) => {
            const c = NK[n];
            const pct = count > 0 ? Math.round((conControl / count) * 100) : 0;
            return (
              <div key={n}
                onClick={() => setDrillFilter({ type: "nivel", value: n, label: n })}
                style={{
                  border: `1px solid ${c.border}`, borderRadius: 10,
                  padding: "16px 18px", background: c.light, cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <Badge nivel={n} t={t} />
                    <div style={{ marginTop: 10 }}>
                      <Num v={count} size={36} color={c.color} />
                      <span style={{ fontSize: 12.5, color: c.color, marginLeft: 5, fontWeight: 500 }}>{ov.risks}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>{ov.gross}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{fmtM(bruta)}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6, marginBottom: 2 }}>{ov.net}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{fmtM(residual)}</div>
                  </div>
                </div>
                <div style={{ borderBottom: "1px solid " + c.border + "55", paddingBottom: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 6 }}>
                    <span style={{ color: "#6B7280" }}>{ov.withControl} ({conControl})</span>
                    <span style={{ color: "#9CA3AF" }}>{ov.noControl} ({sinControl})</span>
                  </div>
                  <div style={{ height: 6, background: "#E5E7EB", borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c.color, borderRadius: 3, opacity: 0.7 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[[ov.withControl, conControl, "#15803D"], [ov.noControl, sinControl, "#B91C1C"]].map(([l, v, cl]) => (
                    <div key={l} style={{
                      flex: 1, background: "rgba(255,255,255,0.7)",
                      borderRadius: 7, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.06)",
                    }}>
                      <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                      <Num v={v} size={16} color={cl} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By team */}
      <div style={{ ...cardStyle, padding: "22px 28px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>{ov.byTeam}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {[ov.cols.team, ov.cols.high, ov.cols.med, ov.cols.low, ov.cols.total, ov.cols.gross, ov.cols.net, ov.cols.red].map((h) => (
                <th key={h} style={T.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipos.map((e) => {
              const red = e.bruta > 0 ? Math.round((1 - e.residual / e.bruta) * 100) : 0;
              return (
                <tr key={e.equipo}
                  onClick={() => setDrillFilter({ type: "equipo", value: e.equipo, label: e.equipo })}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = "#F0F9FF")}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                >
                  <td style={T.td}>
                    <span style={{ fontWeight: 600, color: "#1D4ED8", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                      {e.equipo}
                    </span>
                  </td>
                  {[[e.alto, "#B91C1C"], [e.medio, "#B45309"], [e.bajo, "#15803D"]].map(([v, c], i) => (
                    <td key={i} style={T.td}>
                      {v > 0 ? <Num v={v} size={16} color={c} /> : <span style={{ color: "#D1D5DB" }}>—</span>}
                    </td>
                  ))}
                  <td style={T.td}><span style={{ fontSize: 12.5, color: "#6B7280" }}>{e.count}</span></td>
                  <td style={T.td}><span style={{ fontSize: 13, color: "#374151" }}>{fmtM(e.bruta)}</span></td>
                  <td style={T.td}><span style={{ fontSize: 13, fontWeight: 600, color: "#B45309" }}>{fmtM(e.residual)}</span></td>
                  <td style={T.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 40, height: 4, background: "#E5E7EB", borderRadius: 2 }}>
                        <div style={{ width: `${red}%`, height: "100%", background: "#15803D", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>{red}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Critical risks */}
      {criticos.length > 0 && (
        <div style={{ ...cardStyle, padding: "22px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              {ov.critical}
              <span style={{ fontSize: 11.5, fontWeight: 400, color: "#9CA3AF", marginLeft: 8 }}>{ov.criticalSub}</span>
            </div>
            <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>{ov.clickDetail}</span>
          </div>
          {criticos.map((r) => {
            const cc = r.cobertura >= 60 ? "#15803D" : r.cobertura >= 40 ? "#B45309" : "#B91C1C";
            return (
              <div key={r.id} onClick={() => onSelect(r)}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid #F9FAFB", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Num v={r.score} size={20} color="#B91C1C" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", lineHeight: 1.35, marginBottom: 3 }}>
                    {r.riesgo || r.escenario || r.proceso}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#9CA3AF", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace" }}>{r.id}</span>
                    <span>{r.equipo}</span>
                    <span>·</span><span>{r.pais}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{ov.brutaLbl}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{fmtM(r.monetario)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{ov.residualLbl}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cc }}>{fmtM(r.residual)}</div>
                  </div>
                  <CovDot pct={r.cobertura} t={t} />
                </div>
                <span style={{ color: "#E5E7EB", fontSize: 14 }}>→</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Drill-down modal */}
      {drillFilter && (() => {
        const drillRisks = risks
          .filter((r) => drillFilter.type === "nivel" ? r.nivel === drillFilter.value : r.equipo === drillFilter.value)
          .sort((a, b) => b.score - a.score);
        const title = drillFilter.type === "nivel"
          ? `Riesgos ${drillFilter.label}`
          : `Equipo ${drillFilter.label}`;
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
            onClick={() => setDrillFilter(null)}
          >
            <div
              style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 780, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                    {drillRisks.length} riesgo{drillRisks.length !== 1 ? "s" : ""} · clic en fila para ficha completa
                  </div>
                </div>
                <button onClick={() => setDrillFilter(null)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: "#F9FAFB", cursor: "pointer", fontSize: 14, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
              <div style={{ overflowY: "auto", padding: "8px 24px 20px" }}>
                {drillRisks.map((r) => {
                  const c = NK[r.nivel] || NK.BAJO;
                  const cc = r.cobertura >= 60 ? "#15803D" : r.cobertura >= 40 ? "#B45309" : "#B91C1C";
                  return (
                    <div key={r.id}
                      onClick={() => { setDrillFilter(null); onSelect(r); }}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid #F9FAFB", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ width: 42, height: 42, borderRadius: 9, background: c.light, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Num v={r.score} size={18} color={c.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4, marginBottom: 4 }}>
                          {r.riesgo || r.escenario || r.proceso}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3AF" }}>{r.id}</span>
                          <Badge nivel={r.nivel} t={t} />
                          <span style={{ fontSize: 11.5, color: "#6B7280" }}>{r.equipo}</span>
                          <span style={{ color: "#D1D5DB" }}>·</span>
                          <span style={{ fontSize: 11.5, color: "#6B7280" }}>{r.pais}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0, textAlign: "right" }}>
                        <div>
                          <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>Bruta</div>
                          <div style={{ fontSize: 12.5, color: "#374151", fontWeight: 500 }}>{fmtM(r.monetario)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>Residual</div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: cc }}>{fmtM(r.residual)}</div>
                        </div>
                        <CovDot pct={r.cobertura} t={t} />
                        <span style={{ color: "#D1D5DB", fontSize: 13 }}>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
