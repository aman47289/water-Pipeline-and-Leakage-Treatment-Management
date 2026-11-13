const $=id=>document.getElementById(id);
const N={1:["Depot",64,180],2:["Hill Reservoir",185,76],3:["Ring Road",185,285],4:["Central Valve",310,180],5:["Sector 5",432,70],6:["Market Chowk",438,290],7:["Canal Bend",570,180],8:["Tank Road",312,338]};
const E=[["P1",1,2,1.2],["P2",1,3,1.4],["P3",2,4,1.6],["P4",3,4,1.1],["P5",4,5,1.8],["P6",4,6,1.5],["P7",5,7,1.3],["P8",6,7,1.2],["P9",3,8,1.0],["P10",8,6,1.7],["P11",2,5,2.4]];
let L=[{id:"L-101",pipe:"P6",sev:5,area:4,wait:20,st:"Open"},{id:"L-102",pipe:"P3",sev:4,area:3,wait:9,st:"Open"},{id:"L-103",pipe:"P10",sev:3,area:2,wait:30,st:"Open"},{id:"L-104",pipe:"P8",sev:2,area:2,wait:5,st:"In progress"}];
const WEEK=[["Mon",3],["Tue",5],["Wed",2],["Thu",6],["Fri",4],["Sat",7],["Sun",4]];
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
const sevName=s=>s>=5?"Critical":s==4?"High":s==3?"Medium":"Low";
const S={ws:5,wa:2,hp:4,cap:10};
const bonus=w=>Math.min(S.cap,Math.floor(w/S.hp));
const score=l=>S.ws*l.sev+S.wa*l.area+bonus(l.wait);
const pipeById=Object.fromEntries(E.map(e=>[e[0],e]));
const leakOn=p=>L.find(l=>l.pipe==p&&l.st!="Resolved");
const nm=e=>N[e[1]][0]+" to "+N[e[2]][0];
const tel={inflow:4.2,pressure:3.1};

class Heap{constructor(c){this.a=[];this.c=c}
push(x){const a=this.a;a.push(x);let i=a.length-1;while(i>0){const p=(i-1)>>1;if(this.c(a[i],a[p])<0){[a[i],a[p]]=[a[p],a[i]];i=p}else break}}
pop(){const a=this.a;if(!a.length)return;const top=a[0],last=a.pop();if(a.length){a[0]=last;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<a.length&&this.c(a[l],a[m])<0)m=l;if(r<a.length&&this.c(a[r],a[m])<0)m=r;if(m==i)break;[a[i],a[m]]=[a[m],a[i]];i=m}}return top}
get size(){return this.a.length}}
function dijkstra(src){const d={},prev={};Object.keys(N).forEach(k=>d[k]=Infinity);d[src]=0;const h=new Heap((x,y)=>x[0]-y[0]);h.push([0,src]);
while(h.size){const [dist,u]=h.pop();if(dist>d[u])continue;E.forEach(e=>{if(!M[e[0]].on)return;let v=null;if(e[1]==u)v=e[2];else if(e[2]==u)v=e[1];if(v==null)return;const nd=dist+e[3];if(nd<d[v]){d[v]=nd;prev[v]=u;h.push([nd,v])}})}
return {d,prev}}
function pathTo(prev,t){const p=[+t];while(prev[p[0]]!=null)p.unshift(+prev[p[0]]);return p}

const IC=[["Dashboard","top",'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'],
["Network","network",'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 7l8 1M7 8l4 8M17 10l-4 6"/>'],
["Repair queue","queue",'<path d="M4 6h16M4 12h10M4 18h6"/>'],
["Analytics","analytics",'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>'],
["Pipes",0,'<path d="M3 9h10a4 4 0 014 4v6"/>'],["Leak reports",0,'<path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z"/>'],["Settings",0,'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>']];
$("nav").innerHTML=IC.map((n,i)=>`<button ${n[1]?`data-go="${n[1]}"`:'disabled title="Planned"'} class="${i?"":"on"}"><svg viewBox="0 0 24 24" aria-hidden="true">${n[2]}</svg>${n[0]}</button>`).join("");
document.querySelectorAll("nav button[data-go]").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.remove("on"));b.classList.add("on");$(b.dataset.go).scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})});

