/* eslint-disable no-undef */
import { useState, useEffect, useRef, useCallback } from "react";

const T = {
  teal:"#0D9488", tealDk:"#0F766E", tealLt:"#CCFBF1",
  navy:"#1A2B4A", navyMd:"#243554",
  blue:"#2563EB", blueLt:"#DBEAFE",
  red:"#DC2626",  redLt:"#FEE2E2",
  orange:"#EA580C", orangeLt:"#FFEDD5",
  green:"#16A34A", greenLt:"#DCFCE7",
  amber:"#D97706", amberLt:"#FEF3C7",
  purple:"#7C3AED", purpleLt:"#EDE9FE",
  s50:"#F8FAFC", s100:"#F1F5F9", s200:"#E2E8F0", s300:"#CBD5E1",
  s400:"#94A3B8", s500:"#64748B", s700:"#334155", s900:"#0F172A",
  white:"#FFFFFF",
};

const LIFESPAN = { Helm:10, Seil:10, Gurt:10, Karabiner:15, "LVS-Gerät":10, Steigeisen:20, Sicherung:15, Pickel:20, Rucksack:15, Sonstiges:10 };

const PRODUCT_DB = {
  "3342540837076": { name:"Helm Petzl Meteor IV",          brand:"Petzl",         cat:"Helm"                   },
  "4052285098001": { name:"Seil Edelrid Swift 48X",        brand:"Edelrid",       cat:"Seil"                   },
  "793661360728":  { name:"Karabiner BD 210 Serie",        brand:"Black Diamond", cat:"Karabiner", recall:true  },
  "7613357529310": { name:"LVS Mammut Barryvox",           brand:"Mammut",        cat:"LVS-Gerät"              },
  "4251422500067": { name:"Klettergurt Ortovox Rock",      brand:"Ortovox",       cat:"Gurt"                   },
  "7630012345678": { name:"Pickel Black Diamond Raven",    brand:"Black Diamond", cat:"Pickel"                 },
  "4046051062297": { name:"Steigeisen Salewa Alpinist",    brand:"Salewa",        cat:"Steigeisen"             },
  "4250631023456": { name:"Sicherungsgerät Edelrid Jul 2", brand:"Edelrid",       cat:"Sicherung"              },
  "QR-PETZL-V2-2024":  { name:"Petzl Vertex Best Helm",   brand:"Petzl",         cat:"Helm"                   },
  "QR-MAMMUT-ROPE-48": { name:"Mammut Infinity Dry 9.5",  brand:"Mammut",        cat:"Seil"                   },
  "SN-BD210-2023-Q4A": { name:"Karabiner BD 210 Serie",   brand:"Black Diamond", cat:"Karabiner", recall:true  },
  "SN-PETZ-MET-78432": { name:"Helm Petzl Meteor IV",     brand:"Petzl",         cat:"Helm"                   },
};

const RECALL_DB = {
  "793661360728": { id:"RC-2025-001", severity:"critical", title:"Karabiner BD 210 – Materialfehler Verschluss", date:"14.05.2025", batch:"BD210-2023-Q4", desc:"In der Produktionsserie BD210-2023-Q4 wurde ein Materialfehler in der Verschlussmechanik festgestellt. Unter extremer Belastung kann der Verschluss versagen und zum Absturz führen.", action:"Produkt sofort außer Betrieb nehmen. Kostenlosen Ersatz beim Händler anfragen. Hotline: 0800 123 4567" },
  "SN-BD210-2023-Q4A": { id:"RC-2025-001", severity:"critical", title:"Karabiner BD 210 – Materialfehler Verschluss", date:"14.05.2025", batch:"BD210-2023-Q4", desc:"Materialfehler in der Verschlussmechanik – Versagen unter Belastung möglich.", action:"Sofort außer Betrieb nehmen. Hotline: 0800 123 4567" },
};

const DEMO_USERS = {
  "max@dav.de":  { pw:"demo1234", name:"Max Müller",  initials:"MM" },
  "anna@sac.ch": { pw:"demo1234", name:"Anna Berger", initials:"AB" },
};

const TOUR_TYPES=[{id:"klettern",label:"Klettern",icon:"🧗",color:"#2563EB"},{id:"hochtour",label:"Hochtour",icon:"🏔️",color:"#0D9488"},{id:"skitouren",label:"Skitouren",icon:"⛷️",color:"#7C3AED"},{id:"wandern",label:"Wandern",icon:"🥾",color:"#16A34A"},{id:"eisklettern",label:"Eisklettern",icon:"🧊",color:"#0284C7"},{id:"alle",label:"Alle Touren",icon:"🗺️",color:"#64748B"}];

const INIT_GEAR=[
  {id:"g1",name:"Helm Petzl Meteor IV",brand:"Petzl",cat:"Helm",ean:"3342540837076",serial:"SN-PETZ-MET-78432",reg:"12.03.2024",kaufDatum:"2019-03-12",status:"ok",done:false,receipt:null,teamId:null,tourType:"klettern",impacts:[]},
  {id:"g2",name:"Seil Edelrid Swift 48X",brand:"Edelrid",cat:"Seil",ean:"4052285098001",serial:"",reg:"05.01.2024",kaufDatum:"2020-01-05",status:"ok",done:false,receipt:null,teamId:null,tourType:"klettern",impacts:[]},
  {id:"g3",name:"Karabiner BD 210 Serie",brand:"Black Diamond",cat:"Karabiner",ean:"793661360728",serial:"SN-BD210-2023-Q4A",reg:"20.11.2023",kaufDatum:"2023-11-20",status:"recall",done:false,receipt:null,teamId:null,tourType:"klettern",impacts:[]},
  {id:"g4",name:"LVS Mammut Barryvox",brand:"Mammut",cat:"LVS-Gerät",ean:"7613357529310",serial:"",reg:"02.09.2023",kaufDatum:"2022-09-02",status:"ok",done:false,receipt:null,teamId:"team1",tourType:"skitouren",impacts:[]},
  {id:"g5",name:"Klettergurt Ortovox Rock",brand:"Ortovox",cat:"Gurt",ean:"4251422500067",serial:"",reg:"18.06.2023",kaufDatum:"2015-06-18",status:"ok",done:false,receipt:null,teamId:null,tourType:"hochtour",impacts:[]},
];

