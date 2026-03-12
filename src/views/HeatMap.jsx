import { useState, useMemo, useRef } from "react";
import { NK, cardStyle, cellZone } from "../constants";
import { fmtM } from "../utils/dataUtils";
import { Num } from "../components/atoms";
import { CellModal } from "../components/CellModal";

export function HeatMap({ risks, onSelect, t }) {
  const [hovCell, setHov] = useState(null);
  const [modalCell, setModal] = useState(null);
  const [tipPos, setTip] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const hm = t.hm;

  const grid = useMemo(() => {
    const g = {};
    for (let p = 1; p <= 4; p++) for (let i = 1; i <= 4; i++) g[`${p},${i}`] = [];
    risks.forEach((r) => {
      const k = `${r.prob},${r.impacto}`;
      if (g[k]) g[k].push(r);
    });
    return g;
  }, [risks]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
        <div style={{ ...cardStyle, padding: "22px 26px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{hm.title}</div>
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 22px" }}>{hm.sub}</p>

          <div style={{ display: "flex", gap: 0 }} ref={ref}>
            {/* Y axis label */}
            <div style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 10, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {hm.impact}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[4, 3, 2, 1].map((imp, ri) => (
                  <div key={imp} style={{ display: "flex", gap: 5 }}>
                    {/* Row label */}
                    <div style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10, flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{hm.impLabels[ri]}</div>
                        <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>({imp})</div>
                      </div>
                    </div>

                    {/* Cells */}
                    {[1, 2, 3, 4].map((prob) => {
                      const key = `${prob},${imp}`;
                      const rs = grid[key] || [];
                      const z = cellZone(prob, imp);
                      const isH = hovCell === key;
                      return (
                        <div key={prob}
                          onMouseEnter={(e) => {
                            setHov(key);
                            if (ref.current) {
                              const r = ref.current.getBoundingClientRect();
                              setTip({ x: e.clientX - r.left, y: e.clientY - r.top });
                            }
                          }}
                          onMouseMove={(e) => {
                            if (ref.current) {
                              const r = ref.current.getBoundingClientRect();
                              setTip({ x: e.clientX - r.left, y: e.clientY - r.top });
                            }
                          }}
                          onMouseLeave={() => setHov(null)}
                          onClick={() => rs.length > 0 && setModal(key)}
                          style={{
                            flex: 1, minHeight: 90, borderRadius: 9, background: z.bg,
                            border: `2px solid ${isH && rs.length ? z.accent + "55" : z.border}`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            cursor: rs.length > 0 ? "pointer" : "default",
                            transition: "all .15s", position: "relative", gap: 3,
                            boxShadow: isH && rs.length > 0 ? `0 4px 18px ${z.accent}18` : "none",
                            transform: isH && rs.length > 0 ? "scale(1.03)" : "scale(1)",
                          }}
                        >
                          <div style={{ position: "absolute", top: 5, right: 7, fontSize: 9, fontWeight: 600, color: z.accent, opacity: 0.5, fontFamily: "monospace" }}>
                            {prob * imp}
                          </div>
                          {rs.length > 0 ? (
                            <>
                              <Num v={rs.length} size={30} color={z.num} />
                              <div style={{ fontSize: 9.5, color: z.num, opacity: 0.65, fontWeight: 500 }}>
                                {rs.length === 1 ? hm.risk : hm.risks}
                              </div>
                              <div style={{ fontSize: 9, color: z.accent, opacity: 0.6 }}>
                                {fmtM(rs.reduce((s, r) => s + r.monetario, 0))}
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: 16, color: "#D1D5DB" }}>—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* X axis labels */}
              <div style={{ display: "flex", gap: 5, marginTop: 8, marginLeft: 88 }}>
                {hm.probLabels.map((l, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{l}</div>
                    <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>({i + 1})</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginLeft: 88, marginTop: 4, fontSize: 10, color: "#D1D5DB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {hm.prob}
              </div>
            </div>

            {/* Tooltip */}
            {hovCell && (grid[hovCell] || []).length > 0 && (
              <div style={{
                position: "absolute",
                left: Math.min(tipPos.x + 14, 440), top: Math.max(tipPos.y - 16, 0),
                background: "#1F2937", color: "#F9FAFB", borderRadius: 9,
                padding: "10px 13px", fontSize: 11.5, zIndex: 50,
                maxWidth: 255, pointerEvents: "none",
                boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 5 }}>
                  {(grid[hovCell] || []).length} {(grid[hovCell] || []).length === 1 ? hm.risk : hm.risks} · Score {hovCell.split(",").reduce((a, b) => parseInt(a) * parseInt(b))}
                </div>
                {(grid[hovCell] || []).slice(0, 5).map((r) => (
                  <div key={r.id} style={{ display: "flex", gap: 7, marginBottom: 4, lineHeight: 1.4 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}>{r.id}</span>
                    <span style={{ color: "#E5E7EB", fontSize: 11 }}>
                      {(r.riesgo || r.escenario || r.proceso).slice(0, 52)}
                      {(r.riesgo || r.escenario || r.proceso).length > 52 ? "…" : ""}
                    </span>
                  </div>
                ))}
                {(grid[hovCell] || []).length > 5 && (
                  <div style={{ color: "#9CA3AF", fontSize: 10.5, marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    +{(grid[hovCell] || []).length - 5} más · <b style={{ color: "#93C5FD" }}>clic</b>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...cardStyle, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
              {hm.summary}
            </div>
            {[
              { n: "ALTO", f: (r) => r.score >= 9 },
              { n: "MEDIO", f: (r) => r.score >= 4 && r.score < 9 },
              { n: "BAJO", f: (r) => r.score < 4 },
            ].map(({ n, f }) => {
              const rs = risks.filter(f);
              const c = NK[n];
              return (
                <div key={n} style={{ padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.levelLabel[n]}</span>
                    </div>
                    <Num v={rs.length} size={20} color={c.color} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div style={{ background: "#F9FAFB", borderRadius: 6, padding: "6px 9px" }}>
                      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{hm.bruta}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{fmtM(rs.reduce((s, r) => s + r.monetario, 0))}</div>
                    </div>
                    <div style={{ background: "#FFFBEB", borderRadius: 6, padding: "6px 9px" }}>
                      <div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{hm.residual}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.color }}>{fmtM(rs.reduce((s, r) => s + r.residual, 0))}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Zone legend */}
          <div style={{ ...cardStyle, padding: "16px 18px", background: "#F9FAFB" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              {hm.zones}
            </div>
            {[
              [cellZone(4, 4), hm.zoneLabels[0]],
              [cellZone(3, 3), hm.zoneLabels[1]],
              [cellZone(3, 2), hm.zoneLabels[2]],
              [cellZone(2, 2), hm.zoneLabels[3]],
              [cellZone(1, 1), hm.zoneLabels[4]],
            ].map(([z, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: z.bg, border: `2px solid ${z.border}`, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: "#6B7280" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalCell && (
        <CellModal
          cellKey={modalCell}
          risks={grid[modalCell] || []}
          onClose={() => setModal(null)}
          onSelectRisk={onSelect}
          t={t}
        />
      )}
    </>
  );
}