function spark(a){const mx=Math.max(...a),mn=Math.min(...a),r=mx-mn||1;
return `<svg class="sp" viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true"><polyline points="${a.map((v,i)=>(i*100/(a.length-1))+","+(32-(v-mn)/r*28)).join(" ")}" fill="none" stroke="var(--c)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`}

function drawMap(route,selPipe){let s="",m="";
E.forEach(e=>{const a=N[e[1]],b=N[e[2]],l=leakOn(e[0]),cls=!M[e[0]].on?"off":l?(l.st=="Open"?sevName(l.sev):"repair"):"",c=`x1="${a[1]}" y1="${a[2]}" x2="${b[1]}" y2="${b[2]}"`;
s+=`<line class="pb ${selPipe==e[0]?"sel":""} ${cls=="off"?"off":""}" data-pipe="${e[0]}" tabindex="0" role="button" aria-label="Pipe ${e[0]}, ${nm(e)}" ${c}/><line class="pf ${cls}" ${c}/>`;
if(l&&l.st=="Open")m+=`<g style="--c:var(--${l.sev>=5?"red":"amb"})"><circle class="pulse" cx="${(a[1]+b[1])/2}" cy="${(a[2]+b[2])/2}" r="8"/><circle cx="${(a[1]+b[1])/2}" cy="${(a[2]+b[2])/2}" r="5" fill="var(--c)"/></g>`});
if(route){const pts=route.map(k=>N[k][1]+","+N[k][2]);s+=`<polyline class="route" points="${pts.join(" ")}"/>`;
if(!reduce)s+=`<circle r="6" fill="var(--acc)" style="filter:drop-shadow(0 0 8px var(--acc))"><animateMotion dur="3.5s" repeatCount="indefinite" path="M${pts.join(" L")}"/></circle>`}
Object.entries(N).forEach(([k,n])=>{s+=`<circle class="node" cx="${n[1]}" cy="${n[2]}" r="${k==1?11:7}" ${k==1?'style="stroke:var(--acc);stroke-width:4"':""}/><text class="lbl" x="${n[1]}" y="${n[2]+(n[2]>200?27:-15)}" text-anchor="middle">${n[0]}</text>`});
$("map").innerHTML=s+m;
$("map").querySelectorAll(".pb").forEach(el=>{const go=()=>pickPipe(el.dataset.pipe);el.onclick=go;el.onkeydown=ev=>{if(ev.key=="Enter"||ev.key==" "){ev.preventDefault();go()}}})}

function pickPipe(id){const e=pipeById[id],l=leakOn(id);
$("info").innerHTML=`<span><b>Pipe ${id}</b>: ${nm(e)}, ${e[3]} km. ${l?`Leak ${l.id}, ${sevName(l.sev)}, ${l.st.toLowerCase()}.`:"No active leak."}</span>`;
document.querySelectorAll("tr.row").forEach(r=>r.classList.remove("on"));drawMap(null,id)}

function pickLeak(id){const l=L.find(x=>x.id==id),e=pipeById[l.pipe],{d,prev}=dijkstra(1),t=d[e[1]]<=d[e[2]]?e[1]:e[2],p=pathTo(prev,t);if(!isFinite(d[t])){$("info").textContent="No active route from the depot to pipe "+l.pipe+". Reactivate a connecting pipe.";return}
$("info").innerHTML=`<span><b>Route for ${l.id}</b>: ${p.map(k=>N[k][0]).join(" → ")}, ${d[t].toFixed(1)} km from the depot.</span>`+(l.st=="Open"?`<button class="btn go" id="dsp">Dispatch crew</button>`:"");
if($("dsp"))$("dsp").onclick=()=>{l.st="In progress";render();$("info").innerHTML=`<span><b>${l.id}</b> dispatched. Crew is on the way, ${d[t].toFixed(1)} km from the depot.</span>`;drawMap(p,l.pipe)};
document.querySelectorAll("tr.row").forEach(r=>r.classList.toggle("on",r.dataset.leak==id));drawMap(p,l.pipe)}

