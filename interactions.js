'use strict';
/* ============================================================
   Portfolio — Interactive Visual Upgrades
   ============================================================ */


/* ============================================================
   1. STARFIELD — animated particle canvas in hero
   ============================================================ */
(function () {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, stars = [], raf = null;
    const COLORS = ['rgba(34,211,238,', 'rgba(167,139,250,', 'rgba(241,245,249,'];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        buildStars();
    }

    function buildStars() {
        const n = Math.min(Math.floor(W * H / 7200), 190);
        stars = Array.from({ length: n }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            r:  Math.random() * 1.25 + 0.22,
            vx: (Math.random() - 0.5) * 0.14,
            vy: (Math.random() - 0.5) * 0.14,
            a:  Math.random() * 0.5 + 0.15,
            da: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
            ci: Math.floor(Math.random() * COLORS.length),
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
            s.x += s.vx;  if (s.x < 0) s.x = W; else if (s.x > W) s.x = 0;
            s.y += s.vy;  if (s.y < 0) s.y = H; else if (s.y > H) s.y = 0;
            s.a += s.da;  if (s.a > 0.78 || s.a < 0.08) s.da *= -1;

            const col = COLORS[s.ci] + s.a.toFixed(2) + ')';
            ctx.save();
            ctx.shadowBlur = s.r * 7;
            ctx.shadowColor = col;
            ctx.fillStyle  = col;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        raf = requestAnimationFrame(draw);
    }

    function start() { if (!raf) draw(); }
    function stop()  { if (raf)  { cancelAnimationFrame(raf); raf = null; } }

    const heroEl = document.getElementById('home');
    if (heroEl) {
        new IntersectionObserver(entries => {
            entries[0].isIntersecting ? start() : stop();
        }, { threshold: 0 }).observe(heroEl);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
})();


/* ============================================================
   2. NEURAL NET — animated network visualization in hero
   ============================================================ */
(function () {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const container = document.getElementById('threejs-hero');
    if (!container) return;

    const SIZE = 360;
    const canvas = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    canvas.style.display = 'block';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Layer config
    const LAYER_CFG = [
        { xFrac: 0.14, count: 4, label: 'Input'  },
        { xFrac: 0.38, count: 6, label: ''        },
        { xFrac: 0.62, count: 6, label: ''        },
        { xFrac: 0.86, count: 4, label: 'Output'  },
    ];

    // Build node objects
    const nodes = [];
    LAYER_CFG.forEach((layer, li) => {
        const n = layer.count;
        const spacing = (SIZE * 0.78) / (n + 1);
        const yOffset = (SIZE - spacing * n) / 2;
        for (let i = 0; i < n; i++) {
            nodes.push({
                li,
                baseX: layer.xFrac * SIZE,
                baseY: yOffset + spacing * (i + 1),
                x: 0, y: 0,
                phase: Math.random() * Math.PI * 2,
                bobSpeed: 0.25 + Math.random() * 0.35,
            });
        }
    });

    // Build connections (adjacent layers, all-to-all)
    const connections = [];
    for (let li = 0; li < LAYER_CFG.length - 1; li++) {
        const lA = nodes.filter(n => n.li === li);
        const lB = nodes.filter(n => n.li === li + 1);
        for (const a of lA) {
            for (const b of lB) {
                connections.push({
                    a, b,
                    pulse: Math.random(),
                    pulseSpeed: 0.25 + Math.random() * 0.4,
                });
            }
        }
    }

    // Color: cyan (#22d3ee) at li=0 -> violet (#a78bfa) at li=3
    function lerpColor(li, alpha) {
        const t = li / (LAYER_CFG.length - 1);
        const r = Math.round(34  + (167 - 34)  * t);
        const g = Math.round(211 + (139 - 211) * t);
        const b = Math.round(238 + (250 - 238) * t);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    let mx = 0.5, my = 0.5;
    document.addEventListener('mousemove', e => {
        mx = e.clientX / window.innerWidth;
        my = e.clientY / window.innerHeight;
    }, { passive: true });

    let nnRaf = null;
    let elapsed = 0;
    let lastTs = null;

    function drawFrame(ts) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min((ts - lastTs) / 1000, 0.05);
        lastTs = ts;
        elapsed += dt;

        ctx.clearRect(0, 0, SIZE, SIZE);

        const offX = (mx - 0.5) * 20;
        const offY = (my - 0.5) * 12;

        // Update node positions (bob + parallax)
        for (const n of nodes) {
            const layerFrac = n.li / (LAYER_CFG.length - 1);
            n.x = n.baseX + offX * (layerFrac - 0.5) * 0.9;
            n.y = n.baseY + Math.sin(elapsed * n.bobSpeed + n.phase) * 4 + offY * 0.25;
        }

        // Draw connections
        for (const c of connections) {
            c.pulse = (c.pulse + c.pulseSpeed * dt) % 1;

            // Base line
            const lineGrad = ctx.createLinearGradient(c.a.x, c.a.y, c.b.x, c.b.y);
            lineGrad.addColorStop(0, lerpColor(c.a.li, 0.07));
            lineGrad.addColorStop(1, lerpColor(c.b.li, 0.07));
            ctx.beginPath();
            ctx.moveTo(c.a.x, c.a.y);
            ctx.lineTo(c.b.x, c.b.y);
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 0.7;
            ctx.stroke();

            // Traveling pulse dot
            const px = c.a.x + (c.b.x - c.a.x) * c.pulse;
            const py = c.a.y + (c.b.y - c.a.y) * c.pulse;
            const pli = c.a.li + (c.b.li - c.a.li) * c.pulse;
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = lerpColor(pli, 0.75);
            ctx.fill();
        }

        // Draw nodes
        for (const n of nodes) {
            // Glow halo
            const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 14);
            grd.addColorStop(0, lerpColor(n.li, 0.25));
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Node ring
            ctx.beginPath();
            ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = lerpColor(n.li, 0.18);
            ctx.fill();
            ctx.strokeStyle = lerpColor(n.li, 0.9);
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }

        // Layer labels
        ctx.font = '9px "JetBrains Mono", "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(148,163,184,0.45)';
        const labelY = SIZE - 10;
        ctx.fillText('Input',        LAYER_CFG[0].xFrac * SIZE + offX * (-0.5) * 0.9, labelY);
        ctx.fillText('Hidden layers', (LAYER_CFG[1].xFrac + LAYER_CFG[2].xFrac) / 2 * SIZE, labelY);
        ctx.fillText('Output',       LAYER_CFG[3].xFrac * SIZE + offX * (0.5) * 0.9, labelY);

        nnRaf = requestAnimationFrame(drawFrame);
    }

    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            if (!nnRaf) { lastTs = null; nnRaf = requestAnimationFrame(drawFrame); }
        } else {
            if (nnRaf) { cancelAnimationFrame(nnRaf); nnRaf = null; }
        }
    }, { threshold: 0 }).observe(container);

    lastTs = null;
    nnRaf = requestAnimationFrame(drawFrame);
})();


