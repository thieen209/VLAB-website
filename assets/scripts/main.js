/**
 * VLAB — Ultra-Premium STEM Virtual Laboratory Engine
 * Full-featured interactive multi-lab suite, physics simulation,
 * chemical titration, virtual microscopy, digital circuitry & UI handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mark body as JS animated for safe reveal transitions
  document.body.classList.add('js-animated');

  initThemeToggle();
  initLanguageToggle();
  initMobileMenu();
  initScrollAnimations();
  initFAQ();
  initHeroCoreCanvas();
  initHardwareExplorer();
  initSTEMSandboxSuite();
});

/* ==========================================================================
   1. Theme Management (Obsidian Dark / Crisp Light)
   ========================================================================== */
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const navLogo = document.getElementById('nav-logo');
  const footerLogo = document.getElementById('footer-logo');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('vlab-theme') || 'dark';
  applyTheme(savedTheme);

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('vlab-theme', nextTheme);
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
   2. Bilingual Dictionary & Toggle Engine (VI / EN)
   ========================================================================== */
function initLanguageToggle() {
  const btnVi = document.getElementById('lang-vi');
  const btnEn = document.getElementById('lang-en');
  if (!btnVi || !btnEn) return;

  const savedLang = localStorage.getItem('vlab-lang') || 'vi';
  setLanguage(savedLang);

  btnVi.addEventListener('click', () => setLanguage('vi'));
  btnEn.addEventListener('click', () => setLanguage('en'));

  function setLanguage(lang) {
    localStorage.setItem('vlab-lang', lang);
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

    // Notify sandbox manager to update dynamic copy
    if (window.VLAB_SANDBOX && typeof window.VLAB_SANDBOX.updateTexts === 'function') {
      window.VLAB_SANDBOX.updateTexts();
    }
  }
}

/* ==========================================================================
   3. Mobile Drawer Navigation
   ========================================================================== */
function initMobileMenu() {
  const btn = document.getElementById('nav-mobile-btn');
  const drawer = document.getElementById('mobile-drawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawer.classList.toggle('open');
    btn.innerHTML = drawer.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  document.querySelectorAll('.mobile-link, .mobile-cta-wrap a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !btn.contains(e.target)) {
      drawer.classList.remove('open');
      btn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
}

/* ==========================================================================
   4. Scroll Reveal Animations & Nav Blur State
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  const nav = document.getElementById('nav');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    elements.forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('visible'));
  }

  // Floating Nav background blur on scroll
  window.addEventListener('scroll', () => {
    if (nav) {
      if (window.scrollY > 25) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  }, { passive: true });
}

/* ==========================================================================
   5. Interactive FAQ Accordion
   ========================================================================== */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(otherItem => {
        otherItem.classList.remove('open');
        const otherAns = otherItem.querySelector('.faq-answer');
        if (otherAns) otherAns.style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
      }
    });
  });
}

/* ==========================================================================
   6. Hero Centerpiece: Holographic STEM Core Visual Canvas
   ========================================================================== */
function initHeroCoreCanvas() {
  const canvas = document.getElementById('hero-core-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let frame = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  const container = canvas.parentElement;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  container.addEventListener('mouseleave', () => {
    targetMouseX = 0;
    targetMouseY = 0;
  });

  // Particle constellation
  const particleCount = 45;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 280,
      z: Math.random() * 300 + 50,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: i % 4 === 0 ? '#00F0FF' : i % 4 === 1 ? '#A855F7' : i % 4 === 2 ? '#10B981' : '#FF6B4A'
    });
  }

  function drawCore() {
    frame++;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const cx = width / 2 + mouseX * 25;
    const cy = height / 2 + mouseY * 20;

    // 1. Dynamic Ambient Radial Field
    const ambientGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 220);
    ambientGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
    ambientGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.1)');
    ambientGrad.addColorStop(1, 'rgba(4, 6, 10, 0)');
    ctx.fillStyle = ambientGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.fill();

    // 2. 3D Floating STEM Rings
    const rotSpeed = frame * 0.012;

    function drawOrbitRing(radiusX, radiusY, angle, color, electronPos) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + mouseX * 0.2);

      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Electron Bead
      const ex = Math.cos(rotSpeed * electronPos) * radiusX;
      const ey = Math.sin(rotSpeed * electronPos) * radiusY;

      ctx.beginPath();
      ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    drawOrbitRing(160, 48, rotSpeed * 0.5, 'rgba(0, 240, 255, 0.7)', 1.2);
    drawOrbitRing(145, 56, -rotSpeed * 0.6 + 1.2, 'rgba(168, 85, 247, 0.7)', -1.5);
    drawOrbitRing(175, 42, rotSpeed * 0.4 + 2.4, 'rgba(16, 185, 129, 0.7)', 0.9);

    // 3. Central Quantum Core Nucleus
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    const nucleusGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 24);
    nucleusGrad.addColorStop(0, '#FFFFFF');
    nucleusGrad.addColorStop(0.3, '#00F0FF');
    nucleusGrad.addColorStop(0.8, '#0077B6');
    nucleusGrad.addColorStop(1, '#023E8A');
    ctx.fillStyle = nucleusGrad;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Background Particle Constellation & Wave Lines
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > 320) p.x = -320;
      if (p.x < -320) p.x = 320;
      if (p.y > 150) p.y = -150;
      if (p.y < -150) p.y = 150;

      const px = cx + p.x;
      const py = cy + p.y;

      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Connect near particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 75) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(cx + p2.x, cy + p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 75)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawCore);
  }
  drawCore();
}

/* ==========================================================================
   7. Interactive Hardware Explorer ($20 ESP32 Kit)
   ========================================================================== */
function initHardwareExplorer() {
  const nodes = document.querySelectorAll('.hw-node');
  const titleEl = document.getElementById('hw-info-title');
  const costEl = document.getElementById('hw-info-cost');
  const descEl = document.getElementById('hw-info-desc');
  const iconEl = document.getElementById('hw-info-icon');
  const specsEl = document.getElementById('hw-info-specs');

  if (!nodes.length || !titleEl) return;

  const hwData = {
    esp32: {
      title: 'ESP32 DevKit V1 Microcontroller',
      cost: 'Chi phí: ~95.000đ ($4.00)',
      icon: '<i class="fas fa-microchip"></i>',
      desc: 'Trái tim xử lý của tay cầm VLAB. Trang bị vi xử lý 2 nhân 32-bit Xtensa 240MHz, tích hợp sẵn Bluetooth BLE 5.0 và WiFi, chịu trách nhiệm thu thập tín hiệu cảm biến và tính toán bộ lọc Kalman.',
      specs: [
        { k: 'Xung nhịp:', v: '240 MHz Dual-Core' },
        { k: 'Giao thức:', v: 'BLE 5.0 Ultra-Low Latency (≤ 18ms)' },
        { k: 'Nguồn cấp:', v: '3.3V - 5V DC' }
      ]
    },
    imu: {
      title: 'Cảm biến IMU MPU9250 (9-Axis Motion)',
      cost: 'Chi phí: ~75.000đ ($3.00)',
      icon: '<i class="fas fa-compass"></i>',
      desc: 'Module cảm biến chuyển động 9 trục tích hợp con quay hồi chuyển 3 trục (Gyroscope), gia tốc kế 3 trục (Accelerometer) và cảm biến từ trường Trái Đất (Magnetometer) định vị hướng tay cầm tuyệt đối.',
      specs: [
        { k: 'Độ nhạy Gyro:', v: '±250 to ±2000 °/s' },
        { k: 'Độ nhạy Accel:', v: '±2g to ±16g' },
        { k: 'Giao tiếp:', v: 'I2C 400kHz Fast Mode' }
      ]
    },
    joystick: {
      title: 'Joystick Mini & Nút Bấm Cảm Ứng',
      cost: 'Chi phí: ~25.000đ ($1.00)',
      icon: '<i class="fas fa-gamepad"></i>',
      desc: 'Cần gạt analog 2 trục XY kết hợp nút bấm công tắc bấm nhạy, hỗ trợ học sinh di chuyển trong không gian phòng thí nghiệm ảo và kích hoạt thao tác gắp dụng cụ, rót hóa chất.',
      specs: [
        { k: 'Tín hiệu:', v: '2 Analog + 2 Digital Switches' },
        { k: 'Tuổi thọ:', v: '> 1.000.000 lần bấm' }
      ]
    },
    battery: {
      title: 'Pin Li-Ion 18650 & Mạch Sạc Type-C',
      cost: 'Chi phí: ~50.000đ ($2.00)',
      icon: '<i class="fas fa-battery-full"></i>',
      desc: 'Khối pin dung lượng cao 2200mAh kết hợp mạch hạ áp TP4056 tích hợp cổng Type-C, cho phép sạc nhanh tiện lợi và cung cấp nguồn điện không dây liên tục trên 8 tiếng.',
      specs: [
        { k: 'Dung lượng:', v: '2200 mAh (3.7V)' },
        { k: 'Thời lượng:', v: '> 8 giờ thực hành liên tục' },
        { k: 'Cổng sạc:', v: 'USB Type-C 5V 1A' }
      ]
    },
    enclosure: {
      title: 'Vỏ In 3D Công Thái Học (Nhựa PLA)',
      cost: 'Chi phí: ~50.000đ ($2.00)',
      icon: '<i class="fas fa-cube"></i>',
      desc: 'Thiết kế vừa vặn theo giải phẫu bàn tay học sinh, trọng lượng siêu nhẹ dưới 120g, được in 3D chính xác bằng vật liệu nhựa sinh học thân thiện môi trường.',
      specs: [
        { k: 'Vật liệu:', v: 'PLA Bio-plastic' },
        { k: 'Trọng lượng:', v: '~115 grams' },
        { k: 'Mã nguồn mở:', v: 'File STL miễn phí trên GitHub' }
      ]
    },
    headset: {
      title: 'Kính VR Gài Điện Thoại (VR Box / Cardboard)',
      cost: 'Chi phí: ~95.000đ ($4.00)',
      icon: '<i class="fas fa-vr-cardboard"></i>',
      desc: 'Kính thực tế ảo giá rẻ gài smartphone với thấu kính hội tụ phi cầu 42mm, cho góc nhìn rộng FOV 90° và khoảng cách điều chỉnh tiêu cự phù hợp cho cả học sinh bị cận thị.',
      specs: [
        { k: 'Kích thước máy:', v: 'Smartphone 4.7 – 6.8 inch' },
        { k: 'Góc nhìn FOV:', v: '90° Wide Stereoscopic' },
        { k: 'Điều chỉnh:', v: 'Tiêu cự & Khoảng cách 2 mắt' }
      ]
    }
  };

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const partKey = node.dataset.part;
      const data = hwData[partKey];
      if (!data) return;

      titleEl.textContent = data.title;
      costEl.textContent = data.cost;
      descEl.textContent = data.desc;
      iconEl.innerHTML = data.icon;

      specsEl.innerHTML = data.specs.map(s => `
        <div class="hw-spec-row">
          <span>${s.k}</span>
          <strong>${s.v}</strong>
        </div>
      `).join('');
    });
  });
}

