import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { SHEETS_CSV_URL, C } from "../constants";
import { parseCSV, rowToRisk, applyTranslations } from "../utils/dataUtils";
import { translateRisksToEnglish } from "../services/translationService";

export function useRisks(lang) {
  const [risksES, setRisksES] = useState([]);
  const [risksEN, setRisksEN] = useState([]);
  const [status, setStatus] = useState("loading");   // "loading" | "ok" | "error"
  const [errMsg, setErrMsg] = useState("");
  const [lastFetch, setLast] = useState("");
  const [txState, setTxState] = useState("idle");    // "idle" | "loading" | "done" | "error"
  const txCacheRef = useRef(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setTxState("idle");
    txCacheRef.current = null;
    try {
      const res = await fetch(SHEETS_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      const data = rows
        .slice(1)
        .filter((r) => r.length > 5 && r[C.escenario]?.trim())
        .map((r, i) => rowToRisk(r, i));
      setRisksES(data);
      setRisksEN(data);
      setStatus("ok");
      setLast(new Date().toLocaleTimeString("es-CO"));
    } catch (e) {
      setErrMsg(e.message);
      setStatus("error");
    }
  }, []);

  const triggerTranslation = useCallback(async (sourceRisks) => {
    if (txCacheRef.current) {
      setRisksEN(applyTranslations(sourceRisks, txCacheRef.current));
      return;
    }
    setTxState("loading");
    try {
      const txMap = await translateRisksToEnglish(sourceRisks);
      txCacheRef.current = txMap;
      setRisksEN(applyTranslations(sourceRisks, txMap));
      setTxState("done");
    } catch (e) {
      console.error("Translation failed:", e);
      setTxState("error");
      setRisksEN(sourceRisks);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Trigger translation when switching to EN
  useEffect(() => {
    if (lang === "en" && risksES.length > 0 && txState === "idle") {
      triggerTranslation(risksES);
    }
  }, [lang, risksES, txState, triggerTranslation]);

  const risks = lang === "en" ? risksEN : risksES;

  return { risks, risksES, status, errMsg, lastFetch, txState, load };
}

export function useFilters(risks) {
  const [search, setSearch] = useState("");
  const [fNivel, setFNivel] = useState("Todos");
  const [fPais, setFPais] = useState("Todos");
  const [fEquipo, setFEquipo] = useState("Todos");

  const equipos = useMemo(
    () => ["Todos", ...[...new Set(risks.map((r) => r.equipo).filter(Boolean))].sort()],
    [risks]
  );

  const filtered = useMemo(
    () =>
      risks.filter((r) => {
        if (fNivel !== "Todos" && r.nivel !== fNivel) return false;
        if (fPais !== "Todos" && !r.pais?.toLowerCase().includes(fPais.toLowerCase()))
          return false;
        if (fEquipo !== "Todos" && !r.equipo?.toLowerCase().includes(fEquipo.toLowerCase()))
          return false;
        if (search) {
          const q = search.toLowerCase();
          return [r.riesgo, r.escenario, r.proceso, r.id, r.area, r.responsable, r.pais, r.equipo]
            .some((f) => f?.toLowerCase().includes(q));
        }
        return true;
      }),
    [risks, fNivel, fPais, fEquipo, search]
  );

  return {
    filtered, equipos,
    search, setSearch,
    fNivel, setFNivel,
    fPais, setFPais,
    fEquipo, setFEquipo,
  };
}
