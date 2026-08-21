const $ = s => document.querySelector(s);

window.addEventListener("load", () => setTimeout(() => $("#boot")?.classList.add("hide"), 900));

const themeBtn = $("#themeBtn");
const savedTheme = localStorage.getItem("theme");
if(savedTheme === "light") document.body.classList.add("light");
themeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
});

$("#menuBtn")?.addEventListener("click", () => $("#nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => $("#nav").classList.remove("open")));

const words = ["design()", "build()", "ship()", "repeat()"];
let wi=0, ci=0, deleting=false;
function type(){
  const el=$("#typed"); if(!el) return;
  const w=words[wi];
  el.textContent = deleting ? w.slice(0,ci--) : w.slice(0,ci++);
  if(!deleting && ci>w.length){deleting=true;setTimeout(type,900);return}
  if(deleting && ci<0){deleting=false;wi=(wi+1)%words.length;ci=0}
  setTimeout(type,deleting?45:90);
}
type();

document.querySelectorAll("#filters button").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("#filters button").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  const filter=btn.dataset.filter;
  document.querySelectorAll(".project").forEach(p => p.style.display = filter==="all" || p.dataset.cat===filter ? "" : "none");
}));

const modal=$("#projectModal");
document.querySelectorAll(".project").forEach(card => card.addEventListener("click", e => {
  if(e.target.closest("a")) e.preventDefault();
  $("#modalTitle").textContent=card.dataset.title;
  $("#modalDesc").textContent=card.dataset.desc;
  $("#modalLink").href=card.dataset.link || "#";
  modal.classList.add("show");
}));
$("#closeModal")?.addEventListener("click",()=>modal.classList.remove("show"));
modal?.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("show")});

$("#contactForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const status=$("#formStatus"), btn=e.submitter;
  btn.disabled=true; status.textContent="Sending request...";
  const payload=Object.fromEntries(new FormData(e.target).entries());
  try{
    const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error || "Something went wrong");
    e.target.reset(); status.textContent="✓ Request sent successfully. I'll contact you soon.";
  }catch(err){status.textContent="✕ "+err.message}
  finally{btn.disabled=false}
});