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
   2. THREE.JS — dual wireframe icosahedron with mouse parallax
   ============================================================ */
(function () {
    if (typeof THREE === 'undefined') return;
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const container = document.getElementById('threejs-hero');
    if (!container) return;

    const SIZE = 360;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.0;

    // Outer icosahedron — cyan wireframe
    const outerMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.3, 1),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.30 })
    );
    scene.add(outerMesh);

    // Inner icosahedron — violet, counter-rotating
    const innerMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.75, 0),
        new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.20 })
    );
    scene.add(innerMesh);

    let tX = 0, tY = 0, cX = 0, cY = 0;
    document.addEventListener('mousemove', e => {
        tX = (e.clientX / window.innerWidth  - 0.5) * 0.65;
        tY = (e.clientY / window.innerHeight - 0.5) * 0.65;
    }, { passive: true });

    let threeRaf = null;
    function animate() {
        threeRaf = requestAnimationFrame(animate);
        cX += (tX - cX) * 0.04;
        cY += (tY - cY) * 0.04;

        outerMesh.rotation.x += 0.003 + cY * 0.007;
        outerMesh.rotation.y += 0.005 + cX * 0.007;
        innerMesh.rotation.x -= 0.005 - cY * 0.005;
        innerMesh.rotation.y -= 0.003 - cX * 0.005;

        renderer.render(scene, camera);
    }

    new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            if (!threeRaf) animate();
        } else {
            if (threeRaf) { cancelAnimationFrame(threeRaf); threeRaf = null; }
        }
    }, { threshold: 0 }).observe(container);

    animate();
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
