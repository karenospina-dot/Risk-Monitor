import { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────────────────── */
const SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/" +
  "2PACX-1vT0Vfofxz1z4vAMAo2ToFlpDsYwepti9_mF_iosm7njMv-nkUovhMRUdsaKwz93KALmxeZZw0fnyD27" +
  "/pub?output=csv";

const C = {
  pais:0, equipo:1, proceso:2, tipoWhatIf:3, refOrigen:4,
  refNorm:5, escenario:6, tipoExp:7, consecuencias:8,
  monetario:9, prob:10, impacto:11, nivelCalc:12,
  clasificacion:13, control:14, kpi:15, mejora:16,
  responsable:17, formaControl:18, fechaRev:19,
  cambioCtx:20, observaciones:21,
};

// Fields to translate (key in risk object → label for translation)
const TRANSLATE_FIELDS = [
  "escenario","proceso","equipo","tipoExp","consecuencias",
  "refNorm","control","kpi","mejora","cambioCtx","observaciones","area",
];

/* ─────────────────────────────────────────────────────────────────────────────
   i18n — UI strings only (data content is translated separately)
───────────────────────────────────────────────────────────────────────────── */
const I18N = {
  es: {
    brand:"Risk Monitor", sub:"Alegra · Gestión de Riesgos",
    nav:{ overview:"Overview", heatmap:"Mapa de Calor", kri:"KRI Monitor",
          registros:"Registros", metodologia:"Metodología" },
    filter:{ all:"Todos", search:"Buscar…" },
    reload:"recargar",
    levels:{ ALTO:"ALTO", MEDIO:"MEDIO", BAJO:"BAJO" },
    levelLabel:{ ALTO:"Alto", MEDIO:"Medio", BAJO:"Bajo" },
    ov:{
      activeRisks:"Riesgos activos", activeRisksSub:"escenarios registrados",
      grossExp:"Exposición bruta", grossSub:"sin considerar controles",
      netExp:"Exposición residual", netSub:"ajustada por cobertura real",
      reduction:"Reducción por controles", redSub:"eficiencia del sistema de control",
      byLevel:"Riesgos por nivel — cobertura de controles",
      withControl:"Con control", noControl:"Sin control",
      gross:"Bruta", net:"Residual",
      byTeam:"Exposición por equipo responsable",
      cols:{ team:"Equipo", high:"Alto", med:"Medio", low:"Bajo",
             total:"Total", gross:"Bruta", net:"Residual", red:"Reducción" },
      critical:"Riesgos críticos",
      criticalSub:"score ≥ 12 · requieren intervención inmediata",
      clickDetail:"Clic para ver ficha →",
      brutaLbl:"Bruta", residualLbl:"Residual", risks:"riesgos",
    },
    hm:{
      title:"Mapa de Calor — Riesgo Inherente",
      sub:"Color por zona P×I · número = cantidad de riesgos · clic para ver todos",
      impact:"Impacto →", prob:"Probabilidad →",
      impLabels:["Crítico","Mayor","Moderado","Menor"],
      probLabels:["Remoto","Posible","Probable","Seguro"],
      risk:"riesgo", risks:"riesgos",
      summary:"Resumen por zona", zones:"Zonas",
      zoneLabels:["Score 12–16 · Crítico","Score 9–12 · Alto","Score 6–8 · Medio-alto","Score 4–6 · Medio","Score 1–3 · Bajo"],
      bruta:"Bruta", residual:"Residual",
      clickFicha:"Clic en fila para ver ficha completa",
    },
    kri:{
      alertBanner:(n)=>`${n} riesgo${n>1?"s":""} en nivel Alto`,
      alertSub:(res)=>`Exposición residual: ${res} · Reporte obligatorio a Junta Directiva`,
      highTitle:"Nivel Alto — Acción Inmediata",
      medTitle:"Nivel Medio — Monitoreo Activo",
      empty:"Sin riesgos en los niveles filtrados",
      kpiPending:"KPI pendiente de definir",
      bruta:"Bruta", residual:"Residual",
    },
    reg:{
      title:"Registro de Riesgos",
      sub:(n)=>`${n} riesgos · ordenar por columna · clic en fila para ficha completa`,
      cols:{ id:"ID", country:"País", scenario:"Escenario", team:"Equipo",
             score:"Score", level:"Nivel", control:"Control",
             gross:"Bruta", net:"Residual", owner:"Responsable" },
      of:"de", risks:"riesgos",
    },
    cm:{ score:"Score", risk:"riesgo", risks:"riesgos", inCell:"en esta celda",
         bruta:"Bruta", residual:"Residual", clickFicha:"Clic en fila para ver ficha" },
    dr:{
      gross:"Bruta", net:"Residual", coverage:"Cobertura",
      fields:{ tipoExp:"Tipo de Exposición", consecuencias:"Consecuencias",
               refNorm:"Referencial Normativo", control:"Punto de Control",
               kpi:"KPI Asociado", mejora:"Propuesta de Mejora",
               cambioCtx:"Cambio de Contexto", observaciones:"Observaciones" },
      meta:{ owner:"Responsable", form:"Forma de Control",
             team:"Equipo", lastRev:"Última Revisión" },
    },
    ctrl:{ effective:"Efectivo", partial:"Parcial", none:"Sin control" },
    periods:["Todos","Mensual","Trimestral","Semestral","Anual","Ad-hoc"],
    footer:"Alegra.com · Risk Monitor v7 · COSO ERM 2017 · ISO 31000:2018",
    translating:"Traduciendo contenido al inglés…",
    translationDone:"Traducción completada",
    translationError:"Error al traducir — mostrando en español",
    switchToEn:"Switch to English",
    switchToEs:"Cambiar a Español",
  },
  en: {
    brand:"Risk Monitor", sub:"Alegra · Risk Management",
    nav:{ overview:"Overview", heatmap:"Heat Map", kri:"KRI Monitor",
          registros:"Registry", metodologia:"Methodology" },
    filter:{ all:"All", search:"Search…" },
    reload:"reload",
    levels:{ ALTO:"HIGH", MEDIO:"MEDIUM", BAJO:"LOW" },
    levelLabel:{ ALTO:"High", MEDIO:"Medium", BAJO:"Low" },
    ov:{
      activeRisks:"Active Risks", activeRisksSub:"registered scenarios",
      grossExp:"Gross Exposure", grossSub:"without controls applied",
      netExp:"Residual Exposure", netSub:"adjusted by actual coverage",
      reduction:"Control Reduction", redSub:"efficiency of control system",
      byLevel:"Risks by level — control coverage",
      withControl:"With control", noControl:"No control",
      gross:"Gross", net:"Residual",
      byTeam:"Exposure by responsible team",
      cols:{ team:"Team", high:"High", med:"Medium", low:"Low",
             total:"Total", gross:"Gross", net:"Residual", red:"Reduction" },
      critical:"Critical Risks",
      criticalSub:"score ≥ 12 · require immediate intervention",
      clickDetail:"Click to view detail →",
      brutaLbl:"Gross", residualLbl:"Residual", risks:"risks",
    },
    hm:{
      title:"Heat Map — Inherent Risk",
      sub:"Color by P×I zone · number = count of risks · click to see all risks in cell",
      impact:"Impact →", prob:"Probability →",
      impLabels:["Critical","Major","Moderate","Minor"],
      probLabels:["Remote","Possible","Likely","Almost certain"],
      risk:"risk", risks:"risks",
      summary:"Summary by zone", zones:"Zones",
      zoneLabels:["Score 12–16 · Critical","Score 9–12 · High","Score 6–8 · Medium-high","Score 4–6 · Medium","Score 1–3 · Low"],
      bruta:"Gross", residual:"Residual",
      clickFicha:"Click row to view full detail",
    },
    kri:{
      alertBanner:(n)=>`${n} risk${n>1?"s":""} at High level`,
      alertSub:(res)=>`Residual exposure: ${res} · Mandatory Board of Directors report`,
      highTitle:"High Level — Immediate Action",
      medTitle:"Medium Level — Active Monitoring",
      empty:"No risks in filtered levels",
      kpiPending:"KPI pending definition",
      bruta:"Gross", residual:"Residual",
    },
    reg:{
      title:"Risk Registry",
      sub:(n)=>`${n} risks · click header to sort · click row for full detail`,
      cols:{ id:"ID", country:"Country", scenario:"Scenario", team:"Team",
             score:"Score", level:"Level", control:"Control",
             gross:"Gross", net:"Residual", owner:"Owner" },
      of:"of", risks:"risks",
    },
    cm:{ score:"Score", risk:"risk", risks:"risks", inCell:"in this cell",
         bruta:"Gross", residual:"Residual", clickFicha:"Click row to view full detail" },
    dr:{
      gross:"Gross", net:"Residual", coverage:"Coverage",
      fields:{ tipoExp:"Exposure Type", consecuencias:"Potential Consequences",
               refNorm:"Regulatory Reference", control:"Control Point",
               kpi:"Associated KPI", mejora:"Improvement Proposal",
               cambioCtx:"Context Change", observaciones:"Observations" },
      meta:{ owner:"Control Owner", form:"Control Form",
             team:"Team", lastRev:"Last Review" },
    },
    ctrl:{ effective:"Effective", partial:"Partial", none:"No control" },
    periods:["All","Monthly","Quarterly","Biannual","Annual","Ad-hoc"],
    footer:"Alegra.com · Risk Monitor v7 · COSO ERM 2017 · ISO 31000:2018",
    translating:"Translating content to English…",
    translationDone:"Translation complete",
    translationError:"Translation failed — showing in Spanish",
    switchToEn:"Switch to English",
    switchToEs:"Cambiar a Español",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   TRANSLATION ENGINE — calls Claude API to translate all text fields in batch
   Returns a map: riskId → { field → translated string }
───────────────────────────────────────────────────────────────────────────── */
async function translateRisksToEnglish(risks) {
  // Build a compact JSON payload: [{id, field, text}, ...]
  const items = [];
  risks.forEach(r => {
    TRANSLATE_FIELDS.forEach(field => {
      const text = r[field];
      if (text && text.trim()) {
        items.push({ id: r.id, field, text: text.trim() });
      }
    });
  });

  if (!items.length) return {};

  // Split into chunks of 40 items to stay well within token limits
  const CHUNK = 40;
  const chunks = [];
  for (let i = 0; i < items.length; i += CHUNK) chunks.push(items.slice(i, i + CHUNK));

  const map = {};

  for (const chunk of chunks) {
    const chunkPrompt = `You are a professional translator specializing in labor law, risk management, and corporate governance.
Translate each item from Spanish to English. Keep proper nouns, legal codes (e.g. "Ley 2466/2025"), acronyms, and technical terms intact.
Return ONLY a JSON array with the same structure: [{id, field, text}] where text is the English translation.
No preamble, no markdown fences, no extra text — pure JSON array only.

Input:
${JSON.stringify(chunk)}`;

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: chunkPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(()=>"");
      throw new Error(`API ${response.status}: ${errBody.slice(0,200)}`);
    }
    const data = await response.json();
    const raw = data.content?.find(b => b.type === "text")?.text || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    const translated = JSON.parse(clean);
    translated.forEach(({ id, field, text }) => {
      if (!map[id]) map[id] = {};
      map[id][field] = text;
    });
  }

  return map;
}

/* ─────────────────────────────────────────────────────────────────────────────
   CSV + DATA UTILS
───────────────────────────────────────────────────────────────────────────── */
function parseCSV(text) {
  const rows=[]; let cur="",inQ=false,row=[];
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){inQ=!inQ;continue;}
    if(ch===","&&!inQ){row.push(cur.trim());cur="";continue;}
    if((ch==="\n"||ch==="\r")&&!inQ){
      row.push(cur.trim());rows.push(row);cur="";row=[];
      if(ch==="\r"&&text[i+1]==="\n")i++;
      continue;
    }
    cur+=ch;
  }
  if(cur||row.length){row.push(cur.trim());rows.push(row);}
  return rows;
}
function parseMoney(raw=""){
  const n=parseFloat(raw.replace(/[$\s.]/g,"").replace(",",".").replace(/[^\d.]/g,""));
  return isNaN(n)?0:n;
}
function fmtM(n){
  if(!n)return"—";
  if(n>=1e9)return`$${(n/1e9).toFixed(1)}B`;
  if(n>=1e6)return`$${(n/1e6).toFixed(0)}M`;
  if(n>=1e3)return`$${(n/1e3).toFixed(0)}K`;
  return`$${n.toLocaleString("es-CO")}`;
}
function detectPeriod(row){
  const h=[(row[C.cambioCtx]||""),(row[C.observaciones]||"")].join(" ").toLowerCase();
  if(/mensual|monthly/i.test(h))return"Mensual";
  if(/trimest|quarterly/i.test(h))return"Trimestral";
  if(/semest|biannual/i.test(h))return"Semestral";
  if(/anual|annual/i.test(h))return"Anual";
  if(/ad.?hoc|event/i.test(h))return"Ad-hoc";
  return"Trimestral";
}
function rowToRisk(row,idx){
  const prob=Math.min(4,Math.max(1,parseInt(row[C.prob])||1));
  const impacto=Math.min(4,Math.max(1,parseInt(row[C.impacto])||1));
  const score=prob*impacto;
  const nivel=score>=9?"ALTO":score>=4?"MEDIO":"BAJO";
  const fc=(row[C.formaControl]||"").trim();
  const cobertura=fc.toLowerCase().includes("automát")?65:fc.toLowerCase().includes("manual")?40:30;
  const monetario=parseMoney(row[C.monetario]);
  const residual=Math.round(monetario*(1-cobertura/100));
  return{
    id:`R${String(idx+1).padStart(2,"0")}`,
    pais:(row[C.pais]||"").trim(),
    equipo:(row[C.equipo]||"General").split("/")[0].trim().slice(0,30),
    proceso:(row[C.proceso]||"").trim(),
    escenario:(row[C.escenario]||row[C.proceso]||"").trim(),
    tipoExp:(row[C.tipoExp]||"").trim(),
    consecuencias:(row[C.consecuencias]||"").trim(),
    refNorm:(row[C.refNorm]||"").trim(),
    control:(row[C.control]||"").trim(),
    kpi:(row[C.kpi]||"").trim(),
    mejora:(row[C.mejora]||"").trim(),
    responsable:(row[C.responsable]||"").trim(),
    formaControl:fc,
    fechaRev:(row[C.fechaRev]||"").trim(),
    cambioCtx:(row[C.cambioCtx]||"").trim(),
    observaciones:(row[C.observaciones]||"").trim(),
    periodicity:detectPeriod(row),
    monetario,residual,prob,impacto,score,nivel,cobertura,
    area:(row[C.proceso]||row[C.equipo]||"General").split(/[\/·\-]/)[0].trim().slice(0,32),
    tieneControl:cobertura>=40,
  };
}

// Merge translation map into risks
function applyTranslations(risks, txMap) {
  return risks.map(r => {
    const tx = txMap[r.id];
    if (!tx) return r;
    const out = { ...r };
    TRANSLATE_FIELDS.forEach(f => { if (tx[f]) out[f] = tx[f]; });
    return out;
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
const NK={
  ALTO: {color:"#B91C1C",light:"#FEF2F2",border:"#FECACA"},
  MEDIO:{color:"#B45309",light:"#FFFBEB",border:"#FDE68A"},
  BAJO: {color:"#15803D",light:"#F0FDF4",border:"#BBF7D0"},
};
function cellZone(p,i){
  const s=p*i;
  if(s>=12)return{bg:"#FEE2E2",border:"#FCA5A5",num:"#7F1D1D",accent:"#B91C1C"};
  if(s>=9) return{bg:"#FEF2F2",border:"#FECACA",num:"#991B1B",accent:"#B91C1C"};
  if(s>=6) return{bg:"#FFFBEB",border:"#FDE68A",num:"#78350F",accent:"#B45309"};
  if(s>=4) return{bg:"#FEF9C3",border:"#FDE047",num:"#713F12",accent:"#B45309"};
  return        {bg:"#F0FDF4",border:"#BBF7D0",num:"#14532D",accent:"#15803D"};
}
const card={background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,
  boxShadow:"0 1px 3px rgba(0,0,0,0.05)"};
const T={
  th:{padding:"9px 12px",fontSize:10.5,fontWeight:600,letterSpacing:"0.07em",
    textTransform:"uppercase",color:"#9CA3AF",textAlign:"left",
    borderBottom:"1px solid #E5E7EB",background:"#F9FAFB",whiteSpace:"nowrap"},
  td:{padding:"11px 12px",borderBottom:"1px solid #F3F4F6",verticalAlign:"middle"},
};

/* ─────────────────────────────────────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────────────────────────────────────── */
const Badge=({nivel,t})=>{
  const c=NK[nivel]||NK.BAJO;
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 9px",
      borderRadius:20,fontSize:11,fontWeight:600,color:c.color,
      background:c.light,border:`1px solid ${c.border}`}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:c.color}}/>
      {t.levels[nivel]||nivel}
    </span>
  );
};
const Num=({v,size=32,color="#111827"})=>(
  <span style={{fontSize:size,fontWeight:700,color,lineHeight:1,
    fontFamily:"'Playfair Display',Georgia,serif"}}>{v}</span>
);
const CovDot=({pct,t})=>{
  const color=pct>=60?"#15803D":pct>=40?"#B45309":"#B91C1C";
  const label=pct>=60?t.ctrl.effective:pct>=40?t.ctrl.partial:t.ctrl.none;
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11.5}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
      <span style={{color,fontWeight:500}}>{label}</span>
      <span style={{color:"#9CA3AF"}}>{pct}%</span>
    </span>
  );
};
const FieldBlock=({label,value})=>!value?null:(
  <div style={{marginBottom:14}}>
    <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.1em",
      textTransform:"uppercase",color:"#6B7280",marginBottom:5}}>{label}</div>
    <div style={{fontSize:13,color:"#374151",lineHeight:1.7,background:"#F9FAFB",
      borderRadius:8,padding:"10px 14px",borderLeft:"3px solid #E5E7EB"}}>{value}</div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   TRANSLATION BANNER
