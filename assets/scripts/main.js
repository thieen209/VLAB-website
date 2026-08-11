/**
 * VLAB — Cluely-Inspired Ultra-SaaS Website Engine
 * Floating pill nav, Bento interactions, 3D Showcase tilt, interactive sandbox
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLanguageToggle();
  initScrollAnimations();
  initFAQ();
  initShowcaseCanvas();
  initShowcaseTilt();
  initNavScroll();
  initSandboxManager();
  initCounterAnimations();
});

/* ==========================================================================
   1. Theme Toggle
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
   2. Bilingual Language Toggle
   ========================================================================== */
function initLanguageToggle() {
  const btnVi = document.getElementById('lang-vi');
  const btnEn = document.getElementById('lang-en');
  if (!btnVi || !btnEn) return;

  btnVi.addEventListener('click', () => setLang('vi'));
  btnEn.addEventListener('click', () => setLang('en'));

  function setLang(lang) {
    btnVi.classList.toggle('active', lang === 'vi');
    btnEn.classList.toggle('active', lang === 'en');

    document.querySelectorAll('[data-vi]').forEach(el => {
      el.textContent = lang === 'vi' ? el.getAttribute('data-vi') : el.getAttribute('data-en');
    });

    document.querySelectorAll('[data-vi-html]').forEach(el => {
      el.innerHTML = lang === 'vi' ? el.getAttribute('data-vi-html') : el.getAttribute('data-en-html');
    });
  }
}

/* ==========================================================================
   3. Scroll Reveal Animations
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
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   4. FAQ Accordion
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
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   5. Hero 3D Interactive Showcase Canvas (Cluely Glass Window Visual)
   ========================================================================== */
