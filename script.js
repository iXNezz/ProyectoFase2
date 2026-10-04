const criterionText = {
  1: "El valor de la función debe estar definido exactamente en el punto que estamos analizando.",
  2: "El límite por la izquierda y por la derecha debe conducir al mismo valor finito.",
  3: "El valor al que se acerca la función debe coincidir con el valor que realmente tiene en el punto."
};

document.querySelectorAll(".criterion").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".criterion").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector("#criterionExplanation").textContent = criterionText[btn.dataset.criterion];
  });
});

const modal = document.querySelector("#detailModal");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");
const modalTag = document.querySelector("#modalTag");

const details = {
  removable: ["Discontinuidad removible", "El límite existe y es finito, pero hay un hueco en la gráfica. Si definimos correctamente el valor de la función en ese punto, podemos eliminar la discontinuidad."],
  jump: ["Discontinuidad de salto", "Los límites laterales existen, pero tienen valores distintos. La gráfica presenta un salto y no existe un único límite en el punto."],
  infinite: ["Discontinuidad infinita", "La función crece o decrece sin límite cuando x se acerca al punto. Ese comportamiento se representa con una asíntota vertical."]
};

document.querySelectorAll(".chart-detail").forEach(btn => {
  btn.addEventListener("click", () => {
    const d = details[btn.dataset.detail];
    modalTitle.textContent = d[0];
    modalText.textContent = d[1];
    modalTag.textContent = "TIPO DE DISCONTINUIDAD";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });
});
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
document.querySelector(".modal-close").addEventListener("click", closeModal);
document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const rationalX = document.querySelector("#rationalX");
const rationalResult = document.querySelector("#rationalResult");

function updateRational() {
  const x = Number(rationalX.value);
  if (!Number.isFinite(x)) {
    rationalResult.textContent = "Introduce un número válido.";
    return;
  }
  if (Math.abs(x) < 0.000001) {
    rationalResult.innerHTML = "<strong>x = 0 → 0/0</strong><br>Indeterminación. El límite, después de simplificar, es 3,05 µg/m³.";
    return;
  }
  const y = (3.05 * x) / x;
  rationalResult.innerHTML = `<strong>f(${x}) = ${y.toFixed(2)} µg/m³</strong><br>Para x ≠ 0, coincide con 3,05.`;
}

rationalX.addEventListener("input", updateRational);
updateRational();

const timeSlider = document.querySelector("#timeSlider");
const timeValue = document.querySelector("#timeValue");
const wasteValue = document.querySelector("#wasteValue");

function updateExpo() {
  const t = Number(timeSlider.value);
  const r = 82425.53 * Math.pow(0.93, t);
  timeValue.textContent = `${t} ${t === 1 ? "año" : "años"}`;
  wasteValue.textContent = r.toLocaleString("es-CO", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

timeSlider.addEventListener("input", updateExpo);
updateExpo();

function svgEl(tag, attrs={}) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v));
  return e;
}

function drawGraph(containerId, type) {
  const host = document.getElementById(containerId);
  const w = 620, h = 250, pad = 35;
  const svg = svgEl("svg", {viewBox:`0 0 ${w} ${h}`, width:"100%", height:"100%", role:"img"});
  const bg = svgEl("rect",{x:0,y:0,width:w,height:h,fill:"#e9eee8"});
  svg.appendChild(bg);

  for (let i=1;i<7;i++) {
    const x = pad + i*(w-2*pad)/7;
    const line = svgEl("line",{x1:x,y1:pad,x2:x,y2:h-pad,stroke:"rgba(23,35,31,.10)","stroke-width":1});
    svg.appendChild(line);
  }
  for (let i=1;i<4;i++) {
    const y = pad + i*(h-2*pad)/4;
    const line = svgEl("line",{x1:pad,y1:y,x2:w-pad,y2:y,stroke:"rgba(23,35,31,.10)","stroke-width":1});
    svg.appendChild(line);
  }
  const axis = svgEl("line",{x1:pad,y1:h/2,x2:w-pad,y2:h/2,stroke:"#214f43","stroke-width":1.5});
  svg.appendChild(axis);

  const points = [];
  const x0 = pad, x1 = w-pad, y0 = h-pad, y1 = pad;
  function mapX(x){ return x0 + ((x+6)/12)*(x1-x0); }
  function mapY(y){ return y0 - ((y+6)/12)*(y0-y1); }

  if (type === "removable") {
    let d="";
    for(let x=-6;x<=6;x+=0.1){
      if(Math.abs(x-1)<0.05) continue;
      const y=x+2;
      d += (d?"L":"M")+mapX(x)+" "+mapY(y)+" ";
    }
    svg.appendChild(svgEl("path",{d,fill:"none",stroke:"#214f43","stroke-width":3,"stroke-linecap":"round"}));
    svg.appendChild(svgEl("circle",{cx:mapX(1),cy:mapY(3),r:7,fill:"#e9eee8",stroke:"#214f43","stroke-width":3}));
  } else if (type === "jump") {
    let d1=`M ${mapX(-6)} ${mapY(-1)} L ${mapX(0)} ${mapY(-1)}`;
    let d2=`M ${mapX(0)} ${mapY(2)} L ${mapX(6)} ${mapY(2)}`;
    svg.appendChild(svgEl("path",{d:d1,fill:"none",stroke:"#214f43","stroke-width":3}));
    svg.appendChild(svgEl("path",{d:d2,fill:"none",stroke:"#214f43","stroke-width":3}));
    svg.appendChild(svgEl("circle",{cx:mapX(0),cy:mapY(-1),r:6,fill:"#e9eee8",stroke:"#214f43","stroke-width":3}));
    svg.appendChild(svgEl("circle",{cx:mapX(0),cy:mapY(2),r:6,fill:"#c7dc87",stroke:"#214f43","stroke-width":2}));
  } else {
    let d1="", d2="";
    for(let x=-6;x<=-0.35;x+=0.06){
      const y=Math.max(-6,Math.min(6,1/x));
      d1 += (d1?"L":"M")+mapX(x)+" "+mapY(y)+" ";
    }
    for(let x=0.35;x<=6;x+=0.06){
      const y=Math.max(-6,Math.min(6,1/x));
      d2 += (d2?"L":"M")+mapX(x)+" "+mapY(y)+" ";
    }
    svg.appendChild(svgEl("path",{d:d1,fill:"none",stroke:"#214f43","stroke-width":3}));
    svg.appendChild(svgEl("path",{d:d2,fill:"none",stroke:"#214f43","stroke-width":3}));
    svg.appendChild(svgEl("line",{x1:mapX(0),y1:pad,x2:mapX(0),y2:h-pad,stroke:"#8b9c91","stroke-width":1.5,"stroke-dasharray":"5 5"}));
  }
  host.appendChild(svg);
}

