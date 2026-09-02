/**
 * VLAB — Virtual STEM Laboratory Engine
 * Bilingual manager, Accessible Theme toggle, Interactive Canvas STEM Simulations
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLanguageToggle();
  initMobileNav();
  initScrollAnimations();
  initFAQ();
  initShowcaseCanvas();
  initShowcaseTilt();
  initNavScroll();
  initSandboxManager();
});

/* ==========================================================================
   1. Theme Toggle (Dark / Light)
   ========================================================================== */
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const navLogo = document.getElementById('nav-logo');
  const footerLogo = document.getElementById('footer-logo');
  if (!toggle) return;

  const saved = localStorage.getItem('vlab-theme') || 'dark';
  applyTheme(saved);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('vlab-theme', next);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    const logoSrc = theme === 'dark'
      ? 'assets/images/logos/logo-white-text.png'
      : 'assets/images/logos/logo-black-text.png';
    if (navLogo) navLogo.src = logoSrc;
    if (footerLogo) footerLogo.src = logoSrc;
  }
}

/* ==========================================================================
   2. Bilingual Language Toggle (VI / EN)
   ========================================================================== */
let currentLanguage = 'vi';

function initLanguageToggle() {
  const btnVi = document.getElementById('lang-vi');
  const btnEn = document.getElementById('lang-en');
  if (!btnVi || !btnEn) return;

  const savedLang = localStorage.getItem('vlab-lang') || 'vi';
  setLang(savedLang);

  btnVi.addEventListener('click', () => setLang('vi'));
  btnEn.addEventListener('click', () => setLang('en'));

  function setLang(lang) {
    currentLanguage = lang;
    localStorage.setItem('vlab-lang', lang);
    document.documentElement.setAttribute('lang', lang);

    btnVi.classList.toggle('active', lang === 'vi');
    btnEn.classList.toggle('active', lang === 'en');

    document.querySelectorAll('[data-vi]').forEach(el => {
      const text = lang === 'vi' ? el.getAttribute('data-vi') : el.getAttribute('data-en');
      if (text) el.textContent = text;
    });

    document.querySelectorAll('[data-vi-html]').forEach(el => {
      const html = lang === 'vi' ? el.getAttribute('data-vi-html') : el.getAttribute('data-en-html');
      if (html) el.innerHTML = html;
    });

    // Notify active sandbox to refresh translated controls
    if (window.refreshSandboxUI) {
      window.refreshSandboxUI();
    }
  }
}

/* ==========================================================================
   3. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const btn = document.getElementById('nav-mobile-btn');
  const drawer = document.getElementById('mobile-drawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    drawer.classList.toggle('open');
    btn.setAttribute('aria-expanded', !isOpen);
    drawer.setAttribute('aria-hidden', isOpen);
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ==========================================================================
   4. Scroll Reveal Animations
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. FAQ Accordion
   ========================================================================== */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        const a = i.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   6. Hero 3D Interactive Showcase Canvas (Optimized Render Loop)
   ========================================================================== */