/* ============================================================
   3. ANIMATED SKILL BARS — animate on scroll into view
   ============================================================ */
(function () {
    const fills = document.querySelectorAll('.skill-bar-fill');
    if (!fills.length) return;

    const container = document.querySelector('.skill-bars');
    if (!container) return;

    let triggered = false;

    function runBars() {
        if (triggered) return;
        triggered = true;
        fills.forEach((el, i) => {
            setTimeout(() => {
                el.style.width = (el.dataset.pct || '0') + '%';
            }, i * 65);
        });
    }

    // Delay past AOS fade-in (AOS duration = 680ms) so the
    // width transition is visible, not hidden behind opacity:0
    const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            obs.disconnect();
            setTimeout(runBars, 750);
        }
    }, { threshold: 0.1 });

    obs.observe(container);
})();


/* ============================================================
   4. CUSTOM CURSOR — glowing dot + trailing ring
   ============================================================ */
(function () {
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    document.body.classList.add('custom-cursor-active');

    let mx = -300, my = -300;
    let rx = -300, ry = -300;
    let visible = false;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
        if (!visible) {
            dot.style.opacity  = '1';
            ring.style.opacity = '1';
            visible = true;
        }
    }, { passive: true });

    (function loopRing() {
        rx += (mx - rx) * 0.13;
        ry += (my - ry) * 0.13;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(loopRing);
    })();

    // Expand ring on interactive elements
    document.querySelectorAll('a, button, .project-card, .cert-card, .timeline-card, .contact-item, .blog-card-inner').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('cursor-expanded'),  { passive: true });
        el.addEventListener('mouseleave', () => ring.classList.remove('cursor-expanded'), { passive: true });
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
        visible = false;
    });
    document.addEventListener('mouseenter', () => { visible = false; });
})();


/* ============================================================
   5. HERO PARALLAX — depth layers on scroll
   ============================================================ */
(function () {
    const heroSection = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const glow1       = document.querySelector('.hero-glow-1');
    const glow2       = document.querySelector('.hero-glow-2');
    if (!heroSection || !heroContent) return;

    // Preserve any existing inline transform on glows from CSS animations
    // by using a wrapper translate on top of them
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const sy   = window.scrollY;
            const heroH = heroSection.offsetHeight;
            if (sy > heroH * 1.1) { ticking = false; return; }

            const frac = sy / heroH;

            heroContent.style.transform = `translateY(${sy * 0.17}px)`;
            heroContent.style.opacity   = Math.max(0, 1 - frac * 1.7).toFixed(3);

            if (glow1) glow1.style.marginTop = (sy * 0.14) + 'px';
            if (glow2) glow2.style.marginTop = (sy * 0.08) + 'px';

            ticking = false;
        });
    }, { passive: true });
})();
