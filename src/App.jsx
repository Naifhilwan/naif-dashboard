import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════
   STORAGE & CONSTANTS
═══════════════════════════════════════════════ */
const SK = "naif_adv_v1";
const OK = "naif_session_adv";

const USERS = {
  naif:  { id:"naif",  name:"نايف", role:"المدير التنفيذي",    avatar:"ن",  pin:"1234", color:"#E8762A", isAdmin:true  },
  mawdi: { id:"mawdi", name:"موضي", role:"السكرتيرة التنفيذية", avatar:"مو", pin:"5678", color:"#C45FA0", isAdmin:false }
};

const COMPANY_COLORS = { 1:"#E8762A", 2:"#C45FA0", 3:"#7C5CBF" };
const PC = { critical:"#FF4757", high:"#E8762A", medium:"#E8C23A", low:"#4CC97A" };
const PL = { critical:"حرج", high:"عاجل", medium:"متوسط", low:"منخفض" };
const SC = { "todo":"#666", "in-progress":"#4C9BE8", "review":"#E8C23A", "done":"#4CC97A", "blocked":"#FF4757" };
const SL = { "todo":"لم يبدأ", "in-progress":"جاري", "review":"مراجعة", "done":"مكتمل", "blocked":"متعثر" };

/* ═══════════════════════════════════════════════
   DEFAULT DATA
═══════════════════════════════════════════════ */
const DEF_DATA = {
  companies: [
    {
      id:1, name:"بريد إكس", icon:"🚚", color:"#E8762A", health:74,
      departments: [
        { id:"bx-fr", name:"الفرنشايز", icon:"🏪" },
        { id:"bx-ops", name:"العمليات والتوصيل", icon:"⚙️" },
        { id:"bx-sales", name:"المبيعات والعملاء", icon:"🤝" },
        { id:"bx-fleet", name:"الأسطول والصيانة", icon:"🚛" },
      ],
      okrs: [
        {
          id:"bx-okr1", deptId:"bx-fr", title:"توسعة شبكة الفرنشايز",
          period:"Q1 2025", type:"سنوي",
          progress:35, target:15, current:3, unit:"فرع",
          keyResults: [
            { id:"kr1", title:"إطلاق ٥ فروع جديدة", progress:40, target:5, current:2 },
            { id:"kr2", title:"تحقيق إيرادات ٥٠٠ ألف من الفرنشايز", progress:25, target:500000, current:125000, unit:"ر.س" },
            { id:"kr3", title:"توقيع ١٠ عقود فرنشايز", progress:30, target:10, current:3 },
          ]
        },
        {
          id:"bx-okr2", deptId:"bx-ops", title:"تحسين كفاءة التوصيل",
          period:"Q1 2025", type:"ربعي",
          progress:60, target:98, current:92, unit:"٪ في الموعد",
          keyResults: [
            { id:"kr4", title:"رفع معدل التوصيل في الموعد لـ ٩٨٪", progress:60, target:98, current:92 },
            { id:"kr5", title:"تخفيض شكاوى العملاء ٥٠٪", progress:70, target:50, current:35, unit:"شكوى" },
          ]
        },
      ],
      kpis: [
        { id:"bx-k1", deptId:"bx-fr",    label:"فروع الفرنشايز",      value:3,      target:15,     unit:"فرع",   period:"شهري",   trend:+1,  trendUp:true  },
        { id:"bx-k2", deptId:"bx-ops",   label:"الشحنات الشهرية",     value:3200,   target:5000,   unit:"شحنة",  period:"شهري",   trend:+200,trendUp:true  },
        { id:"bx-k3", deptId:"bx-sales", label:"العملاء التجاريين",   value:47,     target:120,    unit:"عميل",  period:"شهري",   trend:+5,  trendUp:true  },
        { id:"bx-k4", deptId:"bx-sales", label:"المبيعات الشهرية",    value:180000, target:300000, unit:"ر.س",   period:"شهري",   trend:+12, trendUp:true  },
        { id:"bx-k5", deptId:"bx-fleet", label:"حجم الأسطول",         value:23,     target:50,     unit:"مركبة", period:"شهري",   trend:+3,  trendUp:true  },
        { id:"bx-k6", deptId:"bx-ops",   label:"معدل التوصيل في الوقت",value:92,    target:98,     unit:"٪",     period:"أسبوعي", trend:+2,  trendUp:true  },
      ],
      projects: [
        {
          id:"bx-p1", deptId:"bx-fr", title:"إطلاق فرنشايز جدة",
          status:"in-progress", priority:"high", progress:45,
          startDate:"2025-01-01", dueDate:"2025-04-01",
          assignee:"naif", description:"إطلاق أول فرع فرنشايز في جدة كنموذج للتوسعة",
          steps: [
            { id:"s1", title:"تحديد الموقع",           done:true,  note:"تم اختيار موقع في حي الروضة" },
            { id:"s2", title:"إعداد عقد الفرنشايز",    done:true,  note:"" },
            { id:"s3", title:"تجهيز المكان والمعدات",  done:false, note:"قيد التنفيذ - ٣ أسابيع" },
            { id:"s4", title:"تدريب الفريق",           done:false, note:"" },
            { id:"s5", title:"الإطلاق التجريبي",       done:false, note:"" },
            { id:"s6", title:"الإطلاق الرسمي",         done:false, note:"" },
          ],
          updates: [
            { id:"u1", text:"تم توقيع عقد الإيجار بنجاح", date:"١٠ مار", author:"naif" },
            { id:"u2", text:"جاري تجهيز المكان، تأخر بسبب المقاول", date:"١٢ مار", author:"mawdi" },
          ]
        },
        {
          id:"bx-p2", deptId:"bx-ops", title:"منصة تتبع الشحنات",
          status:"in-progress", priority:"medium", progress:70,
          startDate:"2025-02-01", dueDate:"2025-03-30",
          assignee:"naif", description:"بناء منصة رقمية لتتبع الشحنات في الوقت الفعلي",
          steps: [
            { id:"s1", title:"تصميم واجهة المستخدم", done:true,  note:"" },
            { id:"s2", title:"تطوير الباك إند",       done:true,  note:"" },
            { id:"s3", title:"ربط GPS بالأسطول",      done:true,  note:"" },
            { id:"s4", title:"الاختبار",              done:false, note:"" },
            { id:"s5", title:"الإطلاق",               done:false, note:"" },
          ],
          updates: []
        },
      ],
      tasks: [
        { id:"bx-t1", deptId:"bx-fr",    title:"التفاوض مع مستثمر فرنشايز الرياض",  desc:"التفاوض على شروط عقد فرنشايز جديد في الرياض",  priority:"high",   status:"in-progress", assignee:"naif",  due:"٢٠ مار", subtasks:[{id:"st1",title:"تحضير عرض تقديمي",done:true},{id:"st2",title:"الاجتماع الأول",done:true},{id:"st3",title:"إرسال العقد",done:false}], updates:[] },
        { id:"bx-t2", deptId:"bx-fleet", title:"شراء ٣ مركبات توصيل جديدة",         desc:"شراء مركبات للتوسعة في التوصيل",                priority:"high",   status:"todo",        assignee:"mawdi", due:"١٥ مار", subtasks:[{id:"st1",title:"الحصول على عروض أسعار",done:true},{id:"st2",title:"اعتماد الميزانية",done:false},{id:"st3",title:"الشراء والتسجيل",done:false}], updates:[] },
        { id:"bx-t3", deptId:"bx-ops",   title:"مراجعة أداء سائقي التوصيل",         desc:"تقييم ربعي لأداء جميع السائقين",                priority:"medium", status:"todo",        assignee:"mawdi", due:"٢٨ مار", subtasks:[], updates:[] },
        { id:"bx-t4", deptId:"bx-sales", title:"متابعة عقود العملاء الحكوميين",      desc:"مراجعة وتجديد عقود الجهات الحكومية",           priority:"critical",status:"in-progress", assignee:"naif",  due:"١٤ مار", subtasks:[{id:"st1",title:"مراجعة العقود المنتهية",done:true},{id:"st2",title:"التواصل مع الجهات",done:false}], updates:[] },
      ],
      meetings: [
        { id:"bx-m1", title:"اجتماع متابعة الفرنشايز", date:"٢٠ مار ٢٠٢٥", time:"١٠:٠٠ ص", type:"أسبوعي", attendees:["naif","mawdi"], agenda:["مراجعة تقدم فرع جدة","مناقشة عقود الفرنشايز الجديدة","قرارات التوسعة"], decisions:[], status:"upcoming" },
        { id:"bx-m2", title:"مراجعة KPIs الشهرية",     date:"١٥ مار ٢٠٢٥", time:"٩:٠٠ ص",  type:"شهري",  attendees:["naif"],         agenda:["مراجعة مؤشرات الأداء","مقارنة مع الشهر الماضي"], decisions:["زيادة الأسطول بـ ٣ مركبات","إطلاق حملة لاستقطاب عملاء جدد"], status:"done" },
      ]
    },
    {
      id:2, name:"كوزمينا", icon:"🌿", color:"#C45FA0", health:71,
      departments: [
        { id:"kz-buy", name:"المشتريات والاستيراد", icon:"📦" },
        { id:"kz-sales", name:"المبيعات B2B", icon:"🤝" },
        { id:"kz-store", name:"المخزون والمستودع", icon:"🏭" },
        { id:"kz-mkt", name:"التسويق والفعاليات", icon:"🎪" },
      ],
      okrs: [
        {
          id:"kz-okr1", deptId:"kz-sales", title:"تنمية قاعدة العملاء B2B",
          period:"Q1 2025", type:"ربعي",
          progress:38, target:100, current:38, unit:"عميل",
          keyResults: [
            { id:"kr1", title:"الوصول لـ ١٠٠ عميل تجاري نشط", progress:38, target:100, current:38 },
            { id:"kr2", title:"رفع المبيعات الشهرية لـ ٦٠٠ ألف", progress:63, target:600000, current:380000, unit:"ر.س" },
          ]
        },
        {
          id:"kz-okr2", deptId:"kz-buy", title:"تأمين علامات حصرية جديدة",
          period:"سنوي 2025", type:"سنوي",
          progress:50, target:6, current:3, unit:"علامة",
          keyResults: [
            { id:"kr1", title:"التعاقد مع ٦ علامات حصرية", progress:50, target:6, current:3 },
            { id:"kr2", title:"رفع نسبة العلامات الرسمية لـ ١٥", progress:27, target:15, current:4 },
          ]
        },
      ],
      kpis: [
        { id:"kz-k1", deptId:"kz-sales", label:"العملاء التجاريين",   value:38,      target:100,    unit:"عميل",  period:"شهري",   trend:+4,  trendUp:true  },
        { id:"kz-k2", deptId:"kz-sales", label:"المبيعات الشهرية",    value:380000,  target:600000, unit:"ر.س",   period:"شهري",   trend:+9,  trendUp:true  },
        { id:"kz-k3", deptId:"kz-buy",   label:"العلامات الحصرية",    value:3,       target:6,      unit:"علامة", period:"ربعي",   trend:0,   trendUp:true  },
        { id:"kz-k4", deptId:"kz-store", label:"قيمة المخزون",        value:1200000, target:2000000,unit:"ر.س",   period:"شهري",   trend:+5,  trendUp:true  },
        { id:"kz-k5", deptId:"kz-mkt",   label:"الفعاليات المنجزة",   value:2,       target:6,      unit:"فعالية",period:"ربعي",   trend:0,   trendUp:true  },
      ],
      projects: [
        {
          id:"kz-p1", deptId:"kz-mkt", title:"معرض الجمال الرياض ٢٠٢٥",
          status:"in-progress", priority:"high", progress:80,
          startDate:"2025-02-01", dueDate:"2025-04-10",
          assignee:"mawdi", description:"المشاركة في معرض الجمال السنوي في الرياض",
          steps: [
            { id:"s1", title:"حجز المساحة في المعرض",      done:true,  note:"" },
            { id:"s2", title:"تصميم الجناح",                done:true,  note:"" },
            { id:"s3", title:"تحضير المنتجات والعينات",    done:true,  note:"" },
            { id:"s4", title:"تدريب فريق المبيعات",        done:true,  note:"" },
            { id:"s5", title:"التنفيذ والمشاركة",           done:false, note:"موعد المعرض ١٠ أبريل" },
          ],
          updates: [
            { id:"u1", text:"تم استلام تصميم الجناح من الشركة المنفذة", date:"٨ مار", author:"mawdi" },
          ]
        },
      ],
      tasks: [
        { id:"kz-t1", deptId:"kz-buy",   title:"طلبية استيراد COSRX - ٥٠٠ وحدة",   desc:"طلب استيراد دفعة جديدة من COSRX",           priority:"high",   status:"in-progress", assignee:"naif",  due:"١٨ مار", subtasks:[{id:"st1",title:"إرسال طلب الشراء",done:true},{id:"st2",title:"تأكيد الدفع",done:false},{id:"st3",title:"متابعة الشحن",done:false}], updates:[] },
        { id:"kz-t2", deptId:"kz-buy",   title:"تجديد عقد الحصرية مع Anua",         desc:"تجديد عقد الوكالة الحصرية لعلامة Anua",     priority:"critical",status:"todo",        assignee:"naif",  due:"٣١ مار", subtasks:[{id:"st1",title:"مراجعة شروط العقد الحالي",done:false},{id:"st2",title:"التفاوض على الشروط الجديدة",done:false}], updates:[] },
        { id:"kz-t3", deptId:"kz-mkt",   title:"التحضير لمعرض الجمال الرياض",       desc:"تجهيز كافة متطلبات المشاركة في المعرض",     priority:"high",   status:"in-progress", assignee:"mawdi", due:"١ أبر",  subtasks:[{id:"st1",title:"تحضير كتالوج المنتجات",done:true},{id:"st2",title:"تجهيز العينات",done:true},{id:"st3",title:"تدريب الفريق",done:false}], updates:[] },
      ],
      meetings: [
        { id:"kz-m1", title:"متابعة مستجدات الاستيراد", date:"١٨ مار ٢٠٢٥", time:"١١:٠٠ ص", type:"أسبوعي", attendees:["naif","mawdi"], agenda:["متابعة طلبية COSRX","تجديد عقد Anua","مستجدات الاستيراد"], decisions:[], status:"upcoming" },
      ]
    },
    {
      id:3, name:"تشومي", icon:"✨", color:"#7C5CBF", health:63,
      departments: [
        { id:"ts-store", name:"المتجر الإلكتروني", icon:"🛒" },
        { id:"ts-mkt",   name:"التسويق والإعلانات", icon:"📣" },
        { id:"ts-cs",    name:"خدمة العملاء", icon:"💬" },
        { id:"ts-wh",    name:"المخزون والشحن", icon:"📦" },
      ],
      okrs: [
        {
          id:"ts-okr1", deptId:"ts-mkt", title:"تنمية المبيعات الرقمية",
          period:"Q1 2025", type:"ربعي",
          progress:55, target:400000, current:220000, unit:"ر.س",
          keyResults: [
            { id:"kr1", title:"رفع المبيعات الشهرية لـ ٤٠٠ ألف", progress:55, target:400000, current:220000, unit:"ر.س" },
            { id:"kr2", title:"تحقيق ROAS 5x", progress:76, target:5, current:3.8, unit:"×" },
            { id:"kr3", title:"تخفيض CAC لـ ٢٥ ريال", progress:34, target:25, current:38, unit:"ر.س" },
          ]
        },
        {
          id:"ts-okr2", deptId:"ts-cs", title:"تحسين تجربة العملاء",
          period:"Q1 2025", type:"ربعي",
          progress:40, target:45, current:28, unit:"٪ تكرار الشراء",
          keyResults: [
            { id:"kr1", title:"رفع معدل تكرار الشراء لـ ٤٥٪", progress:62, target:45, current:28 },
            { id:"kr2", title:"تخفيض معدل التخلي عن السلة لـ ٤٠٪", progress:15, target:40, current:68 },
          ]
        },
      ],
      kpis: [
        { id:"ts-k1", deptId:"ts-store", label:"المبيعات الشهرية",    value:220000, target:400000, unit:"ر.س",  period:"شهري",   trend:+8,  trendUp:true  },
        { id:"ts-k2", deptId:"ts-store", label:"إجمالي الطلبات",      value:850,    target:2000,  unit:"طلب",  period:"شهري",   trend:+120,trendUp:true  },
        { id:"ts-k3", deptId:"ts-mkt",   label:"ROAS",                 value:3.8,    target:5,     unit:"×",    period:"أسبوعي", trend:+0.2,trendUp:true  },
        { id:"ts-k4", deptId:"ts-mkt",   label:"CAC",                  value:38,     target:25,    unit:"ر.س",  period:"أسبوعي", trend:-2,  trendUp:false },
        { id:"ts-k5", deptId:"ts-cs",    label:"معدل تكرار الشراء",   value:28,     target:45,    unit:"٪",    period:"شهري",   trend:+2,  trendUp:true  },
        { id:"ts-k6", deptId:"ts-cs",    label:"التخلي عن السلة",     value:68,     target:40,    unit:"٪",    period:"أسبوعي", trend:-1,  trendUp:false },
      ],
      projects: [
        {
          id:"ts-p1", deptId:"ts-mkt", title:"حملة رمضان ٢٠٢٥",
          status:"in-progress", priority:"critical", progress:65,
          startDate:"2025-02-15", dueDate:"2025-03-20",
          assignee:"mawdi", description:"حملة تسويقية شاملة لموسم رمضان",
          steps: [
            { id:"s1", title:"تصميم المحتوى الإبداعي",  done:true,  note:"" },
            { id:"s2", title:"إعداد الحملات الإعلانية", done:true,  note:"Meta + Snap" },
            { id:"s3", title:"إطلاق الحملة",             done:true,  note:"" },
            { id:"s4", title:"متابعة الأداء والتحسين",  done:false, note:"جاري يومياً" },
            { id:"s5", title:"تقرير النتائج النهائي",   done:false, note:"" },
          ],
          updates: [
            { id:"u1", text:"الحملة أعطت ROAS 3.8x في الأسبوع الأول — أقل من الهدف", date:"١١ مار", author:"mawdi" },
          ]
        },
        {
          id:"ts-p2", deptId:"ts-cs", title:"برنامج الولاء والنقاط",
          status:"todo", priority:"high", progress:0,
          startDate:"2025-03-20", dueDate:"2025-04-30",
          assignee:"naif", description:"تصميم وإطلاق برنامج نقاط لتحفيز تكرار الشراء",
          steps: [
            { id:"s1", title:"تصميم آلية البرنامج", done:false, note:"" },
            { id:"s2", title:"التطوير التقني",       done:false, note:"" },
            { id:"s3", title:"الاختبار",             done:false, note:"" },
            { id:"s4", title:"الإطلاق",              done:false, note:"" },
          ],
          updates: []
        },
      ],
      tasks: [
        { id:"ts-t1", deptId:"ts-mkt", title:"تحسين أداء حملات Meta",           desc:"مراجعة وتحسين الحملات الإعلانية على Meta",         priority:"high",   status:"in-progress", assignee:"mawdi", due:"١٤ مار", subtasks:[{id:"st1",title:"تحليل أداء الإعلانات الحالية",done:true},{id:"st2",title:"إيقاف الإعلانات الضعيفة",done:true},{id:"st3",title:"رفع ميزانية الإعلانات الناجحة",done:false}], updates:[] },
        { id:"ts-t2", deptId:"ts-store",title:"تحسين صفحة الدفع",               desc:"تقليل معدل التخلي عن السلة بتحسين تجربة الدفع",    priority:"critical",status:"todo",        assignee:"naif",  due:"١٥ مار", subtasks:[{id:"st1",title:"تحليل نقاط التوقف في الدفع",done:false},{id:"st2",title:"تقليل خطوات الدفع",done:false},{id:"st3",title:"إضافة Apple Pay",done:false}], updates:[] },
        { id:"ts-t3", deptId:"ts-cs",   title:"تفعيل برنامج النقاط والولاء",   desc:"إطلاق برنامج مكافآت لزيادة تكرار الشراء",          priority:"high",   status:"todo",        assignee:"mawdi", due:"٢٠ مار", subtasks:[], updates:[] },
      ],
      meetings: [
        { id:"ts-m1", title:"مراجعة أداء حملة رمضان", date:"١٤ مار ٢٠٢٥", time:"٢:٠٠ م", type:"أسبوعي", attendees:["naif","mawdi"], agenda:["مراجعة ROAS الأسبوعي","قرارات تعديل الحملة","متابعة ميزانية الإعلانات"], decisions:[], status:"upcoming" },
      ]
    }
  ]
};

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const pct=(v,t)=>{const n=parseFloat(String(v).replace(/[^\d.]/g,"")),m=parseFloat(String(t).replace(/[^\d.]/g,""));if(!m)return 0;return Math.min(100,Math.round((n/m)*100));};
const fmtN=(v,u)=>{const n=parseFloat(String(v).replace(/[^\d.]/g,""));if(isNaN(n))return v;if(u==="ر.س"&&n>=1000000)return`${(n/1000000).toFixed(1)}م`;if(u==="ر.س"&&n>=1000)return`${Math.round(n/1000)}ك`;return Number.isInteger(n)?n.toLocaleString("ar-EG"):n;};
const clr=(p,rev=false)=>rev?(p<=50?"#4CC97A":p<=70?"#E8C23A":"#FF4757"):(p>=80?"#4CC97A":p>=50?"#E8C23A":"#FF4757");
const ini=n=>{const p=n.trim().split(" ");return p.length>=2?p[0][0]+p[1][0]:n.slice(0,2);};
const now=()=>new Date().toLocaleDateString("ar-SA",{day:"numeric",month:"short"});

