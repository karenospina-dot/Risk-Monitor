import { useState, useMemo } from "react";
import { NK, cardStyle, T } from "../constants";
import { fmtM } from "../utils/dataUtils";
import { Badge, Num, CovDot } from "../components/atoms";

export function Registros({ risks, onSelect, t }) {
  const rg = t.reg;
  const [sortCol, setSortCol] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(0);
  const PAGE = 20;

  const sorted = useMemo(() => [...risks].sort((a, b) => {
    const d = sortDir === "desc" ? -1 : 1;
    if (sortCol === "score")     return d * (a.score - b.score);
    if (sortCol === "monetario") return d * (a.monetario - b.monetario);
    if (sortCol === "residual")  return d * (a.residual - b.residual);
    if (sortCol === "nivel")     return d * (["BAJO", "MEDIO", "ALTO"].indexOf(a.nivel) - ["BAJO", "MEDIO", "ALTO"].indexOf(b.nivel));
    if (sortCol === "cobertura") return d * (a.cobertura - b.cobertura);
    return 0;
  }), [risks, sortCol, sortDir]);

  const paginated = sorted.slice(page * PAGE, (page + 1) * PAGE);
  const totalPages = Math.ceil(sorted.length / PAGE);

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortCol(col); setSortDir("desc"); setPage(0); }
  }

  const SortTh = ({ col, children }) => (
    <th onClick={() => toggleSort(col)}
      style={{ ...T.th, cursor: "pointer", userSelect: "none", color: sortCol === col ? "#111827" : "#9CA3AF" }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {children}
        <span style={{ fontSize: 10, opacity: 0.5 }}>
          {sortCol === col ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
        </span>
      </span>
    </th>
  );

  return (
    <div style={{ ...cardStyle, padding: "22px 26px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 2 }}>{rg.title}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>{rg.sub(risks.length)}</div>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              style={{ padding: "5px 11px", borderRadius: 6, border: "1px solid #E5E7EB", background: page === 0 ? "#F9FAFB" : "#fff", color: page === 0 ? "#D1D5DB" : "#374151", cursor: page === 0 ? "default" : "pointer", fontSize: 13, fontFamily: "inherit" }}>
              ←
            </button>
            <span style={{ fontSize: 12.5, color: "#6B7280" }}>{page + 1}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              style={{ padding: "5px 11px", borderRadius: 6, border: "1px solid #E5E7EB", background: page === totalPages - 1 ? "#F9FAFB" : "#fff", color: page === totalPages - 1 ? "#D1D5DB" : "#374151", cursor: page === totalPages - 1 ? "default" : "pointer", fontSize: 13, fontFamily: "inherit" }}>
              →
            </button>
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={T.th}>{rg.cols.id}</th>
              <th style={T.th}>{rg.cols.country}</th>
              <th style={T.th}>{rg.cols.scenario}</th>
              <th style={T.th}>{rg.cols.team}</th>
              <SortTh col="score">{rg.cols.score}</SortTh>
              <SortTh col="nivel">{rg.cols.level}</SortTh>
              <SortTh col="cobertura">{rg.cols.control}</SortTh>
              <SortTh col="monetario">{rg.cols.gross}</SortTh>
              <SortTh col="residual">{rg.cols.net}</SortTh>
            </tr>
          </thead>
          <tbody>
            {paginated.map((r) => {
              const c = NK[r.nivel] || NK.BAJO;
              const cc = r.cobertura >= 60 ? "#15803D" : r.cobertura >= 40 ? "#B45309" : "#B91C1C";
              return (
                <tr key={r.id} onClick={() => onSelect(r)} style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={T.td}><span style={{ fontFamily: "monospace", fontSize: 11.5, color: "#9CA3AF" }}>{r.id}</span></td>
                  <td style={T.td}><span style={{ fontSize: 12.5, color: "#6B7280" }}>{r.pais}</span></td>
                  <td style={{ ...T.td, minWidth: 320, maxWidth: 520 }}>
                    <div style={{ fontWeight: 500, color: "#111827", lineHeight: 1.45, whiteSpace: "normal", wordBreak: "break-word" }}>
                      {r.riesgo || r.escenario || r.proceso}
                    </div>
                  </td>
                  <td style={{ ...T.td, maxWidth: 120 }}>
                    <div style={{ fontSize: 12.5, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 112 }}>
                      {r.equipo}
                    </div>
                  </td>
                  <td style={T.td}><Num v={r.score} size={22} color={c.color} /></td>
                  <td style={T.td}><Badge nivel={r.nivel} t={t} /></td>
                  <td style={T.td}><CovDot pct={r.cobertura} t={t} /></td>
                  <td style={T.td}><span style={{ fontSize: 13, color: "#6B7280" }}>{fmtM(r.monetario)}</span></td>
                  <td style={T.td}><span style={{ fontSize: 13, fontWeight: 600, color: cc }}>{fmtM(r.residual)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            {page * PAGE + 1}–{Math.min((page + 1) * PAGE, risks.length)} {rg.of} {risks.length} {rg.risks}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: pg === page ? "#1D4ED8" : "#fff", color: pg === page ? "#fff" : "#6B7280", cursor: "pointer", fontSize: 12, fontWeight: pg === page ? 600 : 400, fontFamily: "inherit" }}>
                  {pg + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