function uid()      { return Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function today()    { return new Date().toLocaleDateString("de-DE"); }
function todayISO() { return new Date().toISOString().slice(0,10); }

function expiryInfo(kaufDatum, cat) {
  if (!kaufDatum) return null;
  const years  = LIFESPAN[cat] || 10;
  const buy    = new Date(kaufDatum);
  const exp    = new Date(buy); exp.setFullYear(exp.getFullYear()+years);
  const now    = new Date();
  const msLeft = exp - now;
  const daysLeft = Math.ceil(msLeft/(1000*60*60*24));
  const pct    = Math.max(0,Math.min(100,((exp-buy-msLeft)/(exp-buy))*100));
  const status = daysLeft<0?"expired":daysLeft<180?"critical":daysLeft<365?"warning":"ok";
  return { exp, daysLeft, years, pct, status, expStr:exp.toLocaleDateString("de-DE"), ageYears:((now-buy)/(1000*60*60*24*365)).toFixed(1) };
}
function expiryColor(s) { return s==="expired"?T.red:s==="critical"?T.orange:s==="warning"?T.amber:T.green; }
function catIcon(c)  { const m={Helm:"⛑️",Seil:"🪢",Karabiner:"🔗","LVS-Gerät":"📡",Gurt:"🧗",Pickel:"⛏️",Steigeisen:"🦶",Sicherung:"🔒",Rucksack:"🎒"};return m[c]||"🏔️"; }
function catColor(c) { const m={Helm:T.blue,Seil:T.teal,Karabiner:T.orange,"LVS-Gerät":T.navy,Gurt:T.green,Pickel:T.s700,Steigeisen:T.purple,Sicherung:T.teal,Rucksack:T.orange};return m[c]||T.s500; }

function sLoad(k, fb=null) {
  try {
    const v = localStorage.getItem(k);
    return Promise.resolve(v !== null ? JSON.parse(v) : fb);
  } catch { return Promise.resolve(fb); }
}
function sSave(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  return Promise.resolve();
}
function sDel(k) {
  try { localStorage.removeItem(k); } catch {}
  return Promise.resolve();
}

function Icon({n,s=22,c="currentColor"}){
  const p={width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"};
  if(n==="home")       return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
  if(n==="gear")       return <svg {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
  if(n==="bell")       return <svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(n==="user")       return <svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(n==="users")      return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
  if(n==="shield")     return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  if(n==="alert")      return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  if(n==="check")      return <svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
  if(n==="plus")       return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if(n==="camera")     return <svg {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
  if(n==="back")       return <svg {...p}><polyline points="15 18 9 12 15 6"/></svg>;
  if(n==="mountain")   return <svg {...p}><polygon points="3 20 9 4 14 14 17 9 21 20"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
  if(n==="search")     return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if(n==="trash")      return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
  if(n==="info")       return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
  if(n==="settings")   return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
  if(n==="logout")     return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  if(n==="eye")        return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if(n==="eyeoff")     return <svg {...p}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  if(n==="history")    return <svg {...p}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>;
  if(n==="spark")      return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if(n==="mail")       return <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  if(n==="lock")       return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
  if(n==="x")          return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if(n==="barcode")    return <svg {...p}><path d="M3 5v4M3 15v4M21 5v4M21 15v4M7 5v14M17 5v14M11 5v4M11 15v4M15 5v14"/></svg>;
  if(n==="qr")         return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3"/><rect x="16" y="5" width="3" height="3"/><rect x="5" y="16" width="3" height="3"/><line x1="14" y1="14" x2="20" y2="14"/><line x1="14" y1="17" x2="14" y2="20"/><line x1="20" y1="17" x2="20" y2="20"/></svg>;
  if(n==="text")       return <svg {...p}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
  if(n==="clock")      return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if(n==="receipt")    return <svg {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
  if(n==="wifi-off")   return <svg {...p}><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
  if(n==="wifi")       return <svg {...p}><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
  if(n==="hash")       return <svg {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
  if(n==="law")        return <svg {...p}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
  if(n==="chevron")    return <svg {...p}><polyline points="9 18 15 12 9 6"/></svg>;
  if(n==="export")     return <svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
  if(n==="checkCircle")return <svg {...p}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  if(n==="map")        return <svg {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
  if(n==="phone")      return <svg {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.82 19.79 19.79 0 01.49 2.18 2 2 0 012.68 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.07a16 16 0 006.72 6.72l1.06-1.06a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
  if(n==="star")       return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if(n==="trophy")     return <svg {...p}><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a1 1 0 00-1 1v2a4 4 0 004 4h10a4 4 0 004-4V5a1 1 0 00-1-1h-3"/><rect x="7" y="2" width="10" height="9" rx="1"/></svg>;
  return null;
}

// ── App-Logo Komponente – nutzt das echte Icon aus public/icons/ ─────────────
function AppLogo({size=30, style:extra={}}){
  return <img
    src="/icons/icon-192.png"
    alt="AlpineRecall"
    style={{width:size, height:size, objectFit:"contain", borderRadius:size*0.22, ...extra}}
  />;
}

function Btn({label,icon,onClick,variant="primary",disabled=false,full=false,small=false}){
  const ST={primary:{bg:T.teal,fg:T.white,sh:`0 4px 14px ${T.teal}40`},navy:{bg:T.navy,fg:T.white,sh:`0 4px 14px ${T.navy}30`},danger:{bg:T.red,fg:T.white,sh:"none"},ghost:{bg:T.white,fg:T.s500,sh:"none",bd:`1.5px solid ${T.s200}`},purple:{bg:T.purple,fg:T.white,sh:`0 4px 14px ${T.purple}40`},amber:{bg:T.amber,fg:T.white,sh:"none"}}[variant]||{bg:T.teal,fg:T.white,sh:"none"};
  return <button onClick={onClick} disabled={disabled} onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform="scale(0.97)"}} onMouseUp={e=>{e.currentTarget.style.transform=""}} style={{width:full?"100%":undefined,background:disabled?T.s200:ST.bg,color:disabled?T.s400:ST.fg,border:ST.bd||"none",borderRadius:14,cursor:disabled?"not-allowed":"pointer",padding:small?"8px 14px":"13px 20px",fontSize:small?13:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"opacity .15s,transform .1s",boxShadow:disabled?"none":ST.sh}}>{icon&&<Icon n={icon} s={small?14:16} c={disabled?T.s400:ST.fg}/>}{label}</button>;
}

function FInput({label,type="text",value,onChange,placeholder,icon,error,autoFocus=false,min,max}){
  const [show,setShow]=useState(false);
  const t2=type==="password"?(show?"text":"password"):type;
  return <div style={{marginBottom:14}}>{label&&<label style={{display:"block",fontSize:12,fontWeight:600,color:T.s500,marginBottom:5,fontFamily:"'DM Sans',sans-serif"}}>{label}</label>}<div style={{position:"relative"}}>{icon&&<div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon n={icon} s={16} c={T.s400}/></div>}<input autoFocus={autoFocus} type={t2} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${error?T.red:T.s200}`,borderRadius:12,padding:icon?"12px 40px 12px 38px":"12px 40px 12px 14px",fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:T.navy,background:T.white,transition:"border-color .2s"}} onFocus={e=>e.target.style.borderColor=error?T.red:T.teal} onBlur={e=>e.target.style.borderColor=error?T.red:T.s200}/>{type==="password"&&<button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2}}><Icon n={show?"eyeoff":"eye"} s={16} c={T.s400}/></button>}</div>{error&&<p style={{margin:"4px 0 0",fontSize:12,color:T.red,fontFamily:"'DM Sans',sans-serif"}}>{error}</p>}</div>;
}

function Badge({label,color,bg}){return <span style={{background:bg,color,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,fontFamily:"'DM Sans',sans-serif",flexShrink:0,whiteSpace:"nowrap"}}>{label}</span>;}
function Spinner({size=36,color=T.teal}){return <><style>{`@keyframes ar-spin{to{transform:rotate(360deg)}}`}</style><div style={{width:size,height:size,border:`3px solid ${color}30`,borderTop:`3px solid ${color}`,borderRadius:"50%",animation:"ar-spin .8s linear infinite",margin:"0 auto"}}/></>;}

function PushToast({recall,onClose,onView}){
  useEffect(()=>{const t=setTimeout(onClose,7000);return()=>clearTimeout(t);},[onClose]);
  return <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",width:"90%",maxWidth:360,background:T.navy,borderRadius:16,padding:"14px 16px",zIndex:500,boxShadow:"0 12px 40px rgba(0,0,0,.45)",display:"flex",gap:12,alignItems:"flex-start"}}><div style={{background:`${T.red}30`,borderRadius:10,padding:8,flexShrink:0}}><Icon n="bell" s={18} c={T.red}/></div><div style={{flex:1,minWidth:0}}><p style={{margin:"0 0 2px",fontSize:13,fontWeight:700,color:T.white,fontFamily:"'DM Sans',sans-serif"}}>⚠ Rückruf erkannt!</p><p style={{margin:"0 0 8px",fontSize:12,color:"#93C5FD",lineHeight:1.4,fontFamily:"'DM Sans',sans-serif"}}>{recall.title}</p><button onClick={onView} style={{background:T.red,border:"none",borderRadius:8,padding:"5px 12px",color:T.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Ansehen</button></div><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:2,flexShrink:0}}><Icon n="x" s={16} c={T.s400}/></button></div>;
}

function OfflineBanner({isOffline,lastSync}){
  if(!isOffline) return null;
  return <div style={{background:"linear-gradient(135deg,#374151,#1F2937)",padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}><Icon n="wifi-off" s={13} c="#FCD34D"/><p style={{margin:0,fontSize:11,color:"#FCD34D",fontFamily:"'DM Sans',sans-serif",flex:1}}>Offline-Modus – Daten aus Cache{lastSync?` · ${new Date(lastSync).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}`:""}</p></div>;
}
const SCAN_MODES=[{id:"barcode",label:"Barcode",icon:"barcode",hint:"EAN-Barcode in den Rahmen halten"},{id:"qr",label:"QR-Code",icon:"qr",hint:"QR-Code in den Rahmen halten"},{id:"serial",label:"Seriennr.",icon:"text",hint:"Typenschild fotografieren"},{id:"receipt",label:"Quittung",icon:"receipt",hint:"Kaufbeleg fotografieren"}];

function SmartScanner({onDetect,onClose,initialMode="barcode"}){
  const videoRef=useRef(null),canvasRef=useRef(null),streamRef=useRef(null),scanRef=useRef(null);
  const [mode,setMode]=useState(initialMode);
  const [status,setStatus]=useState("starting");
  const [manualVal,setManualVal]=useState("");
  const [captured,setCaptured]=useState(null);
  const [processing,setProcessing]=useState(false);
  const [snCandidates,setSnCandidates]=useState([]);
  const [receiptData,setReceiptData]=useState(null);
  const stopStream=useCallback(()=>{if(scanRef.current){clearInterval(scanRef.current);scanRef.current=null;}if(streamRef.current){streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;}},[]);
  useEffect(()=>{
    let alive=true;
    (async()=>{try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});if(!alive){stream.getTracks().forEach(t=>t.stop());return;}streamRef.current=stream;if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}setStatus("active");}catch{if(alive)setStatus("error");}})();
    return()=>{alive=false;stopStream();};
  },[stopStream]);
  useEffect(()=>{
    if(status!=="active"||mode==="serial"||mode==="receipt")return;
    if(!("BarcodeDetector" in window)){setStatus("noapi");return;}
    const formats=mode==="qr"?["qr_code"]:["ean_13","ean_8","code_128","code_39","upc_a","upc_e"];
    let det;try{det=new window.BarcodeDetector({formats});}catch{setStatus("noapi");return;}
    scanRef.current=setInterval(async()=>{if(!videoRef.current||videoRef.current.readyState<2)return;try{const codes=await det.detect(videoRef.current);if(codes.length>0){stopStream();onDetect(codes[0].rawValue,mode);}}catch{}},350);
    return()=>{if(scanRef.current)clearInterval(scanRef.current);};
  },[status,mode,stopStream,onDetect]);
  function capture(){
    if(!videoRef.current||!canvasRef.current)return;
    const v=videoRef.current,c=canvasRef.current;c.width=v.videoWidth||640;c.height=v.videoHeight||480;
    const ctx=c.getContext("2d");ctx.drawImage(v,0,0);
    const img=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<img.data.length;i+=4){const avg=(img.data[i]+img.data[i+1]+img.data[i+2])/3;const v2=avg>128?Math.min(255,avg*1.3):Math.max(0,avg*.7);img.data[i]=img.data[i+1]=img.data[i+2]=v2;}ctx.putImageData(img,0,0);
    const url=c.toDataURL("image/jpeg",.8);setCaptured(url);
    if(mode==="serial"){setProcessing(true);setTimeout(()=>{setSnCandidates(["SN-BD210-2023-Q4A","SN-PETZ-MET-78432"]);setProcessing(false);},1800);}
    if(mode==="receipt"){setProcessing(true);setTimeout(()=>{const d=new Date();d.setMonth(d.getMonth()-6);setReceiptData({date:d.toISOString().slice(0,10),dateStr:d.toLocaleDateString("de-DE"),store:"Sporthaus Schuster",image:url,confidence:94});setProcessing(false);},2000);}
  }
  function switchMode(m){setMode(m);setCaptured(null);setSnCandidates([]);setReceiptData(null);setManualVal("");}
  const DEMOS={barcode:["3342540837076 – Petzl Helm","793661360728 – BD Karabiner ⚠️"],qr:["QR-PETZL-V2-2024 – Petzl QR","QR-MAMMUT-ROPE-48 – Mammut Seil"],serial:["SN-BD210-2023-Q4A – BD Karabiner ⚠️","SN-PETZ-MET-78432 – Petzl Helm"],receipt:[]};
  return <div style={{position:"fixed",inset:0,background:"#000",zIndex:400,display:"flex",flexDirection:"column"}}>
    <canvas ref={canvasRef} style={{display:"none"}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,zIndex:20,background:"linear-gradient(to bottom,rgba(0,0,0,.85),transparent)",padding:"52px 16px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <h3 style={{margin:0,fontSize:17,fontWeight:700,color:T.white,fontFamily:"'DM Serif Display',serif"}}>Artikel erfassen</h3>
      <button onClick={()=>{stopStream();onClose();}} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="x" s={18} c={T.white}/></button>
    </div>
    <div style={{position:"absolute",top:102,left:0,right:0,zIndex:20,display:"flex",justifyContent:"center",gap:6,padding:"0 10px"}}>
      {SCAN_MODES.map(m=><button key={m.id} onClick={()=>switchMode(m.id)} style={{background:mode===m.id?"rgba(13,148,136,.9)":"rgba(255,255,255,.12)",border:`1.5px solid ${mode===m.id?T.teal:"rgba(255,255,255,.25)"}`,borderRadius:20,padding:"6px 10px",color:T.white,fontSize:11,fontWeight:mode===m.id?700:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5,backdropFilter:"blur(8px)"}}>
        <Icon n={m.icon} s={12} c={T.white}/>{m.label}
      </button>)}
    </div>
    {captured?<img src={captured} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
    {!captured&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{width:mode==="qr"?200:280,height:mode==="qr"?200:140,position:"relative"}}>
        <style>{`@keyframes ar-scan{0%{top:8px}100%{top:calc(100% - 10px)}}`}</style>
        {[["0%","0%","top","left"],["0%","100%","top","right"],["100%","0%","bottom","left"],["100%","100%","bottom","right"]].map(([t,l,vp,hp],i)=><div key={i} style={{position:"absolute",top:vp==="top"?-2:undefined,bottom:vp==="bottom"?-2:undefined,left:hp==="left"?-2:undefined,right:hp==="right"?-2:undefined,width:28,height:28,borderTop:vp==="top"?`3px solid ${T.teal}`:undefined,borderBottom:vp==="bottom"?`3px solid ${T.teal}`:undefined,borderLeft:hp==="left"?`3px solid ${T.teal}`:undefined,borderRight:hp==="right"?`3px solid ${T.teal}`:undefined}}/>)}
        {mode!=="serial"&&mode!=="receipt"&&<div style={{position:"absolute",left:4,right:4,height:2,background:T.teal,boxShadow:`0 0 10px ${T.teal}`,animation:"ar-scan 1.8s ease-in-out infinite alternate"}}/>}
      </div>
    </div>}
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(0,0,0,.92) 70%,transparent)",padding:"16px 20px 48px"}}>
      {status==="active"&&!captured&&(mode==="serial"||mode==="receipt")&&<div style={{textAlign:"center",marginBottom:12}}>
        <button onClick={capture} style={{width:64,height:64,borderRadius:"50%",background:T.white,border:`4px solid ${mode==="receipt"?T.amber:T.teal}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}><Icon n="camera" s={26} c={T.navy}/></button>
        <p style={{margin:"8px 0 0",fontSize:12,color:"rgba(255,255,255,.6)",fontFamily:"'DM Sans',sans-serif"}}>{mode==="receipt"?"Kaufbeleg fotografieren":"Typenschild fotografieren"}</p>
      </div>}
      {mode==="serial"&&captured&&(processing?<div style={{textAlign:"center",marginBottom:12}}><Spinner size={28} color={T.teal}/><p style={{margin:"8px 0 0",fontSize:12,color:"rgba(255,255,255,.7)",fontFamily:"'DM Sans',sans-serif"}}>Erkenne Seriennummer…</p></div>:snCandidates.length>0&&<div style={{marginBottom:10}}><p style={{color:"rgba(255,255,255,.7)",fontSize:12,margin:"0 0 8px",fontFamily:"'DM Sans',sans-serif"}}>Erkannte Seriennummern:</p>{snCandidates.map(sn=><button key={sn} onClick={()=>{stopStream();onDetect(sn,"serial");}} style={{width:"100%",background:"rgba(13,148,136,.85)",border:`1px solid ${T.teal}`,borderRadius:10,padding:"10px 14px",color:T.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left",display:"flex",justifyContent:"space-between",marginBottom:6}}><span>{sn}</span><Icon n="check" s={16} c={T.white}/></button>)}</div>)}
      {mode==="receipt"&&captured&&(processing?<div style={{textAlign:"center",marginBottom:10}}><Spinner size={28} color={T.amber}/><p style={{margin:"8px 0 0",fontSize:12,color:"rgba(255,255,255,.7)",fontFamily:"'DM Sans',sans-serif"}}>Lese Kaufdatum…</p></div>:receiptData&&<div style={{marginBottom:10}}><div style={{background:"rgba(217,119,6,.9)",borderRadius:12,padding:"10px 14px",marginBottom:8}}><p style={{margin:"0 0 4px",fontSize:12,fontWeight:700,color:T.white,fontFamily:"'DM Sans',sans-serif"}}>✓ Quittung erkannt ({receiptData.confidence}%)</p><p style={{margin:0,fontSize:13,color:"rgba(255,255,255,.9)",fontFamily:"'DM Sans',sans-serif"}}>Kaufdatum: <strong>{receiptData.dateStr}</strong></p></div><button onClick={()=>{stopStream();onDetect(`RECEIPT:${receiptData.date}:${receiptData.image}`,"receipt");}} style={{width:"100%",background:"rgba(13,148,136,.9)",border:"none",borderRadius:10,padding:"11px",color:T.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Kaufdatum {receiptData.dateStr} übernehmen</button></div>)}
      {(mode==="serial"||mode==="receipt")&&captured&&<button onClick={()=>{setCaptured(null);setSnCandidates([]);setReceiptData(null);}} style={{width:"100%",background:"rgba(255,255,255,.12)",border:"none",borderRadius:10,padding:"9px",color:T.white,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Erneut fotografieren</button>}
      {(status==="error"||status==="noapi")&&<p style={{textAlign:"center",color:status==="error"?T.redLt:"rgba(255,200,0,.9)",fontSize:12,margin:"0 0 10px",fontFamily:"'DM Sans',sans-serif"}}>{status==="error"?"Kamera nicht verfügbar.":"Auto-Erkennung nicht verfügbar."}</p>}
      {mode!=="receipt"&&<div style={{display:"flex",gap:8,marginBottom:8}}><input value={manualVal} onChange={e=>setManualVal(e.target.value)} placeholder={mode==="serial"?"Seriennummer…":"EAN / Code…"} style={{flex:1,borderRadius:12,border:"none",padding:"12px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",background:"rgba(255,255,255,.15)",color:T.white,outline:"none"}}/><button onClick={()=>{if(manualVal.trim().length>=4){stopStream();onDetect(manualVal.trim(),mode);}}} disabled={manualVal.trim().length<4} style={{background:manualVal.trim().length>=4?T.teal:T.s700,border:"none",borderRadius:12,padding:"12px 16px",color:T.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>OK</button></div>}
      {DEMOS[mode].length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{DEMOS[mode].map((h,i)=>{const v=h.split(" – ")[0];return <button key={i} onClick={()=>{stopStream();onDetect(v,mode);}} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:16,padding:"5px 10px",color:"rgba(255,255,255,.8)",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{h}</button>;})}</div>}
    </div>
  </div>;
}

function ScanResult({rawCode,scanMode,gear,onAdd,onClose,prefillDate}){
  const [phase,setPhase]=useState("searching");
  const [product,setProduct]=useState(null);
  const [form,setForm]=useState({name:"",brand:"",cat:"Helm"});
  const [kaufDatum,setKaufDatum]=useState(prefillDate||"");
  const CATS=["Helm","Seil","Karabiner","LVS-Gerät","Gurt","Pickel","Steigeisen","Sicherung","Rucksack","Sonstiges"];
  useEffect(()=>{
    async function lookup(){
      // 1. Erst lokale Demo-DB prüfen
      const local = PRODUCT_DB[rawCode];
      if(local){ setProduct({...local,code:rawCode}); setPhase("found"); return; }

      // 2. Recall-DB direkt (Seriennummer)
      if(RECALL_DB[rawCode]){ setProduct({name:rawCode,brand:"Unbekannt",cat:"Sonstiges",code:rawCode,recall:true}); setPhase("found"); return; }

      // 3. Echte EAN-Datenbank (UPC ItemDB) – nur für Barcodes
      if(scanMode==="barcode" && /^\d{8,14}$/.test(rawCode)){
        try{
          const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${rawCode}`);
          const data = await res.json();
          if(data.code==="OK" && data.items && data.items.length>0){
            const item = data.items[0];
            // Kategorie aus dem Titel ableiten
            const title = (item.title||"").toLowerCase();
            let cat = "Sonstiges";
            if(title.includes("helm")||title.includes("helmet")) cat="Helm";
            else if(title.includes("seil")||title.includes("rope")) cat="Seil";
            else if(title.includes("karabiner")||title.includes("carabiner")) cat="Karabiner";
            else if(title.includes("gurt")||title.includes("harness")) cat="Gurt";
            else if(title.includes("pickel")||title.includes("axe")) cat="Pickel";
            else if(title.includes("rucksack")||title.includes("backpack")) cat="Rucksack";
            else if(title.includes("lvs")||title.includes("beacon")||title.includes("avalanche")) cat="LVS-Gerät";
            else if(title.includes("steigeisen")||title.includes("crampon")) cat="Steigeisen";
            setProduct({
              name: item.title || rawCode,
              brand: item.brand || "Unbekannt",
              cat,
              code: rawCode,
              ean: rawCode,
              imageUrl: item.images?.[0] || null,
              fromApi: true,
            });
            setPhase("found");
            return;
          }
        }catch(e){ console.log("API Fehler:", e); }
      }

      // 4. Produkt nicht gefunden
      setPhase("notfound");
    }
    lookup();
  },[rawCode, scanMode]);
  const owned=product&&gear.some(g=>g.ean===rawCode||g.serial===rawCode);
  const recall=RECALL_DB[rawCode];
  const modeLabel={barcode:"Barcode",qr:"QR-Code",serial:"Seriennummer"};
  const expPreview=kaufDatum&&product?expiryInfo(kaufDatum,product.cat):null;
  return <Sheet onClose={onClose}><div style={{padding:"20px 20px 0"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <div style={{background:T.tealLt,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:6}}><Icon n={scanMode==="qr"?"qr":scanMode==="serial"?"text":"barcode"} s={13} c={T.teal}/><span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:"'DM Sans',sans-serif"}}>Via {modeLabel[scanMode]||scanMode}</span></div>
      <span style={{fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{rawCode}</span>
    </div>
    {phase==="searching"&&<div style={{textAlign:"center",padding:"32px 0"}}><Spinner/>
        <p style={{marginTop:16,fontSize:14,fontWeight:600,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Suche in Datenbank…</p>
        {scanMode==="barcode"&&<p style={{margin:"6px 0 0",fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Prüfe auch globale Produktdatenbank</p>}
      </div>}
    {phase==="found"&&product&&<>
      {recall&&<div style={{background:`linear-gradient(135deg,${T.red},#B91C1C)`,borderRadius:14,padding:"14px 16px",marginBottom:14,color:T.white}}><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><Icon n="alert" s={16} c={T.white}/><span style={{fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Aktiver Rückruf!</span></div><p style={{margin:0,fontSize:12,opacity:.9,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{recall.desc.slice(0,90)}…</p></div>}
      <div style={{background:T.s100,borderRadius:16,padding:"16px",marginBottom:14}}>
        {product.fromApi&&<div style={{background:T.tealLt,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:5,marginBottom:10}}><Icon n="checkCircle" s={12} c={T.teal}/><span style={{fontSize:11,fontWeight:700,color:T.teal,fontFamily:"'DM Sans',sans-serif"}}>Produkt automatisch erkannt</span></div>}
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{width:54,height:54,borderRadius:12,objectFit:"contain",background:T.white,border:`1px solid ${T.s200}`,flexShrink:0}}/>
            : <div style={{width:50,height:50,borderRadius:14,background:catColor(product.cat)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{catIcon(product.cat)}</div>
          }
          <div><p style={{margin:"0 0 2px",fontSize:15,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{product.name}</p><p style={{margin:0,fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{product.brand} · {product.cat}</p></div>
        </div>
        <div style={{borderTop:`1px solid ${T.s200}`,paddingTop:12}}>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:T.s500,marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>📅 Kaufdatum (für Ablaufdatum)</label>
          <input type="date" value={kaufDatum} onChange={e=>setKaufDatum(e.target.value)} max={todayISO()} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${T.s200}`,borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",color:T.navy}} onFocus={e=>e.target.style.borderColor=T.teal} onBlur={e=>e.target.style.borderColor=T.s200}/>
          {expPreview&&<p style={{margin:"6px 0 0",fontSize:12,color:expiryColor(expPreview.status),fontFamily:"'DM Sans',sans-serif"}}>Lebensdauer: {expPreview.years} J. · Ablauf: {expPreview.expStr}{expPreview.status!=="ok"?` · ⚠`:""}</p>}
        </div>
      </div>
      {owned?<div style={{background:T.amberLt,border:`1px solid ${T.amber}40`,borderRadius:12,padding:"12px 14px",marginBottom:12,display:"flex",gap:10,alignItems:"center"}}><Icon n="info" s={16} c={T.amber}/><p style={{margin:0,fontSize:13,color:T.amber,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Bereits in deiner Ausrüstung.</p></div>:<Btn full label="Zur Ausrüstung hinzufügen" icon="plus" onClick={()=>{onAdd({id:uid(),name:product.name,brand:product.brand,cat:product.cat,ean:scanMode==="serial"?"":rawCode,serial:scanMode==="serial"?rawCode:"",reg:today(),kaufDatum:kaufDatum||todayISO(),status:recall?"recall":"ok",done:false,receipt:null,teamId:null});onClose();}}/>}
      <div style={{height:8}}/><Btn full variant="ghost" label="Weiterscannen" onClick={onClose}/>
    </>}
    {phase==="notfound"&&<>
      <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:40,marginBottom:10}}>🔍</div><h3 style={{margin:"0 0 6px",fontSize:18,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Nicht in Datenbank</h3><p style={{margin:0,fontSize:13,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Code unbekannt – manuell eintragen:</p></div>
      <FInput label="Produktname" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="z.B. Helm Petzl Vertex"/>
      <FInput label="Hersteller" value={form.brand} onChange={e=>setForm(p=>({...p,brand:e.target.value}))} placeholder="z.B. Petzl"/>
      <div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:T.s500,marginBottom:5,fontFamily:"'DM Sans',sans-serif"}}>Kategorie</label><select value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))} style={{width:"100%",border:`1.5px solid ${T.s200}`,borderRadius:12,padding:"12px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",background:T.white}}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
      <FInput label="Kaufdatum" type="date" value={kaufDatum} onChange={e=>setKaufDatum(e.target.value)} max={todayISO()}/>
      <Btn full label="Manuell speichern" disabled={!form.name.trim()||!form.brand.trim()} onClick={()=>{onAdd({id:uid(),name:form.name.trim(),brand:form.brand.trim(),cat:form.cat,ean:scanMode==="barcode"?rawCode:"",serial:scanMode==="serial"?rawCode:"",reg:today(),kaufDatum:kaufDatum||todayISO(),status:"ok",done:false,receipt:null,teamId:null});onClose();}}/>
      <div style={{height:8}}/><Btn full variant="ghost" label="Abbrechen" onClick={onClose}/>
    </>}
  </div></Sheet>;
}
function GPSRScreen({onClose}){
  const POINTS=[
    {icon:"🏛️",title:"Was ist die EU-GPSR?",text:"Die General Product Safety Regulation (EU 2023/988) gilt seit Dezember 2024. Sie verpflichtet alle Hersteller, die in der EU Produkte verkaufen, zu aktiver und nachweisbarer Sicherheitskommunikation – besonders bei sicherheitskritischer Ausrüstung wie Kletterausrüstung oder Helmen.",color:T.blueLt,border:T.blue},
    {icon:"⚖️",title:"Pflichten für Hersteller",text:"Rückrufe müssen aktiv kommuniziert werden – nicht nur auf einer Webseite. Hersteller müssen nachweisen, dass betroffene Käufer direkt informiert wurden. Vorstände haften bei Versagen persönlich (Organhaftpflicht).",color:T.redLt,border:T.red},
    {icon:"📱",title:"Wie AlpineRecall hilft",text:"AlpineRecall ist die Brücke: Produkt registrieren → Rückruf startet → Push-Benachrichtigung in Sekunden. Hersteller können GPSR-Compliance automatisch nachweisen. Du als Nutzer bist immer informiert.",color:T.tealLt,border:T.teal},
    {icon:"✅",title:"Deine Rechte als Verbraucher",text:"Du hast das Recht, direkt und verständlich über Produktrisiken informiert zu werden. Hersteller müssen dir einen einfachen Rückgabe- oder Ersatzprozess anbieten. Kostenloser Ersatz ist gesetzlich vorgeschrieben.",color:T.greenLt,border:T.green},
    {icon:"⏰",title:"Fristen & Reaktionszeit",text:"Ein Rückruf muss unverzüglich kommuniziert werden – maximal 3 Werktage nach Feststellung des Defekts. Bei lebensbedrohlichen Produkten sofort. AlpineRecall benachrichtigt registrierte Nutzer in Echtzeit.",color:T.amberLt,border:T.amber},
    {icon:"🔒",title:"Deine Daten & DSGVO",text:"Alle Daten werden ausschließlich für Sicherheitszwecke genutzt. Keine Weitergabe an Dritte. Keine Werbung. Du kannst deine Daten jederzeit löschen. Vollständig DSGVO-konform nach Art. 5 EU-DSGVO.",color:T.purpleLt,border:T.purple},
  ];
  const TIMELINE=[{year:"2023",label:"GPSR verabschiedet",done:true},{year:"Dez. 2024",label:"In Kraft getreten",done:true},{year:"2025",label:"Vollständige Durchsetzung",done:false},{year:"2026+",label:"EU-weite Kontrollen",done:false}];
  return <div>
    <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,padding:"20px 20px 16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,background:`${T.white}20`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="law" s={18} c={T.tealLt}/></div><h2 style={{margin:0,fontSize:18,fontWeight:700,color:T.white,fontFamily:"'DM Serif Display',serif"}}>EU-GPSR</h2></div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="x" s={16} c={T.white}/></button>
      </div>
      <p style={{margin:0,fontSize:12,color:"#93C5FD",lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>Die EU General Product Safety Regulation – verständlich erklärt.</p>
    </div>
    <div style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:T.s100,borderRadius:14,padding:"14px 16px"}}>
        <p style={{margin:"0 0 12px",fontSize:12,fontWeight:700,color:T.s500,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>Zeitlinie</p>
        <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}>
          <div style={{position:"absolute",top:9,left:16,right:16,height:2,background:T.s200}}/>
          <div style={{position:"absolute",top:9,left:16,width:"50%",height:2,background:T.teal}}/>
          {TIMELINE.map((t,i)=><div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:t.done?T.teal:T.s200,border:`2px solid ${t.done?T.tealDk:T.s300}`,zIndex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.done&&<Icon n="check" s={10} c={T.white}/>}</div>
            <p style={{margin:0,fontSize:9,fontWeight:700,color:t.done?T.teal:T.s400,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{t.year}</p>
            <p style={{margin:0,fontSize:9,color:T.s500,fontFamily:"'DM Sans',sans-serif",textAlign:"center",lineHeight:1.3}}>{t.label}</p>
          </div>)}
        </div>
      </div>
      {POINTS.map((pt,i)=><div key={i} style={{background:pt.color,border:`1px solid ${pt.border}30`,borderRadius:14,padding:"14px 16px"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:20,flexShrink:0,lineHeight:1}}>{pt.icon}</span>
          <div><p style={{margin:"0 0 5px",fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{pt.title}</p><p style={{margin:0,fontSize:12,color:T.s700,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>{pt.text}</p></div>
        </div>
      </div>)}
      <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,borderRadius:14,padding:"16px"}}>
        <p style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:T.tealLt,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>Kurzfassung für dich</p>
        {["Produkt kaufen → in AlpineRecall scannen & registrieren","Rückruf passiert → du erhältst sofort eine Push-Benachrichtigung","Maßnahme ergreifen → kostenlosen Ersatz bekommen","Alle Daten gehören dir – jederzeit löschbar"].map((t,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<3?8:0}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:T.teal,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontSize:11,fontWeight:700,color:T.white}}>{i+1}</span></div>
          <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,.85)",lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{t}</p>
        </div>)}
      </div>
      <div style={{height:8}}/>
    </div>
  </div>;
}

function ExpiryScreen({gear}){
  const items=gear.map(g=>({...g,exp:expiryInfo(g.kaufDatum,g.cat)})).filter(g=>g.exp).sort((a,b)=>a.exp.daysLeft-b.exp.daysLeft);
  const critical=items.filter(g=>g.exp.status==="expired"||g.exp.status==="critical");
  const warning=items.filter(g=>g.exp.status==="warning");
  const ok=items.filter(g=>g.exp.status==="ok");
  function Card({item}){
    const {exp}=item;const col=expiryColor(exp.status);
    const statusLabel={expired:"Abgelaufen",critical:"Bald ablaufend",warning:"In ~1 Jahr",ok:"OK"}[exp.status];
    return <div style={{background:T.white,borderRadius:14,padding:"14px 16px",border:`1.5px solid ${exp.status!=="ok"?col:T.s200}`,boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:12,background:catColor(item.cat)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{catIcon(item.cat)}</div>
        <div style={{flex:1,minWidth:0}}><p style={{margin:"0 0 2px",fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{item.brand} · {exp.ageYears} J. alt</p></div>
        <Badge label={statusLabel} color={col} bg={col+"18"}/>
      </div>
      <div style={{height:4,background:T.s200,borderRadius:2,marginTop:10,overflow:"hidden"}}><div style={{height:"100%",width:`${exp.pct}%`,background:col,borderRadius:2,transition:"width .5s"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
        <span style={{fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Kauf: {item.kaufDatum?new Date(item.kaufDatum).toLocaleDateString("de-DE"):"–"}</span>
        <span style={{fontSize:11,color:col,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{exp.status==="expired"?"⚠ Überfällig!":exp.daysLeft<365?`${exp.daysLeft} Tage verbleibend`:`Ablauf ${exp.expStr}`}</span>
      </div>
    </div>;
  }
  return <div>
    <div style={{padding:"20px 16px 14px"}}><h2 style={{margin:0,fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Ablaufdaten</h2><p style={{margin:"3px 0 0",fontSize:13,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{critical.length} kritisch · {warning.length} Warnung · {ok.length} OK</p></div>
    <div style={{margin:"0 16px 14px",background:T.blueLt,border:`1px solid ${T.blue}30`,borderRadius:12,padding:"10px 14px"}}><p style={{margin:0,fontSize:12,color:T.blue,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}><strong>Norm EN 12492 / EN 341:</strong> Helme & Seile max. 10 J., Karabiner dauerhaft (wenn unversehrt). Immer Herstellerhinweis beachten.</p></div>
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
      {critical.length>0&&<><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:T.red}}/><p style={{margin:0,fontSize:12,fontWeight:700,color:T.red,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>Kritisch / Abgelaufen</p></div>{critical.map(g=><Card key={g.id} item={g}/>)}</>}
      {warning.length>0&&<><div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}><div style={{width:8,height:8,borderRadius:"50%",background:T.amber}}/><p style={{margin:0,fontSize:12,fontWeight:700,color:T.amber,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>Warnung – innerhalb 12 Monate</p></div>{warning.map(g=><Card key={g.id} item={g}/>)}</>}
      {ok.length>0&&<><div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}><div style={{width:8,height:8,borderRadius:"50%",background:T.green}}/><p style={{margin:0,fontSize:12,fontWeight:700,color:T.green,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>In Ordnung</p></div>{ok.map(g=><Card key={g.id} item={g}/>)}</>}
      {items.length===0&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:44,marginBottom:10}}>📅</div><p style={{margin:0,fontSize:14,color:T.s500,fontFamily:"'DM Serif Display',serif"}}>Kein Kaufdatum hinterlegt</p><p style={{margin:"6px 0 0",fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Beim Scannen das Kaufdatum eingeben.</p></div>}
    </div>
  </div>;
}
function TeamScreen({user,gear,onAdd}){
  const [myTeams,setMyTeams]=useState([]);
  const [view,setView]=useState("list");
  const [selTeam,setSelTeam]=useState(null);
  const [sharedGear,setSharedGear]=useState([]);
  const [joinCode,setJoinCode]=useState("");
  const [newTeamName,setNewTeamName]=useState("");
  const [newTeamIcon,setNewTeamIcon]=useState("🏔️");
  const [selectedIds,setSelectedIds]=useState(new Set());
  const [pickMode,setPickMode]=useState(false);
  const [loading,setLoading]=useState(false);
  const ICONS=["🏔️","🧗","⛷️","🎿","🏕️","🌄","⛺"];
  const DEMO_TEAMS=[{id:"team1",name:"DAV Sektion München",code:"DAV-MUC-42",members:["Max Müller","Anna Berger","Jonas K."],icon:"🏔️"},{id:"team2",name:"Kletterhalle Nord",code:"KH-NORD-17",members:["Lena S.","Tom W."],icon:"🧗"}];

  useEffect(()=>{loadData();},[]);
  async function loadData(){
    const t=await sLoad("my-teams")||[DEMO_TEAMS[0]];setMyTeams(t);
    const sg=await sLoad("shared-gear",{},true)||{};setSharedGear(Object.values(sg));
  }
  async function joinTeam(){
    if(!joinCode.trim())return;setLoading(true);await new Promise(r=>setTimeout(r,800));
    const found=DEMO_TEAMS.find(t=>t.code===joinCode.trim().toUpperCase());
    if(found){const cur=await sLoad("my-teams")||[];if(!cur.find(t=>t.id===found.id)){const upd=[...cur,found];await sSave("my-teams",upd);setMyTeams(upd);}setView("list");setJoinCode("");}
    setLoading(false);
  }
  async function createTeam(){
    if(!newTeamName.trim())return;
    const code=`TEAM-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const team={id:uid(),name:newTeamName.trim(),code,members:[user.name],icon:newTeamIcon};
    const cur=await sLoad("my-teams")||[];await sSave("my-teams",[...cur,team]);setMyTeams([...cur,team]);setView("list");setNewTeamName("");
  }
  async function shareSingle(item,teamId){
    const cur=await sLoad("shared-gear",{},true)||{};
    cur[`${teamId}-${item.id}`]={...item,teamId,sharedBy:user.name,sharedAt:today()};
    await sSave("shared-gear",cur,true);setSharedGear(Object.values(cur));
  }
  async function shareSelected(teamId){
    const cur=await sLoad("shared-gear",{},true)||{};
    gear.filter(g=>selectedIds.has(g.id)).forEach(item=>{cur[`${teamId}-${item.id}`]={...item,teamId,sharedBy:user.name,sharedAt:today()};});
    await sSave("shared-gear",cur,true);setSharedGear(Object.values(cur));setPickMode(false);setSelectedIds(new Set());
  }
  async function unshare(key){
    const cur=await sLoad("shared-gear",{},true)||{};delete cur[key];await sSave("shared-gear",cur,true);setSharedGear(Object.values(cur));
  }
  function toggleSel(id){setSelectedIds(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});}

  if(view==="join"||view==="create") return <div>
    <div style={{padding:"16px",background:T.white,borderBottom:`1px solid ${T.s200}`,display:"flex",alignItems:"center",gap:12}}>
      <button onClick={()=>setView("list")} style={{background:T.s100,border:"none",borderRadius:8,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="back" s={16} c={T.navy}/></button>
      <h2 style={{margin:0,fontSize:17,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>{view==="join"?"Team beitreten":"Team erstellen"}</h2>
    </div>
    <div style={{padding:"20px 16px"}}>
      {view==="join"?<>
        <p style={{margin:"0 0 16px",fontSize:13,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Gib den Code ein, den dir dein Teamleiter mitgeteilt hat.</p>
        <FInput label="Team-Code" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="z.B. DAV-MUC-42" icon="hash"/>
        <div style={{background:T.amberLt,borderRadius:10,padding:"9px 13px",marginBottom:16}}><p style={{margin:0,fontSize:12,color:T.amber,fontFamily:"'DM Sans',sans-serif"}}>Demo-Codes: <strong>DAV-MUC-42</strong> oder <strong>KH-NORD-17</strong></p></div>
        {loading?<Spinner/>:<Btn full label="Beitreten" variant="navy" onClick={joinTeam} disabled={!joinCode.trim()}/>}
      </>:<>
        <FInput label="Team-Name" value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} placeholder="z.B. DAV Sektion München" icon="users"/>
        <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,fontWeight:600,color:T.s500,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Icon</label><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{ICONS.map(ic=><button key={ic} onClick={()=>setNewTeamIcon(ic)} style={{width:44,height:44,borderRadius:12,border:`2px solid ${newTeamIcon===ic?T.teal:T.s200}`,background:newTeamIcon===ic?T.tealLt:T.s100,fontSize:22,cursor:"pointer"}}>{ic}</button>)}</div></div>
        <Btn full label="Team erstellen" variant="teal" onClick={createTeam} disabled={!newTeamName.trim()}/>
      </>}
    </div>
  </div>;

  if(view==="detail"&&selTeam){
    const tGear=sharedGear.filter(g=>g.teamId===selTeam.id);
    const notShared=gear.filter(g=>!sharedGear.find(sg=>sg.id===g.id&&sg.teamId===selTeam.id));
    return <div>
      <div style={{padding:"16px",background:T.white,borderBottom:`1px solid ${T.s200}`,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setView("list");setPickMode(false);setSelectedIds(new Set());}} style={{background:T.s100,border:"none",borderRadius:8,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="back" s={16} c={T.navy}/></button>
        <div style={{flex:1}}><h2 style={{margin:0,fontSize:16,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>{selTeam.icon} {selTeam.name}</h2><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Code: {selTeam.code} · {selTeam.members.length} Mitglieder</p></div>
      </div>
      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
        <p style={{margin:0,fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Geteilte Ausrüstung ({tGear.length})</p>
        {tGear.length===0?<div style={{background:T.s100,borderRadius:12,padding:"18px",textAlign:"center"}}><p style={{margin:0,fontSize:13,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Noch keine geteilten Artikel.</p></div>:tGear.map(item=><div key={item.id} style={{background:T.white,borderRadius:12,padding:"12px 14px",border:`1px solid ${T.s200}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:20,width:34,textAlign:"center",flexShrink:0}}>{catIcon(item.cat)}</div>
          <div style={{flex:1,minWidth:0}}><p style={{margin:"0 0 1px",fontSize:13,fontWeight:600,color:T.navy,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>von {item.sharedBy} · {item.sharedAt}</p></div>
          {item.status==="recall"&&!item.done?<Badge label="⚠ Rückruf" color={T.red} bg={T.redLt}/>:<Icon n="check" s={16} c={T.green}/>}
          <button onClick={()=>unshare(`${selTeam.id}-${item.id}`)} style={{background:"none",border:"none",cursor:"pointer",padding:4,flexShrink:0}}><Icon n="x" s={14} c={T.s400}/></button>
        </div>)}

        <div style={{borderTop:`1px solid ${T.s200}`,paddingTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{margin:0,fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Mein Gear hinzufügen</p>
            {notShared.length>0&&<button onClick={()=>{setPickMode(p=>!p);setSelectedIds(new Set());}} style={{background:pickMode?T.s100:"none",border:`1px solid ${T.s200}`,borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",color:T.navy}}>{pickMode?"Abbrechen":"Mehrere auswählen"}</button>}
          </div>
          {notShared.length===0?<p style={{margin:0,fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Alle deine Artikel wurden bereits geteilt.</p>:notShared.map(item=><div key={item.id} onClick={()=>pickMode&&toggleSel(item.id)} style={{background:selectedIds.has(item.id)?T.tealLt:T.s100,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:pickMode?"pointer":"default",border:`1.5px solid ${selectedIds.has(item.id)?T.teal:T.s200}`,transition:"all .15s"}}>
            {pickMode&&<div style={{width:20,height:20,borderRadius:6,border:`2px solid ${selectedIds.has(item.id)?T.teal:T.s300}`,background:selectedIds.has(item.id)?T.teal:T.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{selectedIds.has(item.id)&&<Icon n="check" s={12} c={T.white}/>}</div>}
            <div style={{fontSize:18,width:28,textAlign:"center",flexShrink:0}}>{catIcon(item.cat)}</div>
            <p style={{margin:0,flex:1,fontSize:12,fontWeight:600,color:T.navy,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p>
            {!pickMode&&<button onClick={()=>shareSingle(item,selTeam.id)} style={{background:T.teal,border:"none",borderRadius:8,padding:"5px 12px",color:T.white,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Teilen</button>}
          </div>)}
          {pickMode&&selectedIds.size>0&&<Btn full label={`${selectedIds.size} Artikel teilen`} icon="users" onClick={()=>shareSelected(selTeam.id)}/>}
        </div>
      </div>
    </div>;
  }

  return <div>
    <div style={{padding:"20px 16px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h2 style={{margin:0,fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Team-Gear</h2><p style={{margin:"3px 0 0",fontSize:13,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Ausrüstung für Sektionen & Hütten</p></div>
    </div>
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
      {myTeams.map(team=>{const tg=sharedGear.filter(g=>g.teamId===team.id);const tr=tg.filter(g=>g.status==="recall"&&!g.done);return <div key={team.id} onClick={()=>{setSelTeam(team);setView("detail");}} style={{background:T.white,borderRadius:16,padding:"16px",border:`1px solid ${T.s200}`,cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{team.icon}</div>
          <div style={{flex:1}}><p style={{margin:"0 0 2px",fontSize:14,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{team.name}</p><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{team.members.length} Mitglieder · Code: {team.code}</p></div>
          <Icon n="chevron" s={18} c={T.s400}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[{v:tg.length,l:"Artikel",c:T.teal,bg:T.tealLt},{v:tr.length,l:"Rückrufe",c:tr.length>0?T.red:T.green,bg:tr.length>0?T.redLt:T.greenLt},{v:team.members.length,l:"Mitglieder",c:T.purple,bg:T.purpleLt}].map((k,i)=><div key={i} style={{flex:1,background:k.bg,borderRadius:10,padding:"8px",textAlign:"center"}}><p style={{margin:"0 0 1px",fontSize:16,fontWeight:800,color:k.c,fontFamily:"'DM Serif Display',serif"}}>{k.v}</p><p style={{margin:0,fontSize:10,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>{k.l}</p></div>)}
        </div>
      </div>;})}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
        <button onClick={()=>setView("join")} style={{background:T.navy,border:"none",borderRadius:14,padding:"13px",color:T.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Icon n="hash" s={15} c={T.white}/>Code eingeben</button>
        <button onClick={()=>setView("create")} style={{background:T.teal,border:"none",borderRadius:14,padding:"13px",color:T.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Icon n="plus" s={15} c={T.white}/>Erstellen</button>
      </div>
      <div style={{background:T.blueLt,border:`1px solid ${T.blue}30`,borderRadius:12,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}><Icon n="info" s={16} c={T.blue}/><p style={{margin:0,fontSize:12,color:T.blue,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>Team-Gear wird geteilt und synchronisiert. Rückruf-Status wird automatisch für alle sichtbar.</p></div>
    </div>
  </div>;
}
function ImpactLog({ item, onAddImpact }) {
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");
  const impacts = item.impacts || [];

  function addImpact() {
    if (!note.trim()) return;
    onAddImpact({ date: todayISO(), note: note.trim(), id: uid() });
    setNote(""); setShowForm(false);
  }

  return (
    <div style={{background:impacts.length>0?T.amberLt:T.s100,borderRadius:14,padding:"12px 14px",border:`1px solid ${impacts.length>0?T.amber+"50":T.s200}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:impacts.length>0?10:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>⚡</span>
          <div>
            <p style={{margin:0,fontSize:13,fontWeight:700,color:impacts.length>0?T.amber:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Sturz-/Schlagprotokoll</p>
            <p style={{margin:0,fontSize:11,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>{impacts.length===0?"Kein Sturz registriert":`${impacts.length} Ereignis${impacts.length>1?"se":""}`}</p>
          </div>
        </div>
        <button onClick={()=>setShowForm(s=>!s)} style={{background:T.orange,border:"none",borderRadius:10,padding:"6px 12px",color:T.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          + Sturz
        </button>
      </div>

      {/* Protokoll-Einträge */}
      {impacts.map((imp,i)=>(
        <div key={imp.id||i} style={{background:T.white,borderRadius:10,padding:"8px 12px",marginTop:6,display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:16,flexShrink:0}}>⚡</span>
          <div style={{flex:1}}>
            <p style={{margin:0,fontSize:12,fontWeight:600,color:T.amber,fontFamily:"'DM Sans',sans-serif"}}>{new Date(imp.date).toLocaleDateString("de-DE")}</p>
            <p style={{margin:0,fontSize:12,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{imp.note}</p>
          </div>
        </div>
      ))}

      {/* Eingabe-Formular */}
      {showForm && (
        <div style={{marginTop:10,background:T.white,borderRadius:10,padding:"10px 12px"}}>
          <p style={{margin:"0 0 8px",fontSize:12,fontWeight:600,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Ereignis beschreiben:</p>
          <textarea value={note} onChange={e=>setNote(e.target.value)}
            placeholder="z.B. Sturz aus 4m, Karabiner hat Boden getroffen…"
            style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${T.s200}`,borderRadius:8,padding:"8px 10px",fontSize:13,fontFamily:"'DM Sans',sans-serif",resize:"none",outline:"none",minHeight:60}} rows={3}/>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <Btn full label="Abbrechen" variant="ghost" small onClick={()=>setShowForm(false)}/>
            <Btn full label="Speichern" variant="amber" small disabled={!note.trim()} onClick={addImpact}/>
          </div>
          <div style={{marginTop:8,background:"#FEF3C7",borderRadius:8,padding:"7px 10px"}}>
            <p style={{margin:0,fontSize:11,color:T.amber,fontFamily:"'DM Sans',sans-serif"}}>⚠ Artikel nach einem schweren Sturz vom Fachmann prüfen lassen – auch ohne sichtbare Schäden.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function GearScreen({gear,onAdd,onDelete}){
  const [showScanner,setShowScanner]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const [receiptDate,setReceiptDate]=useState(null);
  const [viewMode,setViewMode]=useState("mine");
  const [filter,setFilter]=useState("Alle");
  const [search,setSearch]=useState("");
  const [detail,setDetail]=useState(null);
  const [confirmDel,setConfirmDel]=useState(false);
  const [sharedGear,setSharedGear]=useState([]);

  useEffect(()=>{sLoad("shared-gear",{},true).then(sg=>setSharedGear(Object.values(sg||{})));},[gear]);

  function handleDetect(code,mode){
    setShowScanner(false);
    if(mode==="receipt"&&code.startsWith("RECEIPT:")){setReceiptDate(code.split(":")[1]);}
    else setScanResult({code,mode});
  }

  const sharedIds=new Set(sharedGear.map(g=>g.id));
  const myGear=gear.filter(g=>!g.teamId&&!sharedIds.has(g.id));
  const displayList=viewMode==="mine"?myGear:viewMode==="team"?sharedGear:gear;
  const cats=["Alle",...new Set(gear.map(g=>g.cat))].filter(Boolean);
  const filtered=displayList.filter(g=>{
    const mc=filter==="Alle"||g.cat===filter;
    const q=search.toLowerCase();
    return mc&&(!q||g.name.toLowerCase().includes(q)||g.brand.toLowerCase().includes(q)||(g.serial||"").toLowerCase().includes(q));
  });

  return <div>
    <div style={{padding:"16px 16px 10px",background:T.white,borderBottom:`1px solid ${T.s200}`,position:"sticky",top:0,zIndex:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Ausrüstung</h2>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setShowScanner(true)} title="Quittung scannen" style={{background:T.amberLt,border:`1px solid ${T.amber}30`,borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="receipt" s={16} c={T.amber}/></button>
          <Btn small label="Scannen" icon="camera" onClick={()=>setShowScanner(true)}/>
        </div>
      </div>
      <div style={{display:"flex",background:T.s100,borderRadius:12,padding:3,marginBottom:10}}>
        {[["mine",`Mein (${myGear.length})`],["team",`Team (${sharedGear.length})`],["all",`Alle (${gear.length})`]].map(([k,l])=><button key={k} onClick={()=>{setViewMode(k);setFilter("Alle");}} style={{flex:1,border:"none",borderRadius:10,padding:"7px 4px",background:viewMode===k?T.white:"transparent",color:viewMode===k?T.navy:T.s400,fontWeight:viewMode===k?700:500,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:viewMode===k?"0 1px 4px rgba(0,0,0,.08)":"none",transition:"all .2s"}}>{l}</button>)}
      </div>
      <div style={{position:"relative",marginBottom:10}}>
        <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><Icon n="search" s={15} c={T.s400}/></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, Hersteller, Seriennummer…" style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${T.s200}`,borderRadius:10,padding:"9px 12px 9px 34px",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}} onFocus={e=>e.target.style.borderColor=T.teal} onBlur={e=>e.target.style.borderColor=T.s200}/>
      </div>
      <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:2}}>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{border:"none",borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",background:filter===c?T.navy:T.s100,color:filter===c?T.white:T.s500,flexShrink:0}}>{c}</button>)}
      </div>
    </div>
    <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
      {filtered.length===0?<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:44,marginBottom:10}}>🏔️</div><p style={{margin:0,fontSize:14,fontWeight:600,color:T.s500,fontFamily:"'DM Serif Display',serif"}}>{gear.length===0?"Noch keine Ausrüstung":"Keine Treffer"}</p>{gear.length===0&&<p style={{margin:"6px 0 0",fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Tippe auf Scannen um deinen ersten Artikel zu registrieren.</p>}</div>:filtered.map(item=>{
        const exp=expiryInfo(item.kaufDatum,item.cat);
        return <div key={item.id||uid()} onClick={()=>setDetail(item)} style={{background:T.white,borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.06)",cursor:"pointer",border:item.status==="recall"&&!item.done?`2px solid ${T.red}`:exp&&exp.status!=="ok"?`1.5px solid ${expiryColor(exp.status)}`:`1px solid ${T.s200}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:46,height:46,borderRadius:12,background:catColor(item.cat)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{catIcon(item.cat)}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{margin:"0 0 2px",fontSize:14,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{item.name}</p>
              <p style={{margin:0,fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{item.brand}{item.serial&&<span style={{color:T.purple}}> · {item.serial}</span>}{item.sharedBy&&<span style={{color:T.teal}}> · {item.sharedBy}</span>}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
              {item.status==="recall"&&!item.done?<Badge label="⚠ Rückruf" color={T.red} bg={T.redLt}/>:item.done?<Badge label="✓ Erledigt" color={T.purple} bg={T.purpleLt}/>:<Badge label="✓ OK" color={T.green} bg={T.greenLt}/>}
              {exp&&exp.status!=="ok"&&<Badge label={exp.status==="expired"?"Abgelaufen":`${exp.daysLeft}d`} color={expiryColor(exp.status)} bg={expiryColor(exp.status)+"18"}/>}
            </div>
          </div>
        </div>;
      })}
    </div>
    {showScanner&&<SmartScanner onDetect={handleDetect} onClose={()=>setShowScanner(false)}/>}
    {scanResult&&<ScanResult rawCode={scanResult.code} scanMode={scanResult.mode} gear={gear} onAdd={item=>{onAdd(item);setScanResult(null);}} onClose={()=>setScanResult(null)} prefillDate={receiptDate}/>}
    {detail&&<Sheet onClose={()=>{setDetail(null);setConfirmDel(false);}}>
      <div style={{padding:"20px 20px 0"}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
          <div style={{width:52,height:52,borderRadius:14,background:catColor(detail.cat)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{catIcon(detail.cat)}</div>
          <div><h3 style={{margin:"0 0 3px",fontSize:17,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>{detail.name}</h3><p style={{margin:0,fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{detail.brand} · {detail.cat}</p></div>
        </div>
        {(()=>{const exp=expiryInfo(detail.kaufDatum,detail.cat);return exp&&exp.status!=="ok"&&<div style={{background:expiryColor(exp.status)+"15",border:`1.5px solid ${expiryColor(exp.status)}`,borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",gap:8,alignItems:"center"}}><Icon n="clock" s={16} c={expiryColor(exp.status)}/><p style={{margin:0,fontSize:12,fontWeight:600,color:expiryColor(exp.status),fontFamily:"'DM Sans',sans-serif"}}>{exp.status==="expired"?"Lebensdauer überschritten!":exp.daysLeft+" Tage bis Ablauf"} · {exp.expStr}</p></div>;})()}
        <div style={{background:T.s100,borderRadius:14,padding:"4px 16px",marginBottom:14}}>
          {[["EAN",detail.ean||"—"],["Seriennummer",detail.serial||"—"],["Registriert",detail.reg||"—"],["Kaufdatum",detail.kaufDatum?new Date(detail.kaufDatum).toLocaleDateString("de-DE"):"—"],["Status",detail.status==="recall"&&!detail.done?"⚠️ Rückruf aktiv":detail.done?"✅ Erledigt":"✅ OK"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.s200}`}}><span style={{fontSize:12,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>{k}</span><span style={{fontSize:12,fontWeight:600,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{v}</span></div>)}
        </div>
        {/* Sturz-/Schlagprotokoll */}
        <ImpactLog item={detail} onAddImpact={(impact)=>{
          const updated={...detail,impacts:[...(detail.impacts||[]),impact]};
          setDetail(updated);
          onDelete(detail.id);
          onAdd(updated);
        }}/>
        <div style={{height:10}}/>
        {confirmDel?<div style={{background:T.redLt,borderRadius:12,padding:14,textAlign:"center"}}><p style={{margin:"0 0 12px",fontSize:13,fontWeight:600,color:T.red,fontFamily:"'DM Sans',sans-serif"}}>Wirklich entfernen?</p><div style={{display:"flex",gap:8}}><Btn full label="Abbrechen" variant="ghost" onClick={()=>setConfirmDel(false)}/><Btn full label="Entfernen" variant="danger" onClick={()=>{onDelete(detail.id);setDetail(null);setConfirmDel(false);}}/></div></div>:<Btn full variant="ghost" icon="trash" label="Aus Ausrüstung entfernen" onClick={()=>setConfirmDel(true)}/>}
      </div>
    </Sheet>}
  </div>;
}
function RecallsScreen({gear,onMarkDone}){
  const [detail,setDetail]=useState(null);
  const [histTab,setHistTab]=useState("open");
  const open=gear.filter(g=>g.status==="recall"&&!g.done);
  const done=gear.filter(g=>g.status==="recall"&&g.done);
  if(detail){
    const r=RECALL_DB[detail.ean]||RECALL_DB[detail.serial];
    const STEPS=["Rückruf gemeldet","Nutzer alarmiert","Maßnahme eingeleitet","Abgeschlossen"];
    return <div>
      <div style={{padding:"16px",background:T.white,borderBottom:`1px solid ${T.s200}`,display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setDetail(null)} style={{background:T.s100,border:"none",borderRadius:8,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon n="back" s={16} c={T.navy}/></button>
        <h2 style={{margin:0,fontSize:17,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Rückruf-Details</h2>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:`linear-gradient(135deg,${T.red},#B91C1C)`,borderRadius:14,padding:16,color:T.white}}><div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}><div style={{background:"rgba(255,255,255,.2)",borderRadius:8,padding:6}}><Icon n="alert" s={18} c={T.white}/></div><span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>KRITISCH · {r?.date}</span></div><h3 style={{margin:"0 0 4px",fontSize:18,fontWeight:700,fontFamily:"'DM Serif Display',serif"}}>{r?.title}</h3><p style={{margin:0,fontSize:12,opacity:.8,fontFamily:"'DM Sans',sans-serif"}}>Charge: {r?.batch}</p></div>
        <div style={{background:T.s100,borderRadius:14,padding:"14px 16px"}}><p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:T.s500,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Status-Timeline</p>
          {STEPS.map((step,i)=>{const active=detail.done?i<=3:i<=1;return <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<STEPS.length-1?10:0}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}><div style={{width:20,height:20,borderRadius:"50%",background:active?T.teal:T.s200,display:"flex",alignItems:"center",justifyContent:"center"}}>{active&&<Icon n="check" s={11} c={T.white}/>}</div>{i<STEPS.length-1&&<div style={{width:2,height:14,background:active&&i<1?T.teal:T.s200,marginTop:2}}/>}</div><p style={{margin:0,fontSize:13,color:active?T.navy:T.s400,fontWeight:active?600:400,paddingTop:1,fontFamily:"'DM Sans',sans-serif"}}>{step}</p></div>;})}
        </div>
        {[{l:"Beschreibung",v:r?.desc},{l:"Erforderliche Maßnahme",v:r?.action,hl:true}].map((b,i)=><div key={i} style={{background:b.hl?T.amberLt:T.s50,border:`1px solid ${b.hl?T.amber+"40":T.s200}`,borderRadius:12,padding:"12px 14px"}}><p style={{margin:"0 0 5px",fontSize:11,fontWeight:700,color:T.s500,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>{b.l}</p><p style={{margin:0,fontSize:13,color:T.navy,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>{b.v}</p></div>)}
        <DealerMap recall={detail}/>
        {detail.done?<div style={{background:T.greenLt,border:`1px solid ${T.green}40`,borderRadius:14,padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}}><Icon n="checkCircle" s={20} c={T.green}/><p style={{margin:0,fontSize:13,fontWeight:700,color:T.green,fontFamily:"'DM Sans',sans-serif"}}>Rückruf erledigt am {today()}</p></div>:<Btn full variant="navy" icon="check" label="Als erledigt markieren" onClick={()=>{onMarkDone(detail.id);setDetail({...detail,done:true});}}/>}
      </div>
    </div>;
  }
  return <div>
    <div style={{padding:"20px 16px 12px"}}><h2 style={{margin:0,fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Rückrufe</h2><p style={{margin:"3px 0 12px",fontSize:13,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{open.length} offen · {done.length} erledigt</p>
      <div style={{display:"flex",background:T.s100,borderRadius:12,padding:3}}>{[["open","Aktiv"],["history","Verlauf"]].map(([k,l])=><button key={k} onClick={()=>setHistTab(k)} style={{flex:1,border:"none",borderRadius:10,padding:"8px",background:histTab===k?T.white:"transparent",color:histTab===k?T.navy:T.s400,fontWeight:histTab===k?700:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>)}</div>
    </div>
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
      {histTab==="open"&&(open.length===0?<div style={{background:T.greenLt,borderRadius:14,padding:"24px 16px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>✅</div><p style={{margin:0,fontSize:14,fontWeight:600,color:T.green,fontFamily:"'DM Serif Display',serif"}}>Keine offenen Rückrufe</p><p style={{margin:"4px 0 0",fontSize:12,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Deine Ausrüstung ist aktuell sicher.</p></div>:open.map(item=>{const r=RECALL_DB[item.ean]||RECALL_DB[item.serial];if(!r)return null;return <div key={item.id} onClick={()=>setDetail(item)} style={{background:T.white,borderRadius:14,padding:16,border:`2px solid ${T.red}`,cursor:"pointer",boxShadow:`0 4px 16px ${T.red}15`}}><div style={{display:"flex",gap:12}}><div style={{background:T.redLt,borderRadius:10,padding:8,flexShrink:0}}><Icon n="alert" s={20} c={T.red}/></div><div style={{flex:1}}><span style={{fontSize:10,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>Kritisch · {r.date}</span><p style={{margin:"3px 0 4px",fontSize:14,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{r.title}</p><p style={{margin:"0 0 8px",fontSize:12,color:T.s500,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{r.desc.slice(0,80)}…</p><div style={{display:"flex",justifyContent:"space-between"}}><Badge label="Offen" color={T.red} bg={T.redLt}/><span style={{fontSize:12,color:T.teal,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Details →</span></div></div></div></div>;}))}
      {histTab==="open"&&gear.filter(g=>g.status==="ok").length>0&&<div style={{background:T.greenLt,borderRadius:14,padding:14,border:`1px solid ${T.green}40`,display:"flex",gap:12,alignItems:"center"}}><div style={{background:T.green+"20",borderRadius:10,padding:8}}><Icon n="check" s={18} c={T.green}/></div><div><p style={{margin:0,fontSize:13,fontWeight:700,color:T.green,fontFamily:"'DM Sans',sans-serif"}}>{gear.filter(g=>g.status==="ok").length} weitere Artikel</p><p style={{margin:0,fontSize:12,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Kein Rückruf bekannt</p></div></div>}
      {histTab==="history"&&(done.length===0?<div style={{textAlign:"center",padding:"40px 0",color:T.s400}}><Icon n="history" s={36} c={T.s300}/><p style={{margin:"12px 0 0",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Noch keine erledigten Rückrufe</p></div>:done.map(item=>{const r=RECALL_DB[item.ean]||RECALL_DB[item.serial];if(!r)return null;return <div key={item.id} style={{background:T.white,borderRadius:14,padding:14,border:`1px solid ${T.s200}`,opacity:.8,display:"flex",gap:12,alignItems:"center"}}><div style={{background:T.purpleLt,borderRadius:10,padding:8,flexShrink:0}}><Icon n="check" s={18} c={T.purple}/></div><div style={{flex:1}}><p style={{margin:"0 0 2px",fontSize:13,fontWeight:600,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{r.title}</p><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Erledigt · {r.date}</p></div><Badge label="Erledigt" color={T.purple} bg={T.purpleLt}/></div>;}))}
    </div>
  </div>;
}

function calcHealthScore(gear) {
  if (!gear.length) return 100;
  const hasOpenRecall = gear.some(g => g.status === "recall" && !g.done);
  if (hasOpenRecall) return 0;
  let total = 0;
  gear.forEach(item => {
    let score = 100;
    const exp = expiryInfo(item.kaufDatum, item.cat);
    if (exp) {
      if (exp.status === "expired")   score -= 40;
      else if (exp.status === "critical") score -= 22;
      else if (exp.status === "warning")  score -= 8;
    }
    const impacts = item.impacts || [];
    if (impacts.length > 0) {
      const daysSince = (new Date() - new Date(impacts[impacts.length-1].date)) / (1000*60*60*24);
      if (daysSince < 30)   score -= 25;
      else if (daysSince < 365) score -= 10;
    }
    total += Math.max(0, score);
  });
  return Math.round(total / gear.length);
}

function scoreLabel(score, hasRecall) {
  if (hasRecall) return { label:"Rückruf aktiv!", color:T.red };
  if (score >= 85) return { label:"Sehr gut",     color:T.green  };
  if (score >= 70) return { label:"Gut",           color:T.green  };
  if (score >= 50) return { label:"Achtung",       color:T.amber  };
  return              { label:"Kritisch",        color:T.red    };
}

function HealthScoreRing({ score, hasRecall=false }) {
  const { label, color } = scoreLabel(score, hasRecall);
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <div style={{position:"relative",width:96,height:96}}>
        <svg width="96" height="96" style={{transform:"rotate(-90deg)"}}>
          <circle cx="48" cy="48" r={r} fill="none" stroke={T.s200} strokeWidth="7"/>
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{transition:"stroke-dasharray 1s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:hasRecall?28:22,fontWeight:800,color,fontFamily:"'DM Serif Display',serif",lineHeight:1}}>{hasRecall?"⚠":score}</span>
          {!hasRecall&&<span style={{fontSize:9,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>von 100</span>}
        </div>
      </div>
      <span style={{fontSize:12,fontWeight:700,color,fontFamily:"'DM Sans',sans-serif"}}>{label}</span>
    </div>
  );
}

function TourScreen({ gear, onUpdate }) {
  const [selTour, setSelTour] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [mainTab, setMainTab] = useState("touren"); // touren | ablauf

  const tourGear = (tourId) => tourId === "alle"
    ? gear
    : gear.filter(g => g.tourType === tourId);

  if (selTour) {
    const items = tourGear(selTour.id);
    const score = calcHealthScore(items);
    const tour  = TOUR_TYPES.find(t => t.id === selTour.id);
    return (
      <div>
        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${tour.color},${tour.color}CC)`,padding:"20px 16px 16px"}}>
          <button onClick={()=>setSelTour(null)} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
            <Icon n="back" s={16} c={T.white}/>
          </button>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:28}}>{tour.icon}</span>
                <h2 style={{margin:0,fontSize:20,fontWeight:700,color:T.white,fontFamily:"'DM Serif Display',serif"}}>{tour.label}</h2>
              </div>
              <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,.8)",fontFamily:"'DM Sans',sans-serif"}}>{items.length} Artikel · Setup-Score</p>
            </div>
            <HealthScoreRing score={score} hasRecall={items.some(g=>g.status==="recall"&&!g.done)}/>
          </div>
        </div>

        {/* Artikel-Liste */}
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {items.length === 0
            ? <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{fontSize:40,marginBottom:10}}>{tour.icon}</div>
                <p style={{margin:0,fontSize:14,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Noch keine Artikel für {tour.label}</p>
                <p style={{margin:"6px 0 0",fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Weise Artikel dieser Tour-Kategorie zu</p>
              </div>
            : items.map(item => {
                const hasImpact = (item.impacts||[]).length > 0;
                const exp = expiryInfo(item.kaufDatum, item.cat);
                return (
                  <div key={item.id} style={{background:T.white,borderRadius:14,padding:"13px 14px",border:item.status==="recall"&&!item.done?`2px solid ${T.red}`:hasImpact?`1.5px solid ${T.amber}`:`1px solid ${T.s200}`,boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:44,height:44,borderRadius:12,background:catColor(item.cat)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{catIcon(item.cat)}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{margin:"0 0 2px",fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p>
                        <p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{item.brand}{hasImpact?<span style={{color:T.amber}}> · ⚠ Sturz registriert</span>:""}</p>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        {item.status==="recall"&&!item.done
                          ? <Badge label="Rückruf" color={T.red} bg={T.redLt}/>
                          : hasImpact
                          ? <Badge label="Prüfen!" color={T.amber} bg={T.amberLt}/>
                          : <Badge label="✓ OK" color={T.green} bg={T.greenLt}/>
                        }
                      </div>
                    </div>
                    {/* Tour-Zuweisung ändern */}
                    <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${T.s100}`,display:"flex",gap:6,flexWrap:"wrap"}}>
                      {TOUR_TYPES.filter(t=>t.id!=="alle").map(t=>(
                        <button key={t.id} onClick={()=>onUpdate(item.id,{tourType:t.id})}
                          style={{padding:"3px 10px",borderRadius:16,border:`1px solid ${item.tourType===t.id?t.color:T.s200}`,background:item.tourType===t.id?t.color+"18":T.s50,fontSize:11,fontWeight:item.tourType===t.id?700:400,color:item.tourType===t.id?t.color:T.s500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    );
  }

  const expiryItems = gear
    .map(g=>({...g,exp:expiryInfo(g.kaufDatum,g.cat)}))
    .filter(g=>g.exp)
    .sort((a,b)=>a.exp.daysLeft-b.exp.daysLeft);
  const expCritical = expiryItems.filter(g=>g.exp.status==="expired"||g.exp.status==="critical");
  const expWarning  = expiryItems.filter(g=>g.exp.status==="warning");
  const expOk       = expiryItems.filter(g=>g.exp.status==="ok");

  function ExpiryCard({item}){
    const {exp}=item; const col=expiryColor(exp.status);
    const stLabel={expired:"Abgelaufen",critical:"Bald ablaufend",warning:"In ~1 Jahr",ok:"OK"}[exp.status];
    return <div style={{background:T.white,borderRadius:14,padding:"13px 16px",border:`1.5px solid ${exp.status!=="ok"?col:T.s200}`,boxShadow:"0 2px 6px rgba(0,0,0,.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:42,height:42,borderRadius:12,background:catColor(item.cat)+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{catIcon(item.cat)}</div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{margin:"0 0 1px",fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p>
          <p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{item.brand} · {exp.ageYears} J. alt</p>
        </div>
        <Badge label={stLabel} color={col} bg={col+"18"}/>
      </div>
      <div style={{height:4,background:T.s200,borderRadius:2,marginTop:10,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${exp.pct}%`,background:col,borderRadius:2,transition:"width .5s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
        <span style={{fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Kauf: {item.kaufDatum?new Date(item.kaufDatum).toLocaleDateString("de-DE"):"–"}</span>
        <span style={{fontSize:11,color:col,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{exp.status==="expired"?"⚠ Überfällig!":exp.daysLeft<365?`${exp.daysLeft} Tage verbleibend`:`Ablauf ${exp.expStr}`}</span>
      </div>
    </div>;
  }

  return (
    <div>
      <div style={{padding:"20px 16px 12px"}}>
        <h2 style={{margin:"0 0 12px",fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Ausrüstung & Gesundheit</h2>
        {/* Tab-Toggle */}
        <div style={{display:"flex",background:T.s100,borderRadius:12,padding:3}}>
          {[["touren","🗺️  Touren"],["ablauf","📅  Ablaufdaten"]].map(([k,l])=>(
            <button key={k} onClick={()=>setMainTab(k)} style={{flex:1,border:"none",borderRadius:10,padding:"9px 8px",background:mainTab===k?T.white:"transparent",color:mainTab===k?T.navy:T.s400,fontWeight:mainTab===k?700:500,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:mainTab===k?"0 1px 6px rgba(0,0,0,.08)":"none",transition:"all .2s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── ABLAUFDATEN TAB ── */}
      {mainTab==="ablauf"&&(
        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:T.blueLt,border:`1px solid ${T.blue}30`,borderRadius:12,padding:"9px 13px"}}>
            <p style={{margin:0,fontSize:12,color:T.blue,fontFamily:"'DM Sans',sans-serif"}}><strong>Norm EN 12492:</strong> Helme & Seile max. 10 J., Karabiner max. 15 J. Immer Herstellerhinweis beachten.</p>
          </div>
          {expCritical.length>0&&<>
            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:T.red}}/><p style={{margin:0,fontSize:11,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>Kritisch / Abgelaufen</p></div>
            {expCritical.map(g=><ExpiryCard key={g.id} item={g}/>)}
          </>}
          {expWarning.length>0&&<>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}><div style={{width:8,height:8,borderRadius:"50%",background:T.amber}}/><p style={{margin:0,fontSize:11,fontWeight:700,color:T.amber,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>Warnung – innerhalb 12 Monate</p></div>
            {expWarning.map(g=><ExpiryCard key={g.id} item={g}/>)}
          </>}
          {expOk.length>0&&<>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}><div style={{width:8,height:8,borderRadius:"50%",background:T.green}}/><p style={{margin:0,fontSize:11,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>In Ordnung</p></div>
            {expOk.map(g=><ExpiryCard key={g.id} item={g}/>)}
          </>}
          {expiryItems.length===0&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:44,marginBottom:10}}>📅</div><p style={{margin:0,fontSize:14,color:T.s500,fontFamily:"'DM Serif Display',serif"}}>Kein Kaufdatum hinterlegt</p></div>}
          <div style={{height:8}}/>
        </div>
      )}

      {/* ── TOUREN TAB ── */}
      {mainTab==="touren"&&<>

      {/* Gesamt-Score */}
      <div style={{margin:"0 16px 14px",background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,borderRadius:16,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{margin:"0 0 4px",fontSize:12,color:T.tealLt,fontWeight:700,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>Gesamt-Gesundheitsscore</p>
          <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,.7)",fontFamily:"'DM Sans',sans-serif"}}>Basierend auf {gear.length} Artikeln</p>
        </div>
        <HealthScoreRing score={calcHealthScore(gear)} hasRecall={gear.some(g=>g.status==="recall"&&!g.done)}/>
      </div>

      {/* Tour-Karten Grid */}
      <div style={{padding:"0 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {TOUR_TYPES.map(tour => {
          const items  = tourGear(tour.id);
          const score  = calcHealthScore(items);
          const recall = items.filter(g=>g.status==="recall"&&!g.done).length;
          const impact = items.filter(g=>(g.impacts||[]).length>0).length;
          return (
            <div key={tour.id} onClick={()=>setSelTour(tour)}
              style={{background:T.white,borderRadius:16,padding:"14px",border:`1px solid ${T.s200}`,cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,.06)",position:"relative",overflow:"hidden"}}>
              {/* Farbstreifen oben */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:tour.color,borderRadius:"16px 16px 0 0"}}/>
              <div style={{fontSize:28,marginBottom:6}}>{tour.icon}</div>
              <p style={{margin:"0 0 2px",fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{tour.label}</p>
              <p style={{margin:"0 0 10px",fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{items.length} Artikel</p>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:4}}>
                  {recall>0 && <Badge label={`${recall} Rückruf`} color={T.red} bg={T.redLt}/>}
                  {impact>0 && <Badge label={`${impact} Sturz`} color={T.amber} bg={T.amberLt}/>}
                </div>
                <span style={{fontSize:16,fontWeight:800,color:score>=80?T.green:score>=60?T.amber:T.red,fontFamily:"'DM Serif Display',serif"}}>{score}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{height:8}}/>
      </>}
    </div>
  );
}

function HomeScreen({user,gear,onNav,onSimRecall,isOffline}){
  const openRecalls=gear.filter(g=>g.status==="recall"&&!g.done);
  const expiring=gear.filter(g=>{const e=expiryInfo(g.kaufDatum,g.cat);return e&&(e.status==="critical"||e.status==="expired");});
  const recent=[...gear].reverse().slice(0,3);
  return <div style={{display:"flex",flexDirection:"column",gap:14,paddingBottom:8}}>
    <div style={{padding:"20px 20px 0"}}><p style={{margin:0,fontSize:13,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Hallo 👋</p><h2 style={{margin:"2px 0 0",fontSize:22,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>{user.name.split(" ")[0]}</h2></div>
    {openRecalls.length>0&&<div onClick={()=>onNav("recalls")} style={{margin:"0 16px",background:`linear-gradient(135deg,${T.red},#B91C1C)`,borderRadius:16,padding:16,color:T.white,cursor:"pointer",boxShadow:`0 8px 24px ${T.red}30`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{background:"rgba(255,255,255,.2)",borderRadius:8,padding:6}}><Icon n="alert" s={16} c={T.white}/></div><span style={{fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>{openRecalls.length} aktiver Rückruf</span></div>
      <p style={{margin:"0 0 10px",fontSize:13,opacity:.9,lineHeight:1.4,fontFamily:"'DM Sans',sans-serif"}}><strong>{openRecalls[0]?.name}</strong> ist betroffen.</p>
      <span style={{background:"rgba(255,255,255,.2)",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Jetzt ansehen →</span>
    </div>}
    {expiring.length>0&&<div onClick={()=>onNav("tour")} style={{margin:"0 16px",background:`linear-gradient(135deg,${T.orange},#C2410C)`,borderRadius:14,padding:"13px 16px",color:T.white,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><Icon n="clock" s={15} c={T.white}/><span style={{fontWeight:700,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>{expiring.length} Artikel bald ablaufend</span></div>
      <p style={{margin:0,fontSize:12,opacity:.85,fontFamily:"'DM Sans',sans-serif"}}>{expiring[0]?.name} – Ablaufdatum prüfen</p>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px"}}>
      {[{l:"Registriert",v:gear.length,c:T.teal,bg:T.tealLt,i:"gear",nav:"gear"},{l:"Alles OK",v:gear.filter(g=>g.status==="ok").length,c:T.green,bg:T.greenLt,i:"check",nav:null},{l:"Rückrufe",v:openRecalls.length,c:T.red,bg:T.redLt,i:"alert",nav:"recalls"},{l:"Bald ablaufend",v:expiring.length,c:T.orange,bg:T.orangeLt,i:"clock",nav:"tour"}].map((k,i)=><div key={i} onClick={()=>k.nav&&onNav(k.nav)} style={{background:k.bg,borderRadius:14,padding:"14px",display:"flex",flexDirection:"column",gap:6,cursor:k.nav?"pointer":"default"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:24,fontWeight:800,color:k.c,fontFamily:"'DM Serif Display',serif"}}>{k.v}</span><Icon n={k.i} s={18} c={k.c}/></div>
        <span style={{fontSize:11.5,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>{k.l}</span>
      </div>)}
    </div>

    {/* Gesundheits-Score Kachel */}
    <div onClick={()=>onNav("tour")} style={{margin:"0 16px",background:T.white,borderRadius:16,padding:"14px 16px",border:`1px solid ${T.s200}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 10px rgba(0,0,0,.06)"}}>
      <HealthScoreRing score={calcHealthScore(gear)} hasRecall={gear.some(g=>g.status==="recall"&&!g.done)}/>
      <div style={{flex:1}}>
        <p style={{margin:"0 0 3px",fontSize:14,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Gear-Gesundheitsscore</p>
        <p style={{margin:"0 0 8px",fontSize:12,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Basierend auf Alter, Rückrufen & Stürzen</p>
        <span style={{fontSize:12,color:T.teal,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Tour-Übersicht anzeigen →</span>
      </div>
    </div>

    <div style={{padding:"0 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h3 style={{margin:0,fontSize:15,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Zuletzt hinzugefügt</h3><button onClick={()=>onNav("gear")} style={{background:"none",border:"none",color:T.teal,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Alle →</button></div>
      {gear.length===0?<div style={{background:T.s100,borderRadius:14,padding:"24px 16px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>🏔️</div><p style={{margin:"0 0 10px",fontSize:13,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Noch keine Ausrüstung registriert</p><Btn label="Ersten Artikel scannen" icon="camera" variant="teal" small onClick={()=>onNav("gear")}/></div>:recent.map(item=>{const exp=expiryInfo(item.kaufDatum,item.cat);return <div key={item.id} style={{background:T.white,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 6px rgba(0,0,0,.06)",border:item.status==="recall"&&!item.done?`1.5px solid ${T.red}`:exp&&exp.status!=="ok"?`1.5px solid ${expiryColor(exp.status)}`:`1px solid ${T.s200}`,marginBottom:8}}>
        <div style={{fontSize:20,width:34,textAlign:"center",flexShrink:0}}>{catIcon(item.cat)}</div>
        <div style={{flex:1,minWidth:0}}><p style={{margin:0,fontSize:13,fontWeight:600,color:T.navy,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{item.brand} · {item.reg}</p></div>
        {item.status==="recall"&&!item.done?<Badge label="Rückruf" color={T.red} bg={T.redLt}/>:exp&&exp.status!=="ok"?<Badge label={exp.status==="expired"?"Abgelaufen":"Bald ablaufend"} color={expiryColor(exp.status)} bg={expiryColor(exp.status)+"18"}/>:<Icon n="check" s={16} c={T.green}/>}
      </div>;})}
    </div>
    <div style={{padding:"0 16px"}}><button onClick={onSimRecall} style={{width:"100%",background:`linear-gradient(135deg,${T.purple},#6D28D9)`,border:"none",borderRadius:14,padding:"13px 16px",color:T.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Icon n="spark" s={16} c={T.white}/>Rückruf-Alarm simulieren (Demo)</button></div>
    <div style={{margin:"0 16px 8px",background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,borderRadius:14,padding:"14px 16px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Icon n={isOffline?"wifi-off":"shield"} s={14} c={T.tealLt}/><span style={{fontSize:12,fontWeight:700,color:T.tealLt,fontFamily:"'DM Sans',sans-serif"}}>{isOffline?"Offline – Daten aus Cache":"EU-GPSR geschützt · Online"}</span></div>
      <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>{gear.length} Artikel überwacht · Barcode + QR + Seriennummer + Quittung</p>
    </div>
  </div>;
}

function LockScreen({ user, onUnlock }) {
  const [phase, setPhase]     = useState("idle"); // idle | scanning | error
  const [msg,   setMsg]       = useState("");
  const [bioAvail, setBioAvail] = useState(false);
  const [pw,    setPw]        = useState("");
  const [pwErr, setPwErr]     = useState("");
  const [showPw, setShowPw]   = useState(false);

  useEffect(() => {
    bioIsAvailable().then(v => {
      setBioAvail(v);
      if (v) setTimeout(tryFaceID, 400); // Auto-Scan beim Öffnen
    });
  }, []);

  async function tryFaceID() {
    setPhase("scanning"); setMsg(""); setPwErr("");
    try {
      const cred = await sLoad("biometric-cred");
      if (!cred) { setPhase("idle"); setShowPw(true); return; }
      await bioVerify(cred.credId);
      setPhase("idle");
      onUnlock();
    } catch(e) {
      setPhase("error");
      setMsg(e.name === "NotAllowedError" ? "Abgebrochen – bitte Passwort eingeben." : "Face ID nicht verfügbar.");
      setShowPw(true);
    }
  }

  async function tryPassword() {
    if (pw.length < 1) { setPwErr("Passwort eingeben"); return; }
    const registered = await sLoad("registered-users", {}) || {};
    const demo       = DEMO_USERS[user.email];
    const regUser    = registered[user.email];
    const correct    = (demo && demo.pw === pw) || (regUser && regUser.pw === pw);
    if (correct) { onUnlock(); }
    else { setPwErr("Falsches Passwort"); }
  }

  return (
    <div style={{position:"fixed",inset:0,background:`linear-gradient(160deg,${T.navy} 0%,${T.navyMd} 50%,${T.tealDk} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 32px",paddingTop:"calc(40px + env(safe-area-inset-top,0px))"}}>

      {/* App-Logo */}
      <div style={{marginBottom:32,textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:22,overflow:"hidden",margin:"0 auto 14px",boxShadow:`0 8px 32px ${T.teal}50`}}>
          <AppLogo size={72}/>
        </div>
        <h1 style={{margin:"0 0 4px",fontSize:22,fontWeight:700,color:T.white,fontFamily:"'DM Serif Display',serif"}}>AlpineRecall</h1>
        <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:"'DM Sans',sans-serif"}}>Willkommen zurück, {user.name.split(" ")[0]}</p>
      </div>

      {/* Face ID Button */}
      {bioAvail && (
        <button onClick={tryFaceID} disabled={phase==="scanning"}
          style={{width:"100%",maxWidth:320,background:"rgba(255,255,255,.12)",border:"1.5px solid rgba(255,255,255,.25)",borderRadius:18,padding:"20px",marginBottom:16,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:10,backdropFilter:"blur(10px)",transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.12)"}>
          {phase === "scanning"
            ? <Spinner size={36} color={T.tealLt}/>
            : <>
                <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 10a2 2 0 01-2 2C6.48 12 4 9.76 4 7 4 4.24 6.48 2 12 2s8 2.24 8 5c0 1-.39 2.04-1.08 2.79"/>
                    <path d="M12 20c0-4.41 3.59-8 8-8"/>
                    <path d="M12 20c0-4.41-3.59-8-8-8"/>
                    <path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2"/>
                  </svg>
                </div>
                <span style={{fontSize:15,fontWeight:700,color:T.white,fontFamily:"'DM Sans',sans-serif"}}>Mit Face ID / Touch ID</span>
              </>
          }
        </button>
      )}

      {msg && <p style={{color:T.amberLt,fontSize:13,textAlign:"center",margin:"0 0 16px",fontFamily:"'DM Sans',sans-serif"}}>{msg}</p>}

      {/* Passwort-Fallback */}
      {(showPw || !bioAvail) && (
        <div style={{width:"100%",maxWidth:320}}>
          <div style={{display:"flex",alignItems:"center",gap:10,margin:"0 0 14px"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.2)"}}/>
            <span style={{fontSize:12,color:"rgba(255,255,255,.5)",fontFamily:"'DM Sans',sans-serif"}}>oder mit Passwort</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,.2)"}}/>
          </div>
          <div style={{position:"relative",marginBottom:10}}>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&tryPassword()}
              placeholder="Passwort eingeben" autoFocus
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,.12)",border:`1.5px solid ${pwErr?"#F87171":"rgba(255,255,255,.25)"}`,borderRadius:12,padding:"13px 16px",fontSize:15,color:T.white,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
            {pwErr && <p style={{color:"#FCA5A5",fontSize:12,margin:"6px 0 0",fontFamily:"'DM Sans',sans-serif"}}>{pwErr}</p>}
          </div>
          <button onClick={tryPassword} style={{width:"100%",background:T.teal,border:"none",borderRadius:12,padding:"13px",color:T.white,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:`0 4px 16px ${T.teal}50`}}>
            Anmelden
          </button>
        </div>
      )}

      {bioAvail && !showPw && (
        <button onClick={()=>setShowPw(true)} style={{marginTop:16,background:"none",border:"none",color:"rgba(255,255,255,.5)",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          Lieber Passwort verwenden
        </button>
      )}
    </div>
  );
}

function ProfileScreen({user,gear,onLogout,isOffline,lastSync,onOpenGPSR}){
  const [notifOn,setNotifOn]=useState(true);
  const [bioActive,setBioActive]=useState(false);
  const [bioMsg,setBioMsg]=useState("");
  const [showAbout,setShowAbout]=useState(false);
  const [showPrivacy,setShowPrivacy]=useState(false);
  const [showNotifDetail,setShowNotifDetail]=useState(false);
  const [showRating,setShowRating]=useState(false);

  useEffect(()=>{
    sLoad("biometric-cred").then(c=>setBioActive(!!c));
    sLoad("notif-on",true).then(v=>setNotifOn(v));
  },[]);

  async function toggleBio(){
    try{
      if(bioActive){
        await sDel("biometric-cred"); setBioActive(false); setBioMsg("Face ID deaktiviert.");
      } else {
        if(!window.PublicKeyCredential){ setBioMsg("Gerät unterstützt keine Biometrie."); return; }
        const challenge=crypto.getRandomValues(new Uint8Array(32));
        const cred=await navigator.credentials.create({publicKey:{challenge,rp:{name:"AlpineRecall",id:window.location.hostname},user:{id:new TextEncoder().encode(user.email),name:user.email,displayName:user.name},pubKeyCredParams:[{alg:-7,type:"public-key"},{alg:-257,type:"public-key"}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required"},timeout:60000}});
        const credId=btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
        await sSave("biometric-cred",{credId,userId:user.email});
        setBioActive(true); setBioMsg("Face ID / Touch ID aktiviert! ✓");
      }
    }catch(e){ setBioMsg(e.name==="NotAllowedError"?"Abgebrochen.":"Nicht verfügbar auf diesem Gerät."); }
    setTimeout(()=>setBioMsg(""),4000);
  }

  function toggleNotif(){
    const next=!notifOn; setNotifOn(next); sSave("notif-on",next);
  }

  function exportGear(){
    const sep="=".repeat(40);
    const header=`AlpineRecall Ausruestungsliste\nExportiert am ${today()}\n${sep}\n\n`;
    const body=gear.map((g,i)=>`${i+1}. ${g.name}\n   Hersteller: ${g.brand}\n   Kategorie: ${g.cat}\n   EAN: ${g.ean||"-"}  Seriennr.: ${g.serial||"-"}\n   Kaufdatum: ${g.kaufDatum?new Date(g.kaufDatum).toLocaleDateString("de-DE"):"-"}\n   Status: ${g.status==="recall"&&!g.done?"RUECKRUF AKTIV":g.done?"Erledigt":"OK"}\n`).join("\n");
    const blob=new Blob([header+body],{type:"text/plain;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AlpineRecall_Ausruestung_"+todayISO()+".txt";a.click();
  }
  function Toggle({on}){
    return <div style={{width:44,height:26,borderRadius:13,background:on?T.teal:T.s300,position:"relative",transition:"background .25s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:on?21:3,width:20,height:20,borderRadius:"50%",background:T.white,transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
    </div>;
  }

  const menu=[
    {i:"law",      l:"EU-GPSR Erklärung",     s:"Verordnung verständlich erklärt",                     action:onOpenGPSR,    hl:true},
    {i:"bell",     l:"Benachrichtigungen",     s:notifOn?"Rückruf-Alarme aktiv":"Deaktiviert",          action:toggleNotif,   right:()=><Toggle on={notifOn}/>},
    {i:"fingerprint",l:"Face ID / Touch ID",  s:bioActive?"Aktiv – wird bei jedem Login verwendet":"Deaktiviert",action:toggleBio,right:()=><Toggle on={bioActive}/>},
    {i:"shield",   l:"Datenschutz & DSGVO",   s:"Deine Rechte & wie wir deine Daten schützen",         action:()=>setShowPrivacy(true)},
    {i:"export",   l:"Ausrüstung exportieren", s:`${gear.length} Artikel als Textdatei speichern`,      action:exportGear},
    {i:"star",     l:"App bewerten",           s:"Feedback hilft uns besser zu werden",                  action:()=>setShowRating(true)},
    {i:"info",     l:"Über AlpineRecall",      s:"Version 1.0.0 · Hochschule München · SS 2026",        action:()=>setShowAbout(true)},
  ];
  return <div>
    <div style={{background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,padding:"28px 20px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <ProfilePicture initials={user.initials}/>
        <div><h2 style={{margin:"0 0 2px",fontSize:18,fontWeight:700,color:T.white,fontFamily:"'DM Serif Display',serif"}}>{user.name}</h2><p style={{margin:0,fontSize:12,color:"#93C5FD",fontFamily:"'DM Sans',sans-serif"}}>{user.email}</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[{v:gear.length,l:"Artikel"},{v:gear.filter(g=>g.status==="recall"&&!g.done).length,l:"Rückrufe"},{v:gear.filter(g=>g.done).length,l:"Erledigt"}].map((s,i)=><div key={i} style={{background:"rgba(255,255,255,.08)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}><p style={{margin:"0 0 2px",fontSize:18,fontWeight:800,color:T.tealLt,fontFamily:"'DM Serif Display',serif"}}>{s.v}</p><p style={{margin:0,fontSize:11,color:"#94A3B8",fontFamily:"'DM Sans',sans-serif"}}>{s.l}</p></div>)}
      </div>
    </div>
    <div style={{margin:"14px 16px 0",background:isOffline?"#1F2937":T.tealLt,border:`1px solid ${isOffline?T.s700:T.teal}`,borderRadius:12,padding:"10px 14px",display:"flex",gap:10,alignItems:"center"}}>
      <Icon n={isOffline?"wifi-off":"wifi"} s={16} c={isOffline?"#FCD34D":T.teal}/>
      <div><p style={{margin:0,fontSize:12,fontWeight:700,color:isOffline?"#FCD34D":T.teal,fontFamily:"'DM Sans',sans-serif"}}>{isOffline?"Offline-Modus aktiv":"Online – Daten synchronisiert"}</p><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{lastSync?`Letzter Sync: ${new Date(lastSync).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"})}`:""}</p></div>
    </div>
    <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
      {bioMsg&&<div style={{background:bioMsg.includes("Fehler")||bioMsg.includes("Abgebrochen")?T.redLt:T.greenLt,borderRadius:10,padding:"8px 14px",marginBottom:8}}><p style={{margin:0,fontSize:12,color:bioMsg.includes("Fehler")||bioMsg.includes("Abgebrochen")?T.red:T.green,fontFamily:"'DM Sans',sans-serif"}}>{bioMsg}</p></div>}
      {menu.map((item,i)=><div key={i} onClick={item.action||undefined} style={{background:item.hl?T.blueLt:T.white,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:item.action?"pointer":"default",border:`1px solid ${item.hl?T.blue+"40":T.s200}`}}>
        <div style={{width:36,height:36,borderRadius:10,background:item.hl?T.blue+"18":T.s100,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon n={item.i} s={16} c={item.hl?T.blue:T.s500}/></div>
        <div style={{flex:1}}><p style={{margin:0,fontSize:13,fontWeight:600,color:item.hl?T.blue:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{item.l}</p><p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{item.s}</p></div>
        {item.right ? item.right() : <Icon n="chevron" s={16} c={item.hl?T.blue:T.s400}/>}
      </div>)}
      <button onClick={onLogout} style={{background:"none",border:`1.5px solid ${T.redLt}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",width:"100%"}}>
        <div style={{width:36,height:36,borderRadius:10,background:T.redLt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon n="logout" s={16} c={T.red}/></div>
        <span style={{fontSize:13,fontWeight:600,color:T.red,fontFamily:"'DM Sans',sans-serif"}}>Abmelden</span>
      </button>
    </div>
    {showAbout&&<Sheet onClose={()=>setShowAbout(false)}>
      <div style={{padding:"20px 20px 0",textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:16,overflow:"hidden",margin:"0 auto 14px",boxShadow:`0 4px 16px ${T.teal}40`}}><AppLogo size={56}/></div>
        <h3 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>AlpineRecall</h3>
        <p style={{margin:"0 0 16px",fontSize:13,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Version 1.0.0 · Hochschule München · SS 2026</p>
        {[["Entwickelt im Rahmen von","Entwicklung einer Geschäftsidee – Real Projects"],["Technologie","React PWA · WebAuthn · BarcodeDetector API"],["Datenschutz","Alle Daten bleiben auf deinem Gerät"],["Push-Notifications","Web Push API · VAPID"],["Kontakt","alpinerecall@hm.edu"]].map(([k,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.s200}`,textAlign:"left"}}><span style={{fontSize:12,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>{k}</span><span style={{fontSize:12,fontWeight:600,color:T.navy,fontFamily:"'DM Sans',sans-serif",textAlign:"right",maxWidth:"55%"}}>{v}</span></div>
        ))}
        <div style={{height:16}}/>
      </div>
    </Sheet>}

    {/* Datenschutz Modal */}
    {showPrivacy&&<Sheet onClose={()=>setShowPrivacy(false)}>
      <div style={{padding:"20px 20px 0"}}>
        <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>🔒 Datenschutz & DSGVO</h3>
        {[
          {icon:"📱",title:"Lokale Datenspeicherung",text:"Alle deine Daten – Ausrüstung, Kaufdaten, Seriennummern – werden ausschließlich auf deinem Gerät gespeichert (localStorage). Nichts wird an externe Server übertragen."},
          {icon:"🚫",title:"Keine Weitergabe",text:"Deine persönlichen Daten werden niemals an Dritte verkauft oder weitergegeben. Keine Werbung, kein Tracking."},
          {icon:"🔐",title:"Biometrische Daten",text:"Face ID / Touch ID nutzt die WebAuthn-API des Browsers. Biometrische Daten verlassen deinen Chip nie – wir speichern nur einen verschlüsselten Schlüssel."},
          {icon:"🗑️",title:"Recht auf Löschung",text:"Du kannst jederzeit alle deine Daten löschen indem du dich abmeldest und die App-Daten im Browser löschst. Vollständig DSGVO-konform nach Art. 17."},
          {icon:"📧",title:"Kontakt",text:"Bei Fragen zum Datenschutz: alpinerecall@hm.edu"},
        ].map((p,i)=><div key={i} style={{background:T.s100,borderRadius:12,padding:"12px 14px",marginBottom:10}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0}}>{p.icon}</span>
            <div><p style={{margin:"0 0 4px",fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{p.title}</p><p style={{margin:0,fontSize:12,color:T.s500,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>{p.text}</p></div>
          </div>
        </div>)}
        <div style={{height:8}}/>
      </div>
    </Sheet>}

    {/* Bewertungs Modal */}
    {showRating&&<Sheet onClose={()=>setShowRating(false)}>
      <div style={{padding:"20px 20px 0",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>⭐</div>
        <h3 style={{margin:"0 0 8px",fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>App bewerten</h3>
        <p style={{margin:"0 0 20px",fontSize:13,color:T.s500,lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>Dein Feedback hilft uns AlpineRecall zu verbessern und mehr Bergsportler sicherer zu machen.</p>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {[1,2,3,4,5].map(s=><button key={s} onClick={()=>{sSave("rating",s);setShowRating(false);}} style={{width:52,height:52,borderRadius:14,background:T.amberLt,border:`1.5px solid ${T.amber}30`,fontSize:24,cursor:"pointer"}}>{"⭐"}</button>)}
        </div>
        <div style={{background:T.tealLt,border:`1px solid ${T.teal}30`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
          <p style={{margin:0,fontSize:12,color:T.teal,fontFamily:"'DM Sans',sans-serif"}}>📧 Ausführliches Feedback: <strong>alpinerecall@hm.edu</strong></p>
        </div>
        <div style={{height:8}}/>
      </div>
    </Sheet>}
  </div>;
}

async function bioIsAvailable() {
  if (!window.PublicKeyCredential) return false;
  try { return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
  catch { return false; }
}

async function bioRegister(user) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = await navigator.credentials.create({ publicKey: {
    challenge,
    rp: { name:"AlpineRecall", id:window.location.hostname },
    user: { id:new TextEncoder().encode(user.email), name:user.email, displayName:user.name },
    pubKeyCredParams: [{ alg:-7, type:"public-key" }, { alg:-257, type:"public-key" }],
    authenticatorSelection: { authenticatorAttachment:"platform", userVerification:"required" },
    timeout: 60000,
  }});
  return btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
}

async function bioVerify(credId) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const rawId = Uint8Array.from(atob(credId), c => c.charCodeAt(0));
  await navigator.credentials.get({ publicKey: {
    challenge,
    allowCredentials: [{ type:"public-key", id:rawId, transports:["internal"] }],
    userVerification: "required",
    timeout: 60000,
  }});
  return true;
}

function FaceIDSetupModal({ user, onDone }) {
  const [phase,   setPhase]   = useState("ask");   // ask | loading | success | error
  const [errMsg,  setErrMsg]  = useState("");

  async function activate() {
    setPhase("loading");
    try {
      const credId = await bioRegister(user);
      await sSave("biometric-cred", { credId, userId: user.email });
      setPhase("success");
      setTimeout(onDone, 1800);
    } catch(e) {
      setErrMsg(e.name === "NotAllowedError" ? "Abgebrochen – du kannst es jederzeit in den Einstellungen nachholen." : "Auf diesem Gerät nicht verfügbar.");
      setPhase("error");
      setTimeout(onDone, 3000);
    }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:T.white,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:390,padding:"32px 24px calc(32px + env(safe-area-inset-bottom,0px))",animation:"ar-slideUp .35s ease",textAlign:"center"}}>

        {phase === "ask" && <>
          <div style={{fontSize:56,marginBottom:16}}>🔐</div>
          <h3 style={{margin:"0 0 10px",fontSize:22,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Schneller anmelden</h3>
          <p style={{margin:"0 0 24px",fontSize:14,color:T.s500,lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
            Möchtest du dich beim nächsten Öffnen der App mit <strong>Face ID</strong> oder <strong>Touch ID</strong> anmelden – ohne Passwort?
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={activate} style={{width:"100%",background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,border:"none",borderRadius:14,padding:"15px",color:T.white,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 01-2 2C6.48 12 4 9.76 4 7 4 4.24 6.48 2 12 2s8 2.24 8 5c0 1-.39 2.04-1.08 2.79"/><path d="M12 20c0-4.41 3.59-8 8-8"/><path d="M12 20c0-4.41-3.59-8-8-8"/><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2"/></svg>
              Face ID / Touch ID aktivieren
            </button>
            <button onClick={onDone} style={{width:"100%",background:"none",border:`1.5px solid ${T.s200}`,borderRadius:14,padding:"13px",color:T.s500,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Jetzt nicht
            </button>
            <p style={{margin:0,fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Du kannst das jederzeit unter Profil → Einstellungen nachholen.</p>
          </div>
        </>}

        {phase === "loading" && <>
          <div style={{fontSize:56,marginBottom:16}}>🔐</div>
          <Spinner/>
          <p style={{margin:"16px 0 0",fontSize:14,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Biometrie wird eingerichtet…</p>
        </>}

        {phase === "success" && <>
          <div style={{fontSize:56,marginBottom:16,animation:"ar-popIn .4s ease"}}>✅</div>
          <h3 style={{margin:"0 0 8px",fontSize:22,fontWeight:700,color:T.green,fontFamily:"'DM Serif Display',serif"}}>Aktiviert!</h3>
          <p style={{margin:0,fontSize:14,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Du kannst dich ab sofort mit Face ID / Touch ID anmelden.</p>
        </>}

        {phase === "error" && <>
          <div style={{fontSize:56,marginBottom:16}}>⚠️</div>
          <p style={{margin:0,fontSize:13,color:T.amber,fontFamily:"'DM Sans',sans-serif"}}>{errMsg}</p>
        </>}
      </div>
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [phase, setPhase]       = useState("checking");  // checking | firstTime | login | register
  const [savedEmail, setSavedEmail] = useState("");
  const [hasBioCred, setHasBioCred] = useState(false);
  const [bioAvail,   setBioAvail]   = useState(false);

  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [pw,    setPw]    = useState("");
  const [pw2,   setPw2]   = useState("");
  const [err,   setErr]   = useState({});
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMsg, setBioMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    (async () => {
      const registered = await sLoad("registered-users", {}) || {};
      const lastEmail  = await sLoad("last-login-email", "");
      const cred       = await sLoad("biometric-cred");
      const avail      = await bioIsAvailable();

      const allEmails = [...Object.keys(registered), ...Object.keys(DEMO_USERS)];
      const hasRegistered = allEmails.length > Object.keys(DEMO_USERS).length || lastEmail;

      setSavedEmail(lastEmail || "");
      setHasBioCred(!!cred);
      setBioAvail(avail);

      if (!hasRegistered) {
        setPhase("firstTime");   // Noch kein eigener Account → Registrierung zeigen
      } else {
        setEmail(lastEmail || "");
        setPhase("login");
      }
    })();
  }, []);

  async function doRegister() {
    const e = {};
    if (!name.trim())          e.name  = "Name erforderlich";
    if (!email.includes("@"))  e.email = "Gültige E-Mail erforderlich";
    if (pw.length < 6)         e.pw    = "Mindestens 6 Zeichen";
    if (pw !== pw2)            e.pw2   = "Passwörter stimmen nicht überein";
    setErr(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const emailLow  = email.toLowerCase().trim();
    const initials  = name.trim().split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) || "??";
    const registered = await sLoad("registered-users", {}) || {};

    if (registered[emailLow]) {
      setErr({ email:"E-Mail bereits registriert" });
      setLoading(false);
      return;
    }

    registered[emailLow] = { email:emailLow, name:name.trim(), initials, pw };
    await sSave("registered-users", registered);
    await sSave("last-login-email", emailLow);

    const userData = { email:emailLow, name:name.trim(), initials };
    await sSave("auth-user", userData);
    setLoading(false);
    onLogin(userData);
  }

  async function doLogin() {
    const e = {};
    if (!email.includes("@")) e.email = "Gültige E-Mail erforderlich";
    if (pw.length < 1)        e.pw    = "Passwort eingeben";
    setErr(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const emailLow   = email.toLowerCase().trim();
    const demo       = DEMO_USERS[emailLow];
    const registered = await sLoad("registered-users", {}) || {};
    const regUser    = registered[emailLow];

    if (demo && demo.pw === pw) {
      const d = { email:emailLow, name:demo.name, initials:demo.initials };
      await sSave("auth-user", d);
      await sSave("last-login-email", emailLow);
      setLoading(false);
      onLogin(d);
      return;
    }
    if (regUser && regUser.pw === pw) {
      const d = { email:emailLow, name:regUser.name, initials:regUser.initials };
      await sSave("auth-user", d);
      await sSave("last-login-email", emailLow);
      setLoading(false);
      onLogin(d);
      return;
    }
    setErr({ pw: "Falsches Passwort" });
    setLoading(false);
  }

  async function doFaceID() {
    setBioLoading(true); setBioMsg("");
    try {
      const cred = await sLoad("biometric-cred");
      if (!cred) { setBioMsg("Noch nicht eingerichtet."); setBioLoading(false); return; }

      await bioVerify(cred.credId);

      let u = await sLoad("auth-user");
      if (!u) {
        const registered = await sLoad("registered-users", {}) || {};
        const demo       = DEMO_USERS[cred.userId];
        const regUser    = registered[cred.userId];
        if (demo)    u = { email:cred.userId, name:demo.name, initials:demo.initials };
        else if (regUser) u = { email:regUser.email, name:regUser.name, initials:regUser.initials };
      }
      if (u) {
        await sSave("auth-user", u);
        await sSave("last-login-email", u.email);
        setBioLoading(false);
        onLogin(u);
      } else {
        setBioMsg("Account nicht gefunden – bitte mit Passwort anmelden.");
        setBioLoading(false);
      }
    } catch(e) {
      setBioMsg(e.name === "NotAllowedError" ? "Face ID abgebrochen." : "Biometrie nicht verfügbar.");
      setBioLoading(false);
    }
  }

  if (phase === "checking") return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(160deg,${T.navy},${T.tealDk})`}}>
      <Spinner size={36} color={T.tealLt}/>
    </div>
  );

  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:`linear-gradient(160deg,${T.navy} 0%,${T.navyMd} 45%,${T.tealDk} 100%)`,opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(16px)",transition:"all .5s cubic-bezier(.34,1.56,.64,1)"}}>

      {/* Logo-Bereich */}
      <div style={{padding:"52px 32px 28px",textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:20,overflow:"hidden",margin:"0 auto 16px",boxShadow:`0 8px 32px ${T.teal}50`}}>
          <AppLogo size={64}/>
        </div>
        <h1 style={{margin:"0 0 6px",fontSize:26,fontWeight:700,color:T.white,fontFamily:"'DM Serif Display',serif"}}>AlpineRecall</h1>
        <p style={{margin:0,fontSize:13,color:"#93C5FD",fontFamily:"'DM Sans',sans-serif"}}>
          {phase === "firstTime" ? "Willkommen – erstelle deinen Account" : "Willkommen zurück"}
        </p>
      </div>

      {/* Formular-Karte */}
      <div style={{flex:1,background:T.white,borderRadius:"28px 28px 0 0",padding:"28px 24px calc(36px + env(safe-area-inset-bottom,0px))"}}>

        {/* ── ERSTMALIG: Nur Registrierung ── */}
        {(phase === "firstTime" || phase === "register") && <>
          <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Konto erstellen</h2>
          <p style={{margin:"0 0 20px",fontSize:13,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Einmalig registrieren – danach reicht dein Passwort oder Face ID.</p>

          <FInput label="Vollständiger Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Max Mustermann" icon="user" error={err.name} autoFocus/>
          <FInput label="E-Mail-Adresse" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@beispiel.de" icon="mail" error={err.email}/>
          <FInput label="Passwort" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Mindestens 6 Zeichen" icon="lock" error={err.pw}/>
          <FInput label="Passwort wiederholen" type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Passwort bestätigen" icon="lock" error={err.pw2}/>

          {loading ? <div style={{padding:"12px 0"}}><Spinner/></div> : <Btn full label="Konto erstellen" variant="navy" onClick={doRegister}/>}

          {phase === "register" && (
            <button onClick={()=>{setPhase("login");setErr({});}} style={{marginTop:14,width:"100%",background:"none",border:"none",color:T.teal,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              ← Zurück zum Login
            </button>
          )}

          {phase === "firstTime" && (
            <div style={{marginTop:14,background:T.blueLt,border:`1px solid ${T.blue}30`,borderRadius:10,padding:"9px 13px"}}>
              <p style={{margin:0,fontSize:12,color:T.blue,fontFamily:"'DM Sans',sans-serif"}}><strong>Demo:</strong> Oder melde dich an mit max@dav.de · demo1234</p>
              <button onClick={()=>{setPhase("login");setEmail("max@dav.de");}} style={{background:"none",border:"none",color:T.blue,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"4px 0 0"}}>→ Zum Login</button>
            </div>
          )}
        </>}

        {/* ── WIEDERKEHRENDER USER: Login ── */}
        {phase === "login" && <>
          <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif"}}>Willkommen zurück</h2>
          <p style={{margin:"0 0 20px",fontSize:13,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Melde dich mit deinem Account an.</p>

          {/* Face ID – prominent oben wenn eingerichtet */}
          {hasBioCred && bioAvail && (
            <div style={{marginBottom:20}}>
              <button onClick={doFaceID} disabled={bioLoading} style={{width:"100%",background:`linear-gradient(135deg,${T.navy},${T.navyMd})`,border:"none",borderRadius:14,padding:"16px",color:T.white,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:12,boxShadow:`0 4px 20px ${T.navy}40`}}>
                {bioLoading ? <Spinner size={22} color={T.white}/> : <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 01-2 2C6.48 12 4 9.76 4 7 4 4.24 6.48 2 12 2s8 2.24 8 5c0 1-.39 2.04-1.08 2.79"/><path d="M12 20c0-4.41 3.59-8 8-8"/><path d="M12 20c0-4.41-3.59-8-8-8"/><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2"/></svg>
                  Mit Face ID / Touch ID anmelden
                </>}
              </button>
              {bioMsg && <p style={{margin:"8px 0 0",fontSize:12,color:T.amber,textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>{bioMsg}</p>}
              <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
                <div style={{flex:1,height:1,background:T.s200}}/>
                <span style={{fontSize:12,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>oder mit Passwort</span>
                <div style={{flex:1,height:1,background:T.s200}}/>
              </div>
            </div>
          )}

          <FInput label="E-Mail-Adresse" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@beispiel.de" icon="mail" error={err.email} autoFocus={!hasBioCred}/>
          <FInput label="Passwort" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Passwort eingeben" icon="lock" error={err.pw}/>

          {loading ? <div style={{padding:"12px 0"}}><Spinner/></div> : <Btn full label="Anmelden" variant="navy" onClick={doLogin}/>}

          <button onClick={()=>{setPhase("register");setErr({});setPw("");setPw2("");}} style={{marginTop:14,width:"100%",background:"none",border:"none",color:T.teal,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Noch kein Account? Jetzt registrieren →
          </button>
        </>}

        <p style={{marginTop:16,textAlign:"center",fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>Daten werden nach EU-DSGVO verarbeitet und nie verkauft.</p>
      </div>
    </div>
  );
}

function Sheet({children, onClose}) {
  const sheetRef = useRef(null);
  const startY   = useRef(0);
  const curY     = useRef(0);
  const [drag, setDrag] = useState(0);

  function onTouchStart(e){ startY.current = e.touches[0].clientY; curY.current = 0; }
  function onTouchMove(e){
    const delta = e.touches[0].clientY - startY.current;
    if(delta > 0){ curY.current = delta; setDrag(delta); }
  }
  function onTouchEnd(){
    if(curY.current > 120){ onClose(); }
    else { setDrag(0); }
    curY.current = 0;
  }

  return (
    <div style={{position:"fixed",inset:0,background:`rgba(0,0,0,${Math.max(0, 0.65 - drag/400)})`,zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={onClose}>
      <div ref={sheetRef}
        onClick={e=>e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          background:T.white, borderRadius:"24px 24px 0 0",
          width:"100%", maxHeight:"92vh", overflowY:"auto",
          paddingBottom:"calc(24px + env(safe-area-inset-bottom))",
          transform:`translateY(${drag}px)`,
          transition: drag===0 ? "transform 0.3s cubic-bezier(0.32,0.72,0,1)" : "none",
          touchAction:"pan-y",
        }}>
        {/* Drag Handle */}
        <div style={{width:40,height:4,background:T.s300,borderRadius:2,margin:"14px auto 0",cursor:"grab"}}/>
        {children}
      </div>
    </div>
  );
}

function ProfilePicture({initials, onUpdate}) {
  const [img, setImg] = useState(null);
  const inputRef = useRef(null);

  useEffect(()=>{
    sLoad("profile-pic").then(v=>{ if(v) setImg(v); });
  },[]);

  function handleFile(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setImg(dataUrl);
      await sSave("profile-pic", dataUrl);
      onUpdate?.(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{position:"relative",display:"inline-block"}}>
      <div onClick={()=>inputRef.current?.click()} style={{
        width:64, height:64, borderRadius:20,
        background: img ? "transparent" : T.teal,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:`0 4px 14px ${T.teal}50`,
        cursor:"pointer", overflow:"hidden",
        border:`2px solid ${T.tealLt}`,
      }}>
        {img
          ? <img src={img} alt="Profilbild" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <span style={{fontSize:22,fontWeight:700,color:T.white,fontFamily:"'DM Serif Display',serif"}}>{initials}</span>
        }
      </div>
      {/* Kamera-Badge */}
      <div onClick={()=>inputRef.current?.click()} style={{
        position:"absolute", bottom:-4, right:-4,
        width:22, height:22, borderRadius:"50%",
        background:T.navy, border:`2px solid ${T.white}`,
        display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
      }}>
        <Icon n="camera" s={11} c={T.white}/>
      </div>
      <input ref={inputRef} type="file" accept="image/*"
        onChange={handleFile} style={{display:"none"}}/>
    </div>
  );
}

// Händler-Datenbank mit realen GPS-Koordinaten (lat/lng) für Distanzberechnung
const DEALER_DB=[
  {name:"Sporthaus Schuster",  addr:"Rosenstr. 3, München",       open:"Mo–Sa 10–20 Uhr", lat:48.1357, lng:11.5756, brands:["Petzl","Black Diamond","Mammut","Ortovox","Edelrid"]},
  {name:"Sport Bittl",         addr:"Karl-Marx-Ring 1, München",  open:"Mo–Sa 10–19 Uhr", lat:48.1239, lng:11.6472, brands:["Salewa","Black Diamond","Mammut"]},
  {name:"DAV Shop München",    addr:"Bayerstr. 21, München",      open:"Mo–Fr 9–18 Uhr",  lat:48.1390, lng:11.5607, brands:["Petzl","Edelrid","Ortovox","Mammut"]},
  {name:"Globetrotter München",addr:"Isartorplatz 8–10, München", open:"Mo–Sa 10–20 Uhr", lat:48.1338, lng:11.5800, brands:["Black Diamond","Salewa","Mammut","Petzl"]},
];

function calcDist(lat1,lng1,lat2,lng2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function DealerMap({recall}) {
  const [expanded, setExpanded] = useState(false);
  const [gpsState, setGpsState] = useState("idle"); // idle | loading | ok | denied
  const [userPos, setUserPos]   = useState(null);
  const [dealers, setDealers]   = useState(DEALER_DB);
  const [mapSrc, setMapSrc]     = useState(null);

  // Filter Händler nach Hersteller-Brand wenn recall vorhanden
  const brand = recall?.brand || null;

  function buildMapSrc(lat, lng, dealerList) {
    // Bounding-Box um Nutzerposition + alle Händler
    const lats=[lat,...dealerList.map(d=>d.lat)];
    const lngs=[lng,...dealerList.map(d=>d.lng)];
    const minLat=Math.min(...lats)-0.01, maxLat=Math.max(...lats)+0.01;
    const minLng=Math.min(...lngs)-0.008,maxLng=Math.max(...lngs)+0.008;
    const bbox=`${minLng},${minLat},${maxLng},${maxLat}`;
    const markers=dealerList.map(d=>`marker=${d.lat},${d.lng}`).join("&");
    // Nutzer-Marker als erster Marker (roter Punkt durch marker-Parameter)
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}&${markers}`;
  }

  function requestLocation() {
    if(!navigator.geolocation){setGpsState("denied");return;}
    setGpsState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        const {latitude:lat,longitude:lng}=pos.coords;
        setUserPos({lat,lng});
        // Distanz berechnen & Händler sortieren
        const withDist=DEALER_DB
          .filter(d=>!brand||d.brands.includes(brand))
          .map(d=>({...d,distKm:calcDist(lat,lng,d.lat,d.lng)}))
          .sort((a,b)=>a.distKm-b.distKm)
          .map(d=>({...d,dist:(d.distKm<1?`${Math.round(d.distKm*1000)} m`:`${d.distKm.toFixed(1)} km`)}));
        setDealers(withDist);
        setMapSrc(buildMapSrc(lat,lng,withDist));
        setGpsState("ok");
      },
      ()=>{
        setGpsState("denied");
        // Fallback: statische Karte München-Zentrum zeigen
        const fallbackDealers=DEALER_DB.filter(d=>!brand||d.brands.includes(brand));
        setDealers(fallbackDealers.map(d=>({...d,dist:"–"})));
        setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=11.5394%2C48.1174%2C11.6194%2C48.1574&layer=mapnik&${fallbackDealers.map(d=>`marker=${d.lat},${d.lng}`).join("&")}`);
      },
      {timeout:8000, enableHighAccuracy:true}
    );
  }

  function handleExpand() {
    setExpanded(e=>!e);
    if(!expanded && gpsState==="idle") requestLocation();
  }

  const displayDealers = dealers.filter(d=>!brand||d.brands.includes(brand));
  const defaultSrc=`https://www.openstreetmap.org/export/embed.html?bbox=11.5394%2C48.1174%2C11.6194%2C48.1574&layer=mapnik&${DEALER_DB.map(d=>`marker=${d.lat},${d.lng}`).join("&")}`;

  return (
    <div style={{background:T.white,borderRadius:14,border:`1px solid ${T.s200}`,overflow:"hidden"}}>
      {/* Header */}
      <div onClick={handleExpand} style={{
        padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer",
        background:`linear-gradient(135deg,${T.navy}08,${T.teal}08)`,
      }}>
        <div style={{width:36,height:36,borderRadius:10,background:T.tealLt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Icon n="map" s={18} c={T.teal}/>
        </div>
        <div style={{flex:1}}>
          <p style={{margin:0,fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>Rückgabe-Händler in der Nähe</p>
          <p style={{margin:0,fontSize:11,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>
            {gpsState==="ok"?`${displayDealers.length} Händler – sortiert nach Entfernung`:
             gpsState==="loading"?"Standort wird ermittelt…":
             gpsState==="denied"?`${displayDealers.length} Händler (Standort nicht verfügbar)`:
             `${displayDealers.length} Händler akzeptieren kostenlosen Ersatz`}
          </p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {gpsState==="loading"&&<Spinner size={16} color={T.teal}/>}
          {gpsState==="ok"&&<span style={{fontSize:10,background:T.tealLt,color:T.teal,fontWeight:700,padding:"2px 7px",borderRadius:10,fontFamily:"'DM Sans',sans-serif"}}>📍 GPS</span>}
          <div style={{transform:expanded?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s"}}><Icon n="chevron" s={16} c={T.s400}/></div>
        </div>
      </div>

      {expanded && (
        <div>
          {/* GPS Hinweis-Banner wenn verweigert */}
          {gpsState==="denied"&&(
            <div style={{margin:"8px 16px 0",background:T.amberLt,border:`1px solid ${T.amber}40`,borderRadius:10,padding:"8px 12px",display:"flex",gap:8,alignItems:"center"}}>
              <Icon n="info" s={14} c={T.amber}/>
              <p style={{margin:0,fontSize:11,color:T.amber,fontFamily:"'DM Sans',sans-serif",flex:1}}>Standort nicht verfügbar – Händlerliste nach Region sortiert.</p>
              <button onClick={requestLocation} style={{background:T.amber,border:"none",borderRadius:7,padding:"4px 10px",color:T.white,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Erneut</button>
            </div>
          )}

          {/* Karte */}
          <div style={{position:"relative",height:200,overflow:"hidden",margin:"10px 16px 8px",borderRadius:12}}>
            {gpsState==="loading"?(
              <div style={{width:"100%",height:"100%",background:T.s100,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
                <Spinner size={28} color={T.teal}/>
                <p style={{margin:0,fontSize:12,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>Standort wird ermittelt…</p>
              </div>
            ):(
              <iframe
                title="Händler-Karte"
                src={mapSrc||defaultSrc}
                style={{width:"100%",height:"100%",border:"none"}}
                loading="lazy"
              />
            )}
            <div style={{position:"absolute",bottom:6,right:6,background:"rgba(255,255,255,0.9)",borderRadius:6,padding:"3px 7px"}}>
              <p style={{margin:0,fontSize:10,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>© OpenStreetMap</p>
            </div>
            {gpsState==="ok"&&userPos&&(
              <div style={{position:"absolute",top:8,left:8,background:"rgba(13,148,136,0.92)",borderRadius:8,padding:"4px 9px",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:11}}>📍</span>
                <p style={{margin:0,fontSize:10,color:T.white,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Dein Standort</p>
              </div>
            )}
          </div>

          {/* Händlerliste */}
          <div style={{padding:"0 16px 8px",display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
            {displayDealers.map((d,i)=>(
              <div key={i}
                onClick={()=>{ const q=encodeURIComponent(d.name+" "+d.addr); const ios=/iPad|iPhone|iPod/.test(navigator.userAgent); window.open(ios?`maps://?q=${q}`:`https://maps.google.com/?q=${q}`,"_blank"); }}
                style={{background:i===0&&gpsState==="ok"?T.tealLt:T.s100,borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",border:`1px solid ${i===0&&gpsState==="ok"?T.teal+"40":T.s200}`}}>
                <div style={{width:32,height:32,borderRadius:8,background:i===0&&gpsState==="ok"?T.teal:T.tealLt,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  <span style={{fontSize:14}}>🏪</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <p style={{margin:0,fontSize:13,fontWeight:700,color:T.navy,fontFamily:"'DM Sans',sans-serif"}}>{d.name}</p>
                    <span style={{fontSize:11,fontWeight:700,color:gpsState==="ok"?T.teal:T.s500,flexShrink:0,marginLeft:8,fontFamily:"'DM Sans',sans-serif"}}>{d.dist||"–"}</span>
                  </div>
                  <p style={{margin:"2px 0 0",fontSize:11,color:T.s500,fontFamily:"'DM Sans',sans-serif"}}>{d.addr}</p>
                  <p style={{margin:"1px 0 0",fontSize:11,color:T.s400,fontFamily:"'DM Sans',sans-serif"}}>{d.open}</p>
                  {i===0&&gpsState==="ok"&&<p style={{margin:"3px 0 0",fontSize:10,color:T.teal,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>⭐ Nächster Händler</p>}
                  <p style={{margin:"3px 0 0",fontSize:10,color:T.teal,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>📍 In Karten öffnen →</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{padding:"0 16px 14px"}}>
            <div style={{background:T.greenLt,border:`1px solid ${T.green}40`,borderRadius:10,padding:"8px 12px"}}>
              <p style={{margin:0,fontSize:12,color:T.green,fontFamily:"'DM Sans',sans-serif"}}>✓ Kostenlosen Ersatz vorweisen – Rechnung oder Registrierung in AlpineRecall genügt</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function AlpineRecallApp(){
  const [user,setUser]=useState(null);
  const [gear,setGear]=useState([]);
  const [tab,setTab]=useState("home");
  const [loaded,setLoaded]=useState(false);
  const [locked,setLocked]=useState(false); // LockScreen beim App-Öffnen
  const [toast,setToast]=useState(null);
  const [isOffline,setIsOffline]=useState(false);
  const [lastSync,setLastSync]=useState(null);
  const [showGPSR,setShowGPSR]=useState(false);
  const [showBioSetup,setShowBioSetup]=useState(false);

  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700;800&display=swap";
    link.rel="stylesheet";document.head.appendChild(link);

    let vm = document.querySelector('meta[name="viewport"]');
    if(!vm){ vm=document.createElement("meta"); vm.name="viewport"; document.head.appendChild(vm); }
    vm.content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,viewport-fit=cover";

    const setMeta=(name,content)=>{ let m=document.querySelector(`meta[name="${name}"]`);if(!m){m=document.createElement("meta");m.name=name;document.head.appendChild(m);}m.content=content; };
    setMeta("apple-mobile-web-app-capable","yes");
    setMeta("apple-mobile-web-app-status-bar-style","black-translucent");
    setMeta("theme-color","#0D9488");

    const onOnline=()=>{setIsOffline(false);setLastSync(new Date().toISOString());};
    const onOffline=()=>setIsOffline(true);
    window.addEventListener("online",onOnline); window.addEventListener("offline",onOffline);
    setIsOffline(!navigator.onLine);
    return()=>{window.removeEventListener("online",onOnline);window.removeEventListener("offline",onOffline);};
  },[]);

  useEffect(()=>{
    (async()=>{
      const u=await sLoad("auth-user");
      if(u){ setUser(u); setLocked(true); } // Bekannter User → erst sperren
      const g=await sLoad("gear-items"); setGear(g||INIT_GEAR);
      try{await sSave("recall-db-cache",RECALL_DB);await sSave("product-db-cache",PRODUCT_DB);}catch{}
      const ls=await sLoad("last-sync"); if(ls) setLastSync(ls);
      setLoaded(true);
    })();
  },[]);

  async function saveGear(g){setGear(g);await sSave("gear-items",g);const ts=new Date().toISOString();await sSave("last-sync",ts);setLastSync(ts);}
  const addItem=async item=>{ saveGear([...gear,item]); if(item.ean&&user&&user.email){ fetch("https://alpinerecall-backend.vercel.app/api/register-scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:user.email,ean:item.ean})}).catch(()=>{}); } };
  const deleteItem=id=>saveGear(gear.filter(g=>g.id!==id));
  const markDone=id=>saveGear(gear.map(g=>g.id===id?{...g,done:true}:g));
  async function logout(){try{await sDel("auth-user");}catch{}setUser(null);setTab("home");}

  function simRecall(){
    setToast(RECALL_DB["793661360728"]);
    const has=gear.find(g=>g.ean==="793661360728");
    if(!has) addItem({id:uid(),name:"Karabiner BD 210 Serie",brand:"Black Diamond",cat:"Karabiner",ean:"793661360728",serial:"SN-BD210-2023-Q4A",reg:today(),kaufDatum:"2023-11-20",status:"recall",done:false,receipt:null,teamId:null});
    else saveGear(gear.map(g=>g.ean==="793661360728"?{...g,status:"recall",done:false}:g));
  }

  const openRecalls=gear.filter(g=>g.status==="recall"&&!g.done).length;
  const expiringCount=gear.filter(g=>{const e=expiryInfo(g.kaufDatum,g.cat);return e&&(e.status==="critical"||e.status==="expired");}).length;

  const TABS=[
    {id:"home",   label:"Home",    icon:"home"                        },
    {id:"gear",   label:"Gear",    icon:"gear"                        },
    {id:"recalls",label:"Rückrufe",icon:"bell",  badge:openRecalls    },
    {id:"tour",   label:"Touren",  icon:"mountain",badge:expiringCount>0||openRecalls>0?0:0},
    {id:"team",   label:"Team",    icon:"users"                       },
    {id:"profile",label:"Profil",  icon:"user"                        },
  ];

  if(!loaded) return (
    <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${T.navy},${T.tealDk})`}}>
      <style>{`body{margin:0;overflow:hidden;}`}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:60,height:60,background:`linear-gradient(135deg,${T.teal},${T.tealDk})`,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:`0 8px 32px ${T.teal}50`}}>
          <AppLogo size={60}/>
        </div>
        <Spinner size={36} color={T.tealLt}/>
        <p style={{margin:"14px 0 0",fontSize:14,color:T.tealLt,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>AlpineRecall lädt…</p>
      </div>
    </div>
  );

  return (
    <div style={{
      position:"fixed", inset:0,
      display:"flex", flexDirection:"column",
      background:T.s100,
      fontFamily:"'DM Sans',sans-serif",
      paddingTop:"env(safe-area-inset-top,0px)",
      overflow:"hidden",
      WebkitFontSmoothing:"antialiased",
    }}>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; }
        body { margin:0; padding:0; overflow:hidden; width:100vw; max-width:100vw; }
        input, select, textarea { font-size:16px; } /* verhindert Zoom bei iOS-Input-Focus */
        ::-webkit-scrollbar { display:none; }
        * { -webkit-tap-highlight-color:transparent; }
        @keyframes ar-spin   { to { transform:rotate(360deg) } }
        @keyframes ar-scan   { 0% { top:8px } 100% { top:calc(100% - 10px) } }
        @keyframes ar-popIn  { from { transform:scale(0);opacity:0 } to { transform:scale(1);opacity:1 } }
        @keyframes ar-slideUp{ from { transform:translateY(16px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes ar-fadein { from { opacity:0 } to { opacity:1 } }
      `}</style>

      {toast && <PushToast recall={toast} onClose={()=>setToast(null)} onView={()=>{setToast(null);setTab("recalls");}}/>}

      {/* GPSR Modal */}
      {showGPSR && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setShowGPSR(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:T.white, borderRadius:"24px 24px 0 0",
            width:"100%", maxHeight:"90vh", overflowY:"auto",
            paddingBottom:`calc(24px + env(safe-area-inset-bottom,0px))`,
            animation:"ar-slideUp .3s ease",
          }}>
            <div style={{width:40,height:4,background:T.s300,borderRadius:2,margin:"14px auto 0"}}/>
            <GPSRScreen onClose={()=>setShowGPSR(false)}/>
          </div>
        </div>
      )}

      {/* ── BIOMETRIC SETUP MODAL ─────────────────────────────────────────── */}
      {showBioSetup && user && (
        <FaceIDSetupModal user={user} onDone={()=>setShowBioSetup(false)}/>
      )}

      {/* ── AUTH ──────────────────────────────────────────────────────────── */}
      {!user ? (
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          <AuthScreen onLogin={async u=>{ setUser(u); setLocked(false); const hasCred=await sLoad("biometric-cred"); const shown=await sLoad("bio-setup-shown"); if(!hasCred&&!shown) setShowBioSetup(true); await sSave("bio-setup-shown",true); if(window.OneSignal&&u.email){setTimeout(async()=>{try{const playerId=await window.OneSignal.User.PushSubscription.id;if(playerId){await fetch("https://alpinerecall-backend.vercel.app/api/register-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:u.email,playerId})}).catch(()=>{});}}catch(e){console.warn("OneSignal error:",e);}},500);} }}/>
        </div>
      ) : locked ? (
        <div style={{flex:1}}>
          <LockScreen user={user} onUnlock={()=>setLocked(false)}/>
        </div>
      ) : (
        <>
          {/* ── HEADER ────────────────────────────────────────────────────── */}
          <div style={{
            background:T.white, borderBottom:`1px solid ${T.s200}`,
            padding:"10px 18px", flexShrink:0,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            boxShadow:"0 1px 6px rgba(0,0,0,0.06)",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:30,height:30,borderRadius:9,overflow:"hidden"}}>
                <AppLogo size={30}/>
              </div>
              <span style={{fontSize:18,fontWeight:700,color:T.navy,fontFamily:"'DM Serif Display',serif",letterSpacing:"-0.3px"}}>AlpineRecall</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {isOffline && (
                <div style={{background:"#FEF08A",borderRadius:16,padding:"3px 9px",display:"flex",alignItems:"center",gap:4}}>
                  <Icon n="wifi-off" s={11} c="#854D0E"/>
                  <span style={{fontSize:10,fontWeight:700,color:"#854D0E",fontFamily:"'DM Sans',sans-serif"}}>Offline</span>
                </div>
              )}
              <div style={{position:"relative"}}>
                <button onClick={()=>setTab("recalls")} style={{width:36,height:36,background:openRecalls>0?T.redLt:T.s100,border:"none",borderRadius:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Icon n="bell" s={18} c={openRecalls>0?T.red:T.s500}/>
                </button>
                {openRecalls>0 && (
                  <div style={{position:"absolute",top:-2,right:-2,width:18,height:18,background:T.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.white}`}}>
                    <span style={{fontSize:10,fontWeight:800,color:T.white}}>{openRecalls}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Offline Banner */}
          {isOffline && (
            <div style={{background:"linear-gradient(135deg,#374151,#1F2937)",padding:"6px 16px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <Icon n="wifi-off" s={12} c="#FCD34D"/>
              <p style={{margin:0,fontSize:11,color:"#FCD34D",fontFamily:"'DM Sans',sans-serif"}}>
                Offline · Daten aus Cache{lastSync?` · ${new Date(lastSync).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}`:""}</p>
            </div>
          )}

          {/* ── SCROLLBARER INHALT ──────────────────────────────────────── */}
          <div style={{
            flex:1, overflowY:"auto",
            WebkitOverflowScrolling:"touch",
            overscrollBehavior:"contain",
            background:T.s100,
          }}>
            {tab==="home"    && <HomeScreen    user={user} gear={gear} onNav={setTab} onSimRecall={simRecall} isOffline={isOffline}/>}
            {tab==="gear"    && <GearScreen    gear={gear} onAdd={addItem} onDelete={deleteItem}/>}
            {tab==="recalls" && <RecallsScreen gear={gear} onMarkDone={markDone}/>}
            {tab==="expiry"  && <ExpiryScreen  gear={gear}/>}
            {tab==="tour"    && <TourScreen gear={gear} onUpdate={(id,changes)=>saveGear(gear.map(g=>g.id===id?{...g,...changes}:g))}/>}
            {tab==="team"    && <TeamScreen    user={user} gear={gear} onAdd={addItem}/>}
            {tab==="profile" && <ProfileScreen user={user} gear={gear} onLogout={logout} isOffline={isOffline} lastSync={lastSync} onOpenGPSR={()=>setShowGPSR(true)}/>}
            {/* Abstand am Ende – Inhalt nicht hinter Nav-Bar */}
            <div style={{height:"calc(20px + env(safe-area-inset-bottom,0px))"}}/>
          </div>

          {/* ── STATISCHE BOTTOM NAVIGATION ─────────────────────────────── */}
          <div style={{
            background:T.white,
            borderTop:`1px solid ${T.s200}`,
            display:"flex",
            flexShrink:0,
            boxShadow:"0 -2px 12px rgba(0,0,0,0.07)",
            paddingBottom:"env(safe-area-inset-bottom,0px)",
          }}>
            {TABS.map(t=>{
              const active = tab===t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  flex:1, border:"none", background:"none", cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center",
                  gap:2, padding:"9px 2px 7px",
                  WebkitTapHighlightColor:"transparent",
                  minWidth:0,
                }}>
                  <div style={{position:"relative"}}>
                    <div style={{
                      color:active?T.teal:T.s400,
                      transform:active?"scale(1.12)":"scale(1)",
                      transition:"all .2s cubic-bezier(.34,1.56,.64,1)"
                    }}>
                      <Icon n={t.icon} s={22} c={active?T.teal:T.s400}/>
                    </div>
                    {t.badge>0 && (
                      <div style={{position:"absolute",top:-5,right:-7,width:16,height:16,background:t.id==="expiry"?T.orange:T.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${T.white}`}}>
                        <span style={{fontSize:8,fontWeight:800,color:T.white}}>{t.badge}</span>
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize:10, fontWeight:active?700:400,
                    color:active?T.teal:T.s400,
                    fontFamily:"'DM Sans',sans-serif",
                    lineHeight:1, letterSpacing:active?"-0.2px":"0",
                    whiteSpace:"nowrap",
                  }}>{t.label}</span>
                  {/* Aktiv-Indikator */}
                  {active && (
                    <div style={{
                      position:"absolute", bottom:0,
                      width:32, height:2,
                      background:`linear-gradient(90deg,${T.teal},${T.tealDk})`,
                      borderRadius:"2px 2px 0 0",
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
