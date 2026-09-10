(() => {
  'use strict';
  let language = 'vi';
  try { language = localStorage.getItem('vlab-language') === 'en' ? 'en' : 'vi'; } catch (_) {}
  const tr = (vi, en) => language === 'vi' ? vi : en;
  function translate(lang) {
    language = lang; document.documentElement.lang = lang;
    document.querySelectorAll('[data-vi][data-en]').forEach(el => { el.textContent = el.dataset[lang]; });
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
    document.querySelectorAll('[data-legal-lang]').forEach(el => { el.hidden = el.dataset.legalLang !== lang; });
    document.querySelectorAll('.legal-content[lang]').forEach(el => { el.hidden = el.lang !== lang; });
    try { localStorage.setItem('vlab-language', lang); } catch (_) {}
    document.dispatchEvent(new Event('languagechange'));
  }
  document.querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click', () => translate(el.dataset.lang)));
  translate(language);
  const contact = document.createElement('dialog');
  contact.className = 'contact-dialog';
  contact.setAttribute('aria-labelledby', 'contact-title');
  contact.innerHTML = '<button type="button" class="contact-close" aria-label="Đóng / Close">×</button><h2 id="contact-title" data-vi="Liên hệ VLAB" data-en="Contact VLAB">Liên hệ VLAB</h2><p data-vi="Gửi lời nhắn cho Đội Ngựa Mán qua địa chỉ dưới đây." data-en="Send the Ngựa Mán team a message at the address below.">Gửi lời nhắn cho Đội Ngựa Mán qua địa chỉ dưới đây.</p><input class="contact-address" aria-label="Email" readonly value="nguamanvlab@gmail.com"><button type="button" class="button contact-copy" data-vi="Sao chép email" data-en="Copy email">Sao chép email</button><p class="contact-status" role="status"></p>';
  document.body.append(contact);
  let contactTrigger;
  document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => {
    contactTrigger = button;
    contact.querySelector('.contact-status').textContent = '';
    translate(language);
    contact.showModal();
  }));
  contact.querySelector('.contact-close').addEventListener('click', () => contact.close());
  contact.addEventListener('click', event => { if (event.target === contact) { const r=contact.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)contact.close(); } });
  contact.addEventListener('close', () => contactTrigger?.focus());
  contact.querySelector('.contact-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('nguamanvlab@gmail.com'); contact.querySelector('.contact-status').textContent = tr('Đã sao chép địa chỉ email.','Email address copied.'); }
    catch (_) { const input=contact.querySelector('input'); input.focus(); input.select(); contact.querySelector('.contact-status').textContent=tr('Chọn sao chép hoặc nhấn Ctrl+C.','Choose Copy or press Ctrl+C.'); }
  });
  function syncTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-logo]').forEach(img => { img.src = `assets/images/logos/logo-${dark ? 'white' : 'black'}-text.png`; });
    const toggle = document.querySelector('.theme-toggle');
    const label = dark ? tr('Chuyển chế độ sáng', 'Switch to light mode') : tr('Chuyển chế độ tối', 'Switch to dark mode');
    toggle?.setAttribute('aria-label', label); toggle?.setAttribute('title', label);
    if (toggle) toggle.firstElementChild.textContent = dark ? '☀' : '☾';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c1422' : '#ffffff');
  }
  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('vlab-theme', theme); } catch (_) {}
    syncTheme();
  });
  document.addEventListener('languagechange', syncTheme);
  syncTheme();
  const menu = document.querySelector('.menu-button'), mobile = document.querySelector('#mobile-nav');
  const closeMenu = () => { mobile.hidden = true; menu.setAttribute('aria-expanded', 'false'); };
  menu?.addEventListener('click', () => { mobile.hidden = !mobile.hidden; menu.setAttribute('aria-expanded', String(!mobile.hidden)); });
  mobile?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  const canvas = document.querySelector('#experiment');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let mode = 0, time = 0, previous = 0, visible = false;
  let state = defaults();
  function defaults() { return {length:1.2,gravity:9.8,ph:7,zoom:200,specimen:'plant',gate:'AND',a:true,b:false,paused:matchMedia('(prefers-reduced-motion: reduce)').matches}; }
  const titles = [['Con lắc đơn','Simple pendulum'],['Thang pH','The pH scale'],['Quan sát tế bào','Explore a cell'],['Cổng logic','Logic gates']];
  const descriptions = [['Thay đổi chiều dài và gia tốc trọng trường. Mô hình góc nhỏ, bỏ qua lực cản.','Change length and gravity. Small-angle model without air resistance.'],['Màu chỉ thị mang tính minh họa. Không dùng để nhận diện hóa chất thực tế.','Indicator colours are illustrative, not a way to identify real chemicals.'],['Sơ đồ tế bào minh họa, không phải ảnh kính hiển vi.','An illustrative cell diagram, not a microscope photograph.'],['Bật hai đầu vào và khám phá quy tắc AND, OR, XOR.','Toggle two inputs and explore AND, OR and XOR.']];
  const controls = document.querySelector('#demo-inputs'), output = document.querySelector('#demo-output');
  const range = (id,label,min,max,step,unit) => `<label for="control-${id}">${label} <output>${state[id]}${unit}</output></label><input id="control-${id}" data-control="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${state[id]}">`;
  function result() { return state.gate === 'AND' ? state.a && state.b : state.gate === 'OR' ? state.a || state.b : state.a !== state.b; }
  function update() {
    controls.querySelectorAll('input[type=range]').forEach(el => { el.previousElementSibling.querySelector('output').textContent = el.value + ({length:' m',gravity:' m/s²',ph:'',zoom:'×'}[el.dataset.control]); });
    output.textContent = mode === 0 ? `T = 2π√(L/g) ≈ ${(2*Math.PI*Math.sqrt(state.length/state.gravity)).toFixed(2)} s` : mode === 1 ? `pH ${state.ph} · ${Number(state.ph)<7?tr('Axit','Acidic'):Number(state.ph)>7?tr('Bazơ','Basic'):tr('Trung tính','Neutral')} · [H⁺] ≈ 10⁻${state.ph} mol/L` : mode === 2 ? `${tr('Sơ đồ','Diagram')} · ${state.zoom}× · ${state.specimen==='plant'?tr('Tế bào thực vật','Plant cell'):tr('Tế bào động vật','Animal cell')}` : `${Number(state.a)} ${state.gate} ${Number(state.b)} = ${Number(result())}`;
    draw();
  }
  function render() {
    document.querySelector('#demo-title').textContent = tr(...titles[mode]);
    document.querySelector('#demo-description').textContent = tr(...descriptions[mode]);
    document.querySelector('#demo-category').textContent = `0${mode+1} / VLAB WEB DEMO`;
    document.querySelector('#demo-stage-label').textContent = tr(...titles[mode]);
    document.querySelector('#pause-demo').hidden = mode !== 0;
    document.querySelector('#pause-demo').textContent = state.paused ? tr('Tiếp tục','Resume') : tr('Tạm dừng','Pause');
    controls.innerHTML = mode === 0 ? range('length',tr('Chiều dài','Length'),.3,2,.1,' m')+range('gravity',tr('Trọng trường','Gravity'),1.6,20,.1,' m/s²') : mode === 1 ? range('ph','pH',0,14,1,'') : mode === 2 ? range('zoom',tr('Phóng đại sơ đồ','Diagram zoom'),100,400,50,'×')+`<label for="specimen">${tr('Mẫu','Specimen')}</label><select id="specimen"><option value="plant">${tr('Thực vật','Plant')}</option><option value="animal">${tr('Động vật','Animal')}</option></select>` : `<label for="gate">${tr('Cổng','Gate')}</label><select id="gate"><option>AND</option><option>OR</option><option>XOR</option></select><div class="logic-switches"><label><input id="input-a" type="checkbox" ${state.a?'checked':''}> A</label><label><input id="input-b" type="checkbox" ${state.b?'checked':''}> B</label></div>`;
    controls.querySelectorAll('[data-control]').forEach(el => el.addEventListener('input', () => { state[el.dataset.control] = Number(el.value); update(); }));
    for (const id of ['specimen','gate']) { const el = controls.querySelector('#'+id); if(el) { el.value=state[id]; el.addEventListener('change',()=>{state[id]=el.value;update();}); } }
    for (const id of ['a','b']) controls.querySelector('#input-'+id)?.addEventListener('change',e=>{state[id]=e.target.checked;update();});
    update();
  }
  function line(x,y,x2,y2,color='#8196b5',width=2) {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
  function circle(x,y,r,fill) {ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function label(text,x,y,size=18,color='#183757') {ctx.fillStyle=color;ctx.font=`500 ${size}px sans-serif`;ctx.textAlign='center';ctx.fillText(text,x,y);}
  function draw() {
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#f0f5fc';ctx.fillRect(0,0,w,h);
    for(let x=20;x<w;x+=26)for(let y=20;y<h;y+=26)circle(x,y,1,'#d7e2f1');
    if(mode===0){const length=Math.min(h*.62,w*.58)*state.length/2,angle=.22*Math.cos(time*Math.sqrt(state.gravity/state.length)),x=w/2+Math.sin(angle)*length,y=70+Math.cos(angle)*length;line(w/2-45,65,w/2+45,65,'#243f65',5);line(w/2,70,x,y,'#5b769b',3);circle(w/2,70,5,'#1d3557');circle(x,y,19,'#1670ee');circle(x-5,y-6,5,'#80b8ff');label('L = '+state.length.toFixed(1)+' m',w/2,h-30,15);}
    if(mode===1){const colors=['#dd4261','#e95851','#ec794b','#eea14c','#ddbb47','#a9c54c','#76ba65','#47b9a8','#44a9c3','#4485d0','#616bd0','#7b5dc4','#9757ae','#b548a1','#bb3f83'],x=w/2-65,y=h*.23;ctx.fillStyle=colors[state.ph]+'bb';ctx.fillRect(x+3,y+55,124,145);line(x,y,x,y+205,'#496686',3);line(x,y+205,x+130,y+205,'#496686',3);line(x+130,y+205,x+130,y,'#496686',3);label('pH '+state.ph,w/2,y+135,32,'#fff');for(let i=0;i<15;i++){ctx.fillStyle=colors[i];ctx.fillRect(w*.12+i*w*.76/15,h-44,w*.76/15-2,9);}}
    if(mode===2){ctx.save();ctx.translate(w/2,h/2);const s=.6+state.zoom/500;ctx.scale(s,s);ctx.fillStyle='#c3e7d7';ctx.strokeStyle='#4c957a';ctx.lineWidth=5;ctx.beginPath();if(state.specimen==='plant')ctx.roundRect(-105,-95,210,190,24);else ctx.ellipse(0,0,115,85,0,0,Math.PI*2);ctx.fill();ctx.stroke();circle(-20,-5,30,'#b6a0d8');circle(-15,-10,12,'#8065ac');for(let i=0;i<6;i++){const a=i*Math.PI/3;circle(Math.cos(a)*75,Math.sin(a)*58,10,state.specimen==='plant'?'#5d9e68':'#dfae76');}ctx.restore();label(tr('Sơ đồ minh họa','Illustrative diagram'),w/2,h-28,13);}
    if(mode===3){const x=w/2-45,y=h/2-40,on=result();line(40,y+15,x,y+15,state.a?'#1670ee':'#a0aec0',3);line(40,y+65,x,y+65,state.b?'#1670ee':'#a0aec0',3);ctx.fillStyle='#fff';ctx.strokeStyle='#7493b9';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,90,80,16);ctx.fill();ctx.stroke();label(state.gate,w/2,y+47,20);line(x+90,y+40,w-45,y+40,on?'#1670ee':'#a0aec0',3);circle(w-40,y+40,14,on?'#1670ee':'#bcc8d9');label('A: '+Number(state.a),55,y-5,14);label('B: '+Number(state.b),55,y+95,14);label(tr('Đầu ra','Output')+': '+Number(on),w/2,h-35,17);}
  }
  const tabs=[...document.querySelectorAll('[data-mode]')];
  function select(i){mode=i;tabs.forEach((el,n)=>{el.setAttribute('aria-selected',String(n===i));el.tabIndex=n===i?0:-1;});document.querySelector('#demo-panel').setAttribute('aria-labelledby','tab-'+i);render();}
  tabs.forEach((el,i)=>{el.addEventListener('click',()=>select(i));el.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%4;if(e.key==='ArrowLeft')n=(i+3)%4;if(e.key==='Home')n=0;if(e.key==='End')n=3;if(n!==undefined){e.preventDefault();select(n);tabs[n].focus();}});});
  document.querySelector('#pause-demo').addEventListener('click',()=>{state.paused=!state.paused;render();});
  document.querySelector('#reset-demo').addEventListener('click',()=>{state=defaults();time=0;render();});
  document.addEventListener('languagechange',render);
  new ResizeObserver(()=>{const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(canvas.clientWidth*dpr);canvas.height=Math.round(canvas.clientHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(canvas);
  function frame(now){if(visible&&!document.hidden&&mode===0&&!state.paused){time+=Math.min((now-previous)/1000,.05);draw();}previous=now;requestAnimationFrame(frame);}
  render();requestAnimationFrame(frame);
})();