function initShowcaseCanvas() {
  const canvas = document.getElementById('showcase-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const teleGyro = document.getElementById('tele-gyro');
  let frame = 0;

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawGrid3D(pitch, yaw) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 50;
    const horizon = cy - 80;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;

    const lineCount = 16;
    for (let i = -lineCount; i <= lineCount; i++) {
      const x1 = cx + i * 20;
      const y1 = horizon;
      const x2 = cx + i * 90 + Math.sin(yaw) * 40;
      const y2 = canvas.height + 40;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    for (let j = 0; j < 10; j++) {
      const py = horizon + Math.pow(j / 10, 1.8) * (canvas.height - horizon + 40);
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

    const rotX = frame * 0.01 + pitch;
    const rotY = frame * 0.015 + yaw;

    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 90);
    coreGlow.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    coreGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    // 3D Atomic Ring 1 (Cyan)
    ctx.save();
    ctx.rotate(rotY);
    ctx.beginPath();
    ctx.ellipse(0, 0, 130, 45, rotX, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const ex1 = Math.cos(frame * 0.04) * 130;
    const ey1 = Math.sin(frame * 0.04) * 45;
    ctx.beginPath();
    ctx.arc(ex1, ey1, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 3D Atomic Ring 2 (Purple)
    ctx.save();
    ctx.rotate(-rotY * 1.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 115, 50, -rotX * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const ex2 = Math.cos(-frame * 0.03 + 2) * 115;
    const ey2 = Math.sin(-frame * 0.03 + 2) * 50;
    ctx.beginPath();
    ctx.arc(ex2, ey2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#A855F7';
    ctx.shadowColor = '#A855F7';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Central Nucleus
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    const sphereGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 26);
    sphereGrad.addColorStop(0, '#00F0FF');
    sphereGrad.addColorStop(1, '#0077B6');
    ctx.fillStyle = sphereGrad;
    ctx.fill();

    ctx.restore();

    // Simulated VR Virtual Hands
    const handLX = cx - 180 + Math.sin(frame * 0.02) * 15;
    const handLY = cy + 60 + Math.cos(frame * 0.02) * 10;

    const handRX = cx + 180 + Math.cos(frame * 0.02) * 15;
    const handRY = cy + 60 + Math.sin(frame * 0.02) * 10;

    // Reticle L
    ctx.beginPath();
    ctx.arc(handLX, handLY, 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reticle R
    ctx.beginPath();
    ctx.arc(handRX, handRY, 14, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function loop() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const yaw = Math.sin(frame * 0.01) * 0.2;
    const pitch = Math.cos(frame * 0.012) * 0.15;

    drawGrid3D(pitch, yaw);
    drawVRHandsAndObject(frame, yaw, pitch);

    if (teleGyro && frame % 10 === 0) {
      const gx = (Math.sin(frame * 0.02) * 0.35).toFixed(2);
      const gy = (Math.cos(frame * 0.02) * 0.25).toFixed(2);
      const gz = (0.98 + Math.sin(frame * 0.05) * 0.02).toFixed(2);
      teleGyro.textContent = `X: ${gx > 0 ? '+' : ''}${gx} | Y: ${gy > 0 ? '+' : ''}${gy} | Z: +${gz} g`;
    }

    requestAnimationFrame(loop);
  }
  loop();
}

/* ==========================================================================
   6. Showcase Card Mouse 3D Tilt Effect
   ========================================================================== */
function initShowcaseTilt() {
  const showcase = document.getElementById('hero-showcase');
  if (!showcase) return;

  const card = showcase.querySelector('.showcase-card');
  if (!card) return;

  showcase.addEventListener('mousemove', (e) => {
    const rect = showcase.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = (y / (rect.height / 2)) * -8;
    const tiltY = (x / (rect.width / 2)) * 8;

    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
  });

  showcase.addEventListener('mouseleave', () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
}

/* ==========================================================================
   7. Floating Nav Scroll Effect
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
   8. Counter Animations
   ========================================================================== */
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        animateCounter(el, target, prefix, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  function animateCounter(el, target, prefix, suffix) {
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      el.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }
}

/* ==========================================================================
   9. Interactive STEM Lab Sandbox Manager
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

  let activeLab = 'physics';
  let animationId = null;
  let angle = 0.5;
  let angleVel = 0;
  let angleAccel = 0;

  let params = {
    length: 120,
    gravity: 9.8,
    ph: 7.0,
    zoom: 1.0,
    switchA: false,
    switchB: true
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeLab = tab.dataset.lab;
      updateControls();
      restartSimulation();
    });
  });

  function updateControls() {
    if (activeLab === 'physics') {
      panelTitle.textContent = 'Mô phỏng Con lắc đơn (Harmonic Pendulum)';
      panelDesc.textContent = 'Điều chỉnh chiều dài (L) và gia tốc trọng trường (g) để quan sát sự thay đổi chu kỳ dao động T = 2π√(L/g).';
      controlsContainer.innerHTML = `
        <div class="sandbox-control-group">
          <div class="sandbox-label"><span>Chiều dài dây (L)</span><span id="val-length">${params.length} cm</span></div>
          <input type="range" class="sandbox-slider" id="slider-length" min="50" max="200" value="${params.length}">
        </div>
        <div class="sandbox-control-group">
          <div class="sandbox-label"><span>Gia tốc trọng trường (g)</span><span id="val-gravity">${params.gravity} m/s²</span></div>
          <input type="range" class="sandbox-slider" id="slider-gravity" min="1" max="25" step="0.1" value="${params.gravity}">
        </div>
      `;
      document.getElementById('slider-length').addEventListener('input', (e) => {
        params.length = parseFloat(e.target.value);
        document.getElementById('val-length').textContent = `${params.length} cm`;
      });
      document.getElementById('slider-gravity').addEventListener('input', (e) => {
        params.gravity = parseFloat(e.target.value);
        document.getElementById('val-gravity').textContent = `${params.gravity} m/s²`;
      });
    } else if (activeLab === 'chemistry') {
      panelTitle.textContent = 'Mô phỏng Phản ứng Chuẩn độ Axit-Bazơ';
      panelDesc.textContent = 'Kéo thanh pH để thay đổi nồng độ ion H+ / OH- và quan sát sự đổi màu của chỉ thị Phenolphthalein.';
      controlsContainer.innerHTML = `
        <div class="sandbox-control-group">
          <div class="sandbox-label"><span>Độ pH dung dịch</span><span id="val-ph">pH ${params.ph}</span></div>
          <input type="range" class="sandbox-slider" id="slider-ph" min="1" max="14" step="0.1" value="${params.ph}">
        </div>
      `;
      document.getElementById('slider-ph').addEventListener('input', (e) => {
        params.ph = parseFloat(e.target.value);
        document.getElementById('val-ph').textContent = `pH ${params.ph}`;
      });
    } else if (activeLab === 'biology') {
      panelTitle.textContent = 'Kính hiển vi ảo - Soi tế bào sinh học';
      panelDesc.textContent = 'Điều chỉnh độ phóng đại vật kính kính hiển vi để quan sát màng tế bào, nhân và ti thể.';
      controlsContainer.innerHTML = `
        <div class="sandbox-control-group">
          <div class="sandbox-label"><span>Độ phóng đại (Magnification)</span><span id="val-zoom">${(params.zoom * 100).toFixed(0)}x</span></div>
          <input type="range" class="sandbox-slider" id="slider-zoom" min="0.5" max="3" step="0.1" value="${params.zoom}">
        </div>
      `;
      document.getElementById('slider-zoom').addEventListener('input', (e) => {
        params.zoom = parseFloat(e.target.value);
        document.getElementById('val-zoom').textContent = `${(params.zoom * 100).toFixed(0)}x`;
      });
    } else if (activeLab === 'engineering') {
      panelTitle.textContent = 'Mô phỏng Mạch Logic AND/OR Gate';
      panelDesc.textContent = 'Bật/Tắt các công tắc đầu vào A và B để kiểm tra trạng thái sáng của đèn LED đầu ra.';
      controlsContainer.innerHTML = `
        <div class="sandbox-control-group" style="display:flex;gap:12px;margin-top:12px;">
          <button class="btn btn--secondary" id="toggle-a" style="flex:1;padding:10px;font-size:0.85rem;">Switch A: ${params.switchA ? 'ON' : 'OFF'}</button>
          <button class="btn btn--secondary" id="toggle-b" style="flex:1;padding:10px;font-size:0.85rem;">Switch B: ${params.switchB ? 'ON' : 'OFF'}</button>
        </div>
      `;
      const btnA = document.getElementById('toggle-a');
      const btnB = document.getElementById('toggle-b');
      btnA.addEventListener('click', () => {
        params.switchA = !params.switchA;
        btnA.textContent = `Switch A: ${params.switchA ? 'ON' : 'OFF'}`;
      });
      btnB.addEventListener('click', () => {
        params.switchB = !params.switchB;
        btnB.textContent = `Switch B: ${params.switchB ? 'ON' : 'OFF'}`;
      });
    }
  }

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 400;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function restartSimulation() {
    if (animationId) cancelAnimationFrame(animationId);
    angle = 0.6;
    angleVel = 0;
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    if (activeLab === 'physics') {
      const originX = w / 2;
      const originY = 50;
      const l = params.length;
      const g = params.gravity;

      angleAccel = (-1 * (g / 10) / (l / 10)) * Math.sin(angle);
      angleVel += angleAccel;
      angleVel *= 0.995;
      angle += angleVel;

      const bobX = originX + l * Math.sin(angle);
      const bobY = originY + l * Math.cos(angle);

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = 'rgba(0,240,255,0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00F0FF';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      const period = (2 * Math.PI * Math.sqrt((l / 100) / g)).toFixed(2);
      metricDisplay.textContent = `T = 2π√(L/g) = ${period} s | Angle: ${(angle * 180 / Math.PI).toFixed(1)}°`;

    } else if (activeLab === 'chemistry') {
      const ph = params.ph;
      let color = ph < 6 ? '#EF4444' : ph > 8 ? '#A855F7' : '#06D6A0';

      const beakerX = w / 2 - 60;
      const beakerY = h / 2 - 50;
      const beakerW = 120;
      const beakerH = 140;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(beakerX + 6, beakerY + 40, beakerW - 12, beakerH - 46);
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerX, beakerY);
      ctx.lineTo(beakerX, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
      ctx.lineTo(beakerX + beakerW, beakerY);
      ctx.stroke();

      metricDisplay.textContent = `pH: ${ph.toFixed(1)} | Solution: ${ph < 6 ? 'Acidic (H+)' : ph > 8 ? 'Basic (OH-)' : 'Neutral (H2O)'}`;

    } else if (activeLab === 'biology') {
      const z = params.zoom;
      const cx = w / 2;
      const cy = h / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, 90 * z, 0, Math.PI * 2);
      ctx.strokeStyle = '#FF6B35';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(255,107,53,0.1)';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx - 10 * z, cy - 10 * z, 30 * z, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,107,53,0.6)';
      ctx.fill();

      metricDisplay.textContent = `Magnification: ${(z * 100).toFixed(0)}x | Visible: Cell Wall, Nucleus`;

    } else if (activeLab === 'engineering') {
      const out = params.switchA && params.switchB;
      const cx = w / 2;
      const cy = h / 2;

      ctx.strokeStyle = params.switchA ? '#10B981' : '#374151';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy - 30);
      ctx.lineTo(cx - 40, cy - 30);
      ctx.stroke();

      ctx.strokeStyle = params.switchB ? '#10B981' : '#374151';
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy + 30);
      ctx.lineTo(cx - 40, cy + 30);
      ctx.stroke();

      ctx.fillStyle = 'rgba(20,20,35,0.9)';
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 3;
      ctx.fillRect(cx - 40, cy - 50, 80, 100);
      ctx.strokeRect(cx - 40, cy - 50, 80, 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('AND', cx - 18, cy + 6);

      ctx.strokeStyle = out ? '#10B981' : '#374151';
      ctx.beginPath();
      ctx.moveTo(cx + 40, cy);
      ctx.lineTo(cx + 120, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 140, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = out ? '#10B981' : '#374151';
      ctx.fill();

      metricDisplay.textContent = `Input A: ${params.switchA ? 1 : 0} | Input B: ${params.switchB ? 1 : 0} => AND Gate Output: ${out ? 1 : 0}`;
    }

    animationId = requestAnimationFrame(loop);
  }

  updateControls();
  restartSimulation();
}