function initShowcaseCanvas() {
  const canvas = document.getElementById('showcase-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const teleGyro = document.getElementById('tele-gyro');
  let frame = 0;
  let isVisible = true;
  let animId = null;

  // Track visibility to save battery/CPU
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !animId) {
      loop();
    }
  }, { threshold: 0.05 });
  observer.observe(canvas);

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawGrid3D(pitch, yaw) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 50;
    const horizon = cy - 70;

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    ctx.lineWidth = 1;

    const lineCount = 14;
    for (let i = -lineCount; i <= lineCount; i++) {
      const x1 = cx + i * 22;
      const y1 = horizon;
      const x2 = cx + i * 85 + Math.sin(yaw) * 35;
      const y2 = canvas.height + 30;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    for (let j = 0; j < 8; j++) {
      const py = horizon + Math.pow(j / 8, 1.8) * (canvas.height - horizon + 30);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(canvas.width, py);
      ctx.stroke();
    }
  }

  function drawVRHandsAndObject(frame, yaw, pitch) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 20;

    ctx.save();
    ctx.translate(cx, cy);

    const rotX = frame * 0.008 + pitch;
    const rotY = frame * 0.012 + yaw;

    // Core Glow
    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 85);
    coreGlow.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
    coreGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    // 3D Atomic Ring 1 (Cyan)
    ctx.save();
    ctx.rotate(rotY);
    ctx.beginPath();
    ctx.ellipse(0, 0, 120, 42, rotX, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const ex1 = Math.cos(frame * 0.035) * 120;
    const ey1 = Math.sin(frame * 0.035) * 42;
    ctx.beginPath();
    ctx.arc(ex1, ey1, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#00E5FF';
    ctx.fill();
    ctx.restore();

    // 3D Atomic Ring 2 (Purple)
    ctx.save();
    ctx.rotate(-rotY * 1.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 46, -rotX * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const ex2 = Math.cos(-frame * 0.03 + 2) * 110;
    const ey2 = Math.sin(-frame * 0.03 + 2) * 46;
    ctx.beginPath();
    ctx.arc(ex2, ey2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#A855F7';
    ctx.fill();
    ctx.restore();

    // Central Scientific Nucleus
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    const sphereGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 24);
    sphereGrad.addColorStop(0, '#00E5FF');
    sphereGrad.addColorStop(1, '#0077B6');
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    ctx.restore();

    // Simulated VR Controller Tracking Points
    const handLX = cx - 160 + Math.sin(frame * 0.02) * 12;
    const handLY = cy + 50 + Math.cos(frame * 0.02) * 8;

    const handRX = cx + 160 + Math.cos(frame * 0.02) * 12;
    const handRY = cy + 50 + Math.sin(frame * 0.02) * 8;

    // Reticle L
    ctx.beginPath();
    ctx.arc(handLX, handLY, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reticle R
    ctx.beginPath();
    ctx.arc(handRX, handRY, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function loop() {
    if (!isVisible) {
      animId = null;
      return;
    }

    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const yaw = Math.sin(frame * 0.01) * 0.18;
    const pitch = Math.cos(frame * 0.012) * 0.12;

    drawGrid3D(pitch, yaw);
    drawVRHandsAndObject(frame, yaw, pitch);

    if (teleGyro && frame % 12 === 0) {
      const gx = (Math.sin(frame * 0.02) * 0.3).toFixed(2);
      const gy = (Math.cos(frame * 0.02) * 0.2).toFixed(2);
      const gz = (0.98 + Math.sin(frame * 0.04) * 0.02).toFixed(2);
      teleGyro.textContent = `X: ${gx >= 0 ? '+' : ''}${gx} | Y: ${gy >= 0 ? '+' : ''}${gy} | Z: +${gz} g`;
    }

    animId = requestAnimationFrame(loop);
  }
  loop();
}

/* ==========================================================================
   7. Showcase Card Mouse & Touch 3D Tilt Effect
   ========================================================================== */
function initShowcaseTilt() {
  const showcase = document.getElementById('hero-showcase');
  if (!showcase) return;

  const card = showcase.querySelector('.showcase-card');
  if (!card) return;

  function handleMove(clientX, clientY) {
    const rect = showcase.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;

    const tiltX = (y / (rect.height / 2)) * -6;
    const tiltY = (x / (rect.width / 2)) * 6;

    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;
  }

  showcase.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
  showcase.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  showcase.addEventListener('mouseleave', () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
  showcase.addEventListener('touchend', () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
}

/* ==========================================================================
   8. Floating Nav Scroll Effect
   ========================================================================== */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   9. Interactive STEM Lab Sandbox Manager (Physics, Chem, Bio, Engineering)
   ========================================================================== */
function initSandboxManager() {
  const canvas = document.getElementById('sandbox-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const tabs = document.querySelectorAll('.sandbox-tab');
  const panelTitle = document.getElementById('sandbox-panel-title');
  const panelDesc = document.getElementById('sandbox-panel-desc');
  const controlsContainer = document.getElementById('sandbox-controls');
  const metricDisplay = document.getElementById('sandbox-metric');
  const hudText = document.getElementById('sandbox-hud-text');

  let activeLab = 'physics';
  let animationId = null;
  let isVisible = true;

  // Physics state
  let angle = 0.55;
  let angleVel = 0;
  let isDragging = false;

  let params = {
    length: 120,    // cm
    gravity: 9.8,   // m/s2
    ph: 7.0,        // pH 1-14
    zoom: 1.0,      // zoom multiplier
    specimen: 'plant', // 'plant', 'blood', 'onion'
    switchA: true,
    switchB: false,
    gateType: 'AND'  // 'AND', 'OR', 'XOR'
  };

  // IntersectionObserver to pause simulation when offscreen
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !animationId) {
      restartSimulation();
    }
  }, { threshold: 0.05 });
  observer.observe(canvas);

  // Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeLab = tab.dataset.lab;
      updateControls();
      restartSimulation();
    });
  });

  // Global refresh hook for language change
  window.refreshSandboxUI = function() {
    updateControls();
  };

  function updateControls() {
    const isVi = currentLanguage === 'vi';

    if (activeLab === 'physics') {
      panelTitle.textContent = isVi
        ? 'Mô phỏng Con lắc đơn (Harmonic Pendulum)'
        : 'Simple Harmonic Pendulum Simulator';
      panelDesc.textContent = isVi
        ? 'Kéo con lắc hoặc thay đổi chiều dài (L) và gia tốc trọng trường (g) để quan sát chu kỳ dao động T = 2π√(L/g).'
        : 'Drag bob or adjust string length (L) and gravity (g) to observe oscillation period T = 2π√(L/g).';
      if (hudText) hudText.textContent = 'PHYSICS ENGINE · T = 2π√(L/g)';

      controlsContainer.innerHTML = `
        <div class="sandbox-control-group">
          <div class="sandbox-label">
            <span>${isVi ? 'Chiều dài dây treo (L)' : 'String Length (L)'}</span>
            <span id="val-length">${params.length} cm</span>
          </div>
          <input type="range" class="sandbox-slider" id="slider-length" min="60" max="220" value="${params.length}">
        </div>

        <div class="sandbox-control-group">
          <div class="sandbox-label">
            <span>${isVi ? 'Môi trường trọng trường (g)' : 'Gravity Environment (g)'}</span>
            <span id="val-gravity">${params.gravity} m/s²</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="btn btn--secondary env-btn ${params.gravity === 9.8 ? 'active-env' : ''}" data-g="9.8" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Trái Đất (9.8)' : 'Earth (9.8)'}</button>
            <button class="btn btn--secondary env-btn ${params.gravity === 1.6 ? 'active-env' : ''}" data-g="1.6" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Mặt Trăng (1.6)' : 'Moon (1.6)'}</button>
            <button class="btn btn--secondary env-btn ${params.gravity === 24.8 ? 'active-env' : ''}" data-g="24.8" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Mộc Tinh (24.8)' : 'Jupiter (24.8)'}</button>
          </div>
        </div>
      `;

      document.getElementById('slider-length').addEventListener('input', (e) => {
        params.length = parseFloat(e.target.value);
        document.getElementById('val-length').textContent = `${params.length} cm`;
      });

      document.querySelectorAll('.env-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          params.gravity = parseFloat(btn.dataset.g);
          document.getElementById('val-gravity').textContent = `${params.gravity} m/s²`;
          document.querySelectorAll('.env-btn').forEach(b => b.classList.remove('active-env'));
          btn.classList.add('active-env');
        });
      });

    } else if (activeLab === 'chemistry') {
      panelTitle.textContent = isVi
        ? 'Chuẩn độ Axit — Bazơ & Chỉ thị màu pH'
        : 'Acid-Base Titration & pH Color Indicator';
      panelDesc.textContent = isVi
        ? 'Điều chỉnh pH dung dịch để quan sát sự chuyển màu của chất chỉ thị và phương trình phản ứng trung hòa.'
        : 'Adjust solution pH to observe indicator color transitions and the neutralization reaction equation.';
      if (hudText) hudText.textContent = 'CHEMISTRY ENGINE · HCl + NaOH ⇌ NaCl + H2O';

      controlsContainer.innerHTML = `
        <div class="sandbox-control-group">
          <div class="sandbox-label">
            <span>${isVi ? 'Độ pH của dung dịch' : 'Solution pH Value'}</span>
            <span id="val-ph">pH ${params.ph.toFixed(1)}</span>
          </div>
          <input type="range" class="sandbox-slider" id="slider-ph" min="1" max="14" step="0.1" value="${params.ph}">
        </div>

        <div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn btn--secondary ph-preset" data-ph="2.0" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Axit' : 'Acid'} (pH 2)</button>
          <button class="btn btn--secondary ph-preset" data-ph="7.0" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Trung tính' : 'Neutral'} (pH 7)</button>
          <button class="btn btn--secondary ph-preset" data-ph="12.0" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Bazơ' : 'Base'} (pH 12)</button>
        </div>
      `;

      const sliderPh = document.getElementById('slider-ph');
      sliderPh.addEventListener('input', (e) => {
        params.ph = parseFloat(e.target.value);
        document.getElementById('val-ph').textContent = `pH ${params.ph.toFixed(1)}`;
      });

      document.querySelectorAll('.ph-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          params.ph = parseFloat(btn.dataset.ph);
          sliderPh.value = params.ph;
          document.getElementById('val-ph').textContent = `pH ${params.ph.toFixed(1)}`;
        });
      });

    } else if (activeLab === 'biology') {
      panelTitle.textContent = isVi
        ? 'Kính hiển vi quang học ảo — Soi cấu trúc tế bào'
        : 'Virtual Optical Microscope — Cellular Anatomy';
      panelDesc.textContent = isVi
        ? 'Chọn mẫu tiêu bản sinh học và điều chỉnh núm phóng đại vật kính (100x – 600x) để quan sát màng, nhân tế bào.'
        : 'Select a biological specimen and adjust magnification (100x – 600x) to observe cell membrane and nucleus.';
      if (hudText) hudText.textContent = 'BIOLOGY ENGINE · OPTICAL MICROSCOPY';

      controlsContainer.innerHTML = `
        <div class="sandbox-control-group">
          <div class="sandbox-label">
            <span>${isVi ? 'Độ phóng đại (Magnification)' : 'Magnification Level'}</span>
            <span id="val-zoom">${(params.zoom * 200).toFixed(0)}x</span>
          </div>
          <input type="range" class="sandbox-slider" id="slider-zoom" min="0.6" max="3.0" step="0.1" value="${params.zoom}">
        </div>

        <div class="sandbox-control-group">
          <div class="sandbox-label"><span>${isVi ? 'Mẫu tiêu bản quan sát' : 'Select Specimen'}</span></div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn--secondary spec-btn ${params.specimen === 'plant' ? 'active-env' : ''}" data-spec="plant" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Tế bào thực vật' : 'Plant Cell'}</button>
            <button class="btn btn--secondary spec-btn ${params.specimen === 'blood' ? 'active-env' : ''}" data-spec="blood" style="flex:1; padding:6px; font-size:0.75rem;">${isVi ? 'Hồng cầu' : 'Blood Cell'}</button>
          </div>
        </div>
      `;

      document.getElementById('slider-zoom').addEventListener('input', (e) => {
        params.zoom = parseFloat(e.target.value);
        document.getElementById('val-zoom').textContent = `${(params.zoom * 200).toFixed(0)}x`;
      });

      document.querySelectorAll('.spec-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          params.specimen = btn.dataset.spec;
          document.querySelectorAll('.spec-btn').forEach(b => b.classList.remove('active-env'));
          btn.classList.add('active-env');
        });
      });

    } else if (activeLab === 'engineering') {
      panelTitle.textContent = isVi
        ? 'Mạch điện logic kỹ thuật số (Logic Gates)'
        : 'Digital Logic Gate Circuit Simulator';
      panelDesc.textContent = isVi
        ? 'Kiểm tra bảng chân lý của các cổng logic cơ bản (AND, OR, XOR) bằng cách bật/tắt công tắc đầu vào A và B.'
        : 'Verify truth tables for basic logic gates (AND, OR, XOR) by toggling input switches A and B.';
      if (hudText) hudText.textContent = 'ENGINEERING · DIGITAL LOGIC ENGINE';

      controlsContainer.innerHTML = `
        <div class="sandbox-control-group">
          <div class="sandbox-label"><span>${isVi ? 'Chọn cổng Logic' : 'Select Logic Gate'}</span></div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn--secondary gate-btn ${params.gateType === 'AND' ? 'active-env' : ''}" data-gate="AND" style="flex:1; padding:6px; font-size:0.75rem;">AND</button>
            <button class="btn btn--secondary gate-btn ${params.gateType === 'OR' ? 'active-env' : ''}" data-gate="OR" style="flex:1; padding:6px; font-size:0.75rem;">OR</button>
            <button class="btn btn--secondary gate-btn ${params.gateType === 'XOR' ? 'active-env' : ''}" data-gate="XOR" style="flex:1; padding:6px; font-size:0.75rem;">XOR</button>
          </div>
        </div>

        <div class="sandbox-control-group" style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn btn--secondary" id="toggle-a" style="flex:1; padding:10px; font-size:0.84rem; justify-content:center;">
            ${isVi ? 'Công tắc A' : 'Switch A'}: <strong style="color:${params.switchA ? 'var(--success)' : 'var(--text-tertiary)'}; margin-left:4px;">${params.switchA ? '1 (ON)' : '0 (OFF)'}</strong>
          </button>
          <button class="btn btn--secondary" id="toggle-b" style="flex:1; padding:10px; font-size:0.84rem; justify-content:center;">
            ${isVi ? 'Công tắc B' : 'Switch B'}: <strong style="color:${params.switchB ? 'var(--success)' : 'var(--text-tertiary)'}; margin-left:4px;">${params.switchB ? '1 (ON)' : '0 (OFF)'}</strong>
          </button>
        </div>
      `;

      document.querySelectorAll('.gate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          params.gateType = btn.dataset.gate;
          document.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('active-env'));
          btn.classList.add('active-env');
        });
      });

      const btnA = document.getElementById('toggle-a');
      const btnB = document.getElementById('toggle-b');
      btnA.addEventListener('click', () => {
        params.switchA = !params.switchA;
        btnA.innerHTML = `${isVi ? 'Công tắc A' : 'Switch A'}: <strong style="color:${params.switchA ? 'var(--success)' : 'var(--text-tertiary)'}; margin-left:4px;">${params.switchA ? '1 (ON)' : '0 (OFF)'}</strong>`;
      });
      btnB.addEventListener('click', () => {
        params.switchB = !params.switchB;
        btnB.innerHTML = `${isVi ? 'Công tắc B' : 'Switch B'}: <strong style="color:${params.switchB ? 'var(--success)' : 'var(--text-tertiary)'}; margin-left:4px;">${params.switchB ? '1 (ON)' : '0 (OFF)'}</strong>`;
      });
    }
  }

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 380;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Mouse & Touch Drag on Canvas for Physics Bob
  function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handleStart(x, y) {
    if (activeLab !== 'physics') return;
    const originX = canvas.width / 2;
    const originY = 45;
    const bobX = originX + params.length * Math.sin(angle);
    const bobY = originY + params.length * Math.cos(angle);
    const dist = Math.hypot(x - bobX, y - bobY);
    if (dist < 40) {
      isDragging = true;
      angleVel = 0;
    }
  }

  function handleMove(x, y) {
    if (activeLab === 'physics' && isDragging) {
      const originX = canvas.width / 2;
      const originY = 45;
      angle = Math.atan2(x - originX, y - originY);
      angle = Math.max(-1.4, Math.min(1.4, angle));
    }
  }

  function handleEnd() {
    isDragging = false;
  }

  canvas.addEventListener('mousedown', (e) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    handleStart(x, y);
  });
  window.addEventListener('mousemove', (e) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    handleMove(x, y);
  });
  window.addEventListener('mouseup', handleEnd);

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const { x, y } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
      handleStart(x, y);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length > 0) {
      const { x, y } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
      handleMove(x, y);
    }
  }, { passive: true });

  window.addEventListener('touchend', handleEnd);

  function restartSimulation() {
    if (animationId) cancelAnimationFrame(animationId);
    if (activeLab === 'physics') {
      angle = 0.55;
      angleVel = 0;
    }
    loop();
  }

  function loop() {
    if (!isVisible) {
      animationId = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;
    const isVi = currentLanguage === 'vi';

    if (activeLab === 'physics') {
      const originX = w / 2;
      const originY = 45;
      const l = params.length;
      const g = params.gravity;

      if (!isDragging) {
        const angleAccel = (-1 * (g / 9.8) * 0.08 / (l / 100)) * Math.sin(angle);
        angleVel += angleAccel;
        angleVel *= 0.994; // Air resistance damping
        angle += angleVel;
      }

      const bobX = originX + l * Math.sin(angle);
      const bobY = originY + l * Math.cos(angle);

      // Top pivot ceiling line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX - 60, originY);
      ctx.lineTo(originX + 60, originY);
      ctx.stroke();

      // Pendulum Rod
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pivot dot
      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.fill();

      // Pendulum Bob
      ctx.beginPath();
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      const bobGrad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
      bobGrad.addColorStop(0, '#00E5FF');
      bobGrad.addColorStop(1, '#0077B6');
      ctx.fillStyle = bobGrad;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Real scientific period calculation
      const period = (2 * Math.PI * Math.sqrt((l / 100) / g)).toFixed(2);
      const freq = (1 / period).toFixed(2);
      metricDisplay.textContent = `T = ${period} s | f = ${freq} Hz | θ = ${(angle * 180 / Math.PI).toFixed(1)}°`;

    } else if (activeLab === 'chemistry') {
      const ph = params.ph;
      // Phenolphthalein / Universal Indicator color mapping
      let col = '#06D6A0';
      let state = 'Trung tính (Neutral)';
      if (ph < 3) {
        col = '#EF4444'; // Strong acid red
        state = isVi ? 'Axit mạnh (Strong Acid)' : 'Strong Acid';
      } else if (ph < 6.5) {
        col = '#F59E0B'; // Weak acid orange/yellow
        state = isVi ? 'Axit yếu (Weak Acid)' : 'Weak Acid';
      } else if (ph <= 7.5) {
        col = '#10B981'; // Neutral green
        state = isVi ? 'Trung tính (Neutral)' : 'Neutral';
      } else if (ph < 11) {
        col = '#3B82F6'; // Weak base blue
        state = isVi ? 'Bazơ yếu (Weak Base)' : 'Weak Base';
      } else {
        col = '#A855F7'; // Strong base violet
        state = isVi ? 'Bazơ mạnh (Strong Base)' : 'Strong Base';
      }

      const beakerX = w / 2 - 65;
      const beakerY = h / 2 - 55;
      const beakerW = 130;
      const beakerH = 145;

      // Beaker Liquid
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(beakerX + 6, beakerY + 45, beakerW - 12, beakerH - 51);
      ctx.globalAlpha = 1.0;

      // Beaker Outlines
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerX, beakerY);
      ctx.lineTo(beakerX, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW, beakerY);
      ctx.stroke();

      // Graduations on Beaker
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const gy = beakerY + beakerH - i * 24;
        ctx.beginPath();
        ctx.moveTo(beakerX + 6, gy);
        ctx.lineTo(beakerX + 22, gy);
        ctx.stroke();
      }

      // Dropper Pipette on Top
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w / 2, beakerY - 50);
      ctx.lineTo(w / 2, beakerY + 10);
      ctx.stroke();

      // Drop
      ctx.beginPath();
      ctx.arc(w / 2, beakerY + 24, 4, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      metricDisplay.textContent = `pH: ${ph.toFixed(1)} | [H+] = 10^(-${ph.toFixed(1)}) M | ${state}`;

    } else if (activeLab === 'biology') {
      const z = params.zoom;
      const cx = w / 2;
      const cy = h / 2;

      // Circular Microscope Field of View
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#060B18';
      ctx.fillRect(cx - 120, cy - 120, 240, 240);

      if (params.specimen === 'plant') {
        // Plant Cell Grid
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        const cellSize = 55 * z;

        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            const px = cx + i * cellSize;
            const py = cy + j * cellSize;

            ctx.strokeRect(px, py, cellSize - 6, cellSize - 6);

            // Nucleus inside each cell
            ctx.beginPath();
            ctx.arc(px + cellSize * 0.4, py + cellSize * 0.4, 6 * z, 0, Math.PI * 2);
            ctx.fillStyle = '#A855F7';
            ctx.fill();

            // Chloroplasts
            ctx.beginPath();
            ctx.arc(px + cellSize * 0.25, py + cellSize * 0.7, 3 * z, 0, Math.PI * 2);
            ctx.arc(px + cellSize * 0.7, py + cellSize * 0.3, 3 * z, 0, Math.PI * 2);
            ctx.fillStyle = '#06D6A0';
            ctx.fill();
          }
        }
      } else {
        // Red Blood Cells
        ctx.fillStyle = '#EF4444';
        const count = 14;
        for (let k = 0; k < count; k++) {
          const bx = cx + Math.sin(k * 1.3) * 60 * z;
          const by = cy + Math.cos(k * 1.7) * 60 * z;

          ctx.beginPath();
          ctx.arc(bx, by, 12 * z, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(bx, by, 6 * z, 0, Math.PI * 2);
          ctx.fillStyle = '#991B1B';
          ctx.fill();
          ctx.fillStyle = '#EF4444';
        }
      }
      ctx.restore();

      // Outer Microscope Ring
      ctx.beginPath();
      ctx.arc(cx, cy, 112, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      metricDisplay.textContent = `${isVi ? 'Độ phóng đại' : 'Magnification'}: ${(z * 200).toFixed(0)}x | ${params.specimen === 'plant' ? (isVi ? 'Màng tế bào & Nhân' : 'Cell Wall & Nucleus') : (isVi ? 'Hồng cầu (Erythrocytes)' : 'Red Blood Cells')}`;

    } else if (activeLab === 'engineering') {
      const a = params.switchA;
      const b = params.switchB;
      let out = false;

      if (params.gateType === 'AND') out = a && b;
      else if (params.gateType === 'OR') out = a || b;
      else if (params.gateType === 'XOR') out = (a || b) && !(a && b);

      const cx = w / 2;
      const cy = h / 2;

      // Wire A
      ctx.strokeStyle = a ? '#10B981' : '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy - 25);
      ctx.lineTo(cx - 40, cy - 25);
      ctx.stroke();

      // Wire B
      ctx.strokeStyle = b ? '#10B981' : '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 130, cy + 25);
      ctx.lineTo(cx - 40, cy + 25);
      ctx.stroke();

      // Gate Box
      ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 3;
      ctx.fillRect(cx - 40, cy - 45, 80, 90);
      ctx.strokeRect(cx - 40, cy - 45, 80, 90);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(params.gateType, cx, cy + 6);

      // Output Wire
      ctx.strokeStyle = out ? '#10B981' : '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy);
      ctx.lineTo(cx + 115, cy);
      ctx.stroke();

      // Output LED Lamp
      ctx.beginPath();
      ctx.arc(cx + 130, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = out ? '#10B981' : '#334155';
      if (out) {
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 18;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      metricDisplay.textContent = `A: ${a ? 1 : 0} | B: ${b ? 1 : 0} => [${params.gateType} Gate] Output = ${out ? 1 : 0} (LED ${out ? 'ON' : 'OFF'})`;
    }

    animationId = requestAnimationFrame(loop);
  }

  updateControls();
  restartSimulation();
}
