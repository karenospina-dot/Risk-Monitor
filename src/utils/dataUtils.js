import { C, TRANSLATE_FIELDS } from "../constants";

export function parseCSV(text) {
  const rows = [];
  let cur = "", inQ = false, row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { row.push(cur.trim()); cur = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !inQ) {
      row.push(cur.trim()); rows.push(row); cur = ""; row = [];
      if (ch === "\r" && text[i + 1] === "\n") i++;
      continue;
    }
    cur += ch;
  }
  if (cur || row.length) { row.push(cur.trim()); rows.push(row); }
  return rows;
}

export function parseMoney(raw = "") {
  const n = parseFloat(
    raw.replace(/[$\s.]/g, "").replace(",", ".").replace(/[^\d.]/g, "")
  );
  return isNaN(n) ? 0 : n;
}

export function fmtM(n) {
  if (!n) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString("es-CO")}`;
}

export function detectPeriod(row) {
  const h = [(row[C.cambioCtx] || ""), (row[C.observaciones] || "")].join(" ").toLowerCase();
  if (/mensual|monthly/i.test(h)) return "Mensual";
  if (/trimest|quarterly/i.test(h)) return "Trimestral";
  if (/semest|biannual/i.test(h)) return "Semestral";
  if (/anual|annual/i.test(h)) return "Anual";
  if (/ad.?hoc|event/i.test(h)) return "Ad-hoc";
  return "Trimestral";
}

export function rowToRisk(row, idx) {
  const prob = Math.min(4, Math.max(1, parseInt(row[C.prob]) || 1));
  const impacto = Math.min(4, Math.max(1, parseInt(row[C.impacto]) || 1));
  const score = prob * impacto;
  const nivel = score >= 9 ? "ALTO" : score >= 4 ? "MEDIO" : "BAJO";
  const fc = (row[C.formaControl] || "").trim();
  const cobertura = fc.toLowerCase().includes("automát") ? 65
    : fc.toLowerCase().includes("manual") ? 40 : 30;
  const monetario = parseMoney(row[C.monetario]);
  const residual = Math.round(monetario * (1 - cobertura / 100));
  return {
    id: `R${String(idx + 1).padStart(2, "0")}`,
    pais: (row[C.pais] || "").trim(),
    sociedad: (row[C.sociedad] || "").trim(),
    equipo: (row[C.equipo] || "General").split("/")[0].trim().slice(0, 30),
    proceso: (row[C.proceso] || "").trim(),
    escenario: (row[C.escenario] || "").trim(),
    riesgo: (row[C.riesgo] || "").trim(),
    tipoExp: (row[C.tipoExp] || "").trim(),
    consecuencias: (row[C.consecuencias] || "").trim(),
    refNorm: (row[C.refNorm] || "").trim(),
    control: (row[C.control] || "").trim(),
    kpi: (row[C.kpi] || "").trim(),
    mejora: (row[C.mejora] || "").trim(),
    responsable: (row[C.responsable] || "").trim(),
    formaControl: fc,
    fechaRev: (row[C.fechaRev] || "").trim(),
    cambioCtx: (row[C.cambioCtx] || "").trim(),
    observaciones: (row[C.observaciones] || "").trim(),
    periodicity: detectPeriod(row),
    monetario, residual, prob, impacto, score, nivel, cobertura,
    area: (row[C.proceso] || row[C.equipo] || "General")
      .split(/[\/·\-]/)[0].trim().slice(0, 32),
    tieneControl: cobertura >= 40,
  };
}

export function applyTranslations(risks, txMap) {
  return risks.map((r) => {
    const tx = txMap[r.id];
    if (!tx) return r;
    const out = { ...r };
    TRANSLATE_FIELDS.forEach((f) => { if (tx[f]) out[f] = tx[f]; });
    return out;
  });
}