/* ═══════════════════════════════════════════════
   ATOMS
═══════════════════════════════════════════════ */
function Bar({value,color,height=6,radius=4}){
  return(<div style={{background:"#1a1a2e",borderRadius:radius,height,overflow:"hidden"}}><div style={{width:`${value}%`,height:"100%",background:color,borderRadius:radius,transition:"width .8s ease"}}/></div>);
}
function Badge({label,color,bg}){
  return(<span style={{background:bg||color+"22",color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{label}</span>);
}
function Ring({value,color,size=52}){
  const r=size/2-5,c=2*Math.PI*r;
  return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1c1c35" strokeWidth="5"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={`${(value/100)*c} ${c}`} strokeLinecap="round" style={{transition:"stroke-dasharray .7s"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color}}>{value}%</div></div>);
}

function Overlay({onClose,children,width=480}){
  return(<div style={{position:"fixed",inset:0,background:"#000d",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}><div style={{background:"#0c0c1e",border:"1px solid #2a2a45",borderRadius:18,width,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>{children}</div></div>);
}
function OHead({title,color,onClose}){
  return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid #1a1a32",position:"sticky",top:0,background:"#0c0c1e",zIndex:1}}><span style={{fontWeight:800,fontSize:15,color:"#fff"}}>{title}</span><button onClick={onClose} style={{background:`${color}22`,border:`1px solid ${color}44`,borderRadius:8,width:30,height:30,color,fontSize:16,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>);
}
function Inp({label,value,onChange,type="text",options,hint,rows}){
  const s={background:"#12122a",border:"1px solid #2a2a45",borderRadius:9,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box",textAlign:"right",display:"block",resize:"vertical"};
  return(<div style={{marginBottom:14}}>{label&&<div style={{fontSize:11,color:"#666",marginBottom:5,fontWeight:600}}>{label}</div>}{options?<select value={value} onChange={e=>onChange(e.target.value)} style={s}>{options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>:rows?<textarea value={value} onChange={e=>onChange(e.target.value)} style={{...s,minHeight:rows*36}} rows={rows}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} style={s} autoComplete="off"/>}{hint&&<div style={{fontSize:10,color:"#444",marginTop:3}}>{hint}</div>}</div>);
}
function Btn({label,onClick,color,ghost,disabled,small}){
  const p=small?"6px 14px":"10px 22px";
  const fs=small?11:13;
  return(<button onClick={onClick} disabled={disabled} style={{background:ghost?"transparent":disabled?"#333":color,color:ghost?color:"#fff",border:`1px solid ${disabled?"#333":color}`,borderRadius:9,padding:p,fontWeight:700,fontSize:fs,cursor:disabled?"default":"pointer",fontFamily:"inherit",opacity:disabled?.5:1,boxShadow:(!ghost&&!disabled)?`0 2px 12px ${color}44`:"none",flexShrink:0,whiteSpace:"nowrap"}}>{label}</button>);
}

/* ═══════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════ */
function Login({onLogin}){
  const [sel,setSel]=useState(null);
  const [pin,setPin]=useState("");
  const [err,setErr]=useState("");
  const tap=k=>{
    if(k==="del"){setPin(p=>p.slice(0,-1));return;}
    if(pin.length>=4)return;
    const n=pin+k;setPin(n);
    if(n.length===4){if(n===sel?.pin){setTimeout(()=>onLogin(sel),150);}else{setTimeout(()=>{setErr("رقم سري خاطئ");setPin("");},300);}}
  };
  return(
    <div dir="rtl" style={{fontFamily:"'Segoe UI',Tahoma,sans-serif",background:"#080815",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      {!sel?(
        <div style={{width:360}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{width:70,height:70,borderRadius:20,background:"linear-gradient(135deg,#E8762A,#C45FA0,#7C5CBF)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:32,margin:"0 auto 16px",boxShadow:"0 8px 40px #C45FA066"}}>ن</div>
            <div style={{fontWeight:900,fontSize:24,color:"#fff"}}>مركز نايف التنفيذي</div>
            <div style={{fontSize:10,color:"#444",letterSpacing:3,marginTop:4}}>COMMAND CENTER</div>
          </div>
          {Object.values(USERS).map(u=>(
            <div key={u.id} onClick={()=>{setSel(u);setPin("");setErr("");}}
              style={{background:"#0d0d1f",border:`1px solid ${u.color}44`,borderRadius:16,padding:"18px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,marginBottom:12,transition:"all .2s"}}
              onMouseEnter={e=>e.currentTarget.style.background=u.color+"15"}
              onMouseLeave={e=>e.currentTarget.style.background="#0d0d1f"}>
              <div style={{width:50,height:50,borderRadius:14,background:`${u.color}25`,border:`2px solid ${u.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,color:u.color}}>{u.avatar}</div>
              <div><div style={{fontWeight:800,fontSize:16,color:"#fff"}}>{u.name}</div><div style={{fontSize:12,color:"#555",marginTop:2}}>{u.role}</div></div>
              <div style={{marginRight:"auto",color:"#333",fontSize:20}}>‹</div>
            </div>
          ))}
        </div>
      ):(
        <div style={{width:300,textAlign:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"center",marginBottom:28}}>
            <div style={{width:46,height:46,borderRadius:12,background:`${sel.color}25`,border:`2px solid ${sel.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:sel.color}}>{sel.avatar}</div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:15,color:"#fff"}}>{sel.name}</div><button onClick={()=>{setSel(null);setPin("");setErr("");}} style={{background:"none",border:"none",color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit",padding:0}}>تغيير</button></div>
          </div>
          <div style={{display:"flex",gap:14,justifyContent:"center",marginBottom:24}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?sel.color:"#1e1e35",transition:"all .2s",boxShadow:pin.length>i?`0 0 8px ${sel.color}`:""}}/>)}
          </div>
          {err&&<div style={{color:"#FF4757",fontSize:12,marginBottom:12,fontWeight:600}}>{err}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>(
              <button key={i} onClick={()=>k&&tap(k)} disabled={!k}
                style={{background:k==="del"?"#1a1a2e":k?"#111128":"transparent",border:k?"1px solid #2a2a45":"none",borderRadius:13,padding:"16px 0",fontSize:k==="del"?16:22,fontWeight:600,color:k==="del"?"#FF4757":"#fff",cursor:k?"pointer":"default",fontFamily:"inherit",transition:"background .15s"}}
                onMouseEnter={e=>{if(k)e.currentTarget.style.background=sel.color+"33";}}
                onMouseLeave={e=>{if(k)e.currentTarget.style.background=k==="del"?"#1a1a2e":"#111128";}}>
                {k==="del"?"⌫":k}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TASK DETAIL OVERLAY
═══════════════════════════════════════════════ */
function TaskDetail({task,color,depts,isAdmin,currentUser,onSave,onClose}){
  const [f,setF]=useState({...task,subtasks:[...(task.subtasks||[])],updates:[...(task.updates||[])]});
  const [newSub,setNewSub]=useState("");
  const [newUpd,setNewUpd]=useState("");
  const dept=depts.find(d=>d.id===f.deptId);
  const addSub=()=>{if(!newSub.trim())return;setF(x=>({...x,subtasks:[...x.subtasks,{id:"st"+Date.now(),title:newSub.trim(),done:false}]}));setNewSub("");};
  const togSub=id=>setF(x=>({...x,subtasks:x.subtasks.map(s=>s.id===id?{...s,done:!s.done}:s)}));
  const delSub=id=>setF(x=>({...x,subtasks:x.subtasks.filter(s=>s.id!==id)}));
  const addUpd=()=>{if(!newUpd.trim())return;setF(x=>({...x,updates:[{id:"u"+Date.now(),text:newUpd.trim(),date:now(),author:currentUser.id},...x.updates]}));setNewUpd("");};
  const done=f.subtasks.length>0?f.subtasks.filter(s=>s.done).length:f.status==="done"?1:0;
  const total=f.subtasks.length>0?f.subtasks.length:1;
  return(
    <Overlay onClose={onClose} width={560}>
      <OHead title={f.title} color={color} onClose={onClose}/>
      <div style={{padding:"20px 24px"}}>
        {/* Status & Priority row */}
        <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
          <select value={f.status} onChange={e=>setF(x=>({...x,status:e.target.value}))}
            style={{background:`${SC[f.status]}22`,border:`1px solid ${SC[f.status]}55`,borderRadius:20,padding:"4px 14px",color:SC[f.status],fontSize:11,fontWeight:700,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
            {Object.entries(SL).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <select value={f.priority} onChange={e=>setF(x=>({...x,priority:e.target.value}))}
            style={{background:`${PC[f.priority]}22`,border:`1px solid ${PC[f.priority]}55`,borderRadius:20,padding:"4px 14px",color:PC[f.priority],fontSize:11,fontWeight:700,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
            {Object.entries(PL).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <select value={f.deptId} onChange={e=>setF(x=>({...x,deptId:e.target.value}))}
            style={{background:"#1a1a2e",border:"1px solid #2a2a45",borderRadius:20,padding:"4px 14px",color:"#888",fontSize:11,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
            {depts.map(d=><option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
          </select>
        </div>
        <Inp label="العنوان" value={f.title} onChange={v=>setF(x=>({...x,title:v}))}/>
        <Inp label="الوصف" value={f.desc||""} onChange={v=>setF(x=>({...x,desc:v}))} rows={3}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
          <Inp label="الموعد النهائي" value={f.due} onChange={v=>setF(x=>({...x,due:v}))}/>
          <Inp label="المكلّف" value={f.assignee} onChange={v=>setF(x=>({...x,assignee:v}))}
            options={Object.values(USERS).map(u=>({v:u.id,l:`${u.name}`}))}/>
        </div>

        {/* Subtasks */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:700,color:"#ccc"}}>الخطوات والمهام الفرعية</span>
            <span style={{fontSize:10,color:"#555"}}>{f.subtasks.filter(s=>s.done).length}/{f.subtasks.length} مكتمل</span>
          </div>
          {f.subtasks.length>0&&<Bar value={f.subtasks.length?Math.round(f.subtasks.filter(s=>s.done).length/f.subtasks.length*100):0} color={color} height={4}/>}
          <div style={{marginTop:10}}>
            {f.subtasks.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #0f0f20"}}>
                <div onClick={()=>togSub(s.id)} style={{width:18,height:18,borderRadius:5,border:`2px solid ${s.done?color:"#2a2a45"}`,background:s.done?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all .2s"}}>
                  {s.done&&<span style={{color:"#fff",fontSize:10,fontWeight:900}}>✓</span>}
                </div>
                <span style={{flex:1,fontSize:12,color:s.done?"#444":"#ccc",textDecoration:s.done?"line-through":"none"}}>{s.title}</span>
                <button onClick={()=>delSub(s.id)} style={{background:"none",border:"none",color:"#333",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>×</button>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <input value={newSub} onChange={e=>setNewSub(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()}
                placeholder="+ إضافة خطوة..."
                style={{flex:1,background:"#0f0f20",border:"1px solid #2a2a45",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",textAlign:"right"}}/>
              <Btn label="إضافة" onClick={addSub} color={color} small/>
            </div>
          </div>
        </div>

        {/* Updates */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ccc",marginBottom:10}}>التحديثات والملاحظات</div>
          {f.updates.map(u=>{
            const au=USERS[u.author];
            return(<div key={u.id} style={{background:"#0f0f20",borderRadius:10,padding:"12px 14px",marginBottom:8,borderRight:`3px solid ${au?.color||color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,fontWeight:700,color:au?.color||color}}>{au?.name||u.author}</span>
                <span style={{fontSize:10,color:"#444"}}>{u.date}</span>
              </div>
              <div style={{fontSize:12,color:"#bbb",lineHeight:1.6}}>{u.text}</div>
            </div>);
          })}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input value={newUpd} onChange={e=>setNewUpd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addUpd()}
              placeholder="أضف تحديثاً..."
              style={{flex:1,background:"#0f0f20",border:"1px solid #2a2a45",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",textAlign:"right"}}/>
            <Btn label="إرسال" onClick={addUpd} color={color} small/>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <Btn label="حفظ التغييرات" onClick={()=>onSave(f)} color={color}/>
          <Btn label="إلغاء" onClick={onClose} color={color} ghost/>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════
   PROJECT DETAIL OVERLAY
═══════════════════════════════════════════════ */
function ProjectDetail({project,color,depts,isAdmin,currentUser,onSave,onClose}){
  const [f,setF]=useState({...project,steps:[...(project.steps||[])],updates:[...(project.updates||[])]});
  const [newStep,setNewStep]=useState("");
  const [newUpd,setNewUpd]=useState("");
  const progress=f.steps.length?Math.round(f.steps.filter(s=>s.done).length/f.steps.length*100):f.progress||0;
  const addStep=()=>{if(!newStep.trim())return;setF(x=>({...x,steps:[...x.steps,{id:"s"+Date.now(),title:newStep.trim(),done:false,note:""}]}));setNewStep("");};
  const togStep=id=>setF(x=>({...x,steps:x.steps.map(s=>s.id===id?{...s,done:!s.done}:s)}));
  const addUpd=()=>{if(!newUpd.trim())return;setF(x=>({...x,updates:[{id:"u"+Date.now(),text:newUpd.trim(),date:now(),author:currentUser.id},...x.updates]}));setNewUpd("");};
  return(
    <Overlay onClose={onClose} width={600}>
      <OHead title={f.title} color={color} onClose={onClose}/>
      <div style={{padding:"20px 24px"}}>
        <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
          <select value={f.status} onChange={e=>setF(x=>({...x,status:e.target.value}))}
            style={{background:`${SC[f.status]}22`,border:`1px solid ${SC[f.status]}55`,borderRadius:20,padding:"4px 14px",color:SC[f.status],fontSize:11,fontWeight:700,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
            {Object.entries(SL).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <select value={f.priority} onChange={e=>setF(x=>({...x,priority:e.target.value}))}
            style={{background:`${PC[f.priority]}22`,border:`1px solid ${PC[f.priority]}55`,borderRadius:20,padding:"4px 14px",color:PC[f.priority],fontSize:11,fontWeight:700,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
            {Object.entries(PL).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <Inp label="اسم المشروع" value={f.title} onChange={v=>setF(x=>({...x,title:v}))}/>
        <Inp label="الوصف" value={f.description||""} onChange={v=>setF(x=>({...x,description:v}))} rows={2}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
          <Inp label="تاريخ البداية" value={f.startDate||""} onChange={v=>setF(x=>({...x,startDate:v}))}/>
          <Inp label="تاريخ الانتهاء" value={f.dueDate||""} onChange={v=>setF(x=>({...x,dueDate:v}))}/>
          <Inp label="المسؤول" value={f.assignee} onChange={v=>setF(x=>({...x,assignee:v}))}
            options={Object.values(USERS).map(u=>({v:u.id,l:u.name}))}/>
        </div>

        {/* Progress */}
        <div style={{background:"#0f0f20",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:700,color:"#ccc"}}>تقدم المشروع</span>
            <span style={{fontSize:14,fontWeight:900,color}}>{progress}٪</span>
          </div>
          <Bar value={progress} color={color} height={8}/>
        </div>

        {/* Steps */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ccc",marginBottom:10}}>خطوات المشروع</div>
          {f.steps.map((s,i)=>(
            <div key={s.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:6,background:s.done?"#0f2a1a":"#0f0f20",border:`1px solid ${s.done?"#4CC97A33":"#1a1a32"}`}}>
              <div onClick={()=>togStep(s.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${s.done?"#4CC97A":"#2a2a45"}`,background:s.done?"#4CC97A":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:1}}>
                {s.done&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:s.done?"#4CC97A":"#ddd",fontWeight:600,textDecoration:s.done?"line-through":"none"}}>{i+1}. {s.title}</div>
                {s.note&&<div style={{fontSize:10,color:"#555",marginTop:3}}>{s.note}</div>}
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <input value={newStep} onChange={e=>setNewStep(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addStep()}
              placeholder="+ خطوة جديدة..."
              style={{flex:1,background:"#0f0f20",border:"1px solid #2a2a45",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",textAlign:"right"}}/>
            <Btn label="إضافة" onClick={addStep} color={color} small/>
          </div>
        </div>

        {/* Updates */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ccc",marginBottom:10}}>آخر التحديثات</div>
          {f.updates.map(u=>{const au=USERS[u.author];return(
            <div key={u.id} style={{background:"#0f0f20",borderRadius:10,padding:"12px 14px",marginBottom:8,borderRight:`3px solid ${au?.color||color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,fontWeight:700,color:au?.color||color}}>{au?.name||u.author}</span>
                <span style={{fontSize:10,color:"#444"}}>{u.date}</span>
              </div>
              <div style={{fontSize:12,color:"#bbb",lineHeight:1.6}}>{u.text}</div>
            </div>
          );})}
          <div style={{display:"flex",gap:8}}>
            <input value={newUpd} onChange={e=>setNewUpd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addUpd()}
              placeholder="أضف تحديثاً..."
              style={{flex:1,background:"#0f0f20",border:"1px solid #2a2a45",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",textAlign:"right"}}/>
            <Btn label="إرسال" onClick={addUpd} color={color} small/>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <Btn label="حفظ" onClick={()=>onSave({...f,progress})} color={color}/>
          <Btn label="إلغاء" onClick={onClose} color={color} ghost/>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════
   MEETING DETAIL OVERLAY
═══════════════════════════════════════════════ */
function MeetingDetail({meeting,color,isAdmin,currentUser,onSave,onClose}){
  const [f,setF]=useState({...meeting,agenda:[...(meeting.agenda||[])],decisions:[...(meeting.decisions||[])]});
  const [newA,setNewA]=useState("");
  const [newD,setNewD]=useState("");
  return(
    <Overlay onClose={onClose} width={520}>
      <OHead title={f.title} color={color} onClose={onClose}/>
      <div style={{padding:"20px 24px"}}>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <Badge label={f.status==="upcoming"?"قادم":"منتهي"} color={f.status==="upcoming"?"#4CC97A":"#666"}/>
          <Badge label={f.type} color={color}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <Inp label="عنوان الاجتماع" value={f.title} onChange={v=>setF(x=>({...x,title:v}))}/>
          <Inp label="النوع" value={f.type} onChange={v=>setF(x=>({...x,type:v}))} options={[{v:"أسبوعي",l:"أسبوعي"},{v:"شهري",l:"شهري"},{v:"ربعي",l:"ربعي"},{v:"طارئ",l:"طارئ"}]}/>
          <Inp label="التاريخ" value={f.date} onChange={v=>setF(x=>({...x,date:v}))}/>
          <Inp label="الوقت" value={f.time} onChange={v=>setF(x=>({...x,time:v}))}/>
        </div>
        <Inp label="الحالة" value={f.status} onChange={v=>setF(x=>({...x,status:v}))} options={[{v:"upcoming",l:"قادم"},{v:"done",l:"منتهي"}]}/>

        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ccc",marginBottom:8}}>📋 أجندة الاجتماع</div>
          {f.agenda.map((a,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 12px",background:"#0f0f20",borderRadius:8,marginBottom:6}}>
              <span style={{fontSize:10,color:color,fontWeight:800,flexShrink:0}}>{i+1}</span>
              <span style={{flex:1,fontSize:12,color:"#ccc"}}>{a}</span>
              <button onClick={()=>setF(x=>({...x,agenda:x.agenda.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:14}}>×</button>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <input value={newA} onChange={e=>setNewA(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newA.trim()){setF(x=>({...x,agenda:[...x.agenda,newA.trim()]}));setNewA("");}}}
              placeholder="+ نقطة أجندة جديدة..."
              style={{flex:1,background:"#0f0f20",border:"1px solid #2a2a45",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",textAlign:"right"}}/>
            <Btn label="إضافة" onClick={()=>{if(newA.trim()){setF(x=>({...x,agenda:[...x.agenda,newA.trim()]}));setNewA("");}}} color={color} small/>
          </div>
        </div>

        <div style={{marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ccc",marginBottom:8}}>✅ القرارات</div>
          {f.decisions.map((d,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"center",padding:"7px 12px",background:"#0a1f0a",border:"1px solid #4CC97A33",borderRadius:8,marginBottom:6}}>
              <span style={{fontSize:10,color:"#4CC97A",flexShrink:0}}>✓</span>
              <span style={{flex:1,fontSize:12,color:"#ccc"}}>{d}</span>
              <button onClick={()=>setF(x=>({...x,decisions:x.decisions.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:14}}>×</button>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <input value={newD} onChange={e=>setNewD(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newD.trim()){setF(x=>({...x,decisions:[...x.decisions,newD.trim()]}));setNewD("");}}}
              placeholder="+ قرار جديد..."
              style={{flex:1,background:"#0f0f20",border:"1px solid #2a2a45",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",textAlign:"right"}}/>
            <Btn label="إضافة" onClick={()=>{if(newD.trim()){setF(x=>({...x,decisions:[...x.decisions,newD.trim()]}));setNewD("");}}} color={color} small/>
          </div>
        </div>

        <div style={{display:"flex",gap:8}}>
          <Btn label="حفظ" onClick={()=>onSave(f)} color={color}/>
          <Btn label="إلغاء" onClick={onClose} color={color} ghost/>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════
   KPI EDIT OVERLAY
═══════════════════════════════════════════════ */
function KpiEdit({kpi,color,depts,onSave,onClose}){
  const [f,setF]=useState({...kpi});
  return(
    <Overlay onClose={onClose} width={420}>
      <OHead title={`تعديل: ${f.label}`} color={color} onClose={onClose}/>
      <div style={{padding:"20px 24px"}}>
        <Inp label="الاسم" value={f.label} onChange={v=>setF(x=>({...x,label:v}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp label="القيمة الحالية" value={String(f.value)} onChange={v=>setF(x=>({...x,value:parseFloat(v)||0}))} type="number"/>
          <Inp label="الهدف" value={String(f.target)} onChange={v=>setF(x=>({...x,target:parseFloat(v)||0}))} type="number"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp label="الوحدة" value={f.unit} onChange={v=>setF(x=>({...x,unit:v}))}/>
          <Inp label="الدورة" value={f.period} onChange={v=>setF(x=>({...x,period:v}))} options={[{v:"يومي",l:"يومي"},{v:"أسبوعي",l:"أسبوعي"},{v:"شهري",l:"شهري"},{v:"ربعي",l:"ربعي"}]}/>
        </div>
        <Inp label="القسم" value={f.deptId} onChange={v=>setF(x=>({...x,deptId:v}))} options={depts.map(d=>({v:d.id,l:`${d.icon} ${d.name}`}))}/>
        <Inp label="الاتجاه" value={f.trendUp?"up":"down"} onChange={v=>setF(x=>({...x,trendUp:v==="up"}))} options={[{v:"up",l:"↑ إيجابي"},{v:"down",l:"↓ سلبي"}]}/>
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <Btn label="حفظ" onClick={()=>onSave(f)} color={color}/>
          <Btn label="إلغاء" onClick={onClose} color={color} ghost/>
        </div>
      </div>
    </Overlay>
  );
}

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════ */
function Dashboard({user,onLogout}){
  const [data,setData]=useState(DEF_DATA);
  const [loaded,setLoaded]=useState(false);
  const [saved,setSaved]=useState(false);
  const [cid,setCid]=useState(1);
  const [tab,setTab]=useState("overview");
  const [deptFilter,setDeptFilter]=useState("all");
  const [mobileMenu,setMobileMenu]=useState(false);

  // Overlays
  const [taskOv,setTaskOv]=useState(null);
  const [projOv,setProjOv]=useState(null);
  const [meetOv,setMeetOv]=useState(null);
  const [kpiOv,setKpiOv]=useState(null);

  // Load/save
  useEffect(()=>{
    try{const s=localStorage.getItem(SK);if(s)setData(JSON.parse(s));}catch{}
    setLoaded(true);
  },[]);
  useEffect(()=>{
    if(!loaded)return;
    try{localStorage.setItem(SK,JSON.stringify(data));setSaved(true);setTimeout(()=>setSaved(false),1500);}catch{}
  },[data,loaded]);

  const co=data.companies.find(c=>c.id===cid);
  const color=co.color;
  const isAdmin=user.isAdmin;

  // Mutators
  const upd=(id,fn)=>setData(p=>({...p,companies:p.companies.map(c=>c.id===id?fn(c):c)}));
  const saveTask=t=>upd(cid,c=>({...c,tasks:t.id&&c.tasks.find(x=>x.id===t.id)?c.tasks.map(x=>x.id===t.id?t:x):[...c.tasks,{...t,id:"t"+Date.now()}]}));
  const saveProj=p=>upd(cid,c=>({...c,projects:p.id&&c.projects.find(x=>x.id===p.id)?c.projects.map(x=>x.id===p.id?p:x):[...c.projects,{...p,id:"p"+Date.now()}]}));
  const saveMeet=m=>upd(cid,c=>({...c,meetings:m.id&&c.meetings.find(x=>x.id===m.id)?c.meetings.map(x=>x.id===m.id?m:x):[...c.meetings,{...m,id:"m"+Date.now()}]}));
  const saveKpi=k=>upd(cid,c=>({...c,kpis:c.kpis.map(x=>x.id===k.id?k:x)}));
  const delTask=id=>upd(cid,c=>({...c,tasks:c.tasks.filter(t=>t.id!==id)}));
  const delProj=id=>upd(cid,c=>({...c,projects:c.projects.filter(p=>p.id!==id)}));

  // Filtered data
  const filteredTasks=deptFilter==="all"?co.tasks:co.tasks.filter(t=>t.deptId===deptFilter);
  const filteredProjs=deptFilter==="all"?co.projects:co.projects.filter(p=>p.deptId===deptFilter);
  const filteredKpis=deptFilter==="all"?co.kpis:co.kpis.filter(k=>k.deptId===deptFilter);
  const filteredOkrs=deptFilter==="all"?co.okrs:co.okrs.filter(o=>o.deptId===deptFilter);

  // Global stats
  const allTasks=data.companies.flatMap(c=>c.tasks);
  const myTasks=allTasks.filter(t=>t.assignee===user.id&&t.status!=="done");
  const criticalAll=allTasks.filter(t=>t.priority==="critical"&&t.status!=="done");
  const avgHealth=Math.round(data.companies.reduce((s,c)=>s+c.health,0)/data.companies.length);

  const TABS=[
    {k:"overview",l:"نظرة عامة",i:"📊"},
    {k:"okrs",l:"OKRs",i:"🎯"},
    {k:"projects",l:"المشاريع",i:"🚀"},
    {k:"tasks",l:"المهام",i:"✅"},
    {k:"kpis",l:"المؤشرات",i:"📈"},
    {k:"meetings",l:"الاجتماعات",i:"📅"},
  ];

  const newTaskTemplate=()=>({title:"",desc:"",priority:"medium",status:"todo",assignee:user.id,due:"",deptId:co.departments[0]?.id||"",subtasks:[],updates:[]});
  const newProjTemplate=()=>({title:"",description:"",priority:"medium",status:"todo",progress:0,assignee:user.id,startDate:"",dueDate:"",deptId:co.departments[0]?.id||"",steps:[],updates:[]});
  const newMeetTemplate=()=>({title:"",date:"",time:"",type:"أسبوعي",attendees:[user.id],agenda:[],decisions:[],status:"upcoming"});

  return(
    <div dir="rtl" style={{fontFamily:"'Segoe UI',Tahoma,sans-serif",background:"#07071a",minHeight:"100vh",color:"#e4e4f0",display:"flex",flexDirection:"column"}}>

      {/* OVERLAYS */}
      {taskOv&&<TaskDetail task={taskOv} color={color} depts={co.departments} isAdmin={isAdmin} currentUser={user}
        onSave={t=>{saveTask(t);setTaskOv(null);}} onClose={()=>setTaskOv(null)}/>}
      {projOv&&<ProjectDetail project={projOv} color={color} depts={co.departments} isAdmin={isAdmin} currentUser={user}
        onSave={p=>{saveProj(p);setProjOv(null);}} onClose={()=>setProjOv(null)}/>}
      {meetOv&&<MeetingDetail meeting={meetOv} color={color} isAdmin={isAdmin} currentUser={user}
        onSave={m=>{saveMeet(m);setMeetOv(null);}} onClose={()=>setMeetOv(null)}/>}
      {kpiOv&&<KpiEdit kpi={kpiOv} color={color} depts={co.departments}
        onSave={k=>{saveKpi(k);setKpiOv(null);}} onClose={()=>setKpiOv(null)}/>}

      {/* HEADER */}
      <div style={{background:"#0a0a1c",borderBottom:"1px solid #151530",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:80}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#E8762A,#C45FA0,#7C5CBF)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,flexShrink:0}}>ن</div>
          <div style={{display:"none",flexDirection:"column",lineHeight:1.2}}>
            <span style={{fontWeight:800,fontSize:13,color:"#fff"}}>مركز نايف</span>
            <span style={{fontSize:8,color:"#333",letterSpacing:2}}>CEO</span>
          </div>
          {saved&&<span style={{fontSize:9,color:"#4CC97A",background:"#4CC97A15",border:"1px solid #4CC97A33",borderRadius:20,padding:"2px 8px"}}>✓ محفوظ</span>}
        </div>

        {/* Company selector */}
        <div style={{display:"flex",gap:4}}>
          {data.companies.map(c=>(
            <button key={c.id} onClick={()=>{setCid(c.id);setDeptFilter("all");setTab("overview");}}
              style={{background:cid===c.id?`${c.color}22`:"transparent",border:`1px solid ${cid===c.id?c.color+"55":"transparent"}`,borderRadius:10,padding:"5px 10px",cursor:"pointer",fontFamily:"inherit",color:cid===c.id?"#fff":"#555",fontWeight:cid===c.id?700:400,fontSize:11,transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
              <span>{c.icon}</span>
              <span style={{display:"none"}}>{c.name}</span>
            </button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {criticalAll.length>0&&<span style={{fontSize:10,color:"#FF4757",background:"#FF475718",border:"1px solid #FF475733",borderRadius:20,padding:"3px 10px",fontWeight:700}}>{criticalAll.length} حرج</span>}
          <div style={{width:32,height:32,borderRadius:9,background:`${user.color}25`,border:`1px solid ${user.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:user.color}}>{user.avatar}</div>
          <button onClick={onLogout} style={{background:"none",border:"1px solid #1e1e35",borderRadius:7,padding:"5px 10px",color:"#555",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>خروج</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* SIDEBAR */}
        <div style={{width:200,background:"#090916",borderLeft:"1px solid #111128",flexShrink:0,display:"flex",flexDirection:"column",overflowY:"auto"}}>

          {/* Company info */}
          <div style={{padding:"16px 14px",borderBottom:"1px solid #111128"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${color}22`,border:`2px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{co.icon}</div>
              <div><div style={{fontWeight:800,fontSize:13,color:"#fff"}}>{co.name}</div><div style={{fontSize:9,color:"#444"}}>{co.health}٪ صحة</div></div>
            </div>
            <div style={{background:"#1a1a2e",borderRadius:4,height:4,overflow:"hidden"}}>
              <div style={{width:`${co.health}%`,height:"100%",background:clr(co.health),transition:"width .7s"}}/>
            </div>
          </div>

          {/* Tabs */}
          <div style={{padding:"8px 8px"}}>
            <div style={{fontSize:8,color:"#333",letterSpacing:1.5,fontWeight:700,padding:"4px 6px",marginBottom:4}}>القسم</div>
            {/* All departments */}
            <button onClick={()=>setDeptFilter("all")}
              style={{width:"100%",background:deptFilter==="all"?`${color}18`:"transparent",border:`1px solid ${deptFilter==="all"?color+"44":"transparent"}`,borderRadius:8,padding:"7px 10px",cursor:"pointer",fontFamily:"inherit",color:deptFilter==="all"?"#fff":"#666",fontWeight:deptFilter==="all"?700:400,fontSize:11,textAlign:"right",marginBottom:2,transition:"all .2s"}}>
              🏢 كل الأقسام
            </button>
            {co.departments.map(d=>(
              <button key={d.id} onClick={()=>setDeptFilter(d.id)}
                style={{width:"100%",background:deptFilter===d.id?`${color}18`:"transparent",border:`1px solid ${deptFilter===d.id?color+"44":"transparent"}`,borderRadius:8,padding:"7px 10px",cursor:"pointer",fontFamily:"inherit",color:deptFilter===d.id?"#fff":"#666",fontWeight:deptFilter===d.id?700:400,fontSize:11,textAlign:"right",marginBottom:2,transition:"all .2s",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {d.icon} {d.name}
              </button>
            ))}

            <div style={{fontSize:8,color:"#333",letterSpacing:1.5,fontWeight:700,padding:"12px 6px 4px",marginTop:4}}>القوائم</div>
            {TABS.map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)}
                style={{width:"100%",background:tab===t.k?`${color}22`:"transparent",border:`1px solid ${tab===t.k?color+"44":"transparent"}`,borderRadius:8,padding:"7px 10px",cursor:"pointer",fontFamily:"inherit",color:tab===t.k?"#fff":"#666",fontWeight:tab===t.k?700:400,fontSize:11,textAlign:"right",marginBottom:2,transition:"all .2s",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13}}>{t.i}</span>{t.l}
              </button>
            ))}
          </div>

          {/* My tasks quick view */}
          {myTasks.length>0&&(
            <div style={{margin:"8px 10px",padding:12,background:"#0f0f20",borderRadius:10,border:`1px solid ${user.color}22`}}>
              <div style={{fontSize:9,color:user.color,letterSpacing:1.5,fontWeight:700,marginBottom:8}}>مهامي ({myTasks.length})</div>
              {myTasks.slice(0,3).map(t=>{
                const cp=data.companies.find(c=>c.tasks?.some(x=>x.id===t.id));
                return(<div key={t.id} style={{fontSize:10,color:"#888",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}} onClick={()=>{setCid(cp?.id||cid);setTab("tasks");setTaskOv(t);}}>{t.title}</div>);
              })}
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,overflowY:"auto",padding:"20px"}}>

          {/* Company header */}
          <div style={{background:`linear-gradient(135deg,${color}12,transparent 50%)`,border:`1px solid ${color}22`,borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <span style={{fontSize:20,fontWeight:900,color:"#fff"}}>{co.icon} {co.name}</span>
                <Badge label={co.health>=75?"أداء جيد":co.health>=60?"يحتاج متابعة":"حرج"} color={clr(co.health)}/>
                {deptFilter!=="all"&&<Badge label={co.departments.find(d=>d.id===deptFilter)?.name||""} color={color}/>}
              </div>
              <div style={{fontSize:11,color:"#444",marginTop:4,display:"flex",gap:12,flexWrap:"wrap"}}>
                <span>{co.tasks.filter(t=>t.status!=="done").length} مهمة مفتوحة</span>
                <span>{co.projects.filter(p=>p.status!=="done").length} مشروع نشط</span>
                <span>{co.meetings.filter(m=>m.status==="upcoming").length} اجتماع قادم</span>
              </div>
            </div>
            <Ring value={co.health} color={color} size={56}/>
          </div>

          {/* ══ OVERVIEW ══ */}
          {tab==="overview"&&(
            <div>
              {/* Stats cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
                {[
                  {l:"مهام حرجة",v:filteredTasks.filter(t=>t.priority==="critical"&&t.status!=="done").length,c:"#FF4757"},
                  {l:"مشاريع نشطة",v:filteredProjs.filter(p=>p.status==="in-progress").length,c:"#4C9BE8"},
                  {l:"مهام اليوم",v:filteredTasks.filter(t=>t.status!=="done").length,c:color},
                  {l:"مكتملة هذا الشهر",v:filteredTasks.filter(t=>t.status==="done").length,c:"#4CC97A"},
                ].map(s=>(
                  <div key={s.l} style={{background:"#0d0d1f",border:`1px solid ${s.c}28`,borderRadius:13,padding:"14px 16px"}}>
                    <div style={{fontSize:24,fontWeight:900,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:11,color:"#555",marginTop:3}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* OKRs preview */}
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:800,color:"#ccc"}}>🎯 الأهداف الربعية (OKRs)</span>
                  <button onClick={()=>setTab("okrs")} style={{background:"none",border:"none",color:color,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>عرض الكل ←</button>
                </div>
                <div style={{display:"grid",gap:10}}>
                  {filteredOkrs.map(o=>(
                    <div key={o.id} style={{background:"#0d0d1f",border:`1px solid ${color}22`,borderRadius:13,padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:"#fff"}}>{o.title}</div>
                          <div style={{fontSize:10,color:"#444",marginTop:2}}>{co.departments.find(d=>d.id===o.deptId)?.name} · {o.period}</div>
                        </div>
                        <div style={{fontSize:18,fontWeight:900,color:clr(o.progress)}}>{o.progress}٪</div>
                      </div>
                      <Bar value={o.progress} color={clr(o.progress)} height={6}/>
                      <div style={{marginTop:10,display:"grid",gap:5}}>
                        {o.keyResults.map(kr=>(
                          <div key={kr.id} style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:4,height:4,borderRadius:"50%",background:clr(kr.progress),flexShrink:0}}/>
                            <span style={{flex:1,fontSize:10,color:"#666"}}>{kr.title}</span>
                            <span style={{fontSize:10,color:clr(kr.progress),fontWeight:700}}>{kr.progress}٪</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical tasks */}
              {filteredTasks.filter(t=>t.priority==="critical"&&t.status!=="done").length>0&&(
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#FF4757",marginBottom:12}}>⚠ مهام حرجة تحتاج انتباهك</div>
                  {filteredTasks.filter(t=>t.priority==="critical"&&t.status!=="done").map(t=>(
                    <div key={t.id} onClick={()=>setTaskOv(t)}
                      style={{background:"#1a0a0a",border:"1px solid #FF475733",borderRadius:12,padding:"12px 16px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:"#FF4757",flexShrink:0,boxShadow:"0 0 8px #FF4757"}}/>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:12,color:"#fff"}}>{t.title}</div>
                        <div style={{fontSize:10,color:"#555",marginTop:2}}>{co.departments.find(d=>d.id===t.deptId)?.name} · {t.due}</div>
                      </div>
                      <Badge label={USERS[t.assignee]?.name||t.assignee} color={USERS[t.assignee]?.color||"#888"}/>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects preview */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:800,color:"#ccc"}}>🚀 المشاريع النشطة</span>
                  <button onClick={()=>setTab("projects")} style={{background:"none",border:"none",color:color,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>عرض الكل ←</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
                  {filteredProjs.filter(p=>p.status!=="done").slice(0,4).map(p=>{
                    const prog=p.steps?.length?Math.round(p.steps.filter(s=>s.done).length/p.steps.length*100):p.progress;
                    return(
                      <div key={p.id} onClick={()=>setProjOv(p)}
                        style={{background:"#0d0d1f",border:`1px solid ${SC[p.status]}28`,borderRadius:13,padding:"14px 16px",cursor:"pointer"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <span style={{fontWeight:700,fontSize:12,color:"#fff",flex:1,marginLeft:8}}>{p.title}</span>
                          <Badge label={SL[p.status]} color={SC[p.status]}/>
                        </div>
                        <div style={{fontSize:10,color:"#444",marginBottom:10}}>{co.departments.find(d=>d.id===p.deptId)?.name}</div>
                        <Bar value={prog} color={SC[p.status]} height={5}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                          <span style={{fontSize:10,color:"#444"}}>{p.steps?.filter(s=>s.done).length||0}/{p.steps?.length||0} خطوة</span>
                          <span style={{fontSize:10,fontWeight:700,color:SC[p.status]}}>{prog}٪</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ OKRs ══ */}
          {tab==="okrs"&&(
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#ccc",marginBottom:16}}>🎯 الأهداف والنتائج الرئيسية (OKRs)</div>
              <div style={{display:"grid",gap:16}}>
                {filteredOkrs.map(o=>(
                  <div key={o.id} style={{background:"#0d0d1f",border:`1px solid ${color}22`,borderRadius:16,overflow:"hidden"}}>
                    <div style={{padding:"16px 20px",background:`${color}08`,borderBottom:"1px solid #111128"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                        <div>
                          <div style={{fontWeight:800,fontSize:14,color:"#fff"}}>{o.title}</div>
                          <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
                            <Badge label={co.departments.find(d=>d.id===o.deptId)?.name||o.deptId} color={color}/>
                            <Badge label={o.period} color="#4C9BE8"/>
                            <Badge label={o.type} color="#888"/>
                          </div>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:28,fontWeight:900,color:clr(o.progress)}}>{o.progress}٪</div>
                          <div style={{fontSize:9,color:"#444"}}>إنجاز</div>
                        </div>
                      </div>
                      <div style={{marginTop:12}}>
                        <Bar value={o.progress} color={clr(o.progress)} height={8}/>
                        <div style={{fontSize:10,color:"#444",marginTop:4}}>{fmtN(o.current,o.unit)} من {fmtN(o.target,o.unit)} {o.unit}</div>
                      </div>
                    </div>
                    <div style={{padding:"14px 20px"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:10}}>النتائج الرئيسية</div>
                      {o.keyResults.map(kr=>(
                        <div key={kr.id} style={{marginBottom:12}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                            <span style={{fontSize:12,color:"#ccc"}}>{kr.title}</span>
                            <span style={{fontSize:11,fontWeight:700,color:clr(kr.progress)}}>{kr.progress}٪</span>
                          </div>
                          <Bar value={kr.progress} color={clr(kr.progress)} height={5}/>
                          <div style={{fontSize:10,color:"#444",marginTop:3}}>{kr.current}{kr.unit?` ${kr.unit}`:""} من {kr.target}{kr.unit?` ${kr.unit}`:""}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PROJECTS ══ */}
          {tab==="projects"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:13,fontWeight:800,color:"#ccc"}}>🚀 المشاريع ({filteredProjs.length})</span>
                {isAdmin&&<Btn label="+ مشروع جديد" onClick={()=>setProjOv(newProjTemplate())} color={color} small/>}
              </div>
              <div style={{display:"grid",gap:12}}>
                {filteredProjs.map(p=>{
                  const prog=p.steps?.length?Math.round(p.steps.filter(s=>s.done).length/p.steps.length*100):p.progress;
                  const dept=co.departments.find(d=>d.id===p.deptId);
                  return(
                    <div key={p.id} style={{background:"#0d0d1f",border:`1px solid ${SC[p.status]}28`,borderRadius:14,overflow:"hidden"}}>
                      <div style={{padding:"14px 18px",cursor:"pointer"}} onClick={()=>setProjOv({...p})}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:4}}>{p.title}</div>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              <Badge label={SL[p.status]} color={SC[p.status]}/>
                              <Badge label={PL[p.priority]} color={PC[p.priority]}/>
                              {dept&&<Badge label={`${dept.icon} ${dept.name}`} color={color}/>}
                            </div>
                          </div>
                          <div style={{fontSize:22,fontWeight:900,color:SC[p.status],flexShrink:0}}>{prog}٪</div>
                        </div>
                        {p.description&&<div style={{fontSize:11,color:"#555",marginBottom:10,lineHeight:1.5}}>{p.description}</div>}
                        <Bar value={prog} color={SC[p.status]} height={6}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:"#444"}}>
                          <span>{p.steps?.filter(s=>s.done).length||0} / {p.steps?.length||0} خطوة مكتملة</span>
                          <span>{USERS[p.assignee]?.name||p.assignee} · {p.dueDate}</span>
                        </div>
                      </div>
                      {/* Steps mini preview */}
                      {p.steps?.length>0&&(
                        <div style={{padding:"10px 18px",borderTop:"1px solid #111128",display:"flex",gap:6,overflowX:"auto"}}>
                          {p.steps.map((s,i)=>(
                            <div key={s.id} style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                              <div style={{width:16,height:16,borderRadius:"50%",background:s.done?SC["done"]:"#1e1e35",border:`1px solid ${s.done?SC["done"]:"#2a2a45"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:900}}>{s.done?"✓":i+1}</div>
                              <span style={{fontSize:9,color:s.done?"#4CC97A":"#555",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</span>
                              {i<p.steps.length-1&&<span style={{color:"#2a2a45",fontSize:10}}>›</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ TASKS ══ */}
          {tab==="tasks"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                <span style={{fontSize:13,fontWeight:800,color:"#ccc"}}>✅ المهام ({filteredTasks.length})</span>
                <Btn label="+ مهمة جديدة" onClick={()=>setTaskOv(newTaskTemplate())} color={color} small/>
              </div>

              {/* Group by status */}
              {["critical","high","medium","low"].map(prio=>{
                const grp=filteredTasks.filter(t=>t.priority===prio&&t.status!=="done");
                if(!grp.length)return null;
                return(
                  <div key={prio} style={{marginBottom:20}}>
                    <div style={{fontSize:10,color:PC[prio],fontWeight:800,letterSpacing:1.5,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:PC[prio],boxShadow:`0 0 6px ${PC[prio]}`}}/>
                      {PL[prio].toUpperCase()} ({grp.length})
                    </div>
                    {grp.map(t=>{
                      const dept=co.departments.find(d=>d.id===t.deptId);
                      const subDone=t.subtasks?.filter(s=>s.done).length||0;
                      const subTotal=t.subtasks?.length||0;
                      const au=USERS[t.assignee];
                      return(
                        <div key={t.id} onClick={()=>setTaskOv({...t})}
                          style={{background:"#0d0d1f",border:`1px solid ${PC[t.priority]}28`,borderRadius:12,padding:"12px 16px",marginBottom:8,cursor:"pointer",transition:"border-color .2s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=PC[t.priority]+"66"}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=PC[t.priority]+"28"}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:600,fontSize:12,color:"#fff",marginBottom:5}}>{t.title}</div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                <Badge label={SL[t.status]} color={SC[t.status]}/>
                                {dept&&<span style={{fontSize:9,color:"#444"}}>{dept.icon} {dept.name}</span>}
                              </div>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                              {au&&<Badge label={au.name} color={au.color}/>}
                              {t.due&&<span style={{fontSize:9,color:"#444"}}>{t.due}</span>}
                            </div>
                          </div>
                          {subTotal>0&&(
                            <div style={{marginTop:8}}>
                              <Bar value={Math.round(subDone/subTotal*100)} color={color} height={3}/>
                              <div style={{fontSize:9,color:"#444",marginTop:3}}>{subDone}/{subTotal} خطوة</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Done tasks */}
              {filteredTasks.filter(t=>t.status==="done").length>0&&(
                <div>
                  <div style={{fontSize:10,color:"#4CC97A",fontWeight:800,letterSpacing:1.5,marginBottom:8}}>✓ مكتملة ({filteredTasks.filter(t=>t.status==="done").length})</div>
                  {filteredTasks.filter(t=>t.status==="done").map(t=>(
                    <div key={t.id} onClick={()=>setTaskOv({...t})}
                      style={{background:"#0a0a14",border:"1px solid #1a1a2e",borderRadius:12,padding:"10px 16px",marginBottom:6,cursor:"pointer",opacity:.6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{color:"#4CC97A",fontSize:12}}>✓</span>
                        <span style={{fontSize:11,color:"#555",textDecoration:"line-through"}}>{t.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ KPIs ══ */}
          {tab==="kpis"&&(
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#ccc",marginBottom:16}}>📈 مؤشرات الأداء ({filteredKpis.length})</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
                {filteredKpis.map(k=>{
                  const p=pct(k.value,k.target);
                  const dept=co.departments.find(d=>d.id===k.deptId);
                  return(
                    <div key={k.id} onClick={()=>isAdmin&&setKpiOv({...k})}
                      style={{background:"#0d0d1f",border:`1px solid ${clr(p)}28`,borderRadius:14,padding:"16px",cursor:isAdmin?"pointer":"default",transition:"border-color .2s"}}
                      onMouseEnter={e=>{if(isAdmin)e.currentTarget.style.borderColor=color+"66";}}
                      onMouseLeave={e=>{if(isAdmin)e.currentTarget.style.borderColor=clr(p)+"28";}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{fontSize:10,color:"#555",fontWeight:600,flex:1}}>{k.label}</div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                          {dept&&<span style={{fontSize:8,color:"#333"}}>{dept.icon}</span>}
                          <Badge label={k.period} color="#444" bg="#1a1a2e"/>
                        </div>
                      </div>
                      <div style={{fontSize:26,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:4}}>
                        {fmtN(k.value,k.unit)}<span style={{fontSize:11,color:"#555",fontWeight:400}}> {k.unit}</span>
                      </div>
                      <div style={{fontSize:10,color:"#444",marginBottom:8}}>الهدف: {fmtN(k.target,k.unit)} {k.unit}</div>
                      <Bar value={p} color={clr(p)} height={5}/>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                        <span style={{fontSize:10,color:k.trendUp?"#4CC97A":"#FF4757"}}>{k.trendUp?"↑":"↓"} {Math.abs(k.trend)}{k.unit==="٪"?"نقطة":""}</span>
                        <span style={{fontSize:10,fontWeight:700,color:clr(p)}}>{p}٪</span>
                      </div>
                      {isAdmin&&<div style={{fontSize:9,color:"#333",marginTop:4,textAlign:"center"}}>اضغط للتعديل ✎</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ MEETINGS ══ */}
          {tab==="meetings"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:13,fontWeight:800,color:"#ccc"}}>📅 الاجتماعات</span>
                <Btn label="+ اجتماع جديد" onClick={()=>setMeetOv(newMeetTemplate())} color={color} small/>
              </div>

              {/* Upcoming */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:10,color:"#4CC97A",fontWeight:800,letterSpacing:1.5,marginBottom:10}}>📌 قادمة</div>
                {co.meetings.filter(m=>m.status==="upcoming").map(m=>(
                  <div key={m.id} onClick={()=>setMeetOv({...m})}
                    style={{background:"#0d1a0d",border:"1px solid #4CC97A33",borderRadius:13,padding:"14px 18px",marginBottom:10,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:"#fff"}}>{m.title}</div>
                        <div style={{fontSize:10,color:"#555",marginTop:3}}>{m.date} · {m.time}</div>
                      </div>
                      <Badge label={m.type} color="#4CC97A"/>
                    </div>
                    {m.agenda.length>0&&(
                      <div style={{marginTop:10}}>
                        <div style={{fontSize:10,color:"#444",marginBottom:5}}>أجندة:</div>
                        {m.agenda.map((a,i)=>(
                          <div key={i} style={{fontSize:11,color:"#888",marginBottom:3}}>• {a}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {co.meetings.filter(m=>m.status==="upcoming").length===0&&(
                  <div style={{fontSize:12,color:"#333",padding:"20px",textAlign:"center"}}>لا توجد اجتماعات قادمة</div>
                )}
              </div>

              {/* Past */}
              {co.meetings.filter(m=>m.status==="done").length>0&&(
                <div>
                  <div style={{fontSize:10,color:"#555",fontWeight:800,letterSpacing:1.5,marginBottom:10}}>✓ منتهية</div>
                  {co.meetings.filter(m=>m.status==="done").map(m=>(
                    <div key={m.id} onClick={()=>setMeetOv({...m})}
                      style={{background:"#0a0a14",border:"1px solid #1a1a2e",borderRadius:13,padding:"14px 18px",marginBottom:8,cursor:"pointer",opacity:.7}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:12,color:"#888"}}>{m.title}</div>
                          <div style={{fontSize:10,color:"#444",marginTop:2}}>{m.date}</div>
                        </div>
                        {m.decisions.length>0&&<Badge label={`${m.decisions.length} قرار`} color="#4CC97A"/>}
                      </div>
                      {m.decisions.length>0&&(
                        <div style={{marginTop:8}}>
                          {m.decisions.slice(0,2).map((d,i)=><div key={i} style={{fontSize:10,color:"#555",marginBottom:2}}>✓ {d}</div>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div style={{display:"flex",background:"#0a0a1c",borderTop:"1px solid #151530",padding:"8px 4px",position:"sticky",bottom:0,zIndex:80,justifyContent:"space-around"}}>
        {TABS.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 8px",borderRadius:8,flex:1,fontFamily:"inherit"}}>
            <span style={{fontSize:16}}>{t.i}</span>
            <span style={{fontSize:8,color:tab===t.k?color:"#444",fontWeight:tab===t.k?700:400}}>{t.l}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════ */
export default function App(){
  const [user,setUser]=useState(()=>{try{const s=sessionStorage.getItem(OK);return s?JSON.parse(s):null;}catch{return null;}});
  const login=u=>{setUser(u);try{sessionStorage.setItem(OK,JSON.stringify(u));}catch{}};
  const logout=()=>{setUser(null);try{sessionStorage.removeItem(OK);}catch{}};
  if(!user)return<Login onLogin={login}/>;
  return<Dashboard user={user} onLogout={logout}/>;
}