/* ==========================================================================
   8. FLAGSHIP FEATURE: LIVE STEM SANDBOX SUITE ENGINE
   ========================================================================== */
function initSTEMSandboxSuite() {
  const canvas = document.getElementById('sandbox-canvas');
  const graphCanvas = document.getElementById('telemetry-graph-canvas');
  if (!canvas || !graphCanvas) return;

  const ctx = canvas.getContext('2d');
  const graphCtx = graphCanvas.getContext('2d');

  // Master State
  const state = {
    activeLab: 'physics', // 'physics' | 'chemistry' | 'biology' | 'engineering'
    subMode: 'pendulum',   // depends on activeLab
    speed: 1,
    isPaused: false,
    soundEnabled: true,
    fps: 60,
    time: 0,

    // Physics parameters
    physics: {
      mode: 'pendulum', // 'pendulum' | 'spring' | 'projectile'
      length: 140,      // cm
      gravity: 9.8,     // m/s2
      mass: 1.0,        // kg
      damping: 0.002,
      angle: 0.65,      // rad
      angleVel: 0,
      angleAccel: 0,
      isDragging: false,
      // Projectile
      projAngle: 45,    // deg
      projSpeed: 25,    // m/s
      projX: 0,
      projY: 0,
      projVx: 0,
      projVy: 0,
      isFlying: false,
      flightTime: 0,
      trajectory: [],
      targetX: 350
    },

    // Chemistry parameters
    chemistry: {
      mode: 'titration', // 'titration' | 'metal'
      indicator: 'phenolphthalein', // 'phenolphthalein' | 'bromothymol' | 'universal'
      ph: 1.0,
      volAcid: 25.0,     // mL 0.1M HCl
      volBaseAdded: 0.0, // mL 0.1M NaOH
      dripRate: 0,       // 0: off, 1: slow, 2: fast
      drops: [],
      stirrerAngle: 0,
      titrationHistory: [{ v: 0, ph: 1.0 }],
      // Metal reactivity
      metal: 'mg', // 'mg' | 'zn' | 'fe' | 'cu'
      bubbles: [],
      reactionTemp: 25.0
    },

    // Biology parameters
    biology: {
      specimen: 'plant', // 'plant' | 'neuron' | 'bacteria'
      zoom: 1.0,        // 0.5x to 3.0x
      focus: 1.0,       // 0 (blurry) to 1.0 (sharp)
      panX: 0,
      panY: 0,
      isPanning: false,
      lastMouseX: 0,
      lastMouseY: 0,
      selectedOrganelle: null,
      chloroplastAngle: 0,
      actionPotentialPos: 0
    },

    // Engineering parameters
    engineering: {
      mode: 'breadboard', // 'breadboard' | 'logic'
      voltage: 9.0,       // Volts
      resistance: 100,    // Ohms
      switchState: true,
      electrons: [],
      // Logic gates
      gateType: 'AND',    // 'AND' | 'OR' | 'XOR' | 'NOT'
      inputA: false,
      inputB: true
    }
  };

  // Web Audio Synth for STEM audio feedback
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    playBeep(freq = 440, type = 'sine', duration = 0.08) {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) { /* ignore */ }
    },
    playDrop() {
      this.playBeep(650, 'sine', 0.06);
    },
    playClick() {
      this.playBeep(880, 'triangle', 0.03);
    }
  };

  // HiDPI Canvas Resize Handler
  function resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const vpRect = canvas.parentElement.getBoundingClientRect();
    canvas.width = vpRect.width * dpr;
    canvas.height = (vpRect.height || 480) * dpr;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    const graphRect = graphCanvas.parentElement.getBoundingClientRect();
    graphCanvas.width = graphRect.width * dpr;
    graphCanvas.height = (graphRect.height || 90) * dpr;
    graphCtx.resetTransform?.();
    graphCtx.scale(dpr, dpr);
  }
  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  // Initialize electron particle pool for engineering
  for (let i = 0; i < 28; i++) {
    state.engineering.electrons.push(i / 28);
  }

  // Bind UI Tabs and Controls
  const tabs = document.querySelectorAll('.sandbox-tab');
  const submodesContainer = document.getElementById('sandbox-submodes');
  const panelTitle = document.getElementById('sandbox-panel-title');
  const panelDesc = document.getElementById('sandbox-panel-desc');
  const formulaBox = document.getElementById('sandbox-formula-box');
  const controlsDeck = document.getElementById('sandbox-controls');
  const hudModeText = document.getElementById('hud-mode-text');
  const hudInstruction = document.getElementById('hud-instruction');
  const graphTitle = document.getElementById('telemetry-graph-title');
  const metricsGrid = document.getElementById('telemetry-metrics');

  const pauseBtn = document.getElementById('sandbox-btn-pause');
  const pauseIcon = document.getElementById('pause-icon');
  const resetBtn = document.getElementById('sandbox-btn-reset');
  const soundBtn = document.getElementById('sandbox-btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  const speedBtns = document.querySelectorAll('.speed-btn');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeLab = tab.dataset.lab;
      AudioEngine.playClick();
      updateLabUI();
    });
  });

  // Global switch sandbox tab helper (used from other sections)
  window.switchSandboxTab = function(labKey) {
    const targetTab = document.querySelector(`.sandbox-tab[data-lab="${labKey}"]`);
    if (targetTab) targetTab.click();
    const sandboxSection = document.getElementById('sandbox-section');
    if (sandboxSection) sandboxSection.scrollIntoView({ behavior: 'smooth' });
  };

  // Speed controls
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.speed = parseFloat(btn.dataset.speed);
      AudioEngine.playClick();
    });
  });

  // Pause toggle
  pauseBtn.addEventListener('click', () => {
    state.isPaused = !state.isPaused;
    pauseIcon.className = state.isPaused ? 'fas fa-play' : 'fas fa-pause';
    AudioEngine.playClick();
  });

  // Sound toggle
  soundBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    soundIcon.className = state.soundEnabled ? 'fas fa-volume-high' : 'fas fa-volume-xmark';
    AudioEngine.playClick();
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    resetActiveSimulation();
    AudioEngine.playClick();
  });

  function resetActiveSimulation() {
    if (state.activeLab === 'physics') {
      state.physics.angle = 0.65;
      state.physics.angleVel = 0;
      state.physics.isFlying = false;
      state.physics.flightTime = 0;
      state.physics.trajectory = [];
    } else if (state.activeLab === 'chemistry') {
      state.chemistry.volBaseAdded = 0;
      state.chemistry.ph = 1.0;
      state.chemistry.drops = [];
      state.chemistry.titrationHistory = [{ v: 0, ph: 1.0 }];
      state.chemistry.dripRate = 0;
      state.chemistry.bubbles = [];
      state.chemistry.reactionTemp = 25.0;
    } else if (state.activeLab === 'biology') {
      state.biology.zoom = 1.0;
      state.biology.focus = 1.0;
      state.biology.panX = 0;
      state.biology.panY = 0;
      state.biology.selectedOrganelle = null;
    } else if (state.activeLab === 'engineering') {
      state.engineering.switchState = true;
      state.engineering.voltage = 9.0;
      state.engineering.resistance = 100;
      state.engineering.inputA = false;
      state.engineering.inputB = true;
    }
  }

  // Update Controls and Information on Tab Change
  function updateLabUI() {
    const lab = state.activeLab;

    if (lab === 'physics') {
      hudModeText.textContent = 'PHYSICS ENGINE · VERLET RK4';
      graphTitle.textContent = 'Biểu đồ cơ năng thời gian thực (Eđ & Et)';
      hudInstruction.innerHTML = '<i class="fas fa-hand-pointer"></i> <span>Kéo thả quả cầu để đặt góc ban đầu hoặc chỉnh thanh trượt</span>';

      submodesContainer.innerHTML = `
        <button class="submode-pill ${state.physics.mode === 'pendulum' ? 'active' : ''}" data-sub="pendulum">⚛️ Con lắc đơn</button>
        <button class="submode-pill ${state.physics.mode === 'projectile' ? 'active' : ''}" data-sub="projectile">🚀 Ném xiên 2D</button>
      `;

      if (state.physics.mode === 'pendulum') {
        panelTitle.textContent = 'Dao động điều hòa — Con lắc đơn';
        panelDesc.textContent = 'Trực quan hóa sự chuyển hóa qua lại giữa Động năng (Eđ) và Thế năng (Et) theo định luật bảo toàn cơ năng.';
        formulaBox.innerHTML = '<code>T = 2π√(L/g) · E = Eđ + Et = ½mv² + mgh</code>';

        controlsDeck.innerHTML = `
          <div class="control-group">
            <div class="control-label"><span>Chiều dài dây (L)</span><span class="control-val" id="val-phys-l">${state.physics.length} cm</span></div>
            <input type="range" class="control-slider" id="slider-phys-l" min="60" max="220" value="${state.physics.length}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>Gia tốc trọng trường (g)</span><span class="control-val" id="val-phys-g">${state.physics.gravity} m/s²</span></div>
            <input type="range" class="control-slider" id="slider-phys-g" min="1.0" max="25.0" step="0.1" value="${state.physics.gravity}">
            <div class="preset-buttons-row">
              <button class="preset-chip" data-g="9.8">🌍 Trái Đất (9.8)</button>
              <button class="preset-chip" data-g="1.6">🌕 Mặt Trăng (1.6)</button>
              <button class="preset-chip" data-g="3.7">🪐 Sao Hỏa (3.7)</button>
              <button class="preset-chip" data-g="24.8">⚡ Sao Mộc (24.8)</button>
            </div>
          </div>
          <div class="control-group">
            <div class="control-label"><span>Khối lượng vật (m)</span><span class="control-val" id="val-phys-m">${state.physics.mass.toFixed(1)} kg</span></div>
            <input type="range" class="control-slider" id="slider-phys-m" min="0.2" max="5.0" step="0.1" value="${state.physics.mass}">
          </div>
        `;

        document.getElementById('slider-phys-l').addEventListener('input', (e) => {
          state.physics.length = parseFloat(e.target.value);
          document.getElementById('val-phys-l').textContent = `${state.physics.length} cm`;
        });
        document.getElementById('slider-phys-g').addEventListener('input', (e) => {
          state.physics.gravity = parseFloat(e.target.value);
          document.getElementById('val-phys-g').textContent = `${state.physics.gravity} m/s²`;
        });
        document.getElementById('slider-phys-m').addEventListener('input', (e) => {
          state.physics.mass = parseFloat(e.target.value);
          document.getElementById('val-phys-m').textContent = `${state.physics.mass.toFixed(1)} kg`;
        });
        document.querySelectorAll('.preset-chip[data-g]').forEach(chip => {
          chip.addEventListener('click', () => {
            state.physics.gravity = parseFloat(chip.dataset.g);
            document.getElementById('slider-phys-g').value = state.physics.gravity;
            document.getElementById('val-phys-g').textContent = `${state.physics.gravity} m/s²`;
            AudioEngine.playClick();
          });
        });
      } else {
        // Projectile mode
        panelTitle.textContent = 'Chuyển động ném xiên trong trọng trường';
        panelDesc.textContent = 'Nghiên cứu góc bắn tối ưu để đạt tầm ném xa cực đại và độ cao cực đại.';
        formulaBox.innerHTML = '<code>L = (v₀²·sin 2α)/g · H_max = (v₀²·sin²α)/(2g)</code>';

        controlsDeck.innerHTML = `
          <div class="control-group">
            <div class="control-label"><span>Góc bắn (α)</span><span class="control-val" id="val-proj-a">${state.physics.projAngle}°</span></div>
            <input type="range" class="control-slider" id="slider-proj-a" min="10" max="85" value="${state.physics.projAngle}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>Vận tốc ban đầu (v₀)</span><span class="control-val" id="val-proj-v">${state.physics.projSpeed} m/s</span></div>
            <input type="range" class="control-slider" id="slider-proj-v" min="10" max="45" value="${state.physics.projSpeed}">
          </div>
          <button class="btn btn--primary btn--full" id="btn-fire-cannon" style="margin-top:8px;">
            <i class="fas fa-rocket"></i> <span>Khai Hỏa Pháo 🚀</span>
          </button>
        `;

        document.getElementById('slider-proj-a').addEventListener('input', (e) => {
          state.physics.projAngle = parseInt(e.target.value);
          document.getElementById('val-proj-a').textContent = `${state.physics.projAngle}°`;
        });
        document.getElementById('slider-proj-v').addEventListener('input', (e) => {
          state.physics.projSpeed = parseInt(e.target.value);
          document.getElementById('val-proj-v').textContent = `${state.physics.projSpeed} m/s`;
        });
        document.getElementById('btn-fire-cannon').addEventListener('click', () => {
          fireProjectile();
        });
      }
    } else if (lab === 'chemistry') {
      hudModeText.textContent = 'CHEMISTRY LAB · TITRATION pH CURVE';
      graphTitle.textContent = 'Đường cong chuẩn độ pH theo thể tích NaOH (mL)';
      hudInstruction.innerHTML = '<i class="fas fa-hand-pointer"></i> <span>Mở van buret nhỏ giọt NaOH hoặc chọn chất chỉ thị màu</span>';

      submodesContainer.innerHTML = `
        <button class="submode-pill ${state.chemistry.mode === 'titration' ? 'active' : ''}" data-sub="titration">🧪 Chuẩn độ Axit-Bazơ</button>
        <button class="submode-pill ${state.chemistry.mode === 'metal' ? 'active' : ''}" data-sub="metal">⚡ Kim loại + Axit (H₂↑)</button>
      `;

      if (state.chemistry.mode === 'titration') {
        panelTitle.textContent = 'Chuẩn độ Dung dịch HCl bằng NaOH 0.1M';
        panelDesc.textContent = 'Quan sát điểm tương đương tại pH = 7.0 khi axit HCl được trung hòa hoàn toàn bởi NaOH.';
        formulaBox.innerHTML = '<code>H⁺ + OH⁻ → H₂O · [H⁺]·V₁ = [OH⁻]·V₂</code>';

        controlsDeck.innerHTML = `
          <div class="control-group">
            <div class="control-label"><span>Chất chỉ thị pH</span><span class="control-val">${state.chemistry.indicator}</span></div>
            <div class="preset-buttons-row">
              <button class="preset-chip ${state.chemistry.indicator === 'phenolphthalein' ? 'active' : ''}" data-ind="phenolphthalein">Phenolphthalein</button>
              <button class="preset-chip ${state.chemistry.indicator === 'bromothymol' ? 'active' : ''}" data-ind="bromothymol">Bromothymol Blue</button>
              <button class="preset-chip ${state.chemistry.indicator === 'universal' ? 'active' : ''}" data-ind="universal">Thước đo vạn năng</button>
            </div>
          </div>
          <div class="control-group" style="margin-top:6px;">
            <div class="control-label"><span>Van Buret nhỏ giọt</span><span class="control-val" id="val-drip-status">${state.chemistry.dripRate === 0 ? 'Đang Đóng' : state.chemistry.dripRate === 1 ? 'Nhỏ Giọt Chậm' : 'Xả Nhanh'}</span></div>
            <div class="preset-buttons-row">
              <button class="preset-chip ${state.chemistry.dripRate === 0 ? 'active' : ''}" data-drip="0">🛑 Đóng van</button>
              <button class="preset-chip ${state.chemistry.dripRate === 1 ? 'active' : ''}" data-drip="1">💧 Nhỏ 1 giọt/s</button>
              <button class="preset-chip ${state.chemistry.dripRate === 2 ? 'active' : ''}" data-drip="2">🌊 Xả nhanh</button>
            </div>
          </div>
        `;

        document.querySelectorAll('.preset-chip[data-ind]').forEach(chip => {
          chip.addEventListener('click', () => {
            state.chemistry.indicator = chip.dataset.ind;
            AudioEngine.playClick();
            updateLabUI();
          });
        });

        document.querySelectorAll('.preset-chip[data-drip]').forEach(chip => {
          chip.addEventListener('click', () => {
            state.chemistry.dripRate = parseInt(chip.dataset.drip);
            AudioEngine.playClick();
            updateLabUI();
          });
        });
      } else {
        // Metal reaction
        panelTitle.textContent = 'Phản ứng Kim loại tác dụng Axit HCl';
        panelDesc.textContent = 'Nghiên cứu tốc độ sủi bọt khí H₂ theo dãy hoạt động hóa học kim loại: K, Na, Mg, Al, Zn, Fe, Cu.';
        formulaBox.innerHTML = '<code>M + 2HCl → MCl₂ + H₂↑ + Q (tỏa nhiệt)</code>';

        controlsDeck.innerHTML = `
          <div class="control-group">
            <div class="control-label"><span>Chọn kim loại thử nghiệm</span><span class="control-val">${state.chemistry.metal.toUpperCase()}</span></div>
            <div class="preset-buttons-row">
              <button class="preset-chip ${state.chemistry.metal === 'mg' ? 'active' : ''}" data-metal="mg">Magie (Mg) — Cực mạnh</button>
              <button class="preset-chip ${state.chemistry.metal === 'zn' ? 'active' : ''}" data-metal="zn">Kẽm (Zn) — Vừa phải</button>
              <button class="preset-chip ${state.chemistry.metal === 'fe' ? 'active' : ''}" data-metal="fe">Sắt (Fe) — Chậm</button>
              <button class="preset-chip ${state.chemistry.metal === 'cu' ? 'active' : ''}" data-metal="cu">Đồng (Cu) — Không p/ư</button>
            </div>
          </div>
        `;

        document.querySelectorAll('.preset-chip[data-metal]').forEach(chip => {
          chip.addEventListener('click', () => {
            state.chemistry.metal = chip.dataset.metal;
            state.chemistry.reactionTemp = 25.0;
            state.chemistry.bubbles = [];
            AudioEngine.playClick();
            updateLabUI();
          });
        });
      }
    } else if (lab === 'biology') {
      hudModeText.textContent = 'BIO OPTICAL MICROSCOPE · 1000x';
      graphTitle.textContent = 'Thang đo kích thước tế bào (Micromet / Nanomet)';
      hudInstruction.innerHTML = '<i class="fas fa-hand-pointer"></i> <span>Kéo chuột để di chuyển bàn sa trượt, phóng to và nhấp vào các bào quan</span>';

      submodesContainer.innerHTML = `
        <button class="submode-pill ${state.biology.specimen === 'plant' ? 'active' : ''}" data-sub="plant">🌿 Tế bào thực vật</button>
        <button class="submode-pill ${state.biology.specimen === 'neuron' ? 'active' : ''}" data-sub="neuron">🧠 Tế bào thần kinh</button>
        <button class="submode-pill ${state.biology.specimen === 'bacteria' ? 'active' : ''}" data-sub="bacteria">🦠 Virus & Vi khuẩn</button>
      `;

      panelTitle.textContent = 'Kính hiển vi quang học ảo — Soi vi cấu trúc tế bào';
      panelDesc.textContent = 'Quan sát màng sinh chất, nhân tế bào, lục lạp chuyển động dòng chất tế bào và xung điện thần kinh.';
      formulaBox.innerHTML = '<code>Độ phóng đại = Vật kính × Thị kính · Resolving power ~ 0.2 µm</code>';

      controlsDeck.innerHTML = `
        <div class="control-group">
          <div class="control-label"><span>Vật kính phóng đại</span><span class="control-val" id="val-bio-zoom">${(state.biology.zoom * 100).toFixed(0)}x</span></div>
          <input type="range" class="control-slider" id="slider-bio-zoom" min="0.5" max="2.8" step="0.1" value="${state.biology.zoom}">
          <div class="preset-buttons-row">
            <button class="preset-chip" data-zoom="0.5">40x</button>
            <button class="preset-chip" data-zoom="1.0">100x</button>
            <button class="preset-chip" data-zoom="1.8">400x</button>
            <button class="preset-chip" data-zoom="2.5">1000x (Dầu soi)</button>
          </div>
        </div>
        <div class="control-group" style="margin-top:6px;">
          <div class="control-label"><span>Ốc vi cấp (Độ nét Focus)</span><span class="control-val" id="val-bio-focus">${(state.biology.focus * 100).toFixed(0)}%</span></div>
          <input type="range" class="control-slider" id="slider-bio-focus" min="0.2" max="1.0" step="0.05" value="${state.biology.focus}">
        </div>
      `;

      document.getElementById('slider-bio-zoom').addEventListener('input', (e) => {
        state.biology.zoom = parseFloat(e.target.value);
        document.getElementById('val-bio-zoom').textContent = `${(state.biology.zoom * 100).toFixed(0)}x`;
      });
      document.getElementById('slider-bio-focus').addEventListener('input', (e) => {
        state.biology.focus = parseFloat(e.target.value);
        document.getElementById('val-bio-focus').textContent = `${(state.biology.focus * 100).toFixed(0)}%`;
      });
      document.querySelectorAll('.preset-chip[data-zoom]').forEach(chip => {
        chip.addEventListener('click', () => {
          state.biology.zoom = parseFloat(chip.dataset.zoom);
          document.getElementById('slider-bio-zoom').value = state.biology.zoom;
          document.getElementById('val-bio-zoom').textContent = `${(state.biology.zoom * 100).toFixed(0)}x`;
          AudioEngine.playClick();
        });
      });
    } else if (lab === 'engineering') {
      hudModeText.textContent = 'ELECTRONICS BREADBOARD · OHMS LAW';
      graphTitle.textContent = 'Dạng sóng điện áp & Dòng điện theo thời gian';
      hudInstruction.innerHTML = '<i class="fas fa-hand-pointer"></i> <span>Bật công tắc, điều chỉnh điện áp & điện trở để xem dòng hạt electron</span>';

      submodesContainer.innerHTML = `
        <button class="submode-pill ${state.engineering.mode === 'breadboard' ? 'active' : ''}" data-sub="breadboard">⚡ Mạch điện DC Ohm</button>
        <button class="submode-pill ${state.engineering.mode === 'logic' ? 'active' : ''}" data-sub="logic">🔲 Cổng Logic Số</button>
      `;

      if (state.engineering.mode === 'breadboard') {
        panelTitle.textContent = 'Mạch điện một chiều DC & Định luật Ohm';
        panelDesc.textContent = 'Trực quan hóa dòng chuyển động có hướng của các electron tự do trong dây dẫn và công suất phát sáng của bóng đèn.';
        formulaBox.innerHTML = '<code>I = U / R · P = U · I = I² · R</code>';

        controlsDeck.innerHTML = `
          <div class="control-group">
            <div class="control-label"><span>Điện áp nguồn DC (U)</span><span class="control-val" id="val-eng-v">${state.engineering.voltage.toFixed(1)} V</span></div>
            <input type="range" class="control-slider" id="slider-eng-v" min="1.5" max="24.0" step="0.5" value="${state.engineering.voltage}">
          </div>
          <div class="control-group">
            <div class="control-label"><span>Điện trở tải (R)</span><span class="control-val" id="val-eng-r">${state.engineering.resistance} Ω</span></div>
            <input type="range" class="control-slider" id="slider-eng-r" min="10" max="300" step="5" value="${state.engineering.resistance}">
          </div>
          <button class="btn btn--secondary btn--full" id="btn-toggle-switch" style="margin-top:6px;">
            <i class="fas fa-toggle-on"></i> <span>Công tắc: <strong>${state.engineering.switchState ? 'ĐANG BẬT (ON)' : 'ĐANG TẮT (OFF)'}</strong></span>
          </button>
        `;

        document.getElementById('slider-eng-v').addEventListener('input', (e) => {
          state.engineering.voltage = parseFloat(e.target.value);
          document.getElementById('val-eng-v').textContent = `${state.engineering.voltage.toFixed(1)} V`;
        });
        document.getElementById('slider-eng-r').addEventListener('input', (e) => {
          state.engineering.resistance = parseInt(e.target.value);
          document.getElementById('val-eng-r').textContent = `${state.engineering.resistance} Ω`;
        });
        document.getElementById('btn-toggle-switch').addEventListener('click', () => {
          state.engineering.switchState = !state.engineering.switchState;
          AudioEngine.playClick();
          updateLabUI();
        });
      } else {
        // Logic Gates
        panelTitle.textContent = 'Cổng Logic Số Cơ Bản (Digital Logic)';
        panelDesc.textContent = 'Kiểm tra bảng chân lý (Truth Table) nhị phân với các cổng logic AND, OR, XOR, NOT.';
        formulaBox.innerHTML = '<code>AND: Y = A · B | OR: Y = A + B | XOR: Y = A ⊕ B</code>';

        controlsDeck.innerHTML = `
          <div class="control-group">
            <div class="control-label"><span>Loại cổng logic</span><span class="control-val">${state.engineering.gateType}</span></div>
            <div class="preset-buttons-row">
              <button class="preset-chip ${state.engineering.gateType === 'AND' ? 'active' : ''}" data-gate="AND">AND</button>
              <button class="preset-chip ${state.engineering.gateType === 'OR' ? 'active' : ''}" data-gate="OR">OR</button>
              <button class="preset-chip ${state.engineering.gateType === 'XOR' ? 'active' : ''}" data-gate="XOR">XOR</button>
              <button class="preset-chip ${state.engineering.gateType === 'NOT' ? 'active' : ''}" data-gate="NOT">NOT</button>
            </div>
          </div>
          <div class="control-group" style="margin-top:8px;display:flex;gap:8px;flex-direction:row;">
            <button class="btn btn--secondary" id="btn-logic-a" style="flex:1;">Input A: <strong>${state.engineering.inputA ? '1 (HIGH)' : '0 (LOW)'}</strong></button>
            ${state.engineering.gateType !== 'NOT' ? `<button class="btn btn--secondary" id="btn-logic-b" style="flex:1;">Input B: <strong>${state.engineering.inputB ? '1 (HIGH)' : '0 (LOW)'}</strong></button>` : ''}
          </div>
        `;

        document.querySelectorAll('.preset-chip[data-gate]').forEach(chip => {
          chip.addEventListener('click', () => {
            state.engineering.gateType = chip.dataset.gate;
            AudioEngine.playClick();
            updateLabUI();
          });
        });
        document.getElementById('btn-logic-a').addEventListener('click', () => {
          state.engineering.inputA = !state.engineering.inputA;
          AudioEngine.playClick();
          updateLabUI();
        });
        const btnB = document.getElementById('btn-logic-b');
        if (btnB) {
          btnB.addEventListener('click', () => {
            state.engineering.inputB = !state.engineering.inputB;
            AudioEngine.playClick();
            updateLabUI();
          });
        }
      }
    }

    // Submode button listeners
    submodesContainer.querySelectorAll('.submode-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const sub = btn.dataset.sub;
        if (state.activeLab === 'physics') state.physics.mode = sub;
        else if (state.activeLab === 'chemistry') state.chemistry.mode = sub;
        else if (state.activeLab === 'biology') state.biology.specimen = sub;
        else if (state.activeLab === 'engineering') state.engineering.mode = sub;
        AudioEngine.playClick();
        updateLabUI();
      });
    });
  }

  // Cannon Fire Method
  function fireProjectile() {
    state.physics.isFlying = true;
    state.physics.flightTime = 0;
    state.physics.trajectory = [];
    state.physics.projX = 60;
    state.physics.projY = 0;
    const angleRad = (state.physics.projAngle * Math.PI) / 180;
    state.physics.projVx = state.physics.projSpeed * Math.cos(angleRad);
    state.physics.projVy = state.physics.projSpeed * Math.sin(angleRad);
    AudioEngine.playBeep(220, 'square', 0.15);
  }

  // Mouse Drag / Pan Interaction Handlers for Viewport
  let isPointerDown = false;
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      onPointerDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }, { passive: true });

  window.addEventListener('touchend', onPointerUp);

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function onPointerDown(e) {
    const coords = getCanvasCoords(e);
    isPointerDown = true;

    if (state.activeLab === 'physics' && state.physics.mode === 'pendulum') {
      const w = canvas.clientWidth;
      const originX = w / 2;
      const originY = 50;
      const l = state.physics.length;
      const bobX = originX + l * Math.sin(state.physics.angle);
      const bobY = originY + l * Math.cos(state.physics.angle);
      const dist = Math.hypot(coords.x - bobX, coords.y - bobY);

      if (dist < 40) {
        state.physics.isDragging = true;
        state.physics.angleVel = 0;
      }
    } else if (state.activeLab === 'biology') {
      state.biology.isPanning = true;
      state.biology.lastMouseX = coords.x;
      state.biology.lastMouseY = coords.y;
    }
  }

  function onPointerMove(e) {
    const coords = getCanvasCoords(e);

    if (state.activeLab === 'physics' && state.physics.mode === 'pendulum' && state.physics.isDragging) {
      const originX = canvas.clientWidth / 2;
      const originY = 50;
      const dx = coords.x - originX;
      const dy = coords.y - originY;
      state.physics.angle = Math.atan2(dx, dy);
      state.physics.angleVel = 0;
    } else if (state.activeLab === 'biology' && state.biology.isPanning) {
      const dx = coords.x - state.biology.lastMouseX;
      const dy = coords.y - state.biology.lastMouseY;
      state.biology.panX += dx;
      state.biology.panY += dy;
      state.biology.lastMouseX = coords.x;
      state.biology.lastMouseY = coords.y;
    }
  }

  function onPointerUp() {
    isPointerDown = false;
    state.physics.isDragging = false;
    state.biology.isPanning = false;
  }

  // --------------------------------------------------------------------------
  // Main Render & Simulation Loop
  // --------------------------------------------------------------------------
  function mainSimulationLoop() {
    const dt = (1 / 60) * state.speed;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    if (state.activeLab === 'physics') {
      renderPhysicsLab(dt, w, h);
    } else if (state.activeLab === 'chemistry') {
      renderChemistryLab(dt, w, h);
    } else if (state.activeLab === 'biology') {
      renderBiologyLab(dt, w, h);
    } else if (state.activeLab === 'engineering') {
      renderEngineeringLab(dt, w, h);
    }

    requestAnimationFrame(mainSimulationLoop);
  }

  // --------------------------------------------------------------------------
  // 1. Physics Rendering Sub-engine
  // --------------------------------------------------------------------------
  function renderPhysicsLab(dt, w, h) {
    if (state.physics.mode === 'pendulum') {
      const originX = w / 2;
      const originY = 60;
      const p = state.physics;

      if (!state.isPaused && !p.isDragging) {
        // Angular acceleration α = -(g/L) * sin(θ) - damping * ω
        const gEff = p.gravity * 9.8;
        p.angleAccel = (-gEff / p.length) * Math.sin(p.angle) - p.damping * p.angleVel * 60;
        p.angleVel += p.angleAccel * dt;
        p.angle += p.angleVel * dt;
      }

      const bobX = originX + p.length * Math.sin(p.angle);
      const bobY = originY + p.length * Math.cos(p.angle);

      // Support ceiling bracket
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(originX - 50, originY - 14, 100, 14);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.strokeRect(originX - 50, originY - 14, 100, 14);

      // String line
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Pivot node
      ctx.beginPath();
      ctx.arc(originX, originY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00F0FF';
      ctx.fill();

      // Pendulum Bob Sphere
      ctx.beginPath();
      ctx.arc(bobX, bobY, 22, 0, Math.PI * 2);
      const bobGrad = ctx.createRadialGradient(bobX - 6, bobY - 6, 3, bobX, bobY, 22);
      bobGrad.addColorStop(0, '#FFFFFF');
      bobGrad.addColorStop(0.3, '#00D4FF');
      bobGrad.addColorStop(1, '#005F73');
      ctx.fillStyle = bobGrad;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dynamic Velocity Vector Arrow
      const vMagnitude = p.angleVel * p.length * 0.15;
      const vDirX = Math.cos(p.angle) * vMagnitude;
      const vDirY = -Math.sin(p.angle) * vMagnitude;

      ctx.beginPath();
      ctx.moveTo(bobX, bobY);
      ctx.lineTo(bobX + vDirX, bobY + vDirY);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Physics telemetry calculations
      const heightDrop = (p.length * (1 - Math.cos(p.angle))) / 100; // meters
      const linearVel = Math.abs(p.angleVel * (p.length / 100)); // m/s
      const eKinetic = 0.5 * p.mass * linearVel * linearVel;
      const ePotential = p.mass * p.gravity * heightDrop;
      const eTotal = eKinetic + ePotential;
      const periodT = (2 * Math.PI * Math.sqrt((p.length / 100) / p.gravity)).toFixed(2);

      metricsGrid.innerHTML = `
        <div class="tele-metric-box"><span>GÓC LỆCH θ</span><strong>${(p.angle * 180 / Math.PI).toFixed(1)}°</strong></div>
        <div class="tele-metric-box"><span>VẬN TỐC V</span><strong>${linearVel.toFixed(2)} m/s</strong></div>
        <div class="tele-metric-box"><span>CHU KỲ T</span><strong>${periodT} s</strong></div>
        <div class="tele-metric-box"><span>TỔNG CƠ NĂNG E</span><strong>${eTotal.toFixed(3)} J</strong></div>
      `;

      drawEnergyGraph(eKinetic, ePotential, eTotal);

    } else {
      // Projectile Simulation View
      const p = state.physics;
      const groundY = h - 60;
      const launchX = 70;

      // Draw Ground & Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, groundY);
        ctx.stroke();
      }

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, groundY, w, 60);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Target Pad
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(p.targetX - 25, groundY - 6, 50, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(p.targetX - 10, groundY - 6, 20, 6);

      // Trajectory History Dots
      if (p.trajectory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trajectory[0].x, p.trajectory[0].y);
        for (let pt of p.trajectory) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Cannon Barrel
      const angleRad = (p.projAngle * Math.PI) / 180;
      ctx.save();
      ctx.translate(launchX, groundY);
      ctx.rotate(-angleRad);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, -10, 45, 20);
      ctx.strokeStyle = '#00F0FF';
      ctx.strokeRect(0, -10, 45, 20);
      ctx.restore();

      // Flying projectile physics
      if (p.isFlying && !state.isPaused) {
        p.flightTime += dt * 2.5;
        p.projX = launchX + p.projVx * p.flightTime * 7;
        p.projY = groundY - (p.projVy * p.flightTime * 7 - 0.5 * p.gravity * 9.8 * p.flightTime * p.flightTime * 0.5);

        p.trajectory.push({ x: p.projX, y: p.projY });

        if (p.projY >= groundY) {
          p.projY = groundY;
          p.isFlying = false;
          AudioEngine.playBeep(320, 'triangle', 0.1);
        }

        // Draw active projectile
        ctx.beginPath();
        ctx.arc(p.projX, p.projY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#F59E0B';
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      const hMax = ((p.projSpeed * p.projSpeed * Math.pow(Math.sin(angleRad), 2)) / (2 * p.gravity)).toFixed(1);
      const rRange = ((p.projSpeed * p.projSpeed * Math.sin(2 * angleRad)) / p.gravity).toFixed(1);

      metricsGrid.innerHTML = `
        <div class="tele-metric-box"><span>TẦM BAY XA L</span><strong>${rRange} m</strong></div>
        <div class="tele-metric-box"><span>TẦM BAY CAO H</span><strong>${hMax} m</strong></div>
        <div class="tele-metric-box"><span>THỜI GIAN BAY t</span><strong>${p.flightTime.toFixed(2)} s</strong></div>
        <div class="tele-metric-box"><span>VẬN TỐC v₀</span><strong>${p.projSpeed} m/s</strong></div>
      `;
    }
  }

  function drawEnergyGraph(eKinetic, ePotential, eTotal) {
    const gw = graphCanvas.clientWidth;
    const gh = graphCanvas.clientHeight;
    graphCtx.clearRect(0, 0, gw, gh);

    // Energy Bar comparisons
    const maxE = Math.max(eTotal, 0.01) * 1.2;
    const barW = gw / 3 - 16;

    // Ek Bar
    const hK = (eKinetic / maxE) * (gh - 24);
    graphCtx.fillStyle = '#00F0FF';
    graphCtx.fillRect(16, gh - hK - 4, barW, hK);

    // Et Bar
    const hP = (ePotential / maxE) * (gh - 24);
    graphCtx.fillStyle = '#A855F7';
    graphCtx.fillRect(16 + barW + 10, gh - hP - 4, barW, hP);

    // E Total Bar
    const hT = (eTotal / maxE) * (gh - 24);
    graphCtx.fillStyle = '#10B981';
    graphCtx.fillRect(16 + (barW + 10) * 2, gh - hT - 4, barW, hT);

    // Labels
    graphCtx.fillStyle = '#94A3B8';
    graphCtx.font = '10px monospace';
    graphCtx.fillText('ĐỘNG NĂNG Eđ', 16, 12);
    graphCtx.fillText('THẾ NĂNG Et', 16 + barW + 10, 12);
    graphCtx.fillText('CƠ NĂNG E', 16 + (barW + 10) * 2, 12);
  }

  // --------------------------------------------------------------------------
  // 2. Chemistry Rendering Sub-engine
  // --------------------------------------------------------------------------
  function renderChemistryLab(dt, w, h) {
    const c = state.chemistry;
    const cx = w / 2;

    if (c.mode === 'titration') {
      const flaskX = cx;
      const flaskY = h / 2 + 100;
      const buretX = cx;
      const buretY = 40;

      // Handle dripping logic
      if (!state.isPaused && c.dripRate > 0) {
        state.time += dt;
        const dripInterval = c.dripRate === 1 ? 0.6 : 0.15;
        if (state.time > dripInterval) {
          state.time = 0;
          c.drops.push({ x: buretX, y: buretY + 160, vy: 180 });
          c.volBaseAdded += c.dripRate === 1 ? 0.25 : 0.75;
          AudioEngine.playDrop();

          // Calculate Sigmoid pH Curve
          // Equivalence point at V_base = 25.0 mL
          const vDelta = c.volBaseAdded - c.volAcid;
          if (vDelta < -5) {
            c.ph = 1.0 + (c.volBaseAdded / 20) * 0.8;
          } else if (vDelta >= -5 && vDelta <= 5) {
            // Steep jump around 25mL
            c.ph = 7.0 + Math.atan(vDelta * 1.5) * (6.0 / (Math.PI / 2));
          } else {
            c.ph = 13.0 - (1 / (vDelta - 4)) * 0.8;
          }
          c.ph = Math.max(1.0, Math.min(13.8, c.ph));
          c.titrationHistory.push({ v: c.volBaseAdded, ph: c.ph });
        }
      }

      // Update Drops
      for (let i = c.drops.length - 1; i >= 0; i--) {
        const d = c.drops[i];
        d.y += d.vy * dt;
        if (d.y > flaskY - 20) {
          c.drops.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(d.x, d.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
          ctx.fill();
        }
      }

      // Draw Glass Buret
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(buretX - 12, buretY, 24, 150);

      // Buret liquid column
      const buretFill = Math.max(0, 1 - c.volBaseAdded / 50);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.fillRect(buretX - 10, buretY + (1 - buretFill) * 145, 20, buretFill * 145);

      // Stopcock valve
      ctx.fillStyle = c.dripRate > 0 ? '#10B981' : '#EF4444';
      ctx.fillRect(buretX - 18, buretY + 150, 36, 8);

      // Color mapping according to chosen indicator
      let liquidColor = 'rgba(255,255,255,0.2)';
      if (c.indicator === 'phenolphthalein') {
        // Colorless at pH < 8.2, intense magenta pink at pH >= 8.2
        if (c.ph < 8.2) {
          liquidColor = 'rgba(240, 249, 255, 0.25)';
        } else {
          const intensity = Math.min((c.ph - 8.2) / 2, 1);
          liquidColor = `rgba(236, 72, 153, ${0.4 + intensity * 0.5})`;
        }
      } else if (c.indicator === 'bromothymol') {
        // Yellow (acid) -> Green (neutral) -> Blue (base)
        if (c.ph < 6.0) liquidColor = 'rgba(234, 179, 8, 0.75)';
        else if (c.ph > 7.6) liquidColor = 'rgba(37, 99, 235, 0.8)';
        else liquidColor = 'rgba(34, 197, 94, 0.75)';
      } else {
        // Universal Rainbow indicator
        const hue = Math.max(0, Math.min(280, (c.ph / 14) * 280));
        liquidColor = `hsla(${hue}, 85%, 55%, 0.75)`;
      }

      // Draw Erlenmeyer Flask
      const fw = 130;
      const fh = 120;
      ctx.beginPath();
      ctx.moveTo(flaskX - 25, flaskY - 60);
      ctx.lineTo(flaskX - 25, flaskY - 30);
      ctx.lineTo(flaskX - fw / 2, flaskY + fh / 2);
      ctx.lineTo(flaskX + fw / 2, flaskY + fh / 2);
      ctx.lineTo(flaskX + 25, flaskY - 30);
      ctx.lineTo(flaskX + 25, flaskY - 60);
      ctx.closePath();
      ctx.fillStyle = liquidColor;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Magnetic Stirrer whirlpool animation
      c.stirrerAngle += dt * 12;
      ctx.save();
      ctx.translate(flaskX, flaskY + fh / 2 - 16);
      ctx.rotate(c.stirrerAngle);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-12, -3, 24, 6);
      ctx.restore();

      // Titration Graph
      drawTitrationCurve(c.titrationHistory);

      metricsGrid.innerHTML = `
        <div class="tele-metric-box"><span>ĐỘ pH DUNG DỊCH</span><strong>pH ${c.ph.toFixed(2)}</strong></div>
        <div class="tele-metric-box"><span>V(NaOH) ĐÃ NHỎ</span><strong>${c.volBaseAdded.toFixed(2)} mL</strong></div>
        <div class="tele-metric-box"><span>TRẠNG THÁI</span><strong>${c.ph < 7 ? 'Axit (H⁺)' : c.ph > 7.2 ? 'Bazơ (OH⁻)' : 'Điểm Tương Đương 🎯'}</strong></div>
        <div class="tele-metric-box"><span>V(HCl) BAN ĐẦU</span><strong>${c.volAcid.toFixed(1)} mL</strong></div>
      `;
    } else {
      // Metal + Acid Reaction
      const beakerX = cx;
      const beakerY = h / 2 + 40;
      const bw = 180;
      const bh = 180;

      // Bubble spawning
      if (!state.isPaused && c.metal !== 'cu') {
        const rate = c.metal === 'mg' ? 4 : c.metal === 'zn' ? 2 : 1;
        for (let i = 0; i < rate; i++) {
          c.bubbles.push({
            x: beakerX + (Math.random() - 0.5) * (bw - 40),
            y: beakerY + bh / 2 - 20,
            r: Math.random() * 4 + 2,
            vy: Math.random() * 80 + 60
          });
        }
        c.reactionTemp += dt * (c.metal === 'mg' ? 1.5 : c.metal === 'zn' ? 0.6 : 0.2);
        c.reactionTemp = Math.min(75.0, c.reactionTemp);
      }

      // Draw Beaker with liquid
      ctx.fillStyle = 'rgba(6, 214, 160, 0.25)';
      ctx.fillRect(beakerX - bw / 2 + 8, beakerY - bh / 2 + 40, bw - 16, bh - 48);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.strokeRect(beakerX - bw / 2, beakerY - bh / 2, bw, bh);

      // Metal pellet inside beaker
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(beakerX - 30, beakerY + bh / 2 - 25, 60, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(c.metal.toUpperCase() + ' Pellet', beakerX - 22, beakerY + bh / 2 - 12);

      // Update & Draw Bubbles
      for (let i = c.bubbles.length - 1; i >= 0; i--) {
        const b = c.bubbles[i];
        b.y -= b.vy * dt;
        if (b.y < beakerY - bh / 2 + 35) {
          c.bubbles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        }
      }

      metricsGrid.innerHTML = `
        <div class="tele-metric-box"><span>KIM LOẠI</span><strong>${c.metal.toUpperCase()}</strong></div>
        <div class="tele-metric-box"><span>NHIỆT ĐỘ PHẢN ỨNG</span><strong>${c.reactionTemp.toFixed(1)} °C</strong></div>
        <div class="tele-metric-box"><span>KHÍ THOÁT RA</span><strong>H₂ ↑ (Hiđro)</strong></div>
        <div class="tele-metric-box"><span>TỐC ĐỘ PHẢN ỨNG</span><strong>${c.metal === 'mg' ? 'Mãnh Liệt' : c.metal === 'cu' ? 'Không phản ứng' : 'Vừa phải'}</strong></div>
      `;
    }
  }

  function drawTitrationCurve(history) {
    const gw = graphCanvas.clientWidth;
    const gh = graphCanvas.clientHeight;
    graphCtx.clearRect(0, 0, gw, gh);

    // Coordinate grid
    graphCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    graphCtx.lineWidth = 1;
    graphCtx.strokeRect(30, 8, gw - 40, gh - 24);

    // Equivalence line pH = 7
    const eqY = 8 + (1 - 7 / 14) * (gh - 24);
    graphCtx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    graphCtx.setLineDash([3, 3]);
    graphCtx.beginPath();
    graphCtx.moveTo(30, eqY);
    graphCtx.lineTo(gw - 10, eqY);
    graphCtx.stroke();
    graphCtx.setLineDash([]);

    if (history.length < 2) return;

    graphCtx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const pt = history[i];
      const px = 30 + (pt.v / 50) * (gw - 40);
      const py = 8 + (1 - pt.ph / 14) * (gh - 24);
      if (i === 0) graphCtx.moveTo(px, py);
      else graphCtx.lineTo(px, py);
    }
    graphCtx.strokeStyle = '#00F0FF';
    graphCtx.lineWidth = 2.5;
    graphCtx.stroke();
  }

  // --------------------------------------------------------------------------
  // 3. Biology Virtual Microscope Sub-engine
  // --------------------------------------------------------------------------
  function renderBiologyLab(dt, w, h) {
    const bio = state.biology;
    const cx = w / 2;
    const cy = h / 2;

    // Viewport Clipping Mask (Circular Ocular)
    const ocularRadius = Math.min(w, h) * 0.42;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ocularRadius, 0, Math.PI * 2);
    ctx.clip();

    // Microscope Specimen Slide Background
    ctx.fillStyle = '#060B14';
    ctx.fillRect(0, 0, w, h);

    // Apply Zoom & Pan Transformations
    ctx.save();
    ctx.translate(cx + bio.panX, cy + bio.panY);
    ctx.scale(bio.zoom, bio.zoom);

    // Focus blur effect
    const blurAmount = (1 - bio.focus) * 12;
    if (blurAmount > 0.5) {
      ctx.filter = `blur(${blurAmount}px)`;
    }

    if (bio.specimen === 'plant') {
      // Plant Cell (Polygonal Cell Wall & Chloroplasts)
      bio.chloroplastAngle += dt * 0.8;

      // Cell Wall
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 6;
      ctx.strokeRect(-120, -90, 240, 180);

      // Cytoplasm
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(-117, -87, 234, 174);

      // Central Vacuole
      ctx.beginPath();
      ctx.ellipse(20, 10, 70, 45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.stroke();

      // Nucleus
      ctx.beginPath();
      ctx.arc(-60, -30, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#C084FC';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-55, -28, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#6B21A8';
      ctx.fill();

      // Streaming Chloroplasts
      for (let i = 0; i < 8; i++) {
        const ang = bio.chloroplastAngle + (i * Math.PI) / 4;
        const cX = Math.cos(ang) * 90;
        const cY = Math.sin(ang) * 65;
        ctx.beginPath();
        ctx.ellipse(cX, cY, 12, 8, ang, 0, Math.PI * 2);
        ctx.fillStyle = '#22C55E';
        ctx.fill();
      }

    } else if (bio.specimen === 'neuron') {
      // Neuron with Action Potential Spark
      bio.actionPotentialPos += dt * 1.5;
      if (bio.actionPotentialPos > 1) bio.actionPotentialPos = 0;

      // Soma & Nucleus
      ctx.beginPath();
      ctx.arc(-80, 0, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Axon Cable
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.lineTo(140, 0);
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Myelin Sheaths
      for (let x = -20; x <= 100; x += 35) {
        ctx.fillStyle = 'rgba(251, 146, 60, 0.7)';
        ctx.fillRect(x, -12, 28, 24);
      }

      // Action Potential Electric Spark
      const sparkX = -40 + bio.actionPotentialPos * 180;
      ctx.beginPath();
      ctx.arc(sparkX, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

    } else {
      // Bacteriophage Virus
      ctx.fillStyle = '#EC4899';
      ctx.strokeStyle = '#F472B6';
      ctx.lineWidth = 3;

      // Icosahedral Head
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(35, -45);
      ctx.lineTo(35, -10);
      ctx.lineTo(0, 15);
      ctx.lineTo(-35, -10);
      ctx.lineTo(-35, -45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail Sheath
      ctx.fillStyle = '#A855F7';
      ctx.fillRect(-8, 15, 16, 45);

      // Tail Fibers
      ctx.beginPath();
      ctx.moveTo(0, 60); ctx.lineTo(-40, 90);
      ctx.moveTo(0, 60); ctx.lineTo(40, 90);
      ctx.moveTo(0, 60); ctx.lineTo(-20, 95);
      ctx.moveTo(0, 60); ctx.lineTo(20, 95);
      ctx.strokeStyle = '#EC4899';
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();

    // Reticle crosshair overlay
    ctx.beginPath();
    ctx.arc(cx, cy, ocularRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();

    metricsGrid.innerHTML = `
      <div class="tele-metric-box"><span>MẪU THỊ KÍNH</span><strong>${bio.specimen === 'plant' ? 'Tế Bào Thực Vật' : bio.specimen === 'neuron' ? 'Tế Bào Nơ-ron' : 'Khuẩn Thể Phage'}</strong></div>
      <div class="tele-metric-box"><span>ĐỘ PHÓNG ĐẠI</span><strong>${(bio.zoom * 100).toFixed(0)}x</strong></div>
      <div class="tele-metric-box"><span>ĐỘ SẮC NÉT</span><strong>${(bio.focus * 100).toFixed(0)}%</strong></div>
      <div class="tele-metric-box"><span>THỊ SAI KÍNH</span><strong>FOV 90° Standard</strong></div>
    `;
  }

  // --------------------------------------------------------------------------
  // 4. Engineering & Electronics Sub-engine
  // --------------------------------------------------------------------------
  function renderEngineeringLab(dt, w, h) {
    const eng = state.engineering;
    const cx = w / 2;
    const cy = h / 2;

    if (eng.mode === 'breadboard') {
      const current = eng.switchState ? eng.voltage / eng.resistance : 0; // Amperes
      const power = eng.switchState ? current * eng.voltage : 0;          // Watts

      // Circuit wire loop coordinates
      const x1 = cx - 160;
      const y1 = cy - 70;
      const x2 = cx + 160;
      const y2 = cy + 70;

      // Draw Main Circuit Loop
      ctx.strokeStyle = eng.switchState ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Battery on Left Wire
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(x1 - 18, cy - 25, 36, 50);
      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`+ ${eng.voltage.toFixed(1)}V -`, x1 - 24, cy + 5);

      // Switch on Top Wire
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(cx - 30, y1 - 10, 60, 20);
      ctx.strokeStyle = eng.switchState ? '#10B981' : '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 20, y1);
      ctx.lineTo(cx + (eng.switchState ? 20 : 15), y1 - (eng.switchState ? 0 : 18));
      ctx.stroke();

      // Light Bulb on Right Wire
      const bulbX = x2;
      const bulbY = cy;
      const bulbGlow = Math.min(power / 2, 1);

      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 24, 0, Math.PI * 2);
      ctx.fillStyle = eng.switchState ? `rgba(250, 204, 21, ${0.3 + bulbGlow * 0.7})` : 'rgba(255, 255, 255, 0.1)';
      ctx.shadowColor = '#FACC15';
      ctx.shadowBlur = eng.switchState ? bulbGlow * 30 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#FACC15';
      ctx.stroke();

      // Moving Electron Particles
      if (eng.switchState && !state.isPaused) {
        const loopPerimeter = 2 * (x2 - x1) + 2 * (y2 - y1);
        const speed = current * 600;

        for (let i = 0; i < eng.electrons.length; i++) {
          eng.electrons[i] = (eng.electrons[i] + (speed * dt) / loopPerimeter) % 1;
          const distAlong = eng.electrons[i] * loopPerimeter;

          let ex = x1, ey = y1;
          if (distAlong < (x2 - x1)) {
            ex = x1 + distAlong; ey = y1;
          } else if (distAlong < (x2 - x1) + (y2 - y1)) {
            ex = x2; ey = y1 + (distAlong - (x2 - x1));
          } else if (distAlong < 2 * (x2 - x1) + (y2 - y1)) {
            ex = x2 - (distAlong - (x2 - x1) - (y2 - y1)); ey = y2;
          } else {
            ex = x1; ey = y2 - (distAlong - 2 * (x2 - x1) - (y2 - y1));
          }

          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#00F0FF';
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      metricsGrid.innerHTML = `
        <div class="tele-metric-box"><span>ĐIỆN ÁP U</span><strong>${eng.voltage.toFixed(1)} V</strong></div>
        <div class="tele-metric-box"><span>CƯỜNG ĐỘ DÒNG I</span><strong>${(current * 1000).toFixed(1)} mA</strong></div>
        <div class="tele-metric-box"><span>ĐIỆN TRỞ R</span><strong>${eng.resistance} Ω</strong></div>
        <div class="tele-metric-box"><span>CÔNG SUẤT P</span><strong>${power.toFixed(2)} W</strong></div>
      `;
    } else {
      // Digital Logic Gate View
      const g = eng.gateType;
      let out = false;
      if (g === 'AND') out = eng.inputA && eng.inputB;
      else if (g === 'OR') out = eng.inputA || eng.inputB;
      else if (g === 'XOR') out = eng.inputA !== eng.inputB;
      else if (g === 'NOT') out = !eng.inputA;

      // Draw Gate Box
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 50, cy - 45, 100, 90);
      ctx.fillRect(cx - 50, cy - 45, 100, 90);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(g, cx - 18, cy + 6);

      // Input Lines
      ctx.strokeStyle = eng.inputA ? '#10B981' : '#64748B';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx - 130, cy - 20); ctx.lineTo(cx - 50, cy - 20); ctx.stroke();
      ctx.fillText(eng.inputA ? '1' : '0', cx - 150, cy - 14);

      if (g !== 'NOT') {
        ctx.strokeStyle = eng.inputB ? '#10B981' : '#64748B';
        ctx.beginPath(); ctx.moveTo(cx - 130, cy + 20); ctx.lineTo(cx - 50, cy + 20); ctx.stroke();
        ctx.fillText(eng.inputB ? '1' : '0', cx - 150, cy + 26);
      }

      // Output Line & LED
      ctx.strokeStyle = out ? '#10B981' : '#64748B';
      ctx.beginPath(); ctx.moveTo(cx + 50, cy); ctx.lineTo(cx + 120, cy); ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 140, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = out ? '#10B981' : '#334155';
      ctx.shadowColor = out ? '#10B981' : 'transparent';
      ctx.shadowBlur = out ? 20 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#10B981';
      ctx.stroke();

      metricsGrid.innerHTML = `
        <div class="tele-metric-box"><span>CỔNG LOGIC</span><strong>${g}</strong></div>
        <div class="tele-metric-box"><span>INPUT A</span><strong>${eng.inputA ? '1 (HIGH)' : '0 (LOW)'}</strong></div>
        <div class="tele-metric-box"><span>INPUT B</span><strong>${g === 'NOT' ? 'N/A' : eng.inputB ? '1 (HIGH)' : '0 (LOW)'}</strong></div>
        <div class="tele-metric-box"><span>OUTPUT Y</span><strong>${out ? '1 (TRUE / ON)' : '0 (FALSE / OFF)'}</strong></div>
      `;
    }
  }

  // Expose updateTexts for bilingual support
  window.VLAB_SANDBOX = {
    updateTexts() {
      updateLabUI();
    }
  };

  updateLabUI();
  mainSimulationLoop();
}
