
(function setActiveNav(){
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(a=>{
    if(a.getAttribute("href")===here) a.classList.add("active");
  });
})();


const packages = [
  { id:"HIM-01", destination:"Manali",   durationDays:4, basePrice:12999, season:"winter" },
  { id:"GOA-02", destination:"Goa",      durationDays:5, basePrice:18499, season:"summer" },
  { id:"RAJ-03", destination:"Jaipur–Udaipur", durationDays:6, basePrice:22999, season:"monsoon" }
];

function seasonalMultiplier(season){
  switch(season){
    case "summer":  return 1.20;
    case "winter":  return 0.90;
    case "monsoon": return 0.95;
    default:        return 1.00;
  }
}
function weekendSurcharge(date){
  const d = new Date(date).getDay();        
  return (d===0 || d===6) ? 1.10 : 1.00;    
}
function formatINR(n){ return "₹" + n.toLocaleString("en-IN"); }


function renderPackagesTable(){
  const tbody = document.querySelector("#pkgBody");
  if(!tbody) return;
  tbody.innerHTML = "";
  for(const p of packages){                          // loop
    const final = Math.round(p.basePrice * seasonalMultiplier(p.season));
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.destination}</td>
      <td>${p.durationDays} days</td>
      <td>${formatINR(p.basePrice)}</td>
      <td>${p.season}</td>
      <td><strong>${formatINR(final)}</strong></td>`;
    tbody.appendChild(tr);
  }
}
renderPackagesTable();

const form = document.querySelector("#bookingForm");
const totalEl = document.querySelector("#liveTotal");
const submitBtn = document.querySelector("#submitBtn");

function calcEstimate(){
  if(!form || !totalEl) return;

  const pkgId = form.package.value;
  const pkg   = packages.find(p=>p.id===pkgId);
  const checkIn  = form.checkin.value;
  const checkOut = form.checkout.value;
  const guests   = Number(form.guests.value || 1);
  const code     = (form.promo.value || "").trim().toUpperCase();

  
  if(!pkg || !checkIn || !checkOut){ 
    totalEl.textContent = "Fill package + dates to see total.";
    submitBtn && (submitBtn.disabled = true);
    return;
  }

  const ms = new Date(checkOut) - new Date(checkIn);
  const nights = Math.ceil(ms / (1000*60*60*24));
  if(!Number.isFinite(nights) || nights <= 0){
    totalEl.textContent = "End date must be after start date.";
    submitBtn && (submitBtn.disabled = true);
    return;
  }

  
  const daily = (pkg.basePrice * seasonalMultiplier(pkg.season)) / pkg.durationDays;
  let total = daily * nights;

  
  total *= weekendSurcharge(checkIn);

  
  if(guests > 2) total *= 1.20;

  
  switch(code){
    case "EARLYBIRD": total *= 0.90; break;
    case "STUDENT":   total *= 0.85; break;
    case "":          break;
    default:          
  }

  const finalTotal = Math.round(total);
  totalEl.textContent = `Estimated total for ${nights} night(s): ${formatINR(finalTotal)}`;
  submitBtn && (submitBtn.disabled = false);
}

form && form.addEventListener("input", calcEstimate);
form && form.addEventListener("change", calcEstimate);
calcEstimate();


form && form.addEventListener("submit", (e)=>{
  if(submitBtn.disabled){ e.preventDefault(); alert("Fix the errors above."); }
});


const modal   = document.querySelector(".modal");
const bigImg  = document.querySelector("#modalImg");
const cap     = document.querySelector("#modalCap");
function openModal(src, title){
  if(!modal) return;
  bigImg.src = src; bigImg.alt = title; cap.textContent = title || "";
  modal.classList.add("open"); document.body.style.overflow = "hidden";
}
function closeModal(){
  modal.classList.remove("open"); document.body.style.overflow = "";
}
document.querySelectorAll(".gallery img[data-large]").forEach(img=>{
  img.addEventListener("click", ()=>{
    openModal(img.dataset.large, img.getAttribute("title") || img.alt || "");
  });
});
modal && modal.addEventListener("click", (e)=>{ if(e.target===modal) closeModal(); });
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });
