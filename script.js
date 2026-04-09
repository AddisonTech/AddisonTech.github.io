/* ============================================================
   AOS — Animate On Scroll
   ============================================================ */
AOS.init({
    duration: 680,
    easing: 'ease-out-cubic',
    once: true,
    offset: 70,
});

/* ============================================================
   Navbar — scroll state
   ============================================================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ============================================================
   Mobile nav toggle
   ============================================================ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close on backdrop click (tap outside drawer)
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
});

/* ============================================================
   Active nav link on scroll
   ============================================================ */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navAnchors.forEach(a => a.classList.remove('active'));
            const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (match) match.classList.add('active');
        }
    });
}, { threshold: 0.35, rootMargin: '-60px 0px 0px 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   Typewriter — hero subtitle
   ============================================================ */
const PHRASES = [
    'Controls Engineering Technician',
    'Software Developer',
    'AI/ML Engineer in Progress',
    'Mechatronics → Machine Learning',
];

let phraseIdx = 0;
let charIdx   = 0;
let deleting  = false;
const typedEl = document.getElementById('typedText');

function typeStep() {
    const phrase = PHRASES[phraseIdx];

    if (deleting) {
        charIdx--;
    } else {
        charIdx++;
    }

    // Rebuild inner: text + permanent cursor span
    const text = phrase.substring(0, charIdx);
    typedEl.innerHTML = text + '<span class="cursor" aria-hidden="true"></span>';

    let delay = deleting ? 38 : 68;

    if (!deleting && charIdx === phrase.length) {
        delay    = 2200;
        deleting = true;
    } else if (deleting && charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        delay     = 320;
    }

    setTimeout(typeStep, delay);
}

// Small initial delay so the page has settled
setTimeout(typeStep, 600);

/* ============================================================
   Contact form — mailto fallback
   ============================================================ */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name    = contactForm.querySelector('#fname').value.trim();
        const email   = contactForm.querySelector('#femail').value.trim();
        const subject = contactForm.querySelector('#fsubject').value.trim();
        const message = contactForm.querySelector('#fmessage').value.trim();

        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const uri  = `mailto:stalor54@yahoo.com`
                   + `?subject=${encodeURIComponent(subject || 'Portfolio Contact')}`
                   + `&body=${encodeURIComponent(body)}`;

        window.location.href = uri;
    });
}
