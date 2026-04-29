/* ============================================================
   Resume Builder Live Demo - state machine + animations

   Mirrors the real bullet scoring logic from analyzers.py:
     - strong opening action verb
     - quantified outcome (number)
     - length sweet spot (30 - 200 chars)
   Health score rolls up to a 0-100 number and a state label.
   ============================================================ */

(() => {
    'use strict';

    // ----------------------------------------------------------
    // Scenarios
    // ----------------------------------------------------------
    const SCENARIOS = {
        controls: {
            position: 'PLC / Controls Engineer  -  Daedalus Industrial',
            weak: [
                'Worked on PLC programs for the line',
                'Helped fix HMI bugs',
                'Was part of commissioning projects',
                'Did some training on safety systems',
            ],
            strong: [
                'Engineered Studio 5000 ladder logic for 4 packaging lines, cutting changeover time 38%',
                'Resolved 27 FactoryTalk HMI defects in Q3, restoring 99.4% uptime on the bottling cell',
                'Commissioned 6 high-speed servo systems across 2 plants under aggressive 12-week schedules',
                'Trained 14 maintenance technicians on TUV-certified safety system validation procedures',
            ],
            company: 'Daedalus Industrial',
            coach: 'Two bullets miss the basics: no quantified outcome and a weak verb. Suggesting metric-driven rewrites.',
        },
        software: {
            position: 'Senior Software Engineer  -  Platform Team',
            weak: [
                'Worked on the backend team',
                'Helped with infrastructure',
                'Was involved in code reviews',
                'Did some on-call rotations',
            ],
            strong: [
                'Led migration of 12 services to Go, cutting p99 latency 47% and infra spend $180k/yr',
                'Drove Kubernetes platform adoption across 8 teams, eliminating 60% of bespoke deploy scripts',
                'Reviewed 400+ pull requests, mentoring 5 mid-level engineers through senior promotions',
                'Carried on-call through 2x traffic surge, kept p99 below SLA across 11 incident windows',
            ],
            company: 'Platform Team',
            coach: 'Bullets read like job descriptions, not impact. Adding outcomes, scope, and metrics.',
        },
        pm: {
            position: 'Product Manager  -  Growth Pod',
            weak: [
                'Owned roadmap for the team',
                'Helped ship some features',
                'Worked with engineering on planning',
                'Did some user research',
            ],
            strong: [
                'Owned $4M ARR billing roadmap, growing MRR 27% YoY through 3 pricing experiments',
                'Shipped 9 features in 12 months, lifting weekly active retention from 41% to 58%',
                'Partnered with 3 engineering teams on quarterly planning, hitting 11 of 12 commit dates',
                'Led discovery on 38 user interviews, reframing onboarding to cut time-to-value 53%',
            ],
            company: 'Growth Pod',
            coach: 'Verbs are passive and outcomes are missing. Reframing each bullet around impact.',
        },
    };

    // ----------------------------------------------------------
    // Analyzer (mirrors analyzers.py)
    // ----------------------------------------------------------
    const ACTION_VERBS = new Set([
        'built','led','shipped','reduced','designed','developed','architected',
        'deployed','scaled','optimized','automated','owned','drove','launched',
        'delivered','mentored','partnered','pioneered','accelerated','increased',
        'decreased','generated','saved','eliminated','streamlined','refactored',
        'migrated','integrated','established','implemented','created','founded',
        'headed','managed','directed','oversaw','coordinated','executed',
        'achieved','exceeded','surpassed','awarded','recognized','presented',
        'published','taught','trained','coached','supervised','organized',
        'planned','prioritized','resolved','solved','identified','analyzed',
        'researched','evaluated','assessed','audited','tested','validated',
        'verified','debugged','diagnosed','fixed','repaired','configured',
        'installed','maintained','monitored','troubleshot','calibrated',
        'commissioned','programmed','coded','engineered','modeled','simulated',
        'prototyped','fabricated','assembled','manufactured','produced',
        'supplied','sourced','negotiated','contracted','sold','marketed',
        'promoted','advertised','branded','drafted','sketched','illustrated',
        'animated','edited','composed','wrote','authored','reviewed',
        'approved','certified','qualified','accredited','licensed','chaired',
        'spearheaded','championed','advocated','influenced','persuaded',
        'convinced','secured','won','captured','acquired','recovered',
        'rescued','rebuilt','restructured','transformed','modernized','revamped',
        'carried',
    ]);

    const NUMBER_RE = /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million|billion)\b/i;

    function analyzeBullet(line) {
        const text = (line || '').trim();
        const length = text.length;
        const firstToken = text.split(/\s+/)[0] || '';
        const firstWord = firstToken.replace(/[^A-Za-z']/g, '').toLowerCase();
        return {
            text,
            length,
            firstWord,
            hasNumber: NUMBER_RE.test(text),
            hasVerb:   ACTION_VERBS.has(firstWord),
            lengthOk:  length >= 30 && length <= 200,
            score: (NUMBER_RE.test(text) ? 1 : 0)
                 + (ACTION_VERBS.has(firstWord) ? 1 : 0)
                 + ((length >= 30 && length <= 200) ? 1 : 0),
        };
    }

    function bulletStrengthClass(a) {
        if (a.score >= 3) return 'is-strong';
        if (a.score === 2) return 'is-medium';
        return 'is-weak';
    }

    // Health score (0-100) rolls up live from current bullet states.
    function computeHealth(bullets) {
        const scored = bullets.filter(b => (b || '').trim().length > 0).map(analyzeBullet);
        if (!scored.length) return { score: 0, state: 'draft', label: 'Draft' };

        const numFrac  = scored.filter(b => b.hasNumber).length / scored.length;
        const verbFrac = scored.filter(b => b.hasVerb).length / scored.length;
        const lenFrac  = scored.filter(b => b.lengthOk).length / scored.length;

        // Mirror analyzers.py weight intent (compressed to a 0-100 scale).
        // Achievement-quantified (40), Action-verbs (30), Length sweet spot (20),
        // Bullets-present floor (10).
        const pts = Math.round(40 * numFrac + 30 * verbFrac + 20 * lenFrac + 10);
        const score = Math.max(0, Math.min(100, pts));

        let state = 'scoring', label = 'Scoring...';
        if (score >= 85)       { state = 'ready';     label = 'Hire-ready'; }
        else if (score >= 65)  { state = 'rewriting'; label = 'Polishing'; }
        else if (score >= 45)  { state = 'coaching';  label = 'Coaching'; }
        else if (score >= 1)   { state = 'scoring';   label = 'Scoring'; }
        return { score, state, label };
    }

    // ----------------------------------------------------------
    // DOM refs
    // ----------------------------------------------------------
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    const els = {
        positionEl:    $('#ed-position'),
        bulletItems:   $$('.bullet-item'),
        coachTip:      $('#coach-tip'),
        coachText:     $('#coach-text'),
        editorStatus:  $('#editor-status'),
        previewStatus: $('#preview-status'),
        docName:       $('#doc-name'),
        docTitle:      $('#doc-title'),
        docCompany:    $('#doc-company'),
        docTenure:     $('#doc-tenure'),
        docBullets:    $('#doc-bullets'),
        resumeDoc:     $('#resume-doc'),
        healthFill:    $('#health-fill'),
        healthMarker:  $('#health-marker'),
        healthNum:     $('#health-num'),
        healthState:   $('#health-state'),
        timelineSteps: $$('.timeline-step'),
        outputCode:    $('#output-code'),
        outputAction:  $('#output-action'),
        btnPlay:       $('#btn-play'),
        playIcon:      $('#play-icon'),
        playLabel:     $('#play-label'),
        btnSpeed:      $('#btn-speed'),
        speedLabel:    $('#speed-label'),
        btnReset:      $('#btn-reset'),
        sceneBtns:     $$('.goal-btn'),
    };

    // ----------------------------------------------------------
    // State
    // ----------------------------------------------------------
    const state = {
        scene:    'controls',
        bullets:  ['', '', '', ''], // current text shown in editor
        playing:  false,
        speed:    1,                // 1, 1.5, 2
        runId:    0,                // increments on reset / scene change to abort in-flight tasks
        finished: false,
        prefersReduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };

    // ----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    function aborted(myRunId) {
        return myRunId !== state.runId;
    }

    function setEditorStatus(text, kind) {
        const dotClass = kind === 'running' ? 'dot dot-running'
                       : kind === 'done'    ? 'dot dot-done'
                       : 'dot dot-idle';
        els.editorStatus.innerHTML = `<span class="${dotClass}"></span><span>${text}</span>`;
    }

    function setPreviewStatus(text, kind) {
        const dotClass = kind === 'running' ? 'dot dot-running'
                       : kind === 'done'    ? 'dot dot-done'
                       : 'dot dot-idle';
        els.previewStatus.innerHTML = `<span class="${dotClass}"></span><span>${text}</span>`;
    }

    function setTimelinePhase(phase) {
        const order = ['drafting','scoring','coaching','rewriting','ready'];
        const idx = order.indexOf(phase);
        els.timelineSteps.forEach((el, i) => {
            el.classList.remove('active','completed');
            if (i < idx)       el.classList.add('completed');
            else if (i === idx) el.classList.add('active');
        });
    }

    function setHealthState(state) {
        els.healthState.classList.remove('is-draft','is-scoring','is-coaching','is-rewriting','is-ready');
        els.healthState.classList.add('is-' + state);
    }

    function renderHealth() {
        const h = computeHealth(state.bullets);
        els.healthFill.style.width = h.score + '%';
        els.healthMarker.style.left = h.score + '%';
        els.healthNum.textContent = h.score;
        els.healthState.textContent = h.label;
        setHealthState(h.state);
        if (h.state === 'ready') {
            els.healthFill.classList.add('is-ready');
            els.healthMarker.classList.add('is-ready');
            els.resumeDoc.classList.add('is-ready');
        } else {
            els.healthFill.classList.remove('is-ready');
            els.healthMarker.classList.remove('is-ready');
            els.resumeDoc.classList.remove('is-ready');
        }
    }

    function renderChip(idx, analysis) {
        const item = els.bulletItems[idx];
        const chipBox = item.querySelector('.bullet-chip');
        const cls = bulletStrengthClass(analysis);
        item.classList.remove('is-weak','is-medium','is-strong');
        item.classList.add(cls);

        const cv = analysis.hasVerb;
        const cn = analysis.hasNumber;
        const cl = analysis.lengthOk;

        const c = (ok, label) => {
            const tone = ok ? 'chip-ok' : 'chip-bad';
            const ico  = ok ? 'fa-check' : 'fa-xmark';
            return `<span class="chip ${tone}"><i class="fas ${ico}"></i>${label}</span>`;
        };
        const lenChip = (() => {
            if (analysis.lengthOk) return c(true, 'length');
            const tone = analysis.length < 20 || analysis.length > 240 ? 'chip-bad' : 'chip-warn';
            const ico  = tone === 'chip-bad' ? 'fa-xmark' : 'fa-triangle-exclamation';
            return `<span class="chip ${tone}"><i class="fas ${ico}"></i>${analysis.length} chars</span>`;
        })();

        chipBox.innerHTML = c(cv, 'verb') + c(cn, 'number') + lenChip;
        // Stagger the pop: ~70ms between chips so they cascade in instead
        // of slamming all at once. Uses CSS animation-delay via inline style.
        chipBox.querySelectorAll('.chip').forEach((el, i) => {
            el.style.animationDelay = (i * 70) + 'ms';
        });
    }

    function clearChip(idx) {
        const item = els.bulletItems[idx];
        item.classList.remove('is-weak','is-medium','is-strong');
        item.querySelector('.bullet-chip').innerHTML = '';
    }

    function renderPreviewBullets() {
        els.docBullets.innerHTML = '';
        state.bullets.forEach(b => {
            if (!b.trim()) return;
            const a = analyzeBullet(b);
            const li = document.createElement('li');
            li.className = 'doc-bullet' + (a.score >= 3 ? ' is-strong' : '');
            li.textContent = b;
            els.docBullets.appendChild(li);
        });
    }

    function showCoach(text, html) {
        els.coachText.innerHTML = html || text;
        els.coachTip.classList.add('is-visible');
    }

    function hideCoach() {
        els.coachTip.classList.remove('is-visible');
    }

    function emitOutput(line, replace) {
        const code = els.outputCode;
        if (replace) {
            code.innerHTML = line + '\n';
        } else {
            code.innerHTML += line + '\n';
        }
        const body = code.parentElement;
        body.scrollTop = body.scrollHeight;
    }

    function setOutputAction(text) {
        els.outputAction.textContent = text;
    }

    function jsonLine(idx, a, ok) {
        const tag = ok ? '<span class="ok">strong</span>'
                       : a.score === 2 ? '<span class="warn">medium</span>'
                       : '<span class="bad">weak</span>';
        return `<span class="dim">[L${idx+1}]</span> { `
             + `<span class="key">verb</span>: ${a.hasVerb ? '<span class="ok">true</span>' : '<span class="bad">false</span>'}, `
             + `<span class="key">number</span>: ${a.hasNumber ? '<span class="ok">true</span>' : '<span class="bad">false</span>'}, `
             + `<span class="key">length</span>: <span class="acc">${a.length}</span> }  // ${tag}`;
    }

    // ----------------------------------------------------------
    // Typewriter
    // ----------------------------------------------------------
    async function typeInto(targetSelector, idx, text, perChar, myRunId) {
        const el = idx === null
            ? els.positionEl
            : els.bulletItems[idx].querySelector('.bullet-text');

        // Mark the active row
        if (idx !== null) {
            els.bulletItems.forEach(b => b.classList.remove('is-active'));
            els.bulletItems[idx].classList.add('is-active');
        } else {
            // For position field, briefly toggle a caret
            els.positionEl.querySelector('.caret')?.classList.add('is-active');
        }

        for (let i = 1; i <= text.length; i++) {
            if (aborted(myRunId)) return;
            while (!state.playing) {
                if (aborted(myRunId)) return;
                await wait(80);
            }
            if (idx === null) {
                // position field: we keep the caret span, type text before it
                els.positionEl.innerHTML = text.slice(0, i) + '<span class="caret is-active"></span>';
            } else {
                el.textContent = text.slice(0, i);
                state.bullets[idx] = text.slice(0, i);
            }
            renderPreviewBullets();
            await wait(perChar / state.speed);
        }

        if (idx === null) {
            els.positionEl.innerHTML = text + '<span class="caret"></span>';
        } else {
            els.bulletItems[idx].classList.remove('is-active');
            state.bullets[idx] = text;
        }
        renderPreviewBullets();
    }

    async function eraseBullet(idx, myRunId) {
        const el = els.bulletItems[idx].querySelector('.bullet-text');
        const item = els.bulletItems[idx];
        item.classList.add('is-erasing');
        await wait(180 / state.speed);
        if (aborted(myRunId)) return;

        const current = state.bullets[idx];
        for (let i = current.length; i >= 0; i--) {
            if (aborted(myRunId)) return;
            while (!state.playing) {
                if (aborted(myRunId)) return;
                await wait(80);
            }
            el.textContent = current.slice(0, i);
            state.bullets[idx] = current.slice(0, i);
            renderPreviewBullets();
            await wait(8 / state.speed);
        }
        item.classList.remove('is-erasing');
        clearChip(idx);
    }

    // ----------------------------------------------------------
    // Main playback
    // ----------------------------------------------------------
    async function runScene(myRunId) {
        const sc = SCENARIOS[state.scene];
        setEditorStatus('Drafting...', 'running');
        setPreviewStatus('Updating live', 'running');
        setOutputAction('drafting');
        setTimelinePhase('drafting');
        emitOutput(`<span class="dim">// scenario: ${state.scene}</span>`, true);
        emitOutput(`<span class="key">analyze_bullet</span>(line) -> { verb, number, length, score }`);
        emitOutput('');

        // Position field
        await typeInto(null, null, sc.position, 22, myRunId);
        if (aborted(myRunId)) return;
        els.docTitle.textContent = sc.position.split('  -  ')[0];
        els.docCompany.textContent = sc.company;

        // Phase 1: type weak bullets
        for (let i = 0; i < sc.weak.length; i++) {
            if (aborted(myRunId)) return;
            setOutputAction(`drafting L${i+1}`);
            await typeInto('.bullet-text', i, sc.weak[i], 14, myRunId);
            if (aborted(myRunId)) return;

            // Score it
            setTimelinePhase('scoring');
            setOutputAction(`scoring L${i+1}`);
            await wait(160 / state.speed);
            const a = analyzeBullet(sc.weak[i]);
            renderChip(i, a);
            renderHealth();
            emitOutput(jsonLine(i, a, a.score >= 3));
            await wait(120 / state.speed);
        }

        if (aborted(myRunId)) return;

        // Phase 2: coaching
        setTimelinePhase('coaching');
        setEditorStatus('Coaching', 'running');
        setOutputAction('coaching');
        showCoach(sc.coach, `<strong>Coach:</strong> ${sc.coach}`);
        emitOutput('');
        emitOutput(`<span class="warn">// 4 of 4 bullets fall short of the hire-ready threshold (score &lt; 3).</span>`);
        emitOutput(`<span class="warn">// suggesting metric-driven rewrites...</span>`);
        await wait(1100 / state.speed);

        if (aborted(myRunId)) return;

        // Phase 3: rewrite each weak bullet with the strong version
        setTimelinePhase('rewriting');
        setEditorStatus('Rewriting', 'running');
        for (let i = 0; i < sc.strong.length; i++) {
            if (aborted(myRunId)) return;
            setOutputAction(`rewriting L${i+1}`);
            await eraseBullet(i, myRunId);
            if (aborted(myRunId)) return;
            await typeInto('.bullet-text', i, sc.strong[i], 11, myRunId);
            if (aborted(myRunId)) return;
            const a = analyzeBullet(sc.strong[i]);
            renderChip(i, a);
            renderHealth();
            emitOutput(jsonLine(i, a, a.score >= 3));
            await wait(100 / state.speed);
        }

        if (aborted(myRunId)) return;

        // Phase 4: ready
        setTimelinePhase('ready');
        setEditorStatus('Hire-ready', 'done');
        setPreviewStatus('Hire-ready', 'done');
        setOutputAction('done');
        hideCoach();
        renderHealth();
        emitOutput('');
        emitOutput('<span class="ok">[OK] Resume passes hire-ready threshold (score &gt;= 85).</span>');
        emitOutput('<span class="dim">// Export to PDF | HTML | JSON in one click in the Streamlit app.</span>');

        state.finished = true;
        state.playing = false;
        els.playIcon.className = 'fas fa-rotate-left';
        els.playLabel.textContent = 'Replay';
    }

    // ----------------------------------------------------------
    // Reduced-motion: render the final state immediately
    // ----------------------------------------------------------
    function renderStaticReady() {
        const sc = SCENARIOS[state.scene];
        els.positionEl.innerHTML = sc.position + '<span class="caret"></span>';
        els.docTitle.textContent = sc.position.split('  -  ')[0];
        els.docCompany.textContent = sc.company;

        sc.strong.forEach((line, i) => {
            const txt = els.bulletItems[i].querySelector('.bullet-text');
            txt.textContent = line;
            state.bullets[i] = line;
            const a = analyzeBullet(line);
            renderChip(i, a);
        });

        renderPreviewBullets();
        renderHealth();
        setTimelinePhase('ready');
        setEditorStatus('Hire-ready', 'done');
        setPreviewStatus('Hire-ready', 'done');
        setOutputAction('done');
        emitOutput('<span class="ok">[OK] Resume passes hire-ready threshold (score &gt;= 85).</span>', true);
        emitOutput('<span class="dim">// Live animation disabled - prefers-reduced-motion.</span>');
    }

    // ----------------------------------------------------------
    // Reset / scene-switch
    // ----------------------------------------------------------
    function resetUi() {
        // Bump runId FIRST so any in-flight runScene aborts at its next
        // await checkpoint before mutating DOM further. Also halts playback.
        state.runId += 1;
        state.playing = false;
        state.bullets = ['','','',''];
        state.finished = false;
        // Cancel any pending autoplay timer scheduled by IntersectionObserver.
        if (state._autoplayTimer) {
            clearTimeout(state._autoplayTimer);
            state._autoplayTimer = null;
        }

        // Clear bullets
        els.bulletItems.forEach((item, i) => {
            item.classList.remove('is-active','is-erasing','is-weak','is-medium','is-strong');
            item.querySelector('.bullet-text').textContent = '';
            item.querySelector('.bullet-chip').innerHTML = '';
        });

        // Reset position field
        els.positionEl.innerHTML = '<span class="caret"></span>';

        // Reset preview
        els.docTitle.textContent = 'Position';
        els.docCompany.textContent = 'Company';
        els.docBullets.innerHTML = '';
        els.resumeDoc.classList.remove('is-ready');

        // Reset health
        els.healthFill.style.width = '0%';
        els.healthMarker.style.left = '0%';
        els.healthFill.classList.remove('is-ready');
        els.healthMarker.classList.remove('is-ready');
        els.healthNum.textContent = '0';
        els.healthState.textContent = 'Draft';
        setHealthState('draft');

        // Reset timeline + status
        els.timelineSteps.forEach(s => s.classList.remove('active','completed'));
        setEditorStatus('Idle', 'idle');
        setPreviewStatus('Modern template', 'idle');
        setOutputAction('awaiting input');

        hideCoach();
        emitOutput('// Press play to score a draft resume in real time.', true);

        els.playIcon.className = 'fas fa-play';
        els.playLabel.textContent = 'Play';
    }

    // ----------------------------------------------------------
    // Controls
    // ----------------------------------------------------------
    function bindControls() {
        els.btnPlay.addEventListener('click', () => {
            els.btnPlay.classList.remove('is-pulse-hint');
            // Cancel any pending autoplay timer so it can't double-fire runScene.
            if (state._autoplayTimer) {
                clearTimeout(state._autoplayTimer);
                state._autoplayTimer = null;
            }
            if (state.prefersReduced) {
                renderStaticReady();
                return;
            }
            if (state.finished) {
                resetUi();
                state.playing = true;
                runScene(state.runId);
                els.playIcon.className = 'fas fa-pause';
                els.playLabel.textContent = 'Pause';
                return;
            }
            state.playing = !state.playing;
            if (state.playing) {
                els.playIcon.className = 'fas fa-pause';
                els.playLabel.textContent = 'Pause';
                if (state.bullets.every(b => b === '')) {
                    runScene(state.runId);
                }
            } else {
                els.playIcon.className = 'fas fa-play';
                els.playLabel.textContent = 'Resume';
            }
        });

        els.btnSpeed.addEventListener('click', () => {
            const cycle = [1, 1.5, 2];
            const next = cycle[(cycle.indexOf(state.speed) + 1) % cycle.length];
            state.speed = next;
            els.speedLabel.textContent = next + '×';
        });

        els.btnReset.addEventListener('click', () => {
            resetUi();
            if (state.prefersReduced) {
                renderStaticReady();
            }
        });

        els.sceneBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const scene = btn.dataset.scene;
                if (scene === state.scene) return;
                state.scene = scene;
                els.sceneBtns.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                });
                resetUi();
                // Reduced-motion users have no Play button — re-render the
                // static end-state for the new scenario so they aren't stuck
                // on an empty editor with no path forward.
                if (state.prefersReduced) {
                    renderStaticReady();
                }
            });
        });
    }

    // ----------------------------------------------------------
    // Auto-play when the demo scrolls into view
    // ----------------------------------------------------------
    function setupAutoPlay() {
        if (state.prefersReduced) return;

        const stage = document.getElementById('stage');
        if (!stage || !('IntersectionObserver' in window)) {
            // Fallback: kick off after a short delay so something starts on load.
            state._autoplayTimer = setTimeout(triggerAutoPlay, 1100);
            return;
        }

        // Subtle pulse on the Play button while we wait for the user to scroll to it.
        els.btnPlay.classList.add('is-pulse-hint');

        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting && !state.playing && !state.finished
                    && state.bullets.every(b => b === '')) {
                    state._autoplayTimer = setTimeout(triggerAutoPlay, 600);
                    io.disconnect();
                    break;
                }
            }
        }, { threshold: 0.45 });
        io.observe(stage);
    }

    function triggerAutoPlay() {
        state._autoplayTimer = null;
        // Re-check after the timer in case the user already started/aborted
        if (state.playing || state.finished) return;
        if (!state.bullets.every(b => b === '')) return;
        els.btnPlay.classList.remove('is-pulse-hint');
        state.playing = true;
        els.playIcon.className = 'fas fa-pause';
        els.playLabel.textContent = 'Pause';
        runScene(state.runId);
    }

    // ----------------------------------------------------------
    // Boot
    // ----------------------------------------------------------
    function init() {
        resetUi();
        bindControls();

        if (state.prefersReduced) {
            // Auto-render the final state for users who prefer no motion.
            renderStaticReady();
            return;
        }

        setupAutoPlay();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