function paintTel(){const act=L.filter(l=>l.st!="Resolved");
$("tel").innerHTML=`<p><span>Inflow</span><b>${tel.inflow.toFixed(2)} ML/day</b></p><p><span>Average pressure</span><b>${tel.pressure.toFixed(2)} bar</b></p><p><span>Estimated loss (demo)</span><b>${Math.round(act.reduce((s,l)=>s+l.sev*l.sev*1.5,0))} L/min</b></p>`}

function render(){
const open=L.filter(l=>l.st=="Open"),prog=L.filter(l=>l.st=="In progress"),crit=open.filter(l=>l.sev>=5).length;
$("kpis").innerHTML=[["Total pipes",E.length,[11,11,11,11,11,11],"flow"],["Active leaks",open.length+prog.length,[2,3,3,4,3,4],"amb"],["Critical leaks",crit,[0,1,1,1,1,1],"red"],["Repairs in progress",prog.length,[0,0,1,0,1,1],"acc"]].map(k=>`<div class="card kpi" style="--c:var(--${k[3]})"><div><b>${k[1]}</b><span>${k[0]}</span></div>${spark(k[2].concat(k[1]))}</div>`).join("");
const health=Math.max(0,Math.min(100,Math.round(100-2.5*open.reduce((s,l)=>s+l.sev,0)-prog.reduce((s,l)=>s+l.sev,0)))),col=health>=80?"acc":health>=60?"amb":"red",C=2*Math.PI*52;
$("gauge").innerHTML=`<circle cx="70" cy="70" r="52" fill="none" stroke="var(--pipe)" stroke-width="12"/><circle cx="70" cy="70" r="52" fill="none" stroke="var(--${col})" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C*health/100} ${C}" transform="rotate(-90 70 70)" style="filter:drop-shadow(0 0 6px var(--${col}))"/><text class="n" x="70" y="80" text-anchor="middle">${health}</text>`;
$("state").textContent=health>=80?"Stable":health>=60?"Degraded":"At risk";$("state").style.color=`var(--${col})`;
const mx=Math.max(...WEEK.map(w=>w[1]));
$("bars").innerHTML=WEEK.map(w=>`<div><b>${w[1]}</b><span style="height:${w[1]/mx*84}px"></span>${w[0]}</div>`).join("");
const h=new Heap((a,b)=>score(b)-score(a));open.forEach(l=>h.push(l));
let rows="",r=1;while(h.size){const l=h.pop();rows+=`<tr class="row" tabindex="0" data-leak="${l.id}"><td>${r++}</td><td>${l.id}</td><td>${nm(pipeById[l.pipe])}</td><td><span class="badge b-${sevName(l.sev)}">${sevName(l.sev)}</span></td><td class="score">${score(l)}</td><td class="calc">${S.ws}×${l.sev} + ${S.wa}×${l.area} + ${bonus(l.wait)}</td><td>${l.wait} h</td></tr>`}
$("rows").innerHTML=rows||`<tr><td colspan="7">No open leaks. New reports will appear here.</td></tr>`;
$("prog").textContent=prog.length?"Crews on site: "+prog.map(l=>l.id+" at "+nm(pipeById[l.pipe])).join("; ")+".":"No crews on site.";
$("rows").querySelectorAll(".row").forEach(el=>{const go=()=>pickLeak(el.dataset.leak);el.onclick=go;el.onkeydown=ev=>{if(ev.key=="Enter"||ev.key==" "){ev.preventDefault();go()}}});
$("fml").textContent=`Most urgent first. Score = ${S.ws} × severity + ${S.wa} × affected area + waiting bonus (1 point per ${S.hp} hours, up to ${S.cap}).`;paintTel();drawMap()}

