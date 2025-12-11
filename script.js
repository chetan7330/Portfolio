// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  // year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // resume links
  const resumeURL = "assets/Resume-Chetan.pdf";
  const resumeLink = document.getElementById('resumeLink');
  const downloadBtn = document.getElementById('downloadBtn');
  if (resumeLink) resumeLink.href = resumeURL;
  if (downloadBtn) downloadBtn.href = resumeURL;

  initReveal();
});

// ===== Smooth scroll helper =====
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Copy email =====
function copyEmail(){
  const email = 'chetan7330@gmail.com';
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(email).then(() => showToast('Email copied to clipboard'));
  } else {
    prompt('Copy email', email);
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.bottom = '24px';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.background = 'rgba(0,0,0,0.7)';
  t.style.color = 'white';
  t.style.padding = '8px 12px';
  t.style.borderRadius = '8px';
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1500);
}

// ===== Contact form (mailto fallback) =====
function sendContact(e){
  e.preventDefault();
  const name = document.getElementById('name')?.value?.trim() || 'No name';
  const email = document.getElementById('email')?.value?.trim() || 'no-email';
  const message = document.getElementById('message')?.value?.trim() || '';
  const subject = encodeURIComponent(`Portfolio Contact — ${name}`);
  const body = encodeURIComponent(message + "\n\nFrom: " + name + " <" + email + ">");
  window.location.href = `mailto:chetan7330@gmail.com?subject=${subject}&body=${body}`;
}

// ===== Modal handling =====
const modalBackdrop = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const pageWrap = document.querySelector('.wrap');

function openModal(){
  if (!modalBackdrop) return;
  modalBackdrop.classList.add('show');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (pageWrap) pageWrap.setAttribute('aria-hidden', 'true');
  const closeBtn = modalBackdrop.querySelector('.close');
  if (closeBtn) closeBtn.focus();
}
function closeModal(){
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('show');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (pageWrap) pageWrap.setAttribute('aria-hidden', 'false');
}

if (modalBackdrop){
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('show')) closeModal();
  });
}

// ===== Projects content (uses provided repos) =====
function openProject(id){
  let html = '';
  if (id === 1){
    html = `
      <h3 id="modalTitle">Post-HCT Survival Prediction</h3>
      <p class="muted">LightGBM, XGBoost, Random Forest — ensemble ML pipeline.</p>
      <p>Designed an ensemble ML pipeline achieving strong predictive performance on clinical post-HCT data (feature engineering, evaluation, and model stacking).</p>
      <div class="row mt-12">
        <a class="btn accent" href="https://github.com/chetan7330/Post-HCT-Survival-Prediction" target="_blank" rel="noopener">Open Repo</a>
      </div>
    `;
  } else if (id === 2){
    html = `
      <h3 id="modalTitle">Sports Meet Database — SQL DBMS Project</h3>
      <p class="muted">SQL-based database management system for sports meet data.</p>
      <p>Schema design, queries, stored procedures, constraints and sample scripts for managing participants, events, results and schedules.</p>
      <div class="row mt-12">
        <a class="btn accent" href="https://github.com/chetan7330/Sports-Meet-Database-Management-System" target="_blank" rel="noopener">Open Repo</a>
      </div>
    `;
  } else if (id === 3){
    html = `
      <h3 id="modalTitle">Student Record Management System</h3>
      <p class="muted">Node.js, MongoDB, Docker, Jenkins — DevOps-focused student portal.</p>
      <p>RESTful CRUD API, containerized services, CI/CD via Jenkins (build, test, deploy), healthchecks and monitoring — designed for reliability & scalability.</p>
      <div class="row mt-12">
        <a class="btn accent" href="https://github.com/chetan7330/DevOps-Proj" target="_blank" rel="noopener">Open Repo</a>
      </div>
    `;
  }
  if (modalBody) modalBody.innerHTML = html;
  openModal();
}

// ===== Theme toggle =====
// We update the core variables (including modal) to avoid color mismatch
let dark = true;
const themeBtn = document.getElementById('themeBtn');
if (themeBtn){
  themeBtn.addEventListener('click', ()=>{
    if(dark){
      // light theme
      document.documentElement.style.setProperty('--bg', '#f6fbff');
      document.documentElement.style.setProperty('--card', 'rgba(2,6,23,0.04)');
      document.documentElement.style.setProperty('--muted', '#36536a');
      document.documentElement.style.setProperty('--modal-bg', '#ffffff'); // solid light modal
      document.body.style.color = '#021022';
      themeBtn.textContent = '☀️';
    } else {
      // dark theme
      document.documentElement.style.setProperty('--bg', '#0f1022');
      document.documentElement.style.setProperty('--card', 'rgba(255,255,255,0.03)');
      document.documentElement.style.setProperty('--muted', '#9aa0b4');
      document.documentElement.style.setProperty('--modal-bg', 'rgba(20,20,35,0.96)'); // dark modal
      document.body.style.color = '#e8eef8';
      themeBtn.textContent = '🌙';
    }
    dark = !dark;
  });
}

// ===== Small reveal on scroll =====
function initReveal(){
  const revealEls = document.querySelectorAll('.card, .project, .timeline-item');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        ent.target.style.transition = "transform 600ms cubic-bezier(.2,.9,.3,1), opacity 600ms";
        ent.target.style.transform = "translateY(0)";
        ent.target.style.opacity = 1;
      } else {
        ent.target.style.transform = "translateY(8px)";
        ent.target.style.opacity = 0.95;
      }
    });
  }, {threshold:0.09});
  revealEls.forEach(el=>{
    el.style.transform = "translateY(8px)"; el.style.opacity = 0; io.observe(el);
  });
}
