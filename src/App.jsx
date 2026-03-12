import { useState } from "react";
import { SOCIETIES } from "./constants";
import { I18N } from "./constants/i18n";
import { useRisks, useFilters } from "./hooks/useRisks";
import { LoadingScreen, ErrorScreen, TranslationBanner } from "./components/atoms";
import { Drawer } from "./components/Drawer";
import { Overview } from "./views/Overview";
import { HeatMap } from "./views/HeatMap";
import { KRIMonitor } from "./views/KRIMonitor";
import { Registros } from "./views/Registros";
import { Metodologia } from "./views/Metodologia";

export default function App() {
  const [lang, setLang] = useState("es");
  const [view, setView] = useState("overview");
  const [selected, setSel] = useState(null);

  const t = I18N[lang];
  const { risks, status, errMsg, lastFetch, txState, load } = useRisks(lang);
  const {
    filtered, equipos,
    search, setSearch,
    fNivel, setFNivel,
    fPais, setFPais,
    fEquipo, setFEquipo,
  } = useFilters(risks);

  if (status === "loading") return <LoadingScreen />;
  if (status === "error")   return <ErrorScreen msg={errMsg} onRetry={load} />;

  const alertCount = risks.filter((r) => r.nivel === "ALTO").length;
  const navItems = [
    { id: "overview",    icon: "▦", label: t.nav.overview },
    { id: "heatmap",     icon: "▤", label: t.nav.heatmap },
    { id: "registros",   icon: "≡", label: t.nav.registros },
    { id: "metodologia", icon: "📋", label: t.nav.metodologia },
  ];

  const iSt = {
    background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8,
    padding: "7px 11px", color: "#111827", fontSize: 13, outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", background: "#F3F4F6", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

        {/* Row 1: logo + filters + lang + refresh */}
        <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <svg width="90" height="24" viewBox="0 0 90 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#00C4B4"/>
              <path d="M8 16L12 7L16 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.5 13H14.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <text x="28" y="17" fontFamily="-apple-system,BlinkMacSystemFont,'Inter',sans-serif" fontSize="15" fontWeight="700" fill="#111827" letterSpacing="-0.3">alegra</text>
            </svg>
          </div>

          <div style={{ width:1, height:24, background:"#E5E7EB", flexShrink:0 }}/>

          <div style={{ flexShrink:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#111827", lineHeight:1 }}>Risk Monitor</div>
            <div style={{ fontSize:10, color:"#9CA3AF", marginTop:2, letterSpacing:"0.05em", textTransform:"uppercase" }}>
              {lang==="es"?"Gestión de Riesgos":"Risk Management"}
            </div>
          </div>

          <div style={{ flex:1 }}/>

          <input placeholder={t.filter.search} value={search} onChange={e=>setSearch(e.target.value)} style={{ ...iSt, width:148 }}/>
          <select value={fNivel} onChange={e=>setFNivel(e.target.value)} style={iSt}>
            <option value="Todos">{lang==="es"?"Nivel":"Level"}</option>
            {["ALTO","MEDIO","BAJO"].map(v=><option key={v}>{v}</option>)}
          </select>
          <select value={fEquipo} onChange={e=>setFEquipo(e.target.value)} style={{ ...iSt, maxWidth:134 }}>
            <option value="Todos">{lang==="es"?"Equipo":"Team"}</option>
            {equipos.filter(e=>e!=="Todos").map(p=><option key={p}>{p}</option>)}
          </select>
          <select value={fPais} onChange={e=>setFPais(e.target.value)} style={{ ...iSt, maxWidth:200 }}>
            <option value="Todos">{lang==="es"?"Sociedad":"Society"}</option>
            {SOCIETIES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ display:"flex", background:"#F0F0F0", borderRadius:8, padding:3, flexShrink:0, gap:1, border:"1px solid #E5E7EB" }}>
            {[["es","ES"],["en","EN"]].map(([l,code])=>(
              <button key={l} onClick={()=>setLang(l)} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 12px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12.5, fontWeight:700, fontFamily:"inherit", letterSpacing:"0.05em", background:lang===l?"#fff":"transparent", color:lang===l?"#00C4B4":"#9CA3AF", boxShadow:lang===l?"0 1px 3px rgba(0,0,0,0.12)":"none", transition:"all .15s" }}>
                {code}
              </button>
            ))}
          </div>

          <div style={{ width:1, height:22, background:"#E5E7EB", flexShrink:0 }}/>

          <button onClick={load} title="Recargar datos"
            style={{ width:32, height:32, borderRadius:8, border:"1px solid #E5E7EB", background:"#fff", cursor:"pointer", fontSize:16, color:"#6B7280", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#F3F4F6";e.currentTarget.style.color="#111827";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#6B7280";}}>
            ↻
          </button>

          <div style={{ background:"#F3F4F6", borderRadius:7, padding:"4px 10px", fontSize:11, color:"#6B7280", lineHeight:1.5, textAlign:"center", flexShrink:0 }}>
            <div style={{ fontWeight:700, color:"#111827" }}>
              {filtered.length}<span style={{ fontWeight:400, color:"#9CA3AF" }}>/{risks.length}</span>
            </div>
            <div style={{ fontSize:10 }}>{lastFetch}</div>
          </div>
        </div>

        {/* Row 2: nav tabs */}
        <div style={{ height:44, display:"flex", alignItems:"stretch", padding:"0 24px", gap:0 }}>
          {navItems.map(item=>{
            const active=view===item.id;
            return(
              <button key={item.id} onClick={()=>setView(item.id)}
                style={{ display:"flex", alignItems:"center", gap:7, padding:"0 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:active?700:500, fontFamily:"inherit", position:"relative", background:"transparent", color:active?"#1D4ED8":"#6B7280", transition:"color .15s", whiteSpace:"nowrap" }}>
                {active&&<div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"#1D4ED8", borderRadius:"2px 2px 0 0" }}/>}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"#E5E7EB", borderRadius:"2px 2px 0 0", opacity:active?0:1 }}/>
                <span style={{ fontSize:14, lineHeight:1 }}>{item.icon}</span>
                {item.label}
                {(item.badge||0)>0&&(
                  <span style={{ minWidth:18, height:18, borderRadius:9, background:"#DC2626", color:"#fff", fontSize:10, fontWeight:700, padding:"0 4px", display:"inline-flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:1380, margin:"0 auto", padding:"24px 24px 64px" }}>
        {lang==="en"&&<TranslationBanner state={txState} t={t}/>}
        {view==="overview"    &&<Overview    risks={filtered} onSelect={setSel} t={t}/>}
        {view==="heatmap"     &&<HeatMap     risks={filtered} onSelect={setSel} t={t}/>}
        {view==="kri"         &&<KRIMonitor  risks={filtered} onSelect={setSel} t={t}/>}
        {view==="registros"   &&<Registros   risks={filtered} onSelect={setSel} t={t}/>}
        {view==="metodologia" &&<Metodologia lang={lang}/>}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop:"1px solid #E5E7EB", background:"#fff", padding:"10px 24px", display:"flex", justifyContent:"space-between", fontSize:11.5, color:"#9CA3AF" }}>
        <span>{t.footer}</span>
        <span>
          Google Sheets · {lastFetch} ·{" "}
          <button onClick={load} style={{ background:"none", border:"none", color:"#1D4ED8", cursor:"pointer", fontSize:11.5, fontWeight:600, fontFamily:"inherit" }}>
            {t.reload}
          </button>
        </span>
      </div>

      <Drawer risk={selected} onClose={()=>setSel(null)} t={t}/>
    </div>
  );
}
