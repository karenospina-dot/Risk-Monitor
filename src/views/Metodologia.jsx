import { cardStyle } from "../constants";

function MetScoreRow({ score, color, label, desc }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #F9FAFB" }}>
      <div style={{ width: 42, height: 42, borderRadius: 9, background: color + "18", border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: "'Playfair Display',Georgia,serif" }}>{score}</span>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

export function Metodologia({ lang }) {
  const es = lang === "es";
  const S2 = { fontSize: 13, color: "#374151", lineHeight: 1.8, margin: 0 };
  const SH = { fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 10px", fontFamily: "'Playfair Display',Georgia,serif" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Hero banner */}
      <div style={{ ...cardStyle, padding: "28px 32px", background: "linear-gradient(135deg,#EFF6FF 0%,#F0FDF4 100%)", border: "1px solid #BFDBFE" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1D4ED8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              {es ? "Marco Metodológico" : "Methodological Framework"}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 12px", fontFamily: "'Playfair Display',Georgia,serif" }}>
              {es ? "Gestión de Riesgos" : "Risk Management"}
            </h1>
            <p style={{ ...S2, color: "#374151", maxWidth: 640 }}>
              {es
                ? "Este sistema de monitoreo implementa los principios de ISO 31000:2018 y elementos seleccionados del marco COSO ERM 2017, adaptados al contexto de las Sociedades Alegra."
                : "This monitoring system implements the principles of ISO 31000:2018 and selected elements of the COSO ERM 2017 framework, adapted to the context of Alegra Societies."}
            </p>
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                ["ISO 31000:2018", "#1D4ED8", "#EFF6FF", "#BFDBFE"],
                ["COSO ERM 2017", "#1D4ED8", "#EFF6FF", "#BFDBFE"],
                [es ? "Escala 4×4 P×I" : "4×4 P×I Scale", "#B45309", "#FFFBEB", "#FDE68A"],
                [es ? "Riesgo Residual" : "Residual Risk", "#6D28D9", "#F5F3FF", "#DDD6FE"],
                [es ? "Sociedades Alegra" : "Alegra Societies", "#15803D", "#F0FDF4", "#BBF7D0"],
              ].map(([l, c, bg, br]) => (
                <span key={l} style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, color: c, background: bg, border: `1px solid ${br}` }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {[["ISO 31000", "2018"], ["COSO ERM", "2017"], ["4×4", "P×I"]].map(([a, b]) => (
              <div key={a} style={{ width: 80, height: 52, borderRadius: 10, background: "#fff", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>{a}</div>
                <div style={{ fontSize: 10.5, color: "#9CA3AF" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Scale 4x4 */}
        <div style={{ ...cardStyle, padding: "22px 24px" }}>
          <h3 style={SH}>{es ? "Escala de Evaluación 4×4" : "4×4 Evaluation Scale"}</h3>
          <p style={{ ...S2, fontSize: 12, color: "#6B7280", marginBottom: 16 }}>
            {es ? "Score Inherente = Probabilidad (1–4) × Impacto (1–4)" : "Inherent Score = Probability (1–4) × Impact (1–4)"}
          </p>

          {/* Probability */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1D4ED8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              {es ? "Probabilidad" : "Probability"}
            </div>
            {(es
              ? [["1", "Remoto", "El evento es improbable o no ha ocurrido en el sector"],
                ["2", "Posible", "Ha ocurrido alguna vez en el sector o en la organización"],
                ["3", "Probable", "Ocurre regularmente; hay precedentes documentados"],
                ["4", "Seguro", "Ocurrirá o ya está ocurriendo; es casi inevitable"]]
              : [["1", "Remote", "The event is unlikely or has not occurred in the sector"],
                ["2", "Possible", "Has occurred in the sector or organization at some point"],
                ["3", "Likely", "Occurs regularly; documented precedents exist"],
                ["4", "Almost certain", "Will occur or is already occurring; nearly inevitable"]]
            ).map(([v, l, d]) => (
              <div key={v} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid #F9FAFB", alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>{v}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>{l}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Impact */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#B91C1C", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              {es ? "Impacto" : "Impact"}
            </div>
            {(es
              ? [["1", "Menor", "Consecuencias leves, sin afectación material ni reputacional significativa"],
                ["2", "Moderado", "Consecuencias gestionables; requiere acción correctiva puntual"],
                ["3", "Mayor", "Impacto significativo en operaciones, finanzas o relaciones laborales"],
                ["4", "Crítico", "Consecuencias severas: sanciones regulatorias, litigios, daño reputacional grave"]]
              : [["1", "Minor", "Mild consequences, no significant material or reputational impact"],
                ["2", "Moderate", "Manageable consequences; requires specific corrective action"],
                ["3", "Major", "Significant impact on operations, finances, or labor relations"],
                ["4", "Critical", "Severe consequences: regulatory sanctions, litigation, serious reputational damage"]]
            ).map(([v, l, d]) => (
              <div key={v} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid #F9FAFB", alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#B91C1C" }}>{v}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827" }}>{l}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score classification + Control coverage */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...cardStyle, padding: "22px 24px" }}>
            <h3 style={SH}>{es ? "Clasificación por Score" : "Score Classification"}</h3>
            <MetScoreRow score="12–16" color="#B91C1C"
              label={es ? "Crítico — Acción inmediata" : "Critical — Immediate action"}
              desc={es ? "Escalamiento a alta dirección. Plan ≤ 30 días. Reporte a Junta." : "Escalation to senior management. Plan ≤ 30 days. Board report."} />
            <MetScoreRow score="9–11" color="#DC2626"
              label={es ? "Alto — Prioridad alta" : "High — High priority"}
              desc={es ? "Plan de mitigación documentado. Seguimiento mensual." : "Documented mitigation plan. Monthly follow-up."} />
            <MetScoreRow score="6–8" color="#B45309"
              label={es ? "Medio-Alto — Monitoreo activo" : "Medium-High — Active monitoring"}
              desc={es ? "Control activo. Revisión trimestral." : "Active control. Quarterly review."} />
            <MetScoreRow score="4–5" color="#D97706"
              label={es ? "Medio — Monitoreo periódico" : "Medium — Periodic monitoring"}
              desc={es ? "Revisión semestral. Controles preventivos." : "Biannual review. Preventive controls."} />
            <MetScoreRow score="1–3" color="#15803D"
              label={es ? "Bajo — Aceptado" : "Low — Accepted"}
              desc={es ? "Dentro del apetito de riesgo. Revisión anual." : "Within risk appetite. Annual review."} />
          </div>

          <div style={{ ...cardStyle, padding: "20px 22px" }}>
            <h3 style={{ ...SH, fontSize: 13 }}>{es ? "Cobertura de Controles" : "Control Coverage"}</h3>
            {(es
              ? [["< 40%", "Sin control efectivo", "#B91C1C", "#FEF2F2", "Los controles existentes no reducen significativamente la exposición. Requiere acción prioritaria."],
                ["40–60%", "Control parcial", "#B45309", "#FFFBEB", "Controles activos pero insuficientes. Plan de mejora antes del cierre de ciclo."],
                ["> 60%", "Control efectivo", "#15803D", "#F0FDF4", "El riesgo está gestionado dentro de los umbrales aceptables. Mantener y revisar periódicamente."]]
              : [["< 40%", "No effective control", "#B91C1C", "#FEF2F2", "Existing controls do not significantly reduce exposure. Priority action required."],
                ["40–60%", "Partial control", "#B45309", "#FFFBEB", "Active but insufficient controls. Improvement plan recommended before cycle close."],
                ["> 60%", "Effective control", "#15803D", "#F0FDF4", "Risk is managed within acceptable thresholds. Maintain and review periodically."]]
            ).map(([cov, lbl, color, bg, desc]) => (
              <div key={cov} style={{ background: bg, borderRadius: 8, padding: "10px 13px", border: `1px solid ${color}22`, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color }}>{lbl}</span>
                  <span style={{ fontSize: 11, color, background: color + "18", padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>{cov}</span>
                </div>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frameworks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ ...cardStyle, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, background: "#EFF6FF", borderRadius: 10, border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
            <div>
              <h3 style={{ ...SH, margin: 0, fontSize: 14 }}>ISO 31000:2018</h3>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{es ? "Gestión del Riesgo — Directrices" : "Risk Management — Guidelines"}</div>
            </div>
          </div>
          <p style={{ ...S2, fontSize: 12.5, color: "#374151" }}>
            {es
              ? "Estándar internacional que establece los principios y el proceso para gestionar el riesgo de forma sistemática: identificar, analizar, evaluar y tratar los riesgos, con monitoreo continuo e integración al gobierno corporativo."
              : "International standard establishing the principles and process for managing risk systematically: identify, analyze, assess and treat risks, with continuous monitoring and integration into corporate governance."}
          </p>
        </div>
        <div style={{ ...cardStyle, padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, background: "#F0FDF4", borderRadius: 10, border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏛</div>
            <div>
              <h3 style={{ ...SH, margin: 0, fontSize: 14 }}>COSO ERM 2017</h3>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>Enterprise Risk Management</div>
            </div>
          </div>
          <p style={{ ...S2, fontSize: 12.5, color: "#374151" }}>
            {es
              ? "Marco de gobierno que vincula la gestión del riesgo con la estrategia y el desempeño de la organización. Define cómo la Junta Directiva supervisa los riesgos críticos y cómo se comunican los resultados a los niveles directivos."
              : "Governance framework linking risk management to organizational strategy and performance. Defines how the Board of Directors oversees critical risks and how results are communicated to management levels."}
          </p>
        </div>
      </div>
    </div>
  );
}
