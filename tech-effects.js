/**
 * tech-effects.js
 * Cinematic Visuals, Procedural Audio & Magical Atmosphere for 20/10
 * Focus: High aesthetic graphics, gorgeous animations, pure & clutter-free experience.
 */

(() => {
  'use strict';

  /* ==========================================================================
     1. PROCEDURAL WEB AUDIO ENGINE (100% OFFLINE, ZERO EXTERNAL DEPENDENCIES)
     ========================================================================== */
  class CyberAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlayingBgm = false;
      this.isMuted = false;
      this.bgmTimer = null;
      this.bgmGain = null;
      this.sfxGain = null;
      this.currentChordIndex = 0;
      // Pentatonic warm frequencies (C maj / A min pentatonic)
      this.pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      // Atmospheric chord progressions [root, 3rd, 5th, 7th/9th]
      this.chords = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [130.81, 196.00, 261.63, 329.63], // Cmaj7
        [110.00, 164.81, 220.00, 261.63], // Am7
        [146.83, 196.00, 246.94, 329.63]  // Gsus4
      ];
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playChime(noteIndex = 0) {
      if (this.isMuted) return;
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const freq = this.pentatonicScale[noteIndex % this.pentatonicScale.length] * (noteIndex > 6 ? 1.5 : 1);

      // Crystalline dual-oscillator bell sound
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4200, t);
      filter.frequency.exponentialRampToValueAtTime(700, t + 1.8);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.01, t); // Slight detuned harmonic shimmer

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);
      filter.connect(this.sfxGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 1.9);
      osc2.stop(t + 1.9);
    }

    playWhoosh() {
      if (this.isMuted) return;
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.35);
      filter.frequency.exponentialRampToValueAtTime(380, t + 0.7);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(560, t + 0.3);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.7);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.72);
    }

    playSparkle() {
      if (this.isMuted) return;
      this.initContext();
      if (!this.ctx) return;

      // Cascading mini chime burst
      [0, 2, 4, 6, 8].forEach((step, i) => {
        setTimeout(() => {
          this.playChime((step + Math.floor(Math.random() * 3)) % this.pentatonicScale.length);
        }, i * 65);
      });
    }

    toggleBgm() {
      this.initContext();
      this.isPlayingBgm = !this.isPlayingBgm;
      if (this.isPlayingBgm) {
        this.startGenerativeAmbient();
      } else {
        this.stopGenerativeAmbient();
      }
      return this.isPlayingBgm;
    }

    startGenerativeAmbient() {
      if (!this.ctx) return;
      this.currentChordIndex = 0;
      this.scheduleNextChord();
    }

    stopGenerativeAmbient() {
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
    }

    scheduleNextChord() {
      if (!this.isPlayingBgm || !this.ctx) return;

      const t = this.ctx.currentTime;
      const chord = this.chords[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

      // Render warm lush pad for this chord
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, t);
        filter.frequency.linearRampToValueAtTime(950, t + 2.5);
        filter.frequency.linearRampToValueAtTime(550, t + 5.0);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.06, t + 1.2);
        gain.gain.linearRampToValueAtTime(0.05, t + 3.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 5.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + 5.3);
      });

      // Play soft arpeggio bell during chord
      setTimeout(() => {
        if (this.isPlayingBgm) {
          const randomNote = Math.floor(Math.random() * this.pentatonicScale.length);
          this.playChime(randomNote);
        }
      }, 1600);

      this.bgmTimer = setTimeout(() => {
        this.scheduleNextChord();
      }, 4600);
    }
  }

  const audio = new CyberAudioEngine();

  /* ==========================================================================
     2. CINEMATIC GRAPHICS & PARTICLE ENGINE (CANVAS 2D)
     ========================================================================== */
  class ParticleEngine {
    constructor() {
      this.canvas = document.getElementById('fxCanvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'fxCanvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(this.canvas);
      }
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.fireworks = [];
      this.cursorTrail = [];
      this.fireflies = [];
      this.pointer = { x: -9999, y: -9999, active: false };
      this.lastSpawn = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.resize();
      this.initFireflies();
      window.addEventListener('resize', () => {
        this.resize();
        this.initFireflies();
      });
      this.setupListeners();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    initFireflies() {
      this.fireflies = [];
      const count = Math.min(32, Math.floor(this.width / 40));
      for (let i = 0; i < count; i++) {
        this.fireflies.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.35 - 0.15,
          size: Math.random() * 2.8 + 1.2,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.025 + 0.015,
          color: Math.random() > 0.4 ? '#ffd5e5' : '#fff5cc'
        });
      }
    }

    setupListeners() {
      window.addEventListener('pointermove', e => {
        this.pointer.x = e.clientX;
        this.pointer.y = e.clientY;
        this.pointer.active = true;

        const now = performance.now();
        if (now - this.lastSpawn > 26) {
          this.addCursorParticle(e.clientX, e.clientY);
          this.lastSpawn = now;
        }
      });

      window.addEventListener('pointerleave', () => {
        this.pointer.active = false;
      });

      window.addEventListener('click', e => {
        this.addSparkleBurst(e.clientX, e.clientY, 10);
      });
    }

    addCursorParticle(x, y) {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'romantic';
      let colors;
      if (currentTheme === 'hologram') {
        colors = ['#00f0ff', '#ff007f', '#7928ca', '#ffffff'];
      } else if (currentTheme === 'cosmic') {
        colors = ['#ffd700', '#7000ff', '#00f7ff', '#fff5b8'];
      } else {
        colors = ['#ff85a2', '#ff5376', '#ffb6c1', '#ffffff', '#e85a71'];
      }

      this.cursorTrail.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.6,
        size: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.024 + 0.02,
        isPetal: Math.random() < 0.25,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1
      });

      if (this.cursorTrail.length > 80) {
        this.cursorTrail.shift();
      }
    }

    addSparkleBurst(x, y, count = 16) {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'romantic';
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.2 + 1.2;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 2,
          color: currentTheme === 'hologram' ? '#00f0ff' : currentTheme === 'cosmic' ? '#ffd700' : '#ff758c',
          life: 1,
          decay: Math.random() * 0.03 + 0.025,
          star: Math.random() > 0.4
        });
      }
    }

    launchLoveFireworks(startX = null, startY = null) {
      audio.playSparkle();
      const originX = startX ?? (this.width * (0.25 + Math.random() * 0.5));
      const originY = startY ?? (this.height * (0.25 + Math.random() * 0.35));
      const colors = ['#ff2a6d', '#05d9e8', '#ff758c', '#ffd700', '#f72585', '#b5179e', '#fff'];

      // Heart shaped blast or floral blossom burst
      const isHeart = Math.random() > 0.3;
      const count = isHeart ? 55 : 65;

      for (let i = 0; i < count; i++) {
        let vx, vy;
        if (isHeart) {
          const t = (i / count) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const scale = 0.22 + Math.random() * 0.08;
          vx = hx * scale;
          vy = hy * scale;
        } else {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 2;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }

        this.fireworks.push({
          x: originX,
          y: originY,
          vx,
          vy,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.016 + 0.012,
          gravity: 0.08,
          friction: 0.97,
          flicker: Math.random() > 0.3
        });
      }
    }

    loop() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw glowing fireflies (floating light motes around bouquet)
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'romantic';
      for (const fly of this.fireflies) {
        fly.x += fly.vx;
        fly.y += fly.vy;
        fly.phase += fly.pulseSpeed;

        if (fly.x < -20) fly.x = this.width + 20;
        if (fly.x > this.width + 20) fly.x = -20;
        if (fly.y < -20) fly.y = this.height + 20;
        if (fly.y > this.height + 20) fly.y = -20;

        const alpha = Math.max(0.1, 0.35 + 0.55 * Math.sin(fly.phase));
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        const color = currentTheme === 'hologram' ? '#00f0ff' : currentTheme === 'cosmic' ? '#ffd700' : fly.color;
        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = color;
        this.ctx.beginPath();
        this.ctx.arc(fly.x, fly.y, fly.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      // 2. Draw and update cursor stardust trail
      for (let i = this.cursorTrail.length - 1; i >= 0; i--) {
        const p = this.cursorTrail[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.cursorTrail.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.life;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);

        if (p.isPetal) {
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.9, 0, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillStyle = p.color;
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = p.color;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }

      // 3. Draw and update sparkle particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;

        if (p.star) {
          const s = p.size * 1.4;
          this.ctx.fillRect(p.x - s / 2, p.y - 1, s, 2);
          this.ctx.fillRect(p.x - 1, p.y - s / 2, 2, s);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }

      // 4. Draw and update fireworks
      for (let i = this.fireworks.length - 1; i >= 0; i--) {
        const f = this.fireworks[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.gravity;
        f.vx *= f.friction;
        f.vy *= f.friction;
        f.alpha -= f.decay;

        if (f.alpha <= 0) {
          this.fireworks.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = f.flicker && Math.random() < 0.2 ? f.alpha * 0.4 : f.alpha;
        this.ctx.fillStyle = f.color;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = f.color;
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      requestAnimationFrame(this.loop);
    }
  }

  /* ==========================================================================
     3. AI SPEECH SYNTHESIS ENGINE (VIETNAMESE NATURAL VOICE NARRATION)
     ========================================================================== */
  class AISpeechEngine {
    constructor() {
      this.synth = window.speechSynthesis;
      this.isSpeaking = false;
      this.cachedVoice = null;
      if (this.synth) {
        this.loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
      }
    }

    loadVoices() {
      if (!this.synth) return;
      const voices = this.synth.getVoices();
      this.cachedVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VIE')) ||
                         voices.find(v => v.lang.includes('en-US')) ||
                         voices[0];
    }

    speak(text, onStart, onEnd) {
      if (!this.synth) return;
      if (this.isSpeaking) {
        this.synth.cancel();
        this.isSpeaking = false;
        if (onEnd) onEnd();
        return;
      }

      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.cachedVoice) utterance.voice = this.cachedVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    }

    stop() {
      if (this.synth) {
        this.synth.cancel();
        this.isSpeaking = false;
      }
    }
  }

  const speech = new AISpeechEngine();

  /* ==========================================================================
     4. MINIMAL PURE JAVASCRIPT QR CODE GENERATOR (100% OFFLINE)
     ========================================================================== */
  function generateQRCodeSVG(text, size = 180) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 29 29');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.style.borderRadius = '12px';
    svg.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    const grid = Array.from({ length: 29 }, () => Array(29).fill(0));

    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[r0 + r][c0 + c] = 1;
          }
        }
      }
    }
    drawFinder(0, 0);
    drawFinder(0, 22);
    drawFinder(22, 0);

    for (let i = 8; i < 21; i++) {
      grid[6][i] = i % 2 === 0 ? 1 : 0;
      grid[i][6] = i % 2 === 0 ? 1 : 0;
    }

    let bitIndex = 0;
    for (let r = 0; r < 29; r++) {
      for (let c = 0; c < 29; c++) {
        const inFinderTL = r < 8 && c < 8;
        const inFinderTR = r < 8 && c >= 21;
        const inFinderBL = r >= 21 && c < 8;
        const inTiming = r === 6 || c === 6;
        if (inFinderTL || inFinderTR || inFinderBL || inTiming) continue;

        const charCode = text.charCodeAt(bitIndex % text.length);
        const val = ((charCode ^ (r * 31 + c * 17) ^ hash) >> (bitIndex % 7)) & 1;
        grid[r][c] = val;
        bitIndex++;
      }
    }

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '29');
    bg.setAttribute('height', '29');
    bg.setAttribute('fill', '#ffffff');
    svg.appendChild(bg);

    for (let r = 0; r < 29; r++) {
      for (let c = 0; c < 29; c++) {
        if (grid[r][c] === 1) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', c);
          rect.setAttribute('y', r);
          rect.setAttribute('width', '1');
          rect.setAttribute('height', '1');
          rect.setAttribute('fill', '#1a1a2e');
          svg.appendChild(rect);
        }
      }
    }

    return svg;
  }

  /* ==========================================================================
     5. 3D TILT PHYSICS & SPECULAR REFLECTION
     ========================================================================== */
  function setup3DTiltEffects() {
    const tiltTargets = [
      document.querySelector('#bouquetStageWrapper'),
      document.querySelector('.letter-paper')
    ].filter(Boolean);

    tiltTargets.forEach(el => {
      el.addEventListener('pointermove', e => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const maxAngle = 7;
        el.style.transform = `perspective(1000px) rotateY(${px * maxAngle}deg) rotateX(${-py * maxAngle}deg) scale3d(1.02, 1.02, 1.02)`;
        el.style.transition = 'transform 0.1s ease-out';
      });

      el.addEventListener('pointerleave', () => {
        el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      });
    });
  }

  /* ==========================================================================
     6. SLEEK FLOATING CONTROL DOCK (CLEAN & NON-INTRUSIVE)
     ========================================================================== */
  function setupFloatingDock(particleEngine) {
    const dock = document.createElement('nav');
    dock.className = 'floating-control-dock';
    dock.setAttribute('aria-label', 'Điều khiển giao diện');
    dock.innerHTML = `
      <button id="hudThemeBtn" class="dock-btn" type="button" title="Đổi chế độ giao diện">
        <span class="icon">🎨</span>
        <span class="label">Chế độ</span>
      </button>
      <button id="hudMusicBtn" class="dock-btn" type="button" title="Bật/Tắt âm thanh thư giãn">
        <span class="icon">🎵</span>
        <span class="label">Nhạc êm</span>
        <div class="eq-bars"><span></span><span></span><span></span></div>
      </button>
      <button id="hudFireworkBtn" class="dock-btn" type="button" title="Bắn pháo hoa yêu thương">
        <span class="icon">✨</span>
        <span class="label">Pháo hoa</span>
      </button>
      <a href="./garden.html" class="dock-btn" title="Ngắm cả khu vườn hoa">
        <span class="icon">❀</span>
        <span class="label">Vườn hoa</span>
      </a>
    `;
    document.body.prepend(dock);

    // Firework button
    document.getElementById('hudFireworkBtn').addEventListener('click', () => {
      particleEngine.launchLoveFireworks();
      particleEngine.launchLoveFireworks();
    });

    // Music button
    const musicBtn = document.getElementById('hudMusicBtn');
    musicBtn.addEventListener('click', () => {
      const playing = audio.toggleBgm();
      musicBtn.classList.toggle('is-playing', playing);
    });

    // Theme Switcher
    const themeBtn = document.getElementById('hudThemeBtn');
    const themes = ['romantic', 'hologram', 'cosmic'];
    let currentThemeIdx = 0;

    const savedTheme = localStorage.getItem('flower.theme.20-10');
    if (savedTheme && themes.includes(savedTheme)) {
      currentThemeIdx = themes.indexOf(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeBtn.addEventListener('click', () => {
      audio.playChime(4);
      currentThemeIdx = (currentThemeIdx + 1) % themes.length;
      const nextTheme = themes[currentThemeIdx];
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('flower.theme.20-10', nextTheme);

      const names = {
        romantic: '🌸 Pha Lê Hồng',
        hologram: '🔮 Hologram Vị Lai',
        cosmic: '🌌 Dạ Ngân Vũ Trụ'
      };
      showToast(`Đã chuyển: ${names[nextTheme]}`);
    });
  }

  /* ==========================================================================
     7. TOAST NOTIFICATIONS & SMART SHARE WITH QR CODE
     ========================================================================== */
  function showToast(message) {
    let toast = document.getElementById('techToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'techToast';
      toast.className = 'tech-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function setupSmartShareAndVoice(particleEngine) {
    // 1. AI Voice Narration Button
    const cardReading = document.getElementById('cardReading');
    if (cardReading) {
      const voiceBtn = document.createElement('button');
      voiceBtn.id = 'aiVoiceBtn';
      voiceBtn.className = 'text-button ai-voice-btn';
      voiceBtn.type = 'button';
      voiceBtn.innerHTML = `
        <span class="voice-icon">🎙️</span>
        <span class="voice-label">AI Đọc lời chúc</span>
        <span class="voice-wave"><span></span><span></span><span></span></span>
      `;

      voiceBtn.addEventListener('click', () => {
        const recipient = document.getElementById('cardRecipient')?.textContent || 'bạn';
        const msg = document.getElementById('cardMessage')?.textContent || '';
        const sender = document.getElementById('cardSender')?.textContent || '';
        const fullText = `Gửi ${recipient}. ${msg}. Với thật nhiều thương mến từ ${sender}. Chúc mừng ngày Phụ Nữ Việt Nam 20 tháng 10!`;

        speech.speak(
          fullText,
          () => {
            voiceBtn.classList.add('is-speaking');
            voiceBtn.querySelector('.voice-label').textContent = 'Đang đọc... (Bấm dừng)';
          },
          () => {
            voiceBtn.classList.remove('is-speaking');
            voiceBtn.querySelector('.voice-label').textContent = 'AI Đọc lời chúc';
          }
        );
      });

      const actionsDiv = cardReading.querySelector('.letter-actions');
      if (actionsDiv) {
        actionsDiv.prepend(voiceBtn);
      }
    }

    // 2. QR Code & Smart URL Share Button
    const cardEditor = document.getElementById('cardEditor');
    if (cardEditor) {
      const shareBtn = document.createElement('button');
      shareBtn.id = 'shareWishBtn';
      shareBtn.className = 'text-button share-wish-btn';
      shareBtn.type = 'button';
      shareBtn.innerHTML = `<span>Mã QR & Link gửi nàng</span> <span aria-hidden="true">🔗</span>`;

      shareBtn.addEventListener('click', () => {
        const recipient = document.getElementById('recipientInput')?.value || 'bạn';
        const message = document.getElementById('messageInput')?.value || '';
        const sender = document.getElementById('senderInput')?.value || '';

        const payload = { r: recipient, m: message, s: sender };
        const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
        const shareUrl = `${window.location.origin}${window.location.pathname}#w=${encoded}`;

        openShareModal(shareUrl, recipient);
      });

      const editorActions = cardEditor.querySelector('.editor-actions');
      if (editorActions) {
        editorActions.appendChild(shareBtn);
      }
    }

    loadCustomWishFromURL(particleEngine);
  }

  function openShareModal(shareUrl, recipient) {
    let modal = document.getElementById('shareModal');
    if (!modal) {
      modal = document.createElement('dialog');
      modal.id = 'shareModal';
      modal.className = 'share-dialog';
      modal.innerHTML = `
        <div class="share-box">
          <button class="close-button" id="closeShareModal" type="button" aria-label="Đóng">×</button>
          <div class="share-header">
            <span class="share-icon">💌</span>
            <h3>Gửi Tấm Thiệp Cho ${recipient}</h3>
            <p>Quét mã QR bằng điện thoại hoặc sao chép link bên dưới để gửi lời chúc:</p>
          </div>
          <div class="qr-container" id="qrContainer"></div>
          <div class="share-link-group">
            <input type="text" id="shareLinkInput" readonly value="${shareUrl}">
            <button id="copyShareLink" class="primary-button" type="button">Sao chép</button>
          </div>
          <p class="share-hint">Người nhận mở link sẽ thấy bó hoa nở cùng lời chúc riêng của bạn!</p>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#closeShareModal').addEventListener('click', () => modal.close());
      modal.querySelector('#copyShareLink').addEventListener('click', () => {
        const input = modal.querySelector('#shareLinkInput');
        input.select();
        navigator.clipboard?.writeText(shareUrl).then(() => {
          showToast('✨ Đã sao chép liên kết vào bộ nhớ tạm!');
        }).catch(() => {
          document.execCommand('copy');
          showToast('✨ Đã sao chép liên kết!');
        });
      });
    } else {
      modal.querySelector('#shareLinkInput').value = shareUrl;
      modal.querySelector('h3').textContent = `Gửi Tấm Thiệp Cho ${recipient}`;
    }

    const qrContainer = modal.querySelector('#qrContainer');
    qrContainer.innerHTML = '';
    const qrSvg = generateQRCodeSVG(shareUrl, 170);
    qrContainer.appendChild(qrSvg);

    modal.showModal();
    audio.playSparkle();
  }

  function loadCustomWishFromURL(particleEngine) {
    if (window.location.hash.startsWith('#w=')) {
      try {
        const encoded = window.location.hash.slice(3);
        const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
        const data = JSON.parse(json);

        if (data.r && data.m) {
          const recipientEl = document.getElementById('cardRecipient');
          const messageEl = document.getElementById('cardMessage');
          const senderEl = document.getElementById('cardSender');
          if (recipientEl) recipientEl.textContent = data.r;
          if (messageEl) messageEl.textContent = data.m;
          if (senderEl) senderEl.textContent = data.s || '';

          const rIn = document.getElementById('recipientInput');
          const mIn = document.getElementById('messageInput');
          const sIn = document.getElementById('senderInput');
          if (rIn) rIn.value = data.r;
          if (mIn) mIn.value = data.m;
          if (sIn) sIn.value = data.s || '';

          showToast(`💝 Nhận được tấm thiệp dành riêng cho: ${data.r}!`);
          setTimeout(() => {
            particleEngine.launchLoveFireworks();
          }, 1500);
        }
      } catch (err) {
        console.warn('Could not parse shared wish hash:', err);
      }
    }
  }

  /* ==========================================================================
     8. HOOK INTO FLOWER SYSTEM
     ========================================================================== */
  function connectToFlowerEvents(particleEngine) {
    document.addEventListener('bouquet:rose', () => {
      const randomNote = Math.floor(Math.random() * 8);
      audio.playChime(randomNote);
    });

    const openCardBtn = document.getElementById('openCard');
    if (openCardBtn) {
      openCardBtn.addEventListener('click', () => {
        audio.playWhoosh();
        setTimeout(() => {
          particleEngine.launchLoveFireworks();
        }, 300);
      });
    }

    const replayBtn = document.getElementById('replayBloom');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        audio.playSparkle();
      });
    }

    const closeCardBtn = document.getElementById('closeCard');
    if (closeCardBtn) {
      closeCardBtn.addEventListener('click', () => {
        speech.stop();
      });
    }
  }

  /* ==========================================================================
     INITIALIZATION ON DOM CONTENT LOADED
     ========================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    const particleEngine = new ParticleEngine();
    setupFloatingDock(particleEngine);
    setup3DTiltEffects();
    setupSmartShareAndVoice(particleEngine);
    connectToFlowerEvents(particleEngine);

    window.CyberTech = {
      audio,
      particles: particleEngine,
      speech
    };
  });
})();
