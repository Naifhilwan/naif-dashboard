import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════
   KEYS
══════════════════════════════════════════ */
const STORAGE_KEY  = "naif_ceo_v5";
const ODOO_KEY     = "naif_odoo_v5";
const SESSION_KEY  = "naif_session_v5";
const REFRESH_MS   = 60 * 60 * 1000;

/* ══════════════════════════════════════════
   USERS
══════════════════════════════════════════ */
const USERS = {
  naif: {
    id:"naif", name:"نايف", role:"المدير التنفيذي", avatar:"ن", pin:"1234", color:"#E8762A",
    access:{ editKpi:true, editTasks:true, editTeam:true, editProjects:true, odoo:true }
  },
  mawdi: {
    id:"mawdi", name:"موضي", role:"السكرتيرة التنفيذية", avatar:"مو", pin:"5678", color:"#C45FA0",
    access:{ editKpi:false, editTasks:true, editTeam:false, editProjects:false, odoo:false }
  }
};

/* ══════════════════════════════════════════
   DEFAULT DATA
══════════════════════════════════════════ */
const DEF = {
  companies:[
    {
      id:1, name:"بريد إكس", nameEn:"Brid X", industry:"لوجستيات ونقل", icon:"🚚", color:"#E8762A", health:74,
      odooConnected:false, lastSync:null,
      sections:[
        { title:"العملاء والشبكة", icon:"🤝", kpis:[
          { id:"bx1", label:"العملاء التجاريين", value:"47",     target:"120",    unit:"عميل",  trend:"+٥ هذا الشهر",     trendUp:true,  odooField:"customers"        },
          { id:"bx2", label:"الجهات الحكومية",   value:"6",      target:"20",     unit:"جهة",   trend:"+١ هذا الشهر",     trendUp:true,  odooField:"gov_partners"     },
          { id:"bx6", label:"فروع الفرنشايز",    value:"3",      target:"15",     unit:"فرع",   trend:"قيد التفاوض ٢",    trendUp:true,  odooField:null               },
        ]},
        { title:"الإيرادات", icon:"💰", kpis:[
          { id:"bx3", label:"المبيعات الشهرية",  value:"180000", target:"300000", unit:"ر.س",   trend:"+١٢٪ عن الشهر",    trendUp:true,  odooField:"monthly_revenue"  },
        ]},
        { title:"العمليات والأسطول", icon:"⚙️", kpis:[
          { id:"bx4", label:"الشحنات الشهرية",   value:"3200",   target:"5000",   unit:"شحنة",  trend:"+٢٠٠ عن الشهر",   trendUp:true,  odooField:"monthly_pickings" },
          { id:"bx5", label:"عدد الخدمات",        value:"6",      target:"10",     unit:"خدمة",  trend:"توصيل مبرد قادم", trendUp:true,  odooField:null               },
          { id:"bx8", label:"حجم الأسطول",        value:"23",     target:"50",     unit:"مركبة", trend:"٣ قيد الشراء",    trendUp:true,  odooField:"fleet_count"      },
        ]},
      ],
      tasks:[
        { id:1, title:"التفاوض مع جهة حكومية جديدة", due:"٢٠ مار", priority:"high",   done:false, assignee:"naif"  },
        { id:2, title:"إطلاق فرنشايز جدة",            due:"١ أبر",  priority:"high",   done:false, assignee:"naif"  },
        { id:3, title:"شراء ٣ مركبات توصيل جديدة",   due:"١٥ مار", priority:"high",   done:false, assignee:"mawdi" },
        { id:4, title:"إضافة خدمة التوصيل المبرد",    due:"٣٠ مار", priority:"medium", done:false, assignee:"mawdi" },
        { id:5, title:"مراجعة عقود العملاء",           due:"٢٨ مار", priority:"medium", done:true,  assignee:"mawdi" },
      ],
      team:[
        { id:1, name:"محمد الغامدي", role:"مدير العمليات",  tasks:9,  done:7, avatar:"مغ" },
        { id:2, name:"فهد العنزي",   role:"مشرف التوصيل",  tasks:12, done:9, avatar:"فع" },
        { id:3, name:"نوف السهلي",   role:"خدمة العملاء",  tasks:6,  done:5, avatar:"نس" },
      ],
      projects:[
        { id:1, name:"إطلاق فرنشايز جدة",    progress:45, status:"on-track" },
        { id:2, name:"منصة العملاء الرقمية", progress:70, status:"on-track"  },
        { id:3, name:"توسعة الأسطول x١٥",   progress:30, status:"at-risk"   },
      ],
    },
    {
      id:2, name:"كوزمينا", nameEn:"Kozmina", industry:"بيع الجملة - مستحضرات كورية", icon:"🌿", color:"#C45FA0", health:71,
      odooConnected:false, lastSync:null,
      sections:[
        { title:"العملاء والمالية", icon:"🤝", kpis:[
          { id:"kz1", label:"العملاء التجاريين", value:"38",      target:"100",    unit:"عميل",  trend:"+٤ هذا الشهر", trendUp:true, odooField:null },
          { id:"kz5", label:"السيولة المالية",   value:"2100000", target:"3000000",unit:"ر.س",   trend:"تحسن ١٨٪",     trendUp:true, odooField:null },
        ]},
        { title:"العلامات التجارية", icon:"✦", kpis:[
          { id:"kz3", label:"العلامات الحصرية",  value:"3",      target:"6",      unit:"علامة", trend:"COSRX · Anua · Numbuzin",     trendUp:true, odooField:null },
          { id:"kz4", label:"العلامات الرسمية",  value:"4",      target:"10",     unit:"علامة", trend:"Some By Mi · Isntree وأخرى",  trendUp:true, odooField:null },
          { id:"kz_s",label:"المبيعات الشهرية",  value:"380000", target:"600000", unit:"ر.س",   trend:"+٩٪ عن الشهر الماضي",         trendUp:true, odooField:null },
        ]},
        { title:"الفعاليات", icon:"📅", kpis:[
          { id:"kz6", label:"الفعاليات القادمة", value:"2", target:"6", unit:"فعالية", trend:"معرض الجمال الرياض - أبر", trendUp:true, odooField:null },
        ]},
      ],
      tasks:[
        { id:1, title:"طلبية استيراد COSRX",         due:"١٨ مار", priority:"high",   done:false, assignee:"naif"  },
        { id:2, title:"تجديد عقد الحصرية مع Anua",   due:"٣١ مار", priority:"high",   done:false, assignee:"mawdi" },
        { id:3, title:"التحضير لمعرض الجمال الرياض", due:"١ أبر",  priority:"high",   done:false, assignee:"mawdi" },
        { id:4, title:"تحديث كتالوج المنتجات",       due:"٢٥ مار", priority:"medium", done:true,  assignee:"mawdi" },
      ],
      team:[
        { id:1, name:"ريم الحربي",       role:"مديرة المشتريات",  tasks:8,  done:5, avatar:"رح" },
        { id:2, name:"سلمى الدوسري",     role:"مديرة المبيعات",   tasks:10, done:7, avatar:"سد" },
        { id:3, name:"عبدالله القحطاني", role:"المخازن والمخزون", tasks:7,  done:6, avatar:"عق" },
      ],
      projects:[
        { id:1, name:"إطلاق ٥٠ منتج جديد", progress:45, status:"on-track" },
        { id:2, name:"موقع الموزعين B2B",   progress:25, status:"at-risk"  },
        { id:3, name:"معرض الجمال الرياض",  progress:80, status:"on-track" },
      ],
    },
    {
      id:3, name:"تشومي", nameEn:"Tshomi", industry:"متجر إلكتروني - مستحضرات كورية", icon:"✨", color:"#7C5CBF", health:63,
      odooConnected:false, lastSync:null,
      sections:[
        { title:"المبيعات والإيرادات", icon:"💵", kpis:[
          { id:"ts1",    label:"المبيعات الشهرية",       value:"220000", target:"400000", unit:"ر.س",  trend:"+٨٪",          trendUp:true,  odooField:null },
          { id:"ts_ord", label:"إجمالي الطلبات",         value:"850",    target:"2000",   unit:"طلب",  trend:"+١٢٠",         trendUp:true,  odooField:null },
          { id:"ts_aov", label:"متوسط قيمة الطلب (AOV)", value:"259",    target:"350",    unit:"ر.س",  trend:"+١٥ ر.س",      trendUp:true,  odooField:null },
        ]},
        { title:"الإعلانات والتسويق", icon:"📣", kpis:[
          { id:"ts_roas",label:"العائد على الإنفاق ROAS", value:"3.8",   target:"5",     unit:"×",    trend:"الهدف ٥×",     trendUp:true,  odooField:null },
          { id:"ts_cac", label:"تكلفة اكتساب العميل CAC", value:"38",    target:"25",    unit:"ر.س",  trend:"يحتاج تخفيض",  trendUp:false, odooField:null },
        ]},
        { title:"سلوك العملاء", icon:"👤", kpis:[
          { id:"ts3",    label:"معدل تكرار الشراء",      value:"28",  target:"45",  unit:"٪",    trend:"هدف كل ٤٥ يوم",    trendUp:true,  odooField:null },
          { id:"ts_cart",label:"التخلي عن السلة",        value:"68",  target:"40",  unit:"٪",    trend:"يحتاج تحسين عاجل", trendUp:false, odooField:null },
          { id:"ts_new", label:"العملاء الجدد",           value:"310", target:"600", unit:"عميل", trend:"+٤٥ هذا الشهر",    trendUp:true,  odooField:null },
        ]},
      ],
      tasks:[
        { id:1, title:"حملة رمضان - سناب وإنستغرام",  due:"١٢ مار", priority:"high",   done:false, assignee:"mawdi" },
        { id:2, title:"تفعيل برنامج النقاط والولاء",   due:"٢٠ مار", priority:"high",   done:false, assignee:"mawdi" },
        { id:3, title:"تحسين صفحة الدفع",              due:"١٥ مار", priority:"high",   done:false, assignee:"naif"  },
        { id:4, title:"إطلاق برنامج المؤثرات",         due:"٣١ مار", priority:"medium", done:false, assignee:"mawdi" },
        { id:5, title:"مراجعة حملات Meta وSnapchat",   due:"١٤ مار", priority:"high",   done:true,  assignee:"mawdi" },
      ],
      team:[
        { id:1, name:"لمى الشمري",   role:"مديرة المتجر",    tasks:10, done:6, avatar:"لش" },
        { id:2, name:"دانة العصيمي", role:"التسويق الرقمي",  tasks:13, done:7, avatar:"دع" },
        { id:3, name:"هيا السبيعي",  role:"خدمة العملاء",    tasks:8,  done:5, avatar:"هس" },
      ],
      projects:[
        { id:1, name:"إعادة تصميم المتجر", progress:35, status:"delayed"  },
        { id:2, name:"حملة رمضان ٢٠٢٥",   progress:65, status:"on-track" },
        { id:3, name:"تطبيق الجوال",       progress:15, status:"at-risk"  },
        { id:4, name:"برنامج المؤثرات",    progress:50, status:"on-track" },
      ],
    },
  ]
};

/* ══════════════════════════════════════════
   ODOO
══════════════════════════════════════════ */
async function odooAuth(url, db, user, key) {
  const r = await fetch(`${url}/jsonrpc`,{ method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",method:"call",id:1,params:{service:"common",method:"authenticate",args:[db,user,key,{}]}})});
  const j = await r.json();
  if(!j.result) throw new Error("فشل تسجيل الدخول — تحقق من البيانات");
  return j.result;
}
async function odooRpc(url, db, uid, key, model, method, args, kw={}) {
  const r = await fetch(`${url}/jsonrpc`,{ method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",method:"call",id:1,params:{service:"object",method:"execute_kw",args:[db,uid,key,model,method,args,kw]}})});
  const j = await r.json();
  if(j.error) throw new Error(j.error.data?.message||j.error.message);
  return j.result;
}
async function fetchOdooKPIs(cfg) {
  const url = cfg.url.replace(/\/$/,"");
  const uid = await odooAuth(url, cfg.db, cfg.username, cfg.apiKey);
  const now = new Date();
  const ms  = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split("T")[0];
  const me  = new Date(now.getFullYear(),now.getMonth()+1,0).toISOString().split("T")[0];
  const inv = await odooRpc(url,cfg.db,uid,cfg.apiKey,"account.move","read_group",
    [[["move_type","=","out_invoice"],["state","=","posted"],["invoice_date",">=",ms],["invoice_date","<=",me]]],
    {fields:["amount_untaxed"],groupby:[]});
  const monthly_revenue = inv[0]?.amount_untaxed_sum||0;
  const customers = await odooRpc(url,cfg.db,uid,cfg.apiKey,"res.partner","search_count",[[["customer_rank",">",0],["is_company","=",true],["active","=",true]]]);
  const monthly_pickings = await odooRpc(url,cfg.db,uid,cfg.apiKey,"stock.picking","search_count",[[["state","=","done"],["date_done",">=",ms],["date_done","<=",me],["picking_type_code","=","outgoing"]]]);
  let fleet_count=0; try{fleet_count=await odooRpc(url,cfg.db,uid,cfg.apiKey,"fleet.vehicle","search_count",[[["active","=",true]]]);}catch{}
  let gov_partners=0; try{const t=await odooRpc(url,cfg.db,uid,cfg.apiKey,"res.partner.category","search",[[["name","ilike","حكوم"]]]);if(t.length)gov_partners=await odooRpc(url,cfg.db,uid,cfg.apiKey,"res.partner","search_count",[[["category_id","in",t],["active","=",true]]]);}catch{}
  return {monthly_revenue,customers,monthly_pickings,fleet_count,gov_partners};
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const SC  = {"on-track":"#4CC97A","at-risk":"#E8C23A","delayed":"#E8503A"};
const SL  = {"on-track":"في الموعد","at-risk":"يحتاج متابعة","delayed":"متأخر"};
const PC  = {high:"#E8503A",medium:"#E8C23A",low:"#4C9BE8"};
const pct = (v,t)=>{ const n=parseFloat(String(v).replace(/[^\d.]/g,"")),m=parseFloat(String(t).replace(/[^\d.]/g,""));if(!m)return 0;return Math.min(100,Math.round((n/m)*100));};
const bc  = p=>p>=80?"#4CC97A":p>=55?"#E8C23A":"#E8503A";
const fmt = (v,u)=>{ const n=parseFloat(String(v).replace(/[^\d.]/g,""));if(isNaN(n))return v;if(u==="ر.س"&&n>=1000000)return`${(n/1000000).toFixed(1)} م`;if(u==="ر.س"&&n>=1000)return`${Math.round(n/1000)} ك`;return Number.isInteger(n)?n.toLocaleString("ar-EG"):n;};
const ini = n=>{ const p=n.trim().split(" ");return p.length>=2?p[0][0]+p[1][0]:n.slice(0,2);};
const ago = iso=>{ if(!iso)return"لم تتزامن بعد";const d=Math.floor((Date.now()-new Date(iso))/60000);if(d<1)return"الآن";if(d<60)return`منذ ${d} دقيقة`;return`منذ ${Math.floor(d/60)} ساعة`;};

/* ══════════════════════════════════════════
   ATOMS
══════════════════════════════════════════ */
function Ring({value,color,size=58}){
  const r=size/2-7,c=2*Math.PI*r;
  return(<svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1c1c35" strokeWidth="6"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${(value/100)*c} ${c}`} strokeLinecap="round" style={{transition:"stroke-dasharray .7s",filter:`drop-shadow(0 0 5px ${color}88)`}}/></svg>);
}

function Mod({title,onClose,children,w=430}){
  return(<div style={{position:"fixed",inset:0,background:"#000c",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}><div style={{background:"#0e0e22",border:"1px solid #2a2a45",borderRadius:16,padding:26,width:w,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><span style={{fontWeight:800,fontSize:15,color:"#fff"}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",color:"#555",fontSize:22,cursor:"pointer",lineHeight:1,padding:0}}>✕</button></div>{children}</div></div>);
}

function Fld({label,value,onChange,type="text",options,hint}){
  const s={background:"#12122a",border:"1px solid #2a2a45",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box",textAlign:"right",display:"block"};
  return(<div style={{marginBottom:14}}><div style={{fontSize:11,color:"#666",marginBottom:5,fontWeight:600}}>{label}</div>{options?<select value={value} onChange={e=>onChange(e.target.value)} style={s}>{options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} style={s} autoComplete="off"/>}{hint&&<div style={{fontSize:10,color:"#444",marginTop:4}}>{hint}</div>}</div>);
}

const SaveBtn=({onClick,color,label="حفظ",disabled})=>(<button onClick={onClick} disabled={disabled} style={{flex:1,background:disabled?"#333":color,color:"#fff",border:"none",borderRadius:9,padding:"10px 0",fontWeight:700,fontSize:13,cursor:disabled?"default":"pointer",fontFamily:"inherit",opacity:disabled?.5:1,boxShadow:disabled?"none":`0 3px 14px ${color}55`}}>{label}</button>);
const DelBtn=({onClick})=>(<button onClick={onClick} style={{background:"#E8503A18",color:"#E8503A",border:"1px solid #E8503A44",borderRadius:9,padding:"10px 16px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>حذف</button>);

/* ══════════════════════════════════════════
   ODOO MODAL
══════════════════════════════════════════ */
function OdooMod({color,onClose,onSave,existing}){
  const [f,setF]=useState(existing||{url:"",db:"",username:"",apiKey:""});
  const [testing,setTesting]=useState(false);
  const [res,setRes]=useState(null);
  const test=async()=>{
    setTesting(true);setRes(null);
    try{const uid=await odooAuth(f.url.replace(/\/$/,""),f.db,f.username,f.apiKey);setRes({ok:true,msg:`✓ اتصال ناجح! (UID: ${uid})`});}
    catch(e){setRes({ok:false,msg:`✕ فشل: ${e.message}`});}
    setTesting(false);
  };
  const ok=f.url&&f.db&&f.username&&f.apiKey;
  return(
    <Mod title="🔌 إعدادات ربط أودو — بريد إكس" onClose={onClose} w={460}>
      <div style={{background:"#0a0a18",border:"1px solid #E8762A33",borderRadius:10,padding:"12px 14px",marginBottom:18,fontSize:11,color:"#888",lineHeight:1.8}}>
        <div style={{color:"#E8C23A",fontWeight:700,marginBottom:4}}>📋 خطوات الحصول على API Key:</div>
        <div>١. ادخل أودو ← اسمك ← الإعدادات ← تبويب <strong style={{color:"#fff"}}>الأمان</strong></div>
        <div>٢. اضغط <strong style={{color:"#fff"}}>"New API Key"</strong> وأعطه اسم مثل <code style={{color:"#E8762A"}}>naif-dashboard</code></div>
        <div>٣. انسخ الـ Key — <strong style={{color:"#E8503A"}}>لن يظهر مجدداً</strong></div>
      </div>
      <Fld label="رابط أودو" value={f.url} onChange={v=>setF(x=>({...x,url:v}))} hint="مثال: https://bridx.odoo.com"/>
      <Fld label="اسم قاعدة البيانات" value={f.db} onChange={v=>setF(x=>({...x,db:v}))} hint="يظهر في لوحة Odoo.sh"/>
      <Fld label="البريد الإلكتروني" value={f.username} onChange={v=>setF(x=>({...x,username:v}))}/>
      <Fld label="API Key" value={f.apiKey} onChange={v=>setF(x=>({...x,apiKey:v}))} type="password"/>
      {res&&<div style={{background:res.ok?"#4CC97A18":"#E8503A18",border:`1px solid ${res.ok?"#4CC97A44":"#E8503A44"}`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:res.ok?"#4CC97A":"#E8503A",fontWeight:600}}>{res.msg}</div>}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <SaveBtn onClick={test} color="#4C9BE8" label={testing?"جاري الاختبار...":"🧪 اختبار الاتصال"} disabled={!ok||testing}/>
        <SaveBtn onClick={()=>onSave(f)} color={color} label="حفظ وربط ✓" disabled={!res?.ok}/>
      </div>
    </Mod>
  );
}

/* ══════════════════════════════════════════
   CRUD MODALS
══════════════════════════════════════════ */
function KpiMod({kpi,sec,color,onSave,onClose}){
  const [f,setF]=useState({...kpi});
  return(<Mod title={`تعديل: ${f.label}`} onClose={onClose}><Fld label="القيمة الحالية" value={f.value} onChange={v=>setF(x=>({...x,value:v}))}/><Fld label="الهدف" value={f.target} onChange={v=>setF(x=>({...x,target:v}))}/><Fld label="الوحدة" value={f.unit} onChange={v=>setF(x=>({...x,unit:v}))}/><Fld label="ملاحظة / اتجاه" value={f.trend} onChange={v=>setF(x=>({...x,trend:v}))}/><Fld label="الاتجاه" value={f.trendUp?"up":"down"} onChange={v=>setF(x=>({...x,trendUp:v==="up"}))} options={[{v:"up",l:"↑ إيجابي"},{v:"down",l:"↓ سلبي"}]}/><SaveBtn onClick={()=>onSave(sec,f)} color={color}/></Mod>);
}

function TaskMod({task,color,uid,onSave,onDelete,onClose}){
  const isNew=!task?.id;
  const [f,setF]=useState(task||{title:"",due:"",priority:"medium",assignee:uid});
  return(<Mod title={isNew?"إضافة مهمة":"تعديل المهمة"} onClose={onClose}><Fld label="عنوان المهمة" value={f.title} onChange={v=>setF(x=>({...x,title:v}))}/><Fld label="الموعد النهائي" value={f.due} onChange={v=>setF(x=>({...x,due:v}))}/><Fld label="الأولوية" value={f.priority} onChange={v=>setF(x=>({...x,priority:v}))} options={[{v:"high",l:"⚠ عاجل"},{v:"medium",l:"◉ متوسط"},{v:"low",l:"◎ عادي"}]}/><Fld label="المكلّف" value={f.assignee||uid} onChange={v=>setF(x=>({...x,assignee:v}))} options={Object.values(USERS).map(u=>({v:u.id,l:`${u.name} — ${u.role}`}))}/><div style={{display:"flex",gap:8,marginTop:4}}><SaveBtn onClick={()=>onSave(f)} color={color}/>{!isNew&&<DelBtn onClick={()=>onDelete(f.id)}/>}</div></Mod>);
}

function MemberMod({member,color,onSave,onDelete,onClose}){
  const isNew=!member?.id;
  const [f,setF]=useState(member||{name:"",role:"",tasks:0,done:0});
  return(<Mod title={isNew?"إضافة عضو":"تعديل عضو الفريق"} onClose={onClose}><Fld label="الاسم" value={f.name} onChange={v=>setF(x=>({...x,name:v}))}/><Fld label="المسمى الوظيفي" value={f.role} onChange={v=>setF(x=>({...x,role:v}))}/><Fld label="عدد المهام" value={String(f.tasks)} onChange={v=>setF(x=>({...x,tasks:parseInt(v)||0}))} type="number"/><Fld label="المهام المنجزة" value={String(f.done)} onChange={v=>setF(x=>({...x,done:parseInt(v)||0}))} type="number"/><div style={{display:"flex",gap:8,marginTop:4}}><SaveBtn onClick={()=>onSave(f)} color={color}/>{!isNew&&<DelBtn onClick={()=>onDelete(f.id)}/>}</div></Mod>);
}

function ProjectMod({project,color,onSave,onDelete,onClose}){
  const isNew=!project?.id;
  const [f,setF]=useState(project||{name:"",progress:0,status:"on-track"});
  return(<Mod title={isNew?"إضافة مشروع":"تعديل المشروع"} onClose={onClose}><Fld label="اسم المشروع" value={f.name} onChange={v=>setF(x=>({...x,name:v}))}/><Fld label="نسبة الإنجاز (0-100)" value={String(f.progress)} onChange={v=>setF(x=>({...x,progress:Math.min(100,parseInt(v)||0)}))} type="number"/><Fld label="الحالة" value={f.status} onChange={v=>setF(x=>({...x,status:v}))} options={[{v:"on-track",l:"✓ في الموعد"},{v:"at-risk",l:"⚠ يحتاج متابعة"},{v:"delayed",l:"✕ متأخر"}]}/><div style={{display:"flex",gap:8,marginTop:4}}><SaveBtn onClick={()=>onSave(f)} color={color}/>{!isNew&&<DelBtn onClick={()=>onDelete(f.id)}/>}</div></Mod>);
}

/* ══════════════════════════════════════════
   LOGIN
══════════════════════════════════════════ */
function Login({onLogin}){
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");

  const tap=k=>{
    if(k==="del"){setPin(p=>p.slice(0,-1));return;}
    if(pin.length>=4)return;
    const next=pin+k;
    setPin(next);
    if(next.length===4){
      if(next===sel?.pin){setTimeout(()=>onLogin(sel),200);}
      else{setTimeout(()=>{setErr("الرقم السري غير صحيح ✕");setPin("");},300);}
    }
  };

  return(
    <div dir="rtl" style={{fontFamily:"'Segoe UI',Tahoma,sans-serif",background:"#080815",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#e4e4f0"}}>
      <div style={{marginBottom:40,textAlign:"center"}}>
        <div style={{width:66,height:66,borderRadius:18,background:"linear-gradient(135deg,#E8762A,#C45FA0,#7C5CBF)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:30,margin:"0 auto 14px",boxShadow:"0 8px 32px #C45FA055"}}>ن</div>
        <div style={{fontWeight:900,fontSize:22}}>مركز نايف التنفيذي</div>
        <div style={{fontSize:10,color:"#444",letterSpacing:2,marginTop:4}}>CEO COMMAND CENTER</div>
      </div>

      {!sel?(
        <div style={{width:340}}>
          <div style={{fontSize:12,color:"#555",textAlign:"center",marginBottom:18}}>اختر المستخدم</div>
          {Object.values(USERS).map(u=>(
            <button key={u.id} onClick={()=>{setSel(u);setPin("");setErr("");}}
              style={{width:"100%",background:"#0d0d1f",border:`1px solid ${u.color}44`,borderRadius:14,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,marginBottom:10,fontFamily:"inherit",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=u.color+"18";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#0d0d1f";}}>
              <div style={{width:48,height:48,borderRadius:13,background:`${u.color}25`,border:`2px solid ${u.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:u.color,flexShrink:0}}>{u.avatar}</div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>{u.name}</div>
                <div style={{fontSize:11,color:"#666",marginTop:3}}>{u.role}</div>
              </div>
              <div style={{marginRight:"auto",color:"#333",fontSize:18}}>←</div>
            </button>
          ))}
        </div>
      ):(
        <div style={{width:300,textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:22}}>
            <div style={{width:44,height:44,borderRadius:11,background:`${sel.color}25`,border:`1px solid ${sel.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:sel.color}}>{sel.avatar}</div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:700,fontSize:15}}>{sel.name}</div>
              <button onClick={()=>{setSel(null);setPin("");setErr("");}} style={{background:"none",border:"none",color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:0}}>تغيير المستخدم</button>
            </div>
          </div>
          <div style={{fontSize:12,color:"#555",marginBottom:14}}>أدخل الرقم السري</div>
          <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:20}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:pin.length>i?sel.color:"#2a2a45",transition:"all .2s"}}/>)}
          </div>
          {err&&<div style={{color:"#E8503A",fontSize:12,marginBottom:12,fontWeight:600}}>{err}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>(
              <button key={i} onClick={()=>k&&tap(k)} disabled={!k}
                style={{background:k==="del"?"#1a1a2e":k?"#12122a":"transparent",border:k?"1px solid #2a2a45":"none",borderRadius:12,padding:"16px 0",fontSize:k==="del"?16:20,fontWeight:600,color:k==="del"?"#E8503A":"#fff",cursor:k?"pointer":"default",fontFamily:"inherit"}}
                onMouseEnter={e=>{if(k)e.currentTarget.style.background=sel.color+"22";}}
                onMouseLeave={e=>{if(k)e.currentTarget.style.background=k==="del"?"#1a1a2e":"#12122a";}}>
                {k==="del"?"⌫":k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
function Dashboard({user,onLogout}){
  const [data,setData]=useState(DEF);
  const [cfg,setCfg]=useState(null);
  const [cid,setCid]=useState(1);
  const [tab,setTab]=useState("tasks");
  const [filter,setFilter]=useState("all");
  const [saved,setSaved]=useState(false);
  const [syncing,setSyncing]=useState(false);
  const [syncMsg,setSyncMsg]=useState(null);
  const [loaded,setLoaded]=useState(false);

  const [odooMod,setOdooMod]=useState(false);
  const [kpiMod,setKpiMod]=useState(null);
  const [taskMod,setTaskMod]=useState(null);
  const [memMod,setMemMod]=useState(null);
  const [projMod,setProjMod]=useState(null);

  // Load on mount
  useEffect(()=>{
    try{ const s=localStorage.getItem(STORAGE_KEY); if(s) setData(JSON.parse(s)); }catch{}
    try{ const s=localStorage.getItem(ODOO_KEY); if(s) setCfg(JSON.parse(s)); }catch{}
    setLoaded(true);
  },[]);

  // Save data
  useEffect(()=>{
    if(!loaded) return;
    try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); setSaved(true); setTimeout(()=>setSaved(false),1800); }catch{}
  },[data,loaded]);

  // Save odoo cfg
  useEffect(()=>{
    if(!loaded) return;
    try{ if(cfg) localStorage.setItem(ODOO_KEY,JSON.stringify(cfg)); else localStorage.removeItem(ODOO_KEY); }catch{}
  },[cfg,loaded]);

  const co=data.companies.find(c=>c.id===cid);
  const isAdmin=user.id==="naif";
  const ac=user.access;

  /* ODOO SYNC */
  const sync=useCallback(async(c,silent=false)=>{
    if(!c)return;
    if(!silent)setSyncing(true);
    try{
      const kpis=await fetchOdooKPIs(c);
      setData(prev=>({...prev,companies:prev.companies.map(co=>{
        if(co.id!==1)return co;
        return{...co,odooConnected:true,lastSync:new Date().toISOString(),
          sections:co.sections.map(s=>({...s,kpis:s.kpis.map(k=>{
            if(!k.odooField||kpis[k.odooField]==null)return k;
            return{...k,value:String(Math.round(kpis[k.odooField]))};
          })}))};
      })}));
      setSyncMsg({ok:true,msg:"✓ تمت المزامنة مع أودو"});
    }catch(e){setSyncMsg({ok:false,msg:`✕ فشلت المزامنة: ${e.message}`});}
    setSyncing(false);
    setTimeout(()=>setSyncMsg(null),4000);
  },[]);

  useEffect(()=>{if(!cfg)return;sync(cfg,true);const iv=setInterval(()=>sync(cfg,true),REFRESH_MS);return()=>clearInterval(iv);},[cfg,sync]);

  const saveCfg=f=>{setCfg(f);setOdooMod(false);sync(f);};

  /* MUTATORS */
  const upd=(id,fn)=>setData(p=>({...p,companies:p.companies.map(c=>c.id===id?fn(c):c)}));
  const saveKpi=(sec,kpi)=>{upd(cid,c=>({...c,sections:c.sections.map(s=>s.title===sec?{...s,kpis:s.kpis.map(k=>k.id===kpi.id?kpi:k)}:s)}));setKpiMod(null);};
  const saveTask=t=>{upd(cid,c=>({...c,tasks:t.id&&c.tasks.find(x=>x.id===t.id)?c.tasks.map(x=>x.id===t.id?t:x):[...c.tasks,{...t,id:Date.now(),done:false}]}));setTaskMod(null);};
  const delTask=id=>{upd(cid,c=>({...c,tasks:c.tasks.filter(t=>t.id!==id)}));setTaskMod(null);};
  const togTask=id=>upd(cid,c=>({...c,tasks:c.tasks.map(t=>t.id===id?{...t,done:!t.done}:t)}));
  const saveMem=m=>{upd(cid,c=>({...c,team:m.id&&c.team.find(x=>x.id===m.id)?c.team.map(x=>x.id===m.id?{...m,avatar:ini(m.name)}:x):[...c.team,{...m,id:Date.now(),avatar:ini(m.name)}]}));setMemMod(null);};
  const delMem=id=>{upd(cid,c=>({...c,team:c.team.filter(x=>x.id!==id)}));setMemMod(null);};
  const saveProj=p=>{upd(cid,c=>({...c,projects:p.id&&c.projects.find(x=>x.id===p.id)?c.projects.map(x=>x.id===p.id?p:x):[...c.projects,{...p,id:Date.now()}]}));setProjMod(null);};
  const delProj=id=>{upd(cid,c=>({...c,projects:c.projects.filter(x=>x.id!==id)}));setProjMod(null);};

  /* STATS */
  const allT=data.companies.flatMap(c=>c.tasks);
  const myT=allT.filter(t=>t.assignee===user.id);
  const urgAll=allT.filter(t=>t.priority==="high"&&!t.done);
  const urgMy=myT.filter(t=>!t.done&&t.priority==="high");
  const avgH=Math.round(data.companies.reduce((s,c)=>s+c.health,0)/data.companies.length);
  const bx=data.companies.find(c=>c.id===1);

  const TABS=[
    {key:"kpis",label:"مؤشرات الأداء"},
    {key:"tasks",label:"المهام"},
    {key:"team",label:"الفريق"},
    {key:"projects",label:"المشاريع"},
  ];
  const btnS=col=>({background:col,color:"#fff",border:"none",borderRadius:9,padding:"8px 18px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 3px 12px ${col}55`});
  const edS={background:"none",border:"1px solid #2a2a45",borderRadius:6,padding:"4px 12px",color:"#666",fontSize:11,cursor:"pointer",fontFamily:"inherit",flexShrink:0};
  const coT=filter==="mine"?co.tasks.filter(t=>t.assignee===user.id):co.tasks;

  return(
    <div dir="rtl" style={{fontFamily:"'Segoe UI',Tahoma,sans-serif",background:"#080815",minHeight:"100vh",color:"#e4e4f0",display:"flex",flexDirection:"column"}}>

      {/* MODALS */}
      {odooMod&&<OdooMod color="#E8762A" onClose={()=>setOdooMod(false)} onSave={saveCfg} existing={cfg}/>}
      {kpiMod&&<KpiMod kpi={kpiMod.kpi} sec={kpiMod.sec} color={co.color} onSave={saveKpi} onClose={()=>setKpiMod(null)}/>}
      {taskMod!==null&&<TaskMod task={taskMod} color={co.color} uid={user.id} onSave={saveTask} onDelete={delTask} onClose={()=>setTaskMod(null)}/>}
      {memMod!==null&&<MemberMod member={memMod} color={co.color} onSave={saveMem} onDelete={delMem} onClose={()=>setMemMod(null)}/>}
      {projMod!==null&&<ProjectMod project={projMod} color={co.color} onSave={saveProj} onDelete={delProj} onClose={()=>setProjMod(null)}/>}

      {/* HEADER */}
      <div style={{background:"#0b0b1e",borderBottom:"1px solid #1a1a32",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:90}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#E8762A,#C45FA0,#7C5CBF)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16}}>ن</div>
          <div><div style={{fontWeight:800,fontSize:14}}>مركز نايف التنفيذي</div><div style={{fontSize:9,color:"#333",letterSpacing:2}}>CEO COMMAND CENTER</div></div>
          {saved&&<span style={{fontSize:10,color:"#4CC97A",background:"#4CC97A15",border:"1px solid #4CC97A44",borderRadius:20,padding:"3px 10px",marginRight:8}}>✓ تم الحفظ</span>}
          {syncMsg&&<span style={{fontSize:10,color:syncMsg.ok?"#4CC97A":"#E8503A",background:(syncMsg.ok?"#4CC97A":"#E8503A")+"15",border:`1px solid ${syncMsg.ok?"#4CC97A":"#E8503A"}44`,borderRadius:20,padding:"3px 10px",marginRight:8}}>{syncMsg.msg}</span>}
        </div>
        <div style={{display:"flex",gap:8}}>
          {isAdmin?[{l:"متوسط الأداء",v:`${avgH}٪`,c:avgH>=75?"#4CC97A":"#E8C23A"},{l:"مهام عاجلة",v:urgAll.length,c:"#E8503A"}].map(p=>(
            <div key={p.l} style={{background:p.c+"12",border:`1px solid ${p.c}30`,borderRadius:8,padding:"5px 14px",display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:14,fontWeight:900,color:p.c}}>{p.v}</span><span style={{fontSize:10,color:"#555"}}>{p.l}</span></div>
          )):[{l:"مهامي المفتوحة",v:myT.filter(t=>!t.done).length,c:"#4C9BE8"},{l:"مهامي العاجلة",v:urgMy.length,c:"#E8503A"},{l:"أنجزت",v:myT.filter(t=>t.done).length,c:"#4CC97A"}].map(p=>(
            <div key={p.l} style={{background:p.c+"12",border:`1px solid ${p.c}30`,borderRadius:8,padding:"5px 14px",display:"flex",gap:7,alignItems:"center"}}><span style={{fontSize:14,fontWeight:900,color:p.c}}>{p.v}</span><span style={{fontSize:10,color:"#555"}}>{p.l}</span></div>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"left"}}><div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{user.name}</div><div style={{fontSize:10,color:"#555"}}>{user.role}</div></div>
          <div style={{width:36,height:36,borderRadius:9,background:`${user.color}25`,border:`2px solid ${user.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:user.color}}>{user.avatar}</div>
          <button onClick={onLogout} style={{background:"#1a1a2e",border:"1px solid #2a2a45",borderRadius:7,padding:"6px 12px",color:"#666",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>خروج</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1}}>
        {/* SIDEBAR */}
        <div style={{width:224,background:"#0a0a18",borderLeft:"1px solid #1a1a32",flexShrink:0,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"16px 16px 8px",fontSize:9,color:"#333",letterSpacing:2,fontWeight:700}}>الشركات</div>
          {data.companies.map(c=>{
            const act=c.id===cid;
            const urg=c.tasks.filter(t=>t.priority==="high"&&!t.done&&(isAdmin||t.assignee===user.id)).length;
            return(
              <div key={c.id} onClick={()=>{setCid(c.id);setTab("tasks");}}
                style={{padding:"11px 16px",cursor:"pointer",borderRight:act?`3px solid ${c.color}`:"3px solid transparent",background:act?`${c.color}12`:"transparent",transition:"all .2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:8,background:act?`${c.color}22`:"#12122a",border:`1px solid ${act?c.color+"55":"#1e1e35"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,position:"relative"}}>
                    {c.icon}
                    {c.odooConnected&&<div style={{position:"absolute",bottom:-2,left:-2,width:8,height:8,borderRadius:"50%",background:"#4CC97A",border:"1px solid #080815"}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:act?800:500,color:act?"#fff":"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div><div style={{fontSize:9,color:"#444",marginTop:1}}>{c.odooConnected?"🔗 مربوط بأودو":c.industry}</div></div>
                  {urg>0&&<div style={{width:18,height:18,borderRadius:"50%",background:"#E8503A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#fff",flexShrink:0}}>{urg}</div>}
                </div>
              </div>
            );
          })}

          {/* ODOO PANEL — admin only */}
          {isAdmin&&(
            <div style={{margin:"14px 12px 0",padding:14,background:"#0e0e20",borderRadius:12,border:`1px solid ${bx?.odooConnected?"#E8762A44":"#1a1a32"}`}}>
              <div style={{fontSize:9,color:bx?.odooConnected?"#E8762A":"#555",letterSpacing:1.5,fontWeight:700,marginBottom:10}}>{bx?.odooConnected?"🔗 أودو — بريد إكس":"⚙ ربط أودو"}</div>
              {bx?.odooConnected?(
                <>
                  <div style={{fontSize:10,color:"#555",marginBottom:8}}>آخر مزامنة: {ago(bx.lastSync)}</div>
                  <div style={{fontSize:10,color:"#444",marginBottom:8}}>تحديث تلقائي كل ساعة</div>
                  <button onClick={()=>sync(cfg)} disabled={syncing} style={{width:"100%",background:"#E8762A22",color:"#E8762A",border:"1px solid #E8762A44",borderRadius:8,padding:"7px 0",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",marginBottom:6}}>
                    {syncing?"⟳ جاري المزامنة...":"⟳ مزامنة الآن"}
                  </button>
                  <button onClick={()=>setOdooMod(true)} style={{width:"100%",background:"none",color:"#555",border:"1px solid #2a2a45",borderRadius:8,padding:"7px 0",fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>تعديل الإعدادات</button>
                </>
              ):(
                <>
                  <div style={{fontSize:11,color:"#666",marginBottom:10,lineHeight:1.6}}>اربط بريد إكس بأودو لسحب البيانات تلقائياً كل ساعة</div>
                  <button onClick={()=>setOdooMod(true)} style={{width:"100%",background:"#E8762A",color:"#fff",border:"none",borderRadius:8,padding:"8px 0",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 3px 12px #E8762A44"}}>🔌 ربط الآن</button>
                </>
              )}
            </div>
          )}

          {/* URGENT */}
          {isAdmin&&urgAll.length>0&&(
            <div style={{margin:"12px 12px 0",padding:14,background:"#0e0e20",borderRadius:12,border:"1px solid #E8503A22"}}>
              <div style={{fontSize:9,color:"#E8503A",letterSpacing:1.5,fontWeight:700,marginBottom:10}}>⚠ عاجل — كل الشركات</div>
              {urgAll.slice(0,4).map(t=>{const cp=data.companies.find(c=>c.tasks.some(x=>x.id===t.id));const au=USERS[t.assignee];return(<div key={t.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}><div style={{width:6,height:6,borderRadius:"50%",background:cp?.color,marginTop:4,flexShrink:0}}/><div><div style={{fontSize:11,color:"#bbb",lineHeight:1.4}}>{t.title}</div><div style={{fontSize:9,color:"#444",marginTop:2}}>{cp?.name} · {au?.name||"—"}</div></div></div>);})}
            </div>
          )}
          {!isAdmin&&urgMy.length>0&&(
            <div style={{margin:"12px 12px 0",padding:14,background:"#0e0e20",borderRadius:12,border:"1px solid #C45FA022"}}>
              <div style={{fontSize:9,color:"#C45FA0",letterSpacing:1.5,fontWeight:700,marginBottom:10}}>مهامي العاجلة</div>
              {urgMy.slice(0,4).map(t=>{const cp=data.companies.find(c=>c.tasks.some(x=>x.id===t.id));return(<div key={t.id} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}><div style={{width:6,height:6,borderRadius:"50%",background:cp?.color,marginTop:4,flexShrink:0}}/><div><div style={{fontSize:11,color:"#bbb",lineHeight:1.4}}>{t.title}</div><div style={{fontSize:9,color:"#444",marginTop:2}}>{cp?.name} · {t.due}</div></div></div>);})}
            </div>
          )}
        </div>

        {/* MAIN */}
        <div style={{flex:1,overflow:"auto",padding:"20px 24px"}}>

          {/* Company header */}
          <div style={{background:`linear-gradient(135deg,${co.color}12,transparent 60%)`,border:`1px solid ${co.color}25`,borderRadius:16,padding:"16px 22px",display:"flex",alignItems:"center",gap:16,marginBottom:18}}>
            <div style={{width:50,height:50,borderRadius:13,background:`${co.color}20`,border:`2px solid ${co.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{co.icon}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <h1 style={{margin:0,fontSize:20,fontWeight:900}}>{co.name}</h1>
                {co.odooConnected&&<span style={{background:"#E8762A18",color:"#E8762A",border:"1px solid #E8762A44",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>🔗 أودو · {ago(co.lastSync)}</span>}
                <span style={{background:co.health>=80?"#4CC97A18":co.health>=65?"#E8C23A18":"#E8503A18",color:co.health>=80?"#4CC97A":co.health>=65?"#E8C23A":"#E8503A",border:`1px solid ${co.health>=80?"#4CC97A55":co.health>=65?"#E8C23A55":"#E8503A55"}`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>
                  {co.health>=80?"✦ ممتاز":co.health>=65?"⚠ يحتاج متابعة":"✕ حرج"}
                </span>
              </div>
              <div style={{fontSize:11,color:"#444",marginTop:4}}>{co.industry} · {co.tasks.filter(t=>!t.done).length} مهمة مفتوحة{!isAdmin&&` · ${co.tasks.filter(t=>t.assignee===user.id&&!t.done).length} مكلّفة لي`}</div>
            </div>
            {isAdmin&&<div style={{position:"relative",flexShrink:0}}><Ring value={co.health} color={co.color} size={58}/><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:co.color}}>{co.health}٪</div></div>}
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:3,marginBottom:18,background:"#0d0d1f",padding:4,borderRadius:11,width:"fit-content",border:"1px solid #1a1a32"}}>
            {TABS.map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"inherit",background:tab===t.key?co.color:"transparent",color:tab===t.key?"#fff":"#555",transition:"all .2s",boxShadow:tab===t.key?`0 2px 10px ${co.color}55`:"none"}}>{t.label}</button>)}
          </div>

          {/* KPIs */}
          {tab==="kpis"&&(
            <div style={{display:"grid",gap:22}}>
              {co.sections.map(sec=>(
                <div key={sec.title}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{fontSize:15}}>{sec.icon}</span><span style={{fontSize:13,fontWeight:800,color:"#ccc"}}>{sec.title}</span><div style={{flex:1,height:1,background:"#1a1a32",marginRight:8}}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                    {sec.kpis.map(k=>{
                      const p=pct(k.value,k.target);
                      const fromOdoo=co.odooConnected&&k.odooField;
                      const canEdit=ac.editKpi;
                      return(
                        <div key={k.id} onClick={()=>canEdit&&setKpiMod({sec:sec.title,kpi:{...k}})}
                          style={{background:"#0d0d1f",border:`1px solid ${fromOdoo?"#E8762A33":"#1a1a32"}`,borderRadius:14,padding:"16px 18px",cursor:canEdit?"pointer":"default",position:"relative",transition:"border-color .2s"}}
                          onMouseEnter={e=>{if(canEdit)e.currentTarget.style.borderColor=co.color+"77";}}
                          onMouseLeave={e=>{if(canEdit)e.currentTarget.style.borderColor=fromOdoo?"#E8762A33":"#1a1a32";}}>
                          {fromOdoo&&<div style={{position:"absolute",top:8,left:10,fontSize:9,color:"#E8762A",background:"#E8762A18",borderRadius:4,padding:"1px 6px",fontWeight:700}}>أودو</div>}
                          {!fromOdoo&&canEdit&&<div style={{position:"absolute",top:10,left:12,fontSize:10,color:"#2a2a45"}}>✎</div>}
                          {!canEdit&&<div style={{position:"absolute",top:8,left:10,fontSize:9,color:"#333",background:"#1a1a2e",borderRadius:4,padding:"1px 6px"}}>عرض فقط</div>}
                          <div style={{fontSize:10,color:"#555",fontWeight:700,marginBottom:8,marginTop:10}}>{k.label}</div>
                          <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1}}>{fmt(k.value,k.unit)} <span style={{fontSize:11,fontWeight:400,color:"#555"}}>{k.unit}</span></div>
                          <div style={{fontSize:10,color:"#444",marginTop:6}}>الهدف: {fmt(k.target,k.unit)} {k.unit}</div>
                          <div style={{background:"#1a1a2e",borderRadius:4,height:5,marginTop:8}}><div style={{width:`${p}%`,height:"100%",background:bc(p),borderRadius:4,transition:"width .7s"}}/></div>
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:10,color:k.trendUp?"#4CC97A":"#E8503A"}}>{k.trendUp?"↑":"↓"} {k.trend}</span><span style={{fontSize:10,color:"#444"}}>{p}٪</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tasks */}
          {tab==="tasks"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:8,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:4,background:"#0d0d1f",padding:3,borderRadius:8,border:"1px solid #1a1a32"}}>
                  {[{v:"all",l:"كل المهام"},{v:"mine",l:`مهامي (${co.tasks.filter(t=>t.assignee===user.id).length})`}].map(f=>(
                    <button key={f.v} onClick={()=>setFilter(f.v)} style={{padding:"5px 14px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:600,fontSize:11,fontFamily:"inherit",background:filter===f.v?co.color:"transparent",color:filter===f.v?"#fff":"#555",transition:"all .2s"}}>{f.l}</button>
                  ))}
                </div>
                {ac.editTasks&&<button onClick={()=>setTaskMod({})} style={btnS(co.color)}>+ إضافة مهمة</button>}
              </div>
              {["high","medium","low"].map(pr=>{
                const grp=coT.filter(t=>t.priority===pr);
                if(!grp.length)return null;
                return(
                  <div key={pr} style={{marginBottom:16}}>
                    <div style={{fontSize:9,color:PC[pr],fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{pr==="high"?"⚠ عاجل":pr==="medium"?"◉ متوسط":"◎ عادي"}</div>
                    {grp.map(t=>{
                      const au=USERS[t.assignee];
                      const mine=t.assignee===user.id;
                      return(
                        <div key={t.id} style={{background:"#0d0d1f",border:`1px solid ${mine?co.color+"44":"#1a1a32"}`,borderRadius:10,padding:"11px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:6,opacity:t.done?.5:1}}>
                          <div onClick={()=>togTask(t.id)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${t.done?co.color:"#2a2a45"}`,background:t.done?co.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all .2s"}}>{t.done&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}</div>
                          <div style={{flex:1,fontSize:12,color:t.done?"#444":"#ddd",textDecoration:t.done?"line-through":"none"}}>{t.title}</div>
                          {au&&<div style={{display:"flex",alignItems:"center",gap:5,background:USERS[t.assignee]?.color+"18",border:`1px solid ${USERS[t.assignee]?.color}33`,borderRadius:20,padding:"2px 8px",flexShrink:0}}><div style={{width:14,height:14,borderRadius:"50%",background:USERS[t.assignee]?.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"#fff"}}>{au.avatar[0]}</div><span style={{fontSize:9,color:USERS[t.assignee]?.color,fontWeight:700}}>{au.name}</span></div>}
                          <span style={{fontSize:10,color:"#444",flexShrink:0}}>{t.due}</span>
                          {ac.editTasks&&<button onClick={()=>setTaskMod({...t})} style={edS}>تعديل</button>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Team */}
          {tab==="team"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:12,color:"#555"}}>{co.team.length} أعضاء</span>
                {isAdmin&&<button onClick={()=>setMemMod({})} style={btnS(co.color)}>+ إضافة عضو</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {co.team.map(m=>{const r=Math.round((m.done/Math.max(m.tasks,1))*100);return(
                  <div key={m.id} style={{background:"#0d0d1f",border:"1px solid #1a1a32",borderRadius:15,padding:20}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:11,background:`${co.color}25`,border:`1px solid ${co.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:co.color,flexShrink:0}}>{m.avatar||ini(m.name)}</div>
                      <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div><div style={{fontSize:10,color:"#555",marginTop:2}}>{m.role}</div></div>
                      {isAdmin&&<button onClick={()=>setMemMod({...m})} style={edS}>تعديل</button>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                      {[{l:"الكل",v:m.tasks,c:"#ccc"},{l:"منجز",v:m.done,c:"#4CC97A"},{l:"متبقي",v:m.tasks-m.done,c:"#E8503A"}].map(s=><div key={s.l} style={{background:"#12122a",borderRadius:8,padding:"9px 6px",textAlign:"center"}}><div style={{fontSize:19,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#444",marginTop:2}}>{s.l}</div></div>)}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,color:"#555"}}>نسبة الإنجاز</span><span style={{fontSize:11,fontWeight:800,color:r>=80?"#4CC97A":r>=60?"#E8C23A":"#E8503A"}}>{r}٪</span></div>
                    <div style={{background:"#1a1a2e",borderRadius:5,height:6}}><div style={{width:`${r}%`,height:"100%",background:r>=80?"#4CC97A":r>=60?"#E8C23A":"#E8503A",borderRadius:5,transition:"width .7s"}}/></div>
                  </div>
                );})}
              </div>
            </div>
          )}

          {/* Projects */}
          {tab==="projects"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:12,color:"#555"}}>{co.projects.length} مشاريع</span>
                {isAdmin&&<button onClick={()=>setProjMod({})} style={btnS(co.color)}>+ إضافة مشروع</button>}
              </div>
              <div style={{display:"grid",gap:10}}>
                {co.projects.map((p,i)=>(
                  <div key={p.id} style={{background:"#0d0d1f",border:`1px solid ${SC[p.status]}28`,borderRadius:14,padding:"18px 22px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:32,height:32,borderRadius:8,background:`${SC[p.status]}18`,border:`1px solid ${SC[p.status]}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:SC[p.status]}}>{i+1}</div>
                        <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{background:`${SC[p.status]}18`,color:SC[p.status],border:`1px solid ${SC[p.status]}44`,borderRadius:20,padding:"3px 14px",fontSize:11,fontWeight:700}}>{SL[p.status]}</span>
                        <span style={{fontSize:22,fontWeight:900,color:SC[p.status]}}>{p.progress}٪</span>
                        {isAdmin&&<button onClick={()=>setProjMod({...p})} style={edS}>تعديل</button>}
                      </div>
                    </div>
                    <div style={{background:"#1a1a2e",borderRadius:5,height:8}}><div style={{width:`${p.progress}%`,height:"100%",background:`linear-gradient(90deg,${SC[p.status]}70,${SC[p.status]})`,borderRadius:5,boxShadow:`0 0 8px ${SC[p.status]}44`,transition:"width .8s"}}/></div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
export default function App(){
  const [user,setUser]=useState(()=>{try{const s=sessionStorage.getItem(SESSION_KEY);return s?JSON.parse(s):null;}catch{return null;}});
  const login=u=>{setUser(u);try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(u));}catch{}};
  const logout=()=>{setUser(null);try{sessionStorage.removeItem(SESSION_KEY);}catch{}};
  if(!user)return<Login onLogin={login}/>;
  return<Dashboard user={user} onLogout={logout}/>;
}