───────────────────────────────────────────────────────────────────────────── */
function TranslationBanner({state,t}) {
  if(state==="idle"||state==="done")return null;
  const isError=state==="error";
  const bg=isError?"#FEF2F2":"#EFF6FF";
  const border=isError?"#FECACA":"#BFDBFE";
  const color=isError?"#B91C1C":"#1D4ED8";
  const text=isError?t.translationError:t.translating;
  return(
    <div style={{background:bg,border:`1px solid ${border}`,borderRadius:8,
      padding:"10px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
      {!isError&&(
        <div style={{width:16,height:16,border:"2px solid #BFDBFE",
          borderTop:"2px solid #1D4ED8",borderRadius:"50%",
          animation:"spin .7s linear infinite",flexShrink:0}}/>
      )}
      <span style={{fontSize:13,color,fontWeight:500}}>{text}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCREENS
───────────────────────────────────────────────────────────────────────────── */
function LoadingScreen(){
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:18,background:"#F9FAFB"}}>
      <div style={{width:36,height:36,border:"3px solid #E5E7EB",
        borderTop:"3px solid #1D4ED8",borderRadius:"50%",
        animation:"spin .8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{fontWeight:600,color:"#374151",fontSize:14,margin:0}}>
        Cargando desde Google Sheets…
      </p>
    </div>
  );
}
function ErrorScreen({msg,onRetry}){
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:14,
      background:"#F9FAFB",padding:32,textAlign:"center"}}>
      <div style={{fontSize:36}}>⚠️</div>
      <p style={{fontWeight:700,color:"#B91C1C",fontSize:15,margin:0}}>
        No se pudo cargar la hoja
      </p>
      <p style={{fontSize:13,color:"#6B7280",maxWidth:400,lineHeight:1.7,margin:0}}>{msg}</p>
      <button onClick={onRetry} style={{padding:"9px 22px",background:"#1D4ED8",
        color:"#fff",border:"none",borderRadius:8,cursor:"pointer",
        fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Reintentar</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DRAWER
───────────────────────────────────────────────────────────────────────────── */
function Drawer({risk,onClose,t}){
  if(!risk)return null;
  const c=NK[risk.nivel]||NK.BAJO;
  const cc=risk.cobertura>=60?"#15803D":risk.cobertura>=40?"#B45309":"#B91C1C";
  const dr=t.dr;
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex"}}>
      <div style={{flex:1,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(3px)"}}
        onClick={onClose}/>
      <div style={{width:520,background:"#fff",overflowY:"auto",
        boxShadow:"-12px 0 40px rgba(0,0,0,0.1)"}}>
        <div style={{padding:"22px 26px 18px",borderBottom:"1px solid #F3F4F6",
          background:c.light,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div style={{flex:1,paddingRight:16,minWidth:0}}>
              <div style={{fontSize:11,color:"#9CA3AF",marginBottom:5,
                display:"flex",gap:8}}>
                <span style={{fontFamily:"monospace"}}>{risk.id}</span>
                <span>·</span><span>{risk.pais}</span>
              </div>
              <h2 style={{margin:0,fontSize:17,fontWeight:700,color:"#111827",
                lineHeight:1.4,fontFamily:"'Playfair Display',Georgia,serif"}}>
                {risk.escenario||risk.proceso}
              </h2>
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:7,
              background:"rgba(0,0,0,0.06)",border:"none",cursor:"pointer",
              fontSize:15,color:"#6B7280",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
            <Badge nivel={risk.nivel} t={t}/>
            <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 9px",
              borderRadius:20,fontSize:11,fontWeight:600,color:c.color,
              background:"rgba(0,0,0,0.04)",border:"1px solid "+c.border}}>
              Score {risk.score} (P{risk.prob}×I{risk.impacto})
            </span>
          </div>
        </div>
        <div style={{padding:"22px 26px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",
            gap:10,marginBottom:20}}>
            {[[dr.gross,fmtM(risk.monetario),"#111827"],
              [dr.net,fmtM(risk.residual),cc],
              [dr.coverage,`${risk.cobertura}%`,cc]].map(([l,v,cl])=>(
              <div key={l} style={{background:"#F9FAFB",borderRadius:9,
                padding:"12px 14px",border:"1px solid #E5E7EB"}}>
                <div style={{fontSize:20,fontWeight:700,color:cl,lineHeight:1,
                  fontFamily:"'Playfair Display',Georgia,serif"}}>{v}</div>
                <div style={{fontSize:10.5,color:"#9CA3AF",marginTop:5}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{height:5,background:"#E5E7EB",borderRadius:3,marginBottom:18}}>
            <div style={{width:`${risk.cobertura}%`,height:"100%",
              background:cc,borderRadius:3}}/>
          </div>
          <FieldBlock label={dr.fields.tipoExp}       value={risk.tipoExp}/>
          <FieldBlock label={dr.fields.consecuencias} value={risk.consecuencias}/>
          <FieldBlock label={dr.fields.refNorm}       value={risk.refNorm}/>
          <FieldBlock label={dr.fields.control}       value={risk.control}/>
          <FieldBlock label={dr.fields.kpi}           value={risk.kpi}/>
          <FieldBlock label={dr.fields.mejora}        value={risk.mejora}/>
          <FieldBlock label={dr.fields.cambioCtx}     value={risk.cambioCtx}/>
          <FieldBlock label={dr.fields.observaciones} value={risk.observaciones}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[[dr.meta.owner,risk.responsable],
              [dr.meta.form,risk.formaControl],
              [dr.meta.team,risk.equipo],
              [dr.meta.lastRev,risk.fechaRev||"—"]].map(([k,v])=>(
              <div key={k} style={{background:"#F9FAFB",borderRadius:8,
                padding:"10px 12px",border:"1px solid #E5E7EB"}}>
                <div style={{fontSize:10,color:"#9CA3AF",textTransform:"uppercase",
                  letterSpacing:"0.07em",marginBottom:3}}>{k}</div>
                <div style={{fontSize:12.5,color:"#111827",fontWeight:600}}>{v||"—"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CELL MODAL
───────────────────────────────────────────────────────────────────────────── */
function CellModal({cellKey,risks,onClose,onSelectRisk,t}){
  if(!cellKey||!risks.length)return null;
  const [p,i]=cellKey.split(",").map(Number);
  const z=cellZone(p,i);
  const cm=t.cm;
  return(
    <div style={{position:"fixed",inset:0,zIndex:600,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",
        backdropFilter:"blur(4px)"}} onClick={onClose}/>
      <div style={{position:"relative",background:"#fff",borderRadius:14,
        width:580,maxHeight:"78vh",display:"flex",flexDirection:"column",
        boxShadow:"0 24px 64px rgba(0,0,0,0.18)",zIndex:1}}>
        <div style={{padding:"18px 22px 16px",borderBottom:"1px solid #F3F4F6",
          background:z.bg,borderRadius:"14px 14px 0 0",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:z.accent,fontWeight:600,
                letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>
                P{p} × I{i} · {cm.score} {p*i}
              </div>
              <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#111827",
                fontFamily:"'Playfair Display',Georgia,serif"}}>
                {risks.length} {risks.length===1?cm.risk:cm.risks} {cm.inCell}
              </h3>
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:8,
              background:"rgba(0,0,0,0.06)",border:"none",cursor:"pointer",
              fontSize:16,color:"#6B7280",display:"flex",
              alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {risks.map((r,idx)=>{
            const cc=r.cobertura>=60?"#15803D":r.cobertura>=40?"#B45309":"#B91C1C";
            return(
              <div key={r.id}
                onClick={()=>{onClose();onSelectRisk(r);}}
                style={{padding:"13px 22px",cursor:"pointer",
                  borderBottom:"1px solid #F9FAFB"}}
                onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:28,height:28,borderRadius:7,background:z.bg,
                    border:`1px solid ${z.border}`,display:"flex",
                    alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:13,fontWeight:700,color:z.accent,
                      fontFamily:"'Playfair Display',Georgia,serif"}}>{idx+1}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,fontWeight:600,color:"#111827",
                      lineHeight:1.35,marginBottom:3}}>
                      {r.escenario||r.proceso}
                    </div>
                    <div style={{display:"flex",gap:8,fontSize:11.5,
                      color:"#6B7280",flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontFamily:"monospace",color:"#9CA3AF"}}>{r.id}</span>
                      <span>{r.equipo}</span>
                      <span>·</span>
                      <CovDot pct={r.cobertura} t={t}/>
                      <span>·</span>
                      <span style={{color:"#374151"}}>
                        {fmtM(r.monetario)}
                        <span style={{color:"#9CA3AF"}}> → </span>
                        <span style={{color:cc,fontWeight:600}}>{fmtM(r.residual)}</span>
                      </span>
                    </div>
                  </div>
                  <span style={{color:"#D1D5DB",fontSize:14,flexShrink:0}}>→</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"12px 22px",borderTop:"1px solid #F3F4F6",
          background:"#F9FAFB",borderRadius:"0 0 14px 14px",
          display:"flex",justifyContent:"space-between",fontSize:12,color:"#6B7280",
          flexShrink:0}}>
          <span>
            {cm.bruta}: <b style={{color:"#111827"}}>{fmtM(risks.reduce((s,r)=>s+r.monetario,0))}</b>
            {" · "}{cm.residual}: <b style={{color:"#B45309"}}>{fmtM(risks.reduce((s,r)=>s+r.residual,0))}</b>
          </span>
          <span style={{color:"#9CA3AF"}}>{cm.clickFicha}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: OVERVIEW
───────────────────────────────────────────────────────────────────────────── */
function Overview({risks,onSelect,t}){
  const ov=t.ov;
  const totalBruta=risks.reduce((s,r)=>s+r.monetario,0);
  const totalResidual=risks.reduce((s,r)=>s+r.residual,0);
  const reduccion=totalBruta>0?Math.round((1-totalResidual/totalBruta)*100):0;

  const byNivel=["ALTO","MEDIO","BAJO"].map(n=>{
    const rs=risks.filter(r=>r.nivel===n);
    return{n,count:rs.length,
      bruta:rs.reduce((s,r)=>s+r.monetario,0),
      residual:rs.reduce((s,r)=>s+r.residual,0),
      conControl:rs.filter(r=>r.tieneControl).length,
      sinControl:rs.filter(r=>!r.tieneControl).length};
  });

  const equipoMap={};
  risks.forEach(r=>{
    if(!equipoMap[r.equipo])equipoMap[r.equipo]={
      equipo:r.equipo,alto:0,medio:0,bajo:0,bruta:0,residual:0,count:0};
    const e=equipoMap[r.equipo];
    e.count++;e.bruta+=r.monetario;e.residual+=r.residual;
    if(r.nivel==="ALTO")e.alto++;
    else if(r.nivel==="MEDIO")e.medio++;
    else e.bajo++;
  });
  const equipos=Object.values(equipoMap).sort((a,b)=>b.bruta-a.bruta);
  const criticos=[...risks].filter(r=>r.score>=12).sort((a,b)=>b.score-a.score);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* KPI strip */}
      <div style={{...card,padding:"24px 28px"}}>
        <div style={{display:"grid",
          gridTemplateColumns:"1fr 1px 1fr 1px 1fr 1px 1fr",
          alignItems:"center"}}>
          {[
            {label:ov.activeRisks,value:risks.length,sub:ov.activeRisksSub,color:"#111827"},
            null,
            {label:ov.grossExp,value:fmtM(totalBruta),sub:ov.grossSub,color:"#B91C1C"},
            null,
            {label:ov.netExp,value:fmtM(totalResidual),sub:ov.netSub,color:"#B45309"},
            null,
            {label:ov.reduction,value:`${reduccion}%`,sub:ov.redSub,color:"#15803D"},
          ].map((item,idx)=>
            item===null
              ?<div key={idx} style={{width:1,height:52,background:"#F3F4F6",margin:"0 auto"}}/>
              :(
                <div key={idx} style={{padding:"0 24px",textAlign:"center"}}>
                  <Num v={item.value} size={34} color={item.color}/>
                  <div style={{fontSize:12.5,fontWeight:600,color:"#374151",marginTop:6}}>
                    {item.label}
                  </div>
                  <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{item.sub}</div>
                </div>
              )
          )}
        </div>
      </div>

      {/* By level */}
      <div style={{...card,padding:"22px 28px"}}>
        <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:18}}>
          {ov.byLevel}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
          {byNivel.map(({n,count,bruta,residual,conControl,sinControl})=>{
            const c=NK[n];
            const pct=count>0?Math.round((conControl/count)*100):0;
            return(
              <div key={n} style={{border:`1px solid ${c.border}`,borderRadius:10,
                padding:"16px 18px",background:c.light}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <Badge nivel={n} t={t}/>
                    <div style={{marginTop:10}}>
                      <Num v={count} size={36} color={c.color}/>
                      <span style={{fontSize:12.5,color:c.color,marginLeft:5,
                        fontWeight:500}}>{ov.risks}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:"#9CA3AF",marginBottom:2}}>{ov.gross}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#374151"}}>{fmtM(bruta)}</div>
                    <div style={{fontSize:11,color:"#9CA3AF",marginTop:6,marginBottom:2}}>{ov.net}</div>
                    <div style={{fontSize:14,fontWeight:700,color:c.color}}>{fmtM(residual)}</div>
                  </div>
                </div>
                <div style={{borderBottom:"1px solid "+c.border+"55",paddingBottom:12,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    fontSize:11.5,marginBottom:6}}>
                    <span style={{color:"#6B7280"}}>{ov.withControl} ({conControl})</span>
                    <span style={{color:"#9CA3AF"}}>{ov.noControl} ({sinControl})</span>
                  </div>
                  <div style={{height:6,background:"#E5E7EB",borderRadius:3}}>
                    <div style={{width:`${pct}%`,height:"100%",
                      background:c.color,borderRadius:3,opacity:.7}}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {[[ov.withControl,conControl,"#15803D"],
                    [ov.noControl,sinControl,"#B91C1C"]].map(([l,v,cl])=>(
                    <div key={l} style={{flex:1,background:"rgba(255,255,255,0.7)",
                      borderRadius:7,padding:"7px 10px",
                      border:"1px solid rgba(0,0,0,0.06)"}}>
                      <div style={{fontSize:10,color:"#9CA3AF",
                        textTransform:"uppercase",letterSpacing:"0.07em"}}>{l}</div>
                      <Num v={v} size={16} color={cl}/>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By team */}
      <div style={{...card,padding:"22px 28px"}}>
        <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:16}}>
          {ov.byTeam}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr>
              {[ov.cols.team,ov.cols.high,ov.cols.med,ov.cols.low,
                ov.cols.total,ov.cols.gross,ov.cols.net,ov.cols.red].map(h=>(
                <th key={h} style={T.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipos.map(e=>{
              const red=e.bruta>0?Math.round((1-e.residual/e.bruta)*100):0;
              return(
                <tr key={e.equipo}>
                  <td style={T.td}>
                    <span style={{fontWeight:600,color:"#111827"}}>{e.equipo}</span>
                  </td>
                  {[[e.alto,"#B91C1C"],[e.medio,"#B45309"],[e.bajo,"#15803D"]].map(([v,c],i)=>(
                    <td key={i} style={T.td}>
                      {v>0?<Num v={v} size={16} color={c}/>
                          :<span style={{color:"#D1D5DB"}}>—</span>}
                    </td>
                  ))}
                  <td style={T.td}><span style={{fontSize:12.5,color:"#6B7280"}}>{e.count}</span></td>
                  <td style={T.td}><span style={{fontSize:13,color:"#374151"}}>{fmtM(e.bruta)}</span></td>
                  <td style={T.td}><span style={{fontSize:13,fontWeight:600,color:"#B45309"}}>{fmtM(e.residual)}</span></td>
                  <td style={T.td}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:40,height:4,background:"#E5E7EB",borderRadius:2}}>
                        <div style={{width:`${red}%`,height:"100%",background:"#15803D",borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:12,color:"#6B7280"}}>{red}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Critical risks */}
      {criticos.length>0&&(
        <div style={{...card,padding:"22px 28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>
              {ov.critical}
              <span style={{fontSize:11.5,fontWeight:400,color:"#9CA3AF",marginLeft:8}}>
                {ov.criticalSub}
              </span>
            </div>
            <span style={{fontSize:11.5,color:"#9CA3AF"}}>{ov.clickDetail}</span>
          </div>
          {criticos.map(r=>{
            const cc=r.cobertura>=60?"#15803D":r.cobertura>=40?"#B45309":"#B91C1C";
            return(
              <div key={r.id} onClick={()=>onSelect(r)}
                style={{display:"flex",alignItems:"center",gap:16,
                  padding:"12px 0",borderBottom:"1px solid #F9FAFB",cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:44,height:44,borderRadius:10,background:"#FEF2F2",
                  border:"1px solid #FECACA",display:"flex",alignItems:"center",
                  justifyContent:"center",flexShrink:0}}>
                  <Num v={r.score} size={20} color="#B91C1C"/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13.5,fontWeight:600,color:"#111827",
                    lineHeight:1.35,marginBottom:3}}>
                    {r.escenario||r.proceso}
                  </div>
                  <div style={{fontSize:11.5,color:"#9CA3AF",display:"flex",
                    gap:10,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"monospace"}}>{r.id}</span>
                    <span>{r.equipo}</span>
                    <span>·</span><span>{r.pais}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:20,alignItems:"center",flexShrink:0}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:"#9CA3AF"}}>{ov.brutaLbl}</div>
                    <div style={{fontSize:13,fontWeight:500,color:"#374151"}}>{fmtM(r.monetario)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:"#9CA3AF"}}>{ov.residualLbl}</div>
                    <div style={{fontSize:13,fontWeight:700,color:cc}}>{fmtM(r.residual)}</div>
                  </div>
                  <CovDot pct={r.cobertura} t={t}/>
                </div>
                <span style={{color:"#E5E7EB",fontSize:14}}>→</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: HEAT MAP
───────────────────────────────────────────────────────────────────────────── */
function HeatMap({risks,onSelect,t}){
  const [hovCell,setHov]=useState(null);
  const [modalCell,setModal]=useState(null);
  const [tipPos,setTip]=useState({x:0,y:0});
  const ref=useRef(null);
  const hm=t.hm;

  const grid=useMemo(()=>{
    const g={};
    for(let p=1;p<=4;p++)for(let i=1;i<=4;i++)g[`${p},${i}`]=[];
    risks.forEach(r=>{const k=`${r.prob},${r.impacto}`;if(g[k])g[k].push(r);});
    return g;
  },[risks]);

  return(
    <>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20,alignItems:"start"}}>
        <div style={{...card,padding:"22px 26px"}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>
            {hm.title}
          </div>
          <p style={{fontSize:12,color:"#9CA3AF",margin:"0 0 22px"}}>{hm.sub}</p>
          <div style={{display:"flex",gap:0}} ref={ref}>
            <div style={{width:16,display:"flex",alignItems:"center",
              justifyContent:"center",flexShrink:0}}>
              <span style={{writingMode:"vertical-rl",transform:"rotate(180deg)",
                fontSize:10,color:"#9CA3AF",letterSpacing:"0.1em",
                textTransform:"uppercase"}}>{hm.impact}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {[4,3,2,1].map((imp,ri)=>(
                  <div key={imp} style={{display:"flex",gap:5}}>
                    <div style={{width:80,display:"flex",alignItems:"center",
                      justifyContent:"flex-end",paddingRight:10,flexShrink:0}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>
                          {hm.impLabels[ri]}
                        </div>
                        <div style={{fontSize:10.5,color:"#9CA3AF"}}>({imp})</div>
                      </div>
                    </div>
                    {[1,2,3,4].map(prob=>{
                      const key=`${prob},${imp}`;
                      const rs=grid[key]||[];
                      const z=cellZone(prob,imp);
                      const isH=hovCell===key;
                      return(
                        <div key={prob}
                          onMouseEnter={e=>{
                            setHov(key);
                            if(ref.current){
                              const r=ref.current.getBoundingClientRect();
                              setTip({x:e.clientX-r.left,y:e.clientY-r.top});
                            }
                          }}
                          onMouseMove={e=>{
                            if(ref.current){
                              const r=ref.current.getBoundingClientRect();
                              setTip({x:e.clientX-r.left,y:e.clientY-r.top});
                            }
                          }}
                          onMouseLeave={()=>setHov(null)}
                          onClick={()=>rs.length>0&&setModal(key)}
                          style={{flex:1,minHeight:90,borderRadius:9,background:z.bg,
                            border:`2px solid ${isH&&rs.length?z.accent+"55":z.border}`,
                            display:"flex",flexDirection:"column",
                            alignItems:"center",justifyContent:"center",
                            cursor:rs.length>0?"pointer":"default",
                            transition:"all .15s",position:"relative",gap:3,
                            boxShadow:isH&&rs.length>0?`0 4px 18px ${z.accent}18`:"none",
                            transform:isH&&rs.length>0?"scale(1.03)":"scale(1)"}}>
                          <div style={{position:"absolute",top:5,right:7,
                            fontSize:9,fontWeight:600,color:z.accent,opacity:.5,
                            fontFamily:"monospace"}}>{prob*imp}</div>
                          {rs.length>0?(
                            <>
                              <Num v={rs.length} size={30} color={z.num}/>
                              <div style={{fontSize:9.5,color:z.num,opacity:.65,fontWeight:500}}>
                                {rs.length===1?hm.risk:hm.risks}
                              </div>
                              <div style={{fontSize:9,color:z.accent,opacity:.6}}>
                                {fmtM(rs.reduce((s,r)=>s+r.monetario,0))}
                              </div>
                            </>
                          ):(
                            <span style={{fontSize:16,color:"#D1D5DB"}}>—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:5,marginTop:8,marginLeft:88}}>
                {hm.probLabels.map((l,i)=>(
                  <div key={i} style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{l}</div>
                    <div style={{fontSize:10.5,color:"#9CA3AF"}}>({i+1})</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:"center",marginLeft:88,marginTop:4,
                fontSize:10,color:"#D1D5DB",letterSpacing:"0.1em",
                textTransform:"uppercase"}}>{hm.prob}</div>
            </div>
            {hovCell&&(grid[hovCell]||[]).length>0&&(
              <div style={{position:"absolute",
                left:Math.min(tipPos.x+14,440),top:Math.max(tipPos.y-16,0),
                background:"#1F2937",color:"#F9FAFB",borderRadius:9,
                padding:"10px 13px",fontSize:11.5,zIndex:50,
                maxWidth:255,pointerEvents:"none",
                boxShadow:"0 8px 28px rgba(0,0,0,0.22)"}}>
                <div style={{fontWeight:700,marginBottom:6,fontSize:12,
                  borderBottom:"1px solid rgba(255,255,255,0.1)",paddingBottom:5}}>
                  {(grid[hovCell]||[]).length} {(grid[hovCell]||[]).length===1?hm.risk:hm.risks} · Score {hovCell.split(",").reduce((a,b)=>parseInt(a)*parseInt(b))}
                </div>
                {(grid[hovCell]||[]).slice(0,5).map(r=>(
                  <div key={r.id} style={{display:"flex",gap:7,marginBottom:4,lineHeight:1.4}}>
                    <span style={{fontFamily:"monospace",fontSize:10,color:"#9CA3AF",flexShrink:0}}>{r.id}</span>
                    <span style={{color:"#E5E7EB",fontSize:11}}>
                      {(r.escenario||r.proceso).slice(0,52)}{(r.escenario||r.proceso).length>52?"…":""}
                    </span>
                  </div>
                ))}
                {(grid[hovCell]||[]).length>5&&(
                  <div style={{color:"#9CA3AF",fontSize:10.5,marginTop:4,
                    paddingTop:4,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                    +{(grid[hovCell]||[]).length-5} más · <b style={{color:"#93C5FD"}}>clic</b>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{...card,padding:"18px 20px"}}>
            <div style={{fontSize:11,fontWeight:600,color:"#9CA3AF",
              letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>
              {hm.summary}
            </div>
            {[{n:"ALTO",f:r=>r.score>=9},{n:"MEDIO",f:r=>r.score>=4&&r.score<9},{n:"BAJO",f:r=>r.score<4}].map(({n,f})=>{
              const rs=risks.filter(f);
              const c=NK[n];
              return(
                <div key={n} style={{padding:"10px 0",borderBottom:"1px solid #F3F4F6"}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:8,height:8,borderRadius:"50%",
                        background:c.color,display:"inline-block"}}/>
                      <span style={{fontSize:13,fontWeight:600,color:"#111827"}}>
                        {t.levelLabel[n]}
                      </span>
                    </div>
                    <Num v={rs.length} size={20} color={c.color}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <div style={{background:"#F9FAFB",borderRadius:6,padding:"6px 9px"}}>
                      <div style={{fontSize:9,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em"}}>{hm.bruta}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>
                        {fmtM(rs.reduce((s,r)=>s+r.monetario,0))}
                      </div>
                    </div>
                    <div style={{background:"#FFFBEB",borderRadius:6,padding:"6px 9px"}}>
                      <div style={{fontSize:9,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em"}}>{hm.residual}</div>
                      <div style={{fontSize:13,fontWeight:600,color:c.color}}>
                        {fmtM(rs.reduce((s,r)=>s+r.residual,0))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{...card,padding:"16px 18px",background:"#F9FAFB"}}>
            <div style={{fontSize:11,fontWeight:600,color:"#9CA3AF",
              letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>
              {hm.zones}
            </div>
            {[[cellZone(4,4),hm.zoneLabels[0]],[cellZone(3,3),hm.zoneLabels[1]],
              [cellZone(3,2),hm.zoneLabels[2]],[cellZone(2,2),hm.zoneLabels[3]],
              [cellZone(1,1),hm.zoneLabels[4]]].map(([z,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                <div style={{width:16,height:16,borderRadius:4,background:z.bg,
                  border:`2px solid ${z.border}`,flexShrink:0}}/>
                <span style={{fontSize:11.5,color:"#6B7280"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {modalCell&&(
        <CellModal cellKey={modalCell} risks={grid[modalCell]||[]}
          onClose={()=>setModal(null)} onSelectRisk={onSelect} t={t}/>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: KRI MONITOR
───────────────────────────────────────────────────────────────────────────── */
function KRIMonitor({risks,onSelect,t}){
  const k=t.kri;
  const altos=risks.filter(r=>r.nivel==="ALTO");
  const medios=risks.filter(r=>r.nivel==="MEDIO");
  const KCard=({r})=>{
    const c=NK[r.nivel]||NK.BAJO;
    const cc=r.cobertura>=60?"#15803D":r.cobertura>=40?"#B45309":"#B91C1C";
    return(
      <div onClick={()=>onSelect(r)}
        style={{...card,borderTop:`3px solid ${c.color}`,
          padding:"18px 20px",cursor:"pointer",transition:"all .15s"}}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-2px)";}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=card.boxShadow;e.currentTarget.style.transform="translateY(0)";}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:11,color:"#9CA3AF",marginBottom:4,fontFamily:"monospace"}}>
              {r.id} · {r.pais}
            </div>
            <div style={{fontSize:14,fontWeight:600,color:"#111827",lineHeight:1.3}}>
              {r.area||r.equipo}
            </div>
          </div>
          <Badge nivel={r.nivel} t={t}/>
        </div>
        <p style={{fontSize:12.5,color:"#6B7280",margin:"0 0 14px",lineHeight:1.6,minHeight:36}}>
          {r.kpi||r.control||k.kpiPending}
        </p>
        <div style={{height:4,background:"#F3F4F6",borderRadius:3,marginBottom:10}}>
          <div style={{width:`${r.cobertura}%`,height:"100%",background:cc,borderRadius:3}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:"#F9FAFB",borderRadius:7,padding:"8px 10px"}}>
            <div style={{fontSize:9.5,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em"}}>{k.bruta}</div>
            <div style={{fontSize:14,fontWeight:600,color:"#374151"}}>{fmtM(r.monetario)}</div>
          </div>
          <div style={{background:"#FFFBEB",borderRadius:7,padding:"8px 10px"}}>
            <div style={{fontSize:9.5,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:"0.07em"}}>{k.residual}</div>
            <div style={{fontSize:14,fontWeight:600,color:cc}}>{fmtM(r.residual)}</div>
          </div>
        </div>
      </div>
    );
  };
  return(
    <div>
      {altos.length>0&&(
        <>
          <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,
            padding:"13px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:20,flexShrink:0}}>⚠</span>
            <div>
              <p style={{fontWeight:700,color:"#B91C1C",fontSize:13.5,margin:0}}>
                {k.alertBanner(altos.length)}
              </p>
              <p style={{fontSize:12,color:"#DC2626",margin:"2px 0 0"}}>
                {k.alertSub(fmtM(altos.reduce((s,r)=>s+r.residual,0)))}
              </p>
            </div>
          </div>
          <p style={{fontSize:10.5,fontWeight:600,color:"#B91C1C",letterSpacing:"0.12em",
            textTransform:"uppercase",marginBottom:12}}>{k.highTitle}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
            {altos.map(r=><KCard key={r.id} r={r}/>)}
          </div>
        </>
      )}
      {medios.length>0&&(
        <>
          <p style={{fontSize:10.5,fontWeight:600,color:"#B45309",letterSpacing:"0.12em",
            textTransform:"uppercase",marginBottom:12}}>{k.medTitle}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {medios.map(r=><KCard key={r.id} r={r}/>)}
          </div>
        </>
      )}
      {!altos.length&&!medios.length&&(
        <div style={{...card,textAlign:"center",padding:56,color:"#9CA3AF"}}>
          <div style={{fontSize:32,marginBottom:10}}>✅</div>
          <p style={{fontSize:14,fontWeight:600,color:"#374151",margin:0}}>{k.empty}</p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: REGISTROS
───────────────────────────────────────────────────────────────────────────── */
function Registros({risks,onSelect,t}){
  const rg=t.reg;
  const [sortCol,setSortCol]=useState("score");
  const [sortDir,setSortDir]=useState("desc");
  const [page,setPage]=useState(0);
  const PAGE=20;

  const sorted=useMemo(()=>[...risks].sort((a,b)=>{
    const d=sortDir==="desc"?-1:1;
    if(sortCol==="score")     return d*(a.score-b.score);
    if(sortCol==="monetario") return d*(a.monetario-b.monetario);
    if(sortCol==="residual")  return d*(a.residual-b.residual);
    if(sortCol==="nivel")     return d*(["BAJO","MEDIO","ALTO"].indexOf(a.nivel)-["BAJO","MEDIO","ALTO"].indexOf(b.nivel));
    if(sortCol==="cobertura") return d*(a.cobertura-b.cobertura);
    return 0;
  }),[risks,sortCol,sortDir]);

  const paginated=sorted.slice(page*PAGE,(page+1)*PAGE);
  const totalPages=Math.ceil(sorted.length/PAGE);

  function toggleSort(col){
    if(sortCol===col)setSortDir(d=>d==="desc"?"asc":"desc");
    else{setSortCol(col);setSortDir("desc");setPage(0);}
  }
  const SortTh=({col,children})=>(
    <th onClick={()=>toggleSort(col)}
      style={{...T.th,cursor:"pointer",userSelect:"none",
        color:sortCol===col?"#111827":"#9CA3AF"}}>
      <span style={{display:"flex",alignItems:"center",gap:4}}>
        {children}<span style={{fontSize:10,opacity:.5}}>{sortCol===col?(sortDir==="desc"?"↓":"↑"):"↕"}</span>
      </span>
    </th>
  );

  return(
    <div style={{...card,padding:"22px 26px"}}>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:2}}>
            {rg.title}
          </div>
          <div style={{fontSize:12,color:"#9CA3AF"}}>{rg.sub(risks.length)}</div>
        </div>
        {totalPages>1&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
              style={{padding:"5px 11px",borderRadius:6,border:"1px solid #E5E7EB",
                background:page===0?"#F9FAFB":"#fff",color:page===0?"#D1D5DB":"#374151",
                cursor:page===0?"default":"pointer",fontSize:13,fontFamily:"inherit"}}>←</button>
            <span style={{fontSize:12.5,color:"#6B7280"}}>{page+1}/{totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}
              style={{padding:"5px 11px",borderRadius:6,border:"1px solid #E5E7EB",
                background:page===totalPages-1?"#F9FAFB":"#fff",
                color:page===totalPages-1?"#D1D5DB":"#374151",
                cursor:page===totalPages-1?"default":"pointer",fontSize:13,fontFamily:"inherit"}}>→</button>
          </div>
        )}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
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
              <th style={T.th}>{rg.cols.owner}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(r=>{
              const c=NK[r.nivel]||NK.BAJO;
              const cc=r.cobertura>=60?"#15803D":r.cobertura>=40?"#B45309":"#B91C1C";
              return(
                <tr key={r.id} onClick={()=>onSelect(r)} style={{cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={T.td}><span style={{fontFamily:"monospace",fontSize:11.5,color:"#9CA3AF"}}>{r.id}</span></td>
                  <td style={T.td}><span style={{fontSize:12.5,color:"#6B7280"}}>{r.pais}</span></td>
                  <td style={{...T.td,maxWidth:220}}>
                    <div style={{fontWeight:500,color:"#111827",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:212}}
                      title={r.escenario||r.proceso}>
                      {r.escenario||r.proceso}
                    </div>
                  </td>
                  <td style={{...T.td,maxWidth:130}}>
                    <div style={{fontSize:12.5,color:"#6B7280",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:124}}>
                      {r.equipo}
                    </div>
                  </td>
                  <td style={T.td}><Num v={r.score} size={22} color={c.color}/></td>
                  <td style={T.td}><Badge nivel={r.nivel} t={t}/></td>
                  <td style={T.td}><CovDot pct={r.cobertura} t={t}/></td>
                  <td style={T.td}><span style={{fontSize:13,color:"#6B7280"}}>{fmtM(r.monetario)}</span></td>
                  <td style={T.td}><span style={{fontSize:13,fontWeight:600,color:cc}}>{fmtM(r.residual)}</span></td>
                  <td style={{...T.td,maxWidth:140}}>
                    <div style={{fontSize:12.5,color:"#6B7280",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:132}}>
                      {r.responsable}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages>1&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          marginTop:14,paddingTop:14,borderTop:"1px solid #F3F4F6"}}>
          <span style={{fontSize:12,color:"#9CA3AF"}}>
            {page*PAGE+1}–{Math.min((page+1)*PAGE,risks.length)} {rg.of} {risks.length} {rg.risks}
          </span>
          <div style={{display:"flex",gap:4}}>
            {Array.from({length:Math.min(totalPages,7)},(_,i)=>{
              const pg=totalPages<=7?i:Math.max(0,Math.min(page-3,totalPages-7))+i;
              return(
                <button key={pg} onClick={()=>setPage(pg)}
                  style={{width:28,height:28,borderRadius:6,border:"1px solid #E5E7EB",
                    background:pg===page?"#1D4ED8":"#fff",
                    color:pg===page?"#fff":"#6B7280",cursor:"pointer",
                    fontSize:12,fontWeight:pg===page?600:400,fontFamily:"inherit"}}>
                  {pg+1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   METODOLOGÍA — sub-components
───────────────────────────────────────────────────────────────────────────── */
function MetSection({title,subtitle,children,accent}){
  accent=accent||"#1D4ED8";
  return(
    <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,
      boxShadow:"0 1px 3px rgba(0,0,0,0.05)",overflow:"hidden"}}>
      <div style={{padding:"20px 28px 18px",borderBottom:"2px solid #F3F4F6",
        display:"flex",gap:16,alignItems:"flex-start"}}>
        <div style={{width:3,alignSelf:"stretch",borderRadius:2,
          background:accent,flexShrink:0}}/>
        <div>
          <h2 style={{margin:0,fontSize:15,fontWeight:700,color:"#111827",
            fontFamily:"'Playfair Display',Georgia,serif",letterSpacing:"-0.01em"}}>
            {title}
          </h2>
          {subtitle&&<p style={{margin:"4px 0 0",fontSize:12,color:"#9CA3AF"}}>{subtitle}</p>}
        </div>
      </div>
      <div style={{padding:"22px 28px"}}>{children}</div>
    </div>
  );
}
function MetScoreRow({score,color,label,desc}){
  return(
    <div style={{display:"flex",gap:14,alignItems:"flex-start",
      padding:"10px 0",borderBottom:"1px solid #F9FAFB"}}>
      <div style={{width:42,height:42,borderRadius:9,background:color+"18",
        border:`1px solid ${color}44`,display:"flex",alignItems:"center",
        justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:700,color,fontFamily:"'Playfair Display',Georgia,serif"}}>{score}</span>
      </div>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:"#111827",marginBottom:2}}>{label}</div>
        <div style={{fontSize:12.5,color:"#6B7280",lineHeight:1.6}}>{desc}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TAB: METODOLOGÍA
───────────────────────────────────────────────────────────────────────────── */
function Metodologia({lang}){
  const es=lang==="es";
  const S2={fontSize:13,color:"#374151",lineHeight:1.8,margin:0};
  const SH={fontSize:14,fontWeight:700,color:"#111827",margin:"0 0 10px",
    fontFamily:"'Playfair Display',Georgia,serif"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Hero banner */}
      <div style={{...card,padding:"28px 32px",
        background:"linear-gradient(135deg,#EFF6FF 0%,#F0FDF4 100%)",
        border:"1px solid #BFDBFE"}}>
        <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:600,color:"#1D4ED8",
              letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>
              {es?"Marco Metodológico":"Methodological Framework"}
            </div>
            <h1 style={{fontSize:26,fontWeight:700,color:"#111827",margin:"0 0 12px",
              fontFamily:"'Playfair Display',Georgia,serif"}}>
              {es?"Gestión de Riesgos":"Risk Management"}
            </h1>
            <p style={{...S2,color:"#374151",maxWidth:640}}>
              {es?"Este sistema de monitoreo implementa los principios de ISO 31000:2018 y elementos seleccionados del marco COSO ERM 2017, adaptados al contexto de las Sociedades Alegra."
                 :"This monitoring system implements the principles of ISO 31000:2018 and selected elements of the COSO ERM 2017 framework, adapted to the context of Alegra Societies."}
            </p>
            <div style={{marginTop:14,display:"flex",flexWrap:"wrap",gap:6}}>
              {[["ISO 31000:2018","#1D4ED8","#EFF6FF","#BFDBFE"],
                ["COSO ERM 2017","#1D4ED8","#EFF6FF","#BFDBFE"],
                [es?"Escala 4×4 P×I":"4×4 P×I Scale","#B45309","#FFFBEB","#FDE68A"],
                [es?"Riesgo Residual":"Residual Risk","#6D28D9","#F5F3FF","#DDD6FE"],
                [es?"Sociedades Alegra":"Alegra Societies","#15803D","#F0FDF4","#BBF7D0"],
              ].map(([l,c,bg,br])=>(
                <span key={l} style={{display:"inline-block",padding:"3px 12px",borderRadius:20,
                  fontSize:11.5,fontWeight:600,color:c,background:bg,
                  border:`1px solid ${br}`}}>{l}</span>
              ))}
            </div>
          </div>
          <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
            {[["ISO 31000","2018"],["COSO ERM","2017"],["4×4","P×I"]].map(([a,b])=>(
              <div key={a} style={{width:80,height:52,borderRadius:10,background:"#fff",
                border:"1px solid #E5E7EB",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",
                boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:12.5,fontWeight:700,color:"#111827"}}>{a}</div>
                <div style={{fontSize:10.5,color:"#9CA3AF"}}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Escala 4×4 */}
        <div style={{...card,padding:"22px 24px"}}>
          <h3 style={SH}>{es?"Escala de Evaluación 4×4":"4×4 Evaluation Scale"}</h3>
          <p style={{...S2,fontSize:12,color:"#6B7280",marginBottom:16}}>
            {es?"Score Inherente = Probabilidad (1–4) × Impacto (1–4)"
               :"Inherent Score = Probability (1–4) × Impact (1–4)"}
          </p>

          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,fontWeight:600,color:"#1D4ED8",
              letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>
              {es?"Probabilidad":"Probability"}
            </div>
            {(es
              ?[["1","Remoto","El evento es improbable o no ha ocurrido en el sector"],
                ["2","Posible","Ha ocurrido alguna vez en el sector o en la organización"],
                ["3","Probable","Ocurre regularmente; hay precedentes documentados"],
                ["4","Seguro","Ocurrirá o ya está ocurriendo; es casi inevitable"]]
              :[["1","Remote","The event is unlikely or has not occurred in the sector"],
                ["2","Possible","Has occurred in the sector or organization at some point"],
                ["3","Likely","Occurs regularly; documented precedents exist"],
                ["4","Almost certain","Will occur or is already occurring; nearly inevitable"]]
            ).map(([v,l,d])=>(
              <div key={v} style={{display:"flex",gap:10,padding:"7px 0",
                borderBottom:"1px solid #F9FAFB",alignItems:"flex-start"}}>
                <div style={{width:24,height:24,borderRadius:6,background:"#EFF6FF",
                  border:"1px solid #BFDBFE",display:"flex",alignItems:"center",
                  justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#1D4ED8"}}>{v}</span>
                </div>
                <div>
                  <div style={{fontSize:12.5,fontWeight:600,color:"#111827"}}>{l}</div>
                  <div style={{fontSize:12,color:"#6B7280",lineHeight:1.5}}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{fontSize:11,fontWeight:600,color:"#B91C1C",
              letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>
              {es?"Impacto":"Impact"}
            </div>
            {(es
              ?[["1","Menor","Consecuencias leves, sin afectación material ni reputacional significativa"],
                ["2","Moderado","Consecuencias gestionables; requiere acción correctiva puntual"],
                ["3","Mayor","Impacto significativo en operaciones, finanzas o relaciones laborales"],
                ["4","Crítico","Consecuencias severas: sanciones regulatorias, litigios, daño reputacional grave"]]
              :[["1","Minor","Mild consequences, no significant material or reputational impact"],
                ["2","Moderate","Manageable consequences; requires specific corrective action"],
                ["3","Major","Significant impact on operations, finances, or labor relations"],
                ["4","Critical","Severe consequences: regulatory sanctions, litigation, serious reputational damage"]]
            ).map(([v,l,d])=>(
              <div key={v} style={{display:"flex",gap:10,padding:"7px 0",
                borderBottom:"1px solid #F9FAFB",alignItems:"flex-start"}}>
                <div style={{width:24,height:24,borderRadius:6,background:"#FEF2F2",
                  border:"1px solid #FECACA",display:"flex",alignItems:"center",
                  justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#B91C1C"}}>{v}</span>
                </div>
                <div>
                  <div style={{fontSize:12.5,fontWeight:600,color:"#111827"}}>{l}</div>
                  <div style={{fontSize:12,color:"#6B7280",lineHeight:1.5}}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clasificación + Residual */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{...card,padding:"22px 24px"}}>
            <h3 style={SH}>{es?"Clasificación por Score":"Score Classification"}</h3>
            <MetScoreRow score="12–16" color="#B91C1C"
              label={es?"Crítico — Acción inmediata":"Critical — Immediate action"}
              desc={es?"Escalamiento a alta dirección. Plan ≤ 30 días. Reporte a Junta."
                      :"Escalation to senior management. Plan ≤ 30 days. Board report."}/>
            <MetScoreRow score="9–11" color="#DC2626"
              label={es?"Alto — Prioridad alta":"High — High priority"}
              desc={es?"Plan de mitigación documentado. Seguimiento mensual."
                      :"Documented mitigation plan. Monthly follow-up."}/>
            <MetScoreRow score="6–8" color="#B45309"
              label={es?"Medio-Alto — Monitoreo activo":"Medium-High — Active monitoring"}
              desc={es?"Control activo. Revisión trimestral."
                      :"Active control. Quarterly review."}/>
            <MetScoreRow score="4–5" color="#D97706"
              label={es?"Medio — Monitoreo periódico":"Medium — Periodic monitoring"}
              desc={es?"Revisión semestral. Controles preventivos."
                      :"Biannual review. Preventive controls."}/>
            <MetScoreRow score="1–3" color="#15803D"
              label={es?"Bajo — Aceptado":"Low — Accepted"}
              desc={es?"Dentro del apetito de riesgo. Revisión anual."
                      :"Within risk appetite. Annual review."}/>
          </div>
          <div style={{...card,padding:"20px 22px"}}>
            <h3 style={{...SH,fontSize:13}}>
              {es?"Cobertura de Controles":"Control Coverage"}
            </h3>
            {(es
              ?[["< 40%","Sin control efectivo","#B91C1C","#FEF2F2","Los controles existentes no reducen significativamente la exposición. Requiere acción prioritaria."],
                ["40–60%","Control parcial","#B45309","#FFFBEB","Controles activos pero insuficientes. Plan de mejora antes del cierre de ciclo."],
                ["> 60%","Control efectivo","#15803D","#F0FDF4","El riesgo está gestionado dentro de los umbrales aceptables. Mantener y revisar periódicamente."]]
              :[["< 40%","No effective control","#B91C1C","#FEF2F2","Existing controls do not significantly reduce exposure. Priority action required."],
                ["40–60%","Partial control","#B45309","#FFFBEB","Active but insufficient controls. Improvement plan recommended before cycle close."],
                ["> 60%","Effective control","#15803D","#F0FDF4","Risk is managed within acceptable thresholds. Maintain and review periodically."]]
            ).map(([cov,lbl,color,bg,desc])=>(
              <div key={cov} style={{background:bg,borderRadius:8,padding:"10px 13px",
                border:`1px solid ${color}22`,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12.5,fontWeight:600,color}}>{lbl}</span>
                  <span style={{fontSize:11,color,background:color+"18",
                    padding:"1px 8px",borderRadius:10,fontWeight:600}}>{cov}</span>
                </div>
                <p style={{fontSize:12,color:"#6B7280",margin:0,lineHeight:1.6}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Frameworks — concise, no bullet lists */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{...card,padding:"22px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={{width:40,height:40,background:"#EFF6FF",borderRadius:10,
              border:"1px solid #BFDBFE",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:18}}>📋</div>
            <div>
              <h3 style={{...SH,margin:0,fontSize:14}}>ISO 31000:2018</h3>
              <div style={{fontSize:12,color:"#9CA3AF"}}>
                {es?"Gestión del Riesgo — Directrices":"Risk Management — Guidelines"}
              </div>
            </div>
          </div>
          <p style={{...S2,fontSize:12.5,color:"#374151"}}>
            {es?"Estándar internacional que establece los principios y el proceso para gestionar el riesgo de forma sistemática: identificar, analizar, evaluar y tratar los riesgos, con monitoreo continuo e integración al gobierno corporativo."
               :"International standard establishing the principles and process for managing risk systematically: identify, analyze, assess and treat risks, with continuous monitoring and integration into corporate governance."}
          </p>
        </div>
        <div style={{...card,padding:"22px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={{width:40,height:40,background:"#F0FDF4",borderRadius:10,
              border:"1px solid #BBF7D0",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:18}}>🏛</div>
            <div>
              <h3 style={{...SH,margin:0,fontSize:14}}>COSO ERM 2017</h3>
              <div style={{fontSize:12,color:"#9CA3AF"}}>
                Enterprise Risk Management
              </div>
            </div>
          </div>
          <p style={{...S2,fontSize:12.5,color:"#374151"}}>
            {es?"Marco de gobierno que vincula la gestión del riesgo con la estrategia y el desempeño de la organización. Define cómo la Junta Directiva supervisa los riesgos críticos y cómo se comunican los resultados a los niveles directivos."
               :"Governance framework linking risk management to organizational strategy and performance. Defines how the Board of Directors oversees critical risks and how results are communicated to management levels."}
          </p>
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────────────────────── */
export default function App(){
  const [risksES,setRisksES]=useState([]);      // always Spanish (source)
  const [risksEN,setRisksEN]=useState([]);      // translated to English
  const [status,setStatus]=useState("loading");
  const [errMsg,setErrMsg]=useState("");
  const [lastFetch,setLast]=useState("");
  const [txState,setTxState]=useState("idle");  // idle | loading | done | error
  const txCacheRef=useRef(null);                // cache so we don't re-translate

  const [lang,setLang]=useState("es");
  const [view,setView]=useState("overview");
  const [selected,setSel]=useState(null);
  const [search,setSearch]=useState("");
  const [fNivel,setFNivel]=useState("Todos");
  const [fPais,setFPais]=useState("Todos");
  const [fEquipo,setFEquipo]=useState("Todos");

  const t=I18N[lang];
  const risks=lang==="en"?risksEN:risksES;

  async function load(){
    setStatus("loading");
    setTxState("idle");
    txCacheRef.current=null;
    try{
      const res=await fetch(SHEETS_CSV_URL);
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const text=await res.text();
      const rows=parseCSV(text);
      const data=rows.slice(1)
        .filter(r=>r.length>5&&r[C.escenario]?.trim())
        .map((r,i)=>rowToRisk(r,i));
      setRisksES(data);
      setRisksEN(data); // start with ES until translation arrives
      setStatus("ok");
      setLast(new Date().toLocaleTimeString("es-CO"));
    }catch(e){setErrMsg(e.message);setStatus("error");}
  }

  // Translate when user switches to EN and we have data and no cache yet
  const triggerTranslation=useCallback(async(sourceRisks)=>{
    if(txCacheRef.current){
      // reuse cache
      setRisksEN(applyTranslations(sourceRisks,txCacheRef.current));
      return;
    }
    setTxState("loading");
    try{
      const txMap=await translateRisksToEnglish(sourceRisks);
      txCacheRef.current=txMap;
      setRisksEN(applyTranslations(sourceRisks,txMap));
      setTxState("done");
    }catch(e){
      console.error("Translation failed:",e);
      setTxState("error");
      setRisksEN(sourceRisks); // fallback to Spanish
    }
  },[]);

  useEffect(()=>{load();},[]);

  useEffect(()=>{
    if(lang==="en"&&risksES.length>0&&txState==="idle"){
      triggerTranslation(risksES);
    }
  },[lang,risksES,txState,triggerTranslation]);

  const paises=useMemo(()=>["Todos",...new Set(risks.map(r=>r.pais).filter(Boolean))],[risks]);
  const equipos=useMemo(()=>["Todos",...[...new Set(risks.map(r=>r.equipo).filter(Boolean))].sort()],[risks]);

  const filtered=useMemo(()=>risks.filter(r=>{
    if(fNivel!=="Todos"&&r.nivel!==fNivel)return false;
    if(fPais !=="Todos"&&r.pais !==fPais) return false;
    if(fEquipo!=="Todos"&&r.equipo!==fEquipo)return false;
    if(search){
      const q=search.toLowerCase();
      return[r.escenario,r.proceso,r.id,r.area,r.responsable,r.pais,r.equipo]
        .some(f=>f?.toLowerCase().includes(q));
    }
    return true;
  }),[risks,fNivel,fPais,fEquipo,search]);

  const alertCount=risks.filter(r=>r.nivel==="ALTO").length;

  if(status==="loading")return<LoadingScreen/>;
  if(status==="error")  return<ErrorScreen msg={errMsg} onRetry={load}/>;

  const navItems=[
    {id:"overview",   icon:"▦", label:t.nav.overview},
    {id:"heatmap",    icon:"▤", label:t.nav.heatmap},
    {id:"registros",  icon:"≡", label:t.nav.registros},
    {id:"metodologia",icon:"📋",label:t.nav.metodologia},
  ];
  const iSt={background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:8,
    padding:"7px 11px",color:"#111827",fontSize:13,outline:"none",fontFamily:"inherit"};
  const allOpt=t.filter.all;

  return(
    <div style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      background:"#F3F4F6",minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── TOP HEADER BAR ────────────────────────────────────────── */}
      <div style={{background:"#fff",borderBottom:"1px solid #E5E7EB",
        position:"sticky",top:0,zIndex:200,
        boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>

        {/* Row 1: logo + lang + refresh */}
        <div style={{height:52,display:"flex",alignItems:"center",
          padding:"0 24px",gap:16,borderBottom:"1px solid #F3F4F6"}}>

          {/* Alegra logo — inline SVG wordmark */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <svg width="90" height="24" viewBox="0 0 90 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Icon: stylized "A" circle */}
              <circle cx="12" cy="12" r="12" fill="#00C4B4"/>
              <path d="M8 16L12 7L16 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.5 13H14.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              {/* Wordmark */}
              <text x="28" y="17" fontFamily="-apple-system,BlinkMacSystemFont,'Inter',sans-serif"
                fontSize="15" fontWeight="700" fill="#111827" letterSpacing="-0.3">alegra</text>
            </svg>
          </div>

          {/* Divider */}
          <div style={{width:1,height:24,background:"#E5E7EB",flexShrink:0}}/>

          {/* Product label */}
          <div style={{flexShrink:0}}>
            <div style={{fontSize:13,fontWeight:700,color:"#111827",lineHeight:1}}>
              Risk Monitor
            </div>
            <div style={{fontSize:10,color:"#9CA3AF",marginTop:2,
              letterSpacing:"0.05em",textTransform:"uppercase"}}>
              {lang==="es"?"Gestión de Riesgos":"Risk Management"}
            </div>
          </div>

          {/* Spacer */}
          <div style={{flex:1}}/>

          {/* Filters row */}
          <input placeholder={t.filter.search} value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{...iSt,width:148}}/>
          <select value={fNivel} onChange={e=>setFNivel(e.target.value)} style={iSt}>
            {[allOpt,"ALTO","MEDIO","BAJO"].map(v=><option key={v}>{v}</option>)}
          </select>
          <select value={fEquipo} onChange={e=>setFEquipo(e.target.value)}
            style={{...iSt,maxWidth:134}}>
            {equipos.map(p=><option key={p}>{p}</option>)}
          </select>
          <select value={fPais} onChange={e=>setFPais(e.target.value)} style={iSt}>
            {paises.map(p=><option key={p}>{p}</option>)}
          </select>

          {/* Refresh */}
          <button onClick={load} title="Recargar datos"
            style={{width:32,height:32,borderRadius:8,border:"1px solid #E5E7EB",
              background:"#fff",cursor:"pointer",fontSize:16,color:"#6B7280",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#F3F4F6";e.currentTarget.style.color="#111827";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#6B7280";}}>
            ↻
          </button>

          {/* Count badge */}
          <div style={{background:"#F3F4F6",borderRadius:7,padding:"4px 10px",
            fontSize:11,color:"#6B7280",lineHeight:1.5,textAlign:"center",flexShrink:0}}>
            <div style={{fontWeight:700,color:"#111827"}}>{filtered.length}<span style={{fontWeight:400,color:"#9CA3AF"}}>/{risks.length}</span></div>
            <div style={{fontSize:10}}>{lastFetch}</div>
          </div>

          {/* Language toggle */}
          <div style={{display:"flex",background:"#F3F4F6",borderRadius:8,
            padding:3,flexShrink:0,gap:2}}>
            {[["es","🇨🇴","ES"],["en","🇺🇸","EN"]].map(([l,flag,code])=>(
              <button key={l} onClick={()=>setLang(l)}
                style={{display:"flex",alignItems:"center",gap:5,
                  padding:"4px 11px",borderRadius:6,border:"none",
                  cursor:"pointer",fontSize:12,fontWeight:700,
                  fontFamily:"inherit",letterSpacing:"0.04em",
                  background:lang===l?"#fff":"transparent",
                  color:lang===l?"#1D4ED8":"#9CA3AF",
                  boxShadow:lang===l?"0 1px 3px rgba(0,0,0,0.1)":"none",
                  transition:"all .15s"}}>
                <span>{flag}</span>
                <span>{code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: navigation tabs */}
        <div style={{height:44,display:"flex",alignItems:"stretch",
          padding:"0 24px",gap:0}}>
          {navItems.map(item=>{
            const active=view===item.id;
            return(
              <button key={item.id} onClick={()=>setView(item.id)}
                style={{display:"flex",alignItems:"center",gap:7,
                  padding:"0 18px",border:"none",cursor:"pointer",
                  fontSize:13,fontWeight:active?700:500,
                  fontFamily:"inherit",position:"relative",
                  background:"transparent",
                  color:active?"#1D4ED8":"#6B7280",
                  transition:"color .15s",whiteSpace:"nowrap"}}>
                {/* active underline */}
                {active&&<div style={{position:"absolute",bottom:0,left:0,right:0,
                  height:2,background:"#1D4ED8",borderRadius:"2px 2px 0 0"}}/>}
                {/* hover underline */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,
                  height:2,background:"#E5E7EB",borderRadius:"2px 2px 0 0",
                  opacity:active?0:1}}/>
                <span style={{fontSize:14,lineHeight:1}}>{item.icon}</span>
                {item.label}
                {(item.badge||0)>0&&(
                  <span style={{minWidth:18,height:18,borderRadius:9,
                    background:"#DC2626",color:"#fff",fontSize:10,
                    fontWeight:700,padding:"0 4px",display:"inline-flex",
                    alignItems:"center",justifyContent:"center",lineHeight:1}}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1380,margin:"0 auto",padding:"24px 24px 64px"}}>
        {/* Translation banner */}
        {lang==="en"&&<TranslationBanner state={txState} t={t}/>}

        {view==="overview"   &&<Overview    risks={filtered} onSelect={setSel} t={t}/>}
        {view==="heatmap"    &&<HeatMap     risks={filtered} onSelect={setSel} t={t}/>}
        {view==="registros"  &&<Registros   risks={filtered} onSelect={setSel} t={t}/>}
        {view==="metodologia"&&<Metodologia lang={lang}/>}
      </div>

      {/* FOOTER */}
      <div style={{borderTop:"1px solid #E5E7EB",background:"#fff",
        padding:"10px 24px",display:"flex",justifyContent:"space-between",
        fontSize:11.5,color:"#9CA3AF"}}>
        <span>{t.footer}</span>
        <span>
          Google Sheets · {lastFetch} ·{" "}
          <button onClick={load} style={{background:"none",border:"none",
            color:"#1D4ED8",cursor:"pointer",fontSize:11.5,
            fontWeight:600,fontFamily:"inherit"}}>{t.reload}</button>
        </span>
      </div>

      <Drawer risk={selected} onClose={()=>setSel(null)} t={t}/>
    </div>
  );
}