let seq=105;
$("sim").onclick=()=>{const free=E.filter(e=>!leakOn(e[0]));if(!free.length){$("info").textContent="Every pipe already has a leak report.";return}
const e=free[Math.random()*free.length|0],l={id:"L-"+(seq++),pipe:e[0],sev:1+(Math.random()*5|0),area:1+(Math.random()*5|0),wait:Math.random()*12|0,st:"Open"};L.push(l);render();pickLeak(l.id)};
$("th").onclick=()=>{const r=document.documentElement,cur=r.dataset.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");r.dataset.theme=cur=="dark"?"light":"dark"};
const tick=()=>$("clock").textContent=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});
tick();setInterval(tick,1000);

/* pipe metadata, views and forms */
const MAT=["PVC","Cast iron","HDPE","Steel"],M={};
E.forEach((e,i)=>M[e[0]]={mat:MAT[i%4],dia:[150,200,250,300][i%4],on:true});
const esc=t=>t.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const msg=(id,t)=>{$(id).textContent=t};
const pstat=e=>{const l=leakOn(e[0]);return !M[e[0]].on?"Inactive":l?(l.st=="Open"?"Leaking":"Under repair"):"Normal"};
const pcol={Normal:"flow",Leaking:"red","Under repair":"acc",Inactive:"mut"};
const jopts=Object.entries(N).map(([k,n])=>`<option value="${k}">${n[0]}</option>`).join("");
$("fa").innerHTML=jopts;$("fb").innerHTML=jopts;$("fb").selectedIndex=1;

function renderPipes(){const q=$("pq").value.trim().toLowerCase(),f=$("pf").value;
const rows=E.filter(e=>{const s=pstat(e);return (f=="All"||s==f)&&(e[0]+" "+nm(e)+" "+M[e[0]].mat).toLowerCase().includes(q)});
$("prows").innerHTML=rows.map(e=>{const s=pstat(e);return `<tr><td>${e[0]}</td><td>${nm(e)}</td><td>${M[e[0]].mat}</td><td>${M[e[0]].dia} mm</td><td>${e[3]} km</td><td><span class="badge" style="--c:var(--${pcol[s]})">${s}</span></td><td><button class="btn" data-t="${e[0]}">${M[e[0]].on?"Deactivate":"Activate"}</button></td></tr>`}).join("")||`<tr><td colspan="7">No pipes match. Clear the search or change the filter.</td></tr>`;
$("prows").querySelectorAll("button").forEach(b=>b.onclick=()=>{const id=b.dataset.t;if(M[id].on&&leakOn(id))return msg("pmsg",`Pipe ${id} has an active leak. Resolve it before deactivating.`);M[id].on=!M[id].on;msg("pmsg","");renderPipes();render()})}
$("pq").oninput=renderPipes;$("pf").onchange=renderPipes;
$("padd").onclick=()=>{const a=+$("fa").value,b=+$("fb").value,km=parseFloat($("fl").value),dia=parseInt($("fd").value);
if(a==b)return msg("pmsg","Choose two different junctions.");
if(!(km>0)||!(dia>0))return msg("pmsg","Enter a length and a diameter greater than zero.");
if(E.some(e=>(e[1]==a&&e[2]==b)||(e[1]==b&&e[2]==a)))return msg("pmsg","These junctions are already connected.");
const id="P"+(E.length+1),e=[id,a,b,km];E.push(e);pipeById[id]=e;M[id]={mat:$("fm").value,dia,on:true};
msg("pmsg",`Added ${id}: ${nm(e)}.`);$("fl").value="";renderPipes();render()};

function fillSel(){const cur=$("lp").value;$("lp").innerHTML=`<option value="">Select a pipe</option>`+E.filter(e=>M[e[0]].on).map(e=>`<option value="${e[0]}">${e[0]} – ${nm(e)}</option>`).join("");$("lp").value=cur}
function renderLeaks(){const sc={Open:"amb","In progress":"acc",Resolved:"flow"};
$("lrows").innerHTML=L.slice().reverse().map(l=>`<tr><td>${l.id}</td><td>${nm(pipeById[l.pipe])}${l.desc?`<div class="calc">${esc(l.desc)}</div>`:""}</td><td><span class="badge b-${sevName(l.sev)}">${sevName(l.sev)}</span></td><td><span class="badge" style="--c:var(--${sc[l.st]})">${l.st}</span></td><td class="score">${score(l)}</td><td>${l.wait} h</td><td>${l.st=="Open"?`<button class="btn" data-a="d" data-id="${l.id}">Dispatch crew</button>`:l.st=="In progress"?`<button class="btn" data-a="r" data-id="${l.id}">Mark resolved</button>`:"Done"}</td></tr>`).join("");
$("lrows").querySelectorAll("button").forEach(b=>b.onclick=()=>{const l=L.find(x=>x.id==b.dataset.id);l.st=b.dataset.a=="d"?"In progress":"Resolved";renderLeaks();fillSel();render()})}
$("ladd").onclick=()=>{const p=$("lp").value,sev=+$("ls").value,area=+$("la").value;
if(!p||!sev||!area)return msg("lmsg","Choose a pipe, a severity and an affected area.");
const ex=leakOn(p);if(ex)return msg("lmsg",`Pipe ${p} already has an active report (${ex.id}).`);
const l={id:"L-"+(seq++),pipe:p,sev,area,wait:0,st:"Open",desc:$("ld").value.trim()};L.push(l);
const rank=L.filter(x=>x.st=="Open").sort((x,y)=>score(y)-score(x)).indexOf(l)+1;
msg("lmsg",`Reported ${l.id}. Priority score ${score(l)}, rank ${rank} in the repair queue.`);$("ld").value="";$("lp").value="";$("ls").value="";$("la").value="";renderLeaks();fillSel();render()};

["s1","s2","s3","s4"].forEach((id,i)=>$(id).oninput=()=>{S[["ws","wa","hp","cap"][i]]=Math.max(i==2?1:0,parseFloat($(id).value)||0);render()});
$("srst").onclick=()=>{Object.assign(S,{ws:5,wa:2,hp:4,cap:10});["s1","s2","s3","s4"].forEach((id,i)=>$(id).value=[5,2,4,10][i]);render()};
document.querySelectorAll("[data-th]").forEach(b=>b.onclick=()=>{const t=b.dataset.th,r=document.documentElement;t?r.dataset.theme=t:r.removeAttribute("data-theme")});

const KEY=["v:dash","g:network","g:queue","g:analytics","v:pipes","v:leaks","v:set"];
function show(v){["dash","pipes","leaks","set"].forEach(k=>$("v-"+k).hidden=k!=v);
const T={dash:["Network control room",`Live view of ${E.length} pipes across ${Object.keys(N).length} junctions. Sample data for the prototype.`],pipes:["Pipe records","Search, add and deactivate pipes. Inactive pipes are skipped when planning crew routes."],leaks:["Leak reports","Report a leak and move it from open to resolved."],set:["Settings","Tune how repairs are prioritised and how the console looks."]}[v];
$("ttl").textContent=T[0];$("sbt").textContent=T[1];
if(v=="pipes")renderPipes();if(v=="leaks"){renderLeaks();fillSel()}if(v=="dash")render()}
function go(k){const [t,x]=k.split(":");document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.k==k));
if(t=="v")show(x);else{show("dash");$(x).scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"})}}
$("nav").innerHTML=IC.map((n,i)=>`<button data-k="${KEY[i]}" class="${i?"":"on"}"><svg viewBox="0 0 24 24" aria-hidden="true">${n[2]}</svg>${n[0]}</button>`).join("");
document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>go(b.dataset.k));
if(!reduce){const bg=document.querySelector(".bg");for(let i=0;i<16;i++){const b=document.createElement("b"),z=6+Math.random()*18;b.style.cssText=`left:${Math.random()*100}%;width:${z}px;height:${z}px;animation-duration:${14+Math.random()*16}s;animation-delay:-${Math.random()*24}s`;bg.appendChild(b)}}
setInterval(()=>{tel.inflow=4.2+(Math.random()-.5)*.2;tel.pressure=3.1+(Math.random()-.5)*.15;paintTel()},2200);
render();
