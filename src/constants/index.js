export const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/" +
  "2PACX-1vT0Vfofxz1z4vAMAo2ToFlpDsYwepti9_mF_iosm7njMv-nkUovhMRUdsaKwz93KALmxeZZw0fnyD27" +
  "/pub?output=csv";

// Column index map
export const C = {
  pais: 0, sociedad: 1, equipo: 2, proceso: 3, tipoWhatIf: 4,
  refOrigen: 5, refNorm: 6, escenario: 7, riesgo: 8,
  tipoExp: 9, consecuencias: 10, monetario: 11,
  prob: 12, impacto: 13, nivelCalc: 14,
  clasificacion: 15, control: 16, kpi: 17, mejora: 18,
  responsable: 19, formaControl: 20, fechaRev: 21,
  cambioCtx: 22, observaciones: 23, reevaluacion: 24,
};

// Fields to translate (key in risk object → label for translation)
export const TRANSLATE_FIELDS = [
  "escenario", "proceso", "equipo", "tipoExp", "consecuencias",
  "refNorm", "control", "kpi", "mejora", "cambioCtx", "observaciones", "area",
];

export const SOCIETIES = [
  "Soluciones Alegra S.A.S",
  "Alanube Soluciones S.R.L",
  "Alegra CAN LP",
  "Alegra Contabilidad S.A. con C.V.",
  "Alegra Holdings S.A.S",
  "Alanube SAC",
  "Alegra Soluciones SL",
  "Alero Global S.A.S",
  "Alanube Soluciones SRL",
  "Alanube Soluciones SA",
  "Alanube SAU",
];

// Design tokens — risk level colors
export const NK = {
  ALTO:  { color: "#B91C1C", light: "#FEF2F2", border: "#FECACA" },
  MEDIO: { color: "#B45309", light: "#FFFBEB", border: "#FDE68A" },
  BAJO:  { color: "#15803D", light: "#F0FDF4", border: "#BBF7D0" },
};

// Shared card style
export const cardStyle = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

// Shared table cell styles
export const T = {
  th: {
    padding: "9px 12px", fontSize: 10.5, fontWeight: 600,
    letterSpacing: "0.07em", textTransform: "uppercase", color: "#9CA3AF",
    textAlign: "left", borderBottom: "1px solid #E5E7EB",
    background: "#F9FAFB", whiteSpace: "nowrap",
  },
  td: { padding: "11px 12px", borderBottom: "1px solid #F3F4F6", verticalAlign: "top" },
};

export function cellZone(p, i) {
  const s = p * i;
  if (s >= 12) return { bg: "#FEE2E2", border: "#FCA5A5", num: "#7F1D1D", accent: "#B91C1C" };
  if (s >= 9)  return { bg: "#FEF2F2", border: "#FECACA", num: "#991B1B", accent: "#B91C1C" };
  if (s >= 6)  return { bg: "#FFFBEB", border: "#FDE68A", num: "#78350F", accent: "#B45309" };
  if (s >= 4)  return { bg: "#FEF9C3", border: "#FDE047", num: "#713F12", accent: "#B45309" };
  return              { bg: "#F0FDF4", border: "#BBF7D0", num: "#14532D", accent: "#15803D" };
}