drawGraph("chart-removable","removable");
drawGraph("chart-jump","jump");
drawGraph("chart-infinite","infinite");

function drawRationalChart() {
  const host = document.querySelector("#rationalChart");
  const w=900,h=330,pad=55;
  const svg=svgEl("svg",{viewBox:`0 0 ${w} ${h}`,width:"100%",height:"100%"});
  function X(x){return pad+(x+6)/12*(w-2*pad);}
  function Y(y){return h-pad-((y-2.5)/1.2)*(h-2*pad);}
  [2.6,2.8,3.0,3.2,3.4].forEach(y=>{
    const yy=Y(y);
    svg.appendChild(svgEl("line",{x1:pad,y1:yy,x2:w-pad,y2:yy,stroke:"rgba(199,220,135,.12)","stroke-width":1}));
  });
  const zeroX=X(0);
  svg.appendChild(svgEl("line",{x1:zeroX,y1:pad,x2:zeroX,y2:h-pad,stroke:"rgba(199,220,135,.28)","stroke-width":1.5,"stroke-dasharray":"6 6"}));
  const yy=Y(3.05);
  svg.appendChild(svgEl("path",{d:`M ${X(-6)} ${yy} L ${X(-0.08)} ${yy} M ${X(0.08)} ${yy} L ${X(6)} ${yy}`,fill:"none",stroke:"#c7dc87","stroke-width":4,"stroke-linecap":"round"}));
  svg.appendChild(svgEl("circle",{cx:zeroX,cy:yy,r:9,fill:"#13231f",stroke:"#c7dc87","stroke-width":4}));
  const txt=svgEl("text",{x:zeroX+15,y:yy-12,fill:"#c7dc87","font-size":14,"font-family":"DM Sans, Arial"});
  txt.textContent="(0, 3,05)"; svg.appendChild(txt);
  const label=svgEl("text",{x:w-pad-180,y:yy-10,fill:"#c7dc87","font-size":13,"font-family":"DM Sans, Arial"});
  label.textContent="diferencia = 3,05 µg/m³"; svg.appendChild(label);
  host.appendChild(svg);
}

drawRationalChart();

function drawExpoChart() {
  const host=document.querySelector("#expoChart");
  const w=900,h=330,pad=55;
  const svg=svgEl("svg",{viewBox:`0 0 ${w} ${h}`,width:"100%",height:"100%"});
  function X(x){return pad+(x/10)*(w-2*pad);}
  function Y(y){return h-pad-(y/90000)*(h-2*pad);}
  [0,20000,40000,60000,80000].forEach(y=>{
    const yy=Y(y);
    svg.appendChild(svgEl("line",{x1:pad,y1:yy,x2:w-pad,y2:yy,stroke:"rgba(23,35,31,.10)","stroke-width":1}));
  });
  const asymY=Y(0);
  svg.appendChild(svgEl("line",{x1:pad,y1:asymY,x2:w-pad,y2:asymY,stroke:"#347360","stroke-width":2,"stroke-dasharray":"7 7"}));
  let d="";
  for(let t=0;t<=10;t+=.05){
    const r=82425.53*Math.pow(.93,t);
    d+=(d?"L":"M")+X(t)+" "+Y(r)+" ";
  }
  svg.appendChild(svgEl("path",{d,fill:"none",stroke:"#214f43","stroke-width":4,"stroke-linecap":"round"}));
  svg.appendChild(svgEl("circle",{cx:X(0),cy:Y(82425.53),r:6,fill:"#c7dc87"}));
  const label=svgEl("text",{x:w-pad-130,y:asymY-10,fill:"#347360","font-size":13,"font-family":"DM Sans, Arial"});
  label.textContent="asíntota y = 0"; svg.appendChild(label);
  host.appendChild(svg);
}

drawExpoChart();

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
menuBtn.addEventListener("click", () => {
  const open = navLinks.style.display === "flex";
  navLinks.style.display = open ? "" : "flex";
  if (!open) {
    navLinks.style.position="absolute";
    navLinks.style.top="75px";
    navLinks.style.right="20px";
    navLinks.style.flexDirection="column";
    navLinks.style.padding="18px";
    navLinks.style.background="rgba(19,35,31,.95)";
    navLinks.style.borderRadius="15px";
  }
});
