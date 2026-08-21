const $=s=>document.querySelector(s);
function setTheme(){
  if(localStorage.getItem("theme")==="light") document.body.classList.add("light");
}
setTheme();
$("#adminTheme")?.addEventListener("click",()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("theme",document.body.classList.contains("light")?"light":"dark");
});

async function api(url, options={}){
  const r=await fetch(url,{credentials:"include",...options});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||"Request failed");
  return data;
}
async function load(){
  try{
    const data=await api("/api/admin/requests");
    $("#loginPanel").hidden=true; $("#dashboard").hidden=false;
    render(data.requests||[]);
  }catch(e){
    $("#loginPanel").hidden=false; $("#dashboard").hidden=true;
  }
}
function render(items){
  $("#total").textContent=items.length;
  $("#newCount").textContent=items.filter(x=>x.status==="New").length;
  $("#working").textContent=items.filter(x=>x.status==="Working").length;
  $("#done").textContent=items.filter(x=>x.status==="Completed").length;
  const box=$("#requests"); box.innerHTML="";
  if(!items.length){box.innerHTML='<div class="empty">No project requests yet.</div>';return}
  items.forEach(x=>{
    const el=document.createElement("article"); el.className="request-card";
    el.innerHTML=`
      <div class="request-top"><div><small>${escapeHtml(x.websiteType||"Project")}</small><h3>${escapeHtml(x.name)}</h3></div>
      <select class="status-select"><option ${x.status==="New"?"selected":""}>New</option><option ${x.status==="Contacted"?"selected":""}>Contacted</option><option ${x.status==="Working"?"selected":""}>Working</option><option ${x.status==="Completed"?"selected":""}>Completed</option></select></div>
      <div class="request-meta"><span>✉ ${escapeHtml(x.email)}</span><span>☎ ${escapeHtml(x.phone||"Not provided")}</span><span>৳ ${escapeHtml(x.budget||"Not decided")}</span></div>
      <p>${escapeHtml(x.message)}</p>
      <textarea class="note" placeholder="Private note...">${escapeHtml(x.note||"")}</textarea>
      <div class="request-actions"><a class="btn ghost" href="mailto:${encodeURIComponent(x.email)}">Email</a>${x.phone?`<a class="btn ghost" href="https://wa.me/${x.phone.replace(/[^0-9]/g,'')}" target="_blank" rel="noopener">WhatsApp</a>`:""}<button class="btn primary save">Save</button><button class="danger delete">Delete</button></div>`;
    el.querySelector(".save").onclick=async()=>{await api("/api/admin/requests/"+x._id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:el.querySelector(".status-select").value,note:el.querySelector(".note").value})});load()};
    el.querySelector(".delete").onclick=async()=>{if(confirm("Delete this request?")){await api("/api/admin/requests/"+x._id,{method:"DELETE"});load()}};
    box.appendChild(el);
  });
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

$("#loginForm")?.addEventListener("submit",async e=>{
  e.preventDefault(); const status=$("#loginStatus");
  try{await api("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(e.target).entries()))});e.target.reset();load()}
  catch(err){status.textContent="✕ "+err.message}
});
$("#logout")?.addEventListener("click",async()=>{await api("/api/admin/logout",{method:"POST"});location.reload()});
load();