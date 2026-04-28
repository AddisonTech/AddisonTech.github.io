/* ============================================================
   Smith_Agentic Live Demo - animation engine
   Self-contained vanilla JS module.
   ============================================================ */
(function () {
    'use strict';

    // -----------------------------
    // Reduced-motion short-circuit
    // -----------------------------
    var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // -----------------------------
    // Pre-scripted scenes
    // Each scene = ordered list of steps. Each step is one
    // agent activation with status text + a typewriter snippet.
    // -----------------------------
    var SCENES = {
        plc: {
            goal: "Generate a Studio 5000 ladder routine for a 3-station palletizer with safety interlocks, then write a React HMI page to visualize it.",
            steps: [
                {
                    agent: 'orchestrator', stage: 'planning',
                    status: 'Decomposing goal into execution plan...',
                    action: 'planning the run',
                    output:
"PLAN:\n" +
"  1. Research AB ControlLogix conventions + NFPA 79 E-stop\n" +
"  2. Define I/O tags + UDTs for 3-station palletizer\n" +
"  3. Author ladder logic with interlocks\n" +
"  4. Build React HMI dashboard\n" +
"  5. Safety review against NFPA / ISO 13849\n"
                },
                {
                    agent: 'researcher', stage: 'researching',
                    status: 'Querying ChromaDB + scanning codebase...',
                    action: 'retrieving prior art',
                    output:
"Found:\n" +
"  - ControlLogix tag naming: PascalCase, prefix by station\n" +
"  - NFPA 79 §9.2.5: dual-channel E-stop required\n" +
"  - Reflex prior: similar palletizer in /outputs/2025-08\n"
                },
                {
                    agent: 'builder', stage: 'building',
                    status: 'Generating ladder logic + React components...',
                    action: 'authoring artifacts',
                    output:
"Routine: Station1_Sequence\n" +
"  | XIC Station1.Ready  XIC Safety.OK     |  OTE Station1.Cycle\n" +
"  | XIC Station1.Cycle  TON Station1.T1 5s|  ONS Station1.Pick\n" +
"  | XIC Estop.Reset_Req                   |  RES Safety.Trip\n" +
"  ...\n" +
"Component: <PalletizerHMI station={1} />\n"
                },
                {
                    agent: 'critic', stage: 'critiquing',
                    status: 'Reviewing for safety + UX compliance...',
                    action: 'reviewing build',
                    output:
"⚠  Station 2 interlock missing — light curtain not gated\n" +
"⚠  HMI: E-stop status indicator not visually prominent\n" +
"✓  Tag naming convention compliant\n" +
"✓  Dual-channel safety wiring per NFPA 79\n" +
"Verdict: REVISE\n"
                },
                {
                    agent: 'builder', stage: 'revising',
                    status: 'Builder applying revisions...',
                    action: 'patching artifacts',
                    output:
"+ Added LightCurtain.OK to Station2 interlock chain\n" +
"+ Promoted EstopActive to top-banner indicator (red, blink)\n"
                },
                {
                    agent: 'critic', stage: 'critiquing',
                    status: 'Re-validating revisions...',
                    action: 'final review',
                    output:
"✓  Station 2 light curtain gated\n" +
"✓  E-stop banner visible across HMI\n" +
"Verdict: APPROVED\n"
                },
                {
                    agent: 'orchestrator', stage: 'done',
                    status: 'Outputs saved.',
                    action: 'run complete',
                    output:
"Outputs saved to /outputs:\n" +
"  - ladder.l5x\n" +
"  - hmi/PalletizerHMI.jsx\n" +
"  - safety_review.md\n"
                }
            ]
        },
        react: {
            goal: "Build a React dashboard that streams Modbus tag values over WebSocket and renders an ISA 18.2-compliant alarm panel.",
            steps: [
                {
                    agent: 'orchestrator', stage: 'planning',
                    status: 'Decomposing dashboard requirements...',
                    action: 'planning the run',
                    output:
"PLAN:\n" +
"  1. Scope WS message schema + reconnect strategy\n" +
"  2. Pick state model (Zustand) + alarm priority map\n" +
"  3. Author <LiveTagGrid> + <AlarmPanel> components\n" +
"  4. Wire ISA 18.2 priority colors + ack flow\n" +
"  5. Review accessibility + perf on 500-tag stream\n"
                },
                {
                    agent: 'researcher', stage: 'researching',
                    status: 'Pulling ISA 18.2 + WebSocket patterns...',
                    action: 'retrieving prior art',
                    output:
"Found:\n" +
"  - ISA 18.2 priorities: Critical / High / Med / Low + colors\n" +
"  - Reflex prior: power-dashboard alarm engine /outputs/2026-02\n" +
"  - WS reconnect: exponential backoff w/ jitter, ping every 25s\n"
                },
                {
                    agent: 'builder', stage: 'building',
                    status: 'Scaffolding components + hooks...',
                    action: 'authoring artifacts',
                    output:
"// src/hooks/useTagStream.ts\n" +
"export function useTagStream(url: string) {\n" +
"  const [tags, setTags] = useState<Record<string, TagValue>>({});\n" +
"  useEffect(() => {\n" +
"    const ws = new WebSocket(url);\n" +
"    ws.onmessage = (e) => setTags(prev => ({ ...prev, ...JSON.parse(e.data) }));\n" +
"    return () => ws.close();\n" +
"  }, [url]);\n" +
"  return tags;\n" +
"}\n"
                },
                {
                    agent: 'critic', stage: 'critiquing',
                    status: 'Reviewing ISA 18.2 + a11y...',
                    action: 'reviewing build',
                    output:
"⚠  AlarmPanel: missing aria-live=\"assertive\" on critical row\n" +
"⚠  No reconnect on WS close → silent stale data risk\n" +
"✓  Priority color tokens map to ISA 18.2\n" +
"Verdict: REVISE\n"
                },
                {
                    agent: 'builder', stage: 'revising',
                    status: 'Applying fixes...',
                    action: 'patching artifacts',
                    output:
"+ aria-live=\"assertive\" added to <AlarmRow priority=\"critical\">\n" +
"+ ws.onclose → exponential backoff reconnect (1s..30s)\n"
                },
                {
                    agent: 'critic', stage: 'critiquing',
                    status: 'Re-validating revisions...',
                    action: 'final review',
                    output:
"✓  Critical alarms announced to AT\n" +
"✓  Reconnect verified under flap test\n" +
"Verdict: APPROVED\n"
                },
                {
                    agent: 'orchestrator', stage: 'done',
                    status: 'Outputs saved.',
                    action: 'run complete',
                    output:
"Outputs saved to /outputs:\n" +
"  - src/hooks/useTagStream.ts\n" +
"  - src/components/AlarmPanel.tsx\n" +
"  - review.md\n"
                }
            ]
        },
        vision: {
            goal: "Author a vision-inspection FastAPI service that runs an Ollama VLM against a webcam frame and gates a PASS/FAIL output to the PLC.",
            steps: [
                {
                    agent: 'orchestrator', stage: 'planning',
                    status: 'Decomposing inspection pipeline...',
                    action: 'planning the run',
                    output:
"PLAN:\n" +
"  1. Define part-present + defect prompt template\n" +
"  2. Spec FastAPI /inspect endpoint w/ image upload\n" +
"  3. Author Ollama VLM client + parser\n" +
"  4. Write PASS/FAIL → PLC tag handoff (Modbus)\n" +
"  5. Review false-positive risk + latency budget\n"
                },
                {
                    agent: 'researcher', stage: 'researching',
                    status: 'Probing Ollama VLM endpoints + prior runs...',
                    action: 'retrieving prior art',
                    output:
"Found:\n" +
"  - Ollama llava model: ~280ms / 640px frame on RTX 4060\n" +
"  - Reflex prior: IEMvision job-gating pattern /outputs/2026-04\n" +
"  - Modbus FC=06 single-register write for verdict\n"
                },
                {
                    agent: 'builder', stage: 'building',
                    status: 'Authoring service + client...',
                    action: 'authoring artifacts',
                    output:
"# app/inspect.py\n" +
"@router.post(\"/inspect\")\n" +
"async def inspect(file: UploadFile):\n" +
"    img = await file.read()\n" +
"    verdict = await vlm.classify(img, prompt=DEFECT_PROMPT)\n" +
"    plc.write_register(VERDICT_TAG, 1 if verdict.passed else 0)\n" +
"    return {\"pass\": verdict.passed, \"score\": verdict.score}\n"
                },
                {
                    agent: 'critic', stage: 'critiquing',
                    status: 'Reviewing safety + perf...',
                    action: 'reviewing build',
                    output:
"⚠  No fail-safe on VLM timeout — PLC sees stale verdict\n" +
"⚠  Confidence threshold not enforced (raw bool)\n" +
"✓  Modbus write idempotent\n" +
"Verdict: REVISE\n"
                },
                {
                    agent: 'builder', stage: 'revising',
                    status: 'Patching fail-safes...',
                    action: 'patching artifacts',
                    output:
"+ asyncio.wait_for(vlm.classify, timeout=2.0) → on timeout: FAIL\n" +
"+ require verdict.score >= 0.78 else FAIL\n"
                },
                {
                    agent: 'critic', stage: 'critiquing',
                    status: 'Re-validating revisions...',
                    action: 'final review',
                    output:
"✓  Timeout path writes safe verdict (FAIL)\n" +
"✓  Confidence floor enforced\n" +
"Verdict: APPROVED\n"
                },
                {
                    agent: 'orchestrator', stage: 'done',
                    status: 'Outputs saved.',
                    action: 'run complete',
                    output:
"Outputs saved to /outputs:\n" +
"  - app/inspect.py\n" +
"  - app/vlm_client.py\n" +
"  - review.md\n"
                }
            ]
        }
    };

    // -----------------------------
    // DOM refs
    // -----------------------------
    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    var stageEl       = $('#stage');
    var stageStatusEl = $('#stage-status');
    var stageStatusText = stageStatusEl ? stageStatusEl.querySelector('.status-text') : null;
    var goalTextEl    = $('#goal-text');
    var agentCards    = {
        orchestrator: $('.agent-card[data-agent="orchestrator"]'),
        researcher:   $('.agent-card[data-agent="researcher"]'),
        builder:      $('.agent-card[data-agent="builder"]'),
        critic:       $('.agent-card[data-agent="critic"]')
    };
    var timelineSteps = {};
    $$('.timeline-step').forEach(function (el) {
        timelineSteps[el.dataset.step] = el;
    });

    var outputAgent  = $('#output-agent');
    var outputAction = $('#output-action');
    var outputCode   = $('#output-code');
    var outputCaret  = $('#output-caret');
    var outputBody   = $('#output-body');

    var btnPlay      = $('#btn-play');
    var playIcon     = $('#play-icon');
    var playLabel    = $('#play-label');
    var btnSpeed     = $('#btn-speed');
    var speedLabel   = $('#speed-label');
    var btnReset     = $('#btn-reset');

    var goalBtns     = $$('.goal-btn');
    var packetEl     = $('#packet');
    var edges = {
        '0->1': $('#edge-0-1'),
        '1->2': $('#edge-1-2'),
        '2->3': $('#edge-2-3'),
        'loop': $('#edge-loop')
    };

    // -----------------------------
    // State
    // -----------------------------
    var state = {
        sceneKey: 'plc',
        steps: SCENES.plc.steps,
        stepIndex: -1,           // not started
        playing: false,
        speed: 1,                // 1 or 2
        finished: false,
        // Timer/typing handles
        typingTimer: null,
        gapTimer: null,
        packetTimer: null,
        // Visibility / intersection paused flags
        autoPaused: false,       // paused due to tab hidden / off-screen
        userPlaying: false       // user-intent (independent of autoPause)
    };

    var AGENT_INDEX = { orchestrator: 0, researcher: 1, builder: 2, critic: 3 };
    var STAGE_FROM_AGENT = {
        // last fallback if step lacks .stage; first occurrence rules
        orchestrator: 'planning',
        researcher: 'researching',
        builder: 'building',
        critic: 'critiquing'
    };

    // -----------------------------
    // Helpers
    // -----------------------------
    function setStageStatus(text, mode) {
        if (stageStatusText) stageStatusText.textContent = text;
        if (!stageStatusEl) return;
        stageStatusEl.classList.remove('is-running', 'is-done');
        if (mode === 'running') stageStatusEl.classList.add('is-running');
        else if (mode === 'done') stageStatusEl.classList.add('is-done');
    }

    function clearAgents() {
        Object.keys(agentCards).forEach(function (k) {
            var c = agentCards[k];
            if (!c) return;
            c.classList.remove('active', 'completed');
            var st = c.querySelector('.agent-status-text');
            if (st) st.textContent = 'Idle';
        });
    }

    function setActiveAgent(agentKey, statusText) {
        Object.keys(agentCards).forEach(function (k) {
            var c = agentCards[k];
            if (!c) return;
            c.classList.remove('active');
            if (k === agentKey) c.classList.add('active');
        });
        var card = agentCards[agentKey];
        if (card) {
            var st = card.querySelector('.agent-status-text');
            if (st) st.textContent = statusText || '...';
        }
    }

    function markAgentCompleted(agentKey) {
        var c = agentCards[agentKey];
        if (!c) return;
        c.classList.remove('active');
        c.classList.add('completed');
        var st = c.querySelector('.agent-status-text');
        if (st) st.textContent = 'Done';
    }

    function clearTimeline() {
        Object.keys(timelineSteps).forEach(function (k) {
            timelineSteps[k].classList.remove('active', 'completed');
        });
    }

    function setTimelineStage(stageKey, completedKeys) {
        Object.keys(timelineSteps).forEach(function (k) {
            timelineSteps[k].classList.remove('active', 'completed');
        });
        (completedKeys || []).forEach(function (k) {
            if (timelineSteps[k]) timelineSteps[k].classList.add('completed');
        });
        if (timelineSteps[stageKey]) {
            timelineSteps[stageKey].classList.add('active');
        }
    }

    function clearEdges() {
        Object.keys(edges).forEach(function (k) {
            if (edges[k]) edges[k].classList.remove('active');
        });
    }

    function highlightEdgeBetween(prevAgent, nextAgent) {
        clearEdges();
        if (prevAgent == null || nextAgent == null) return;
        var a = AGENT_INDEX[prevAgent], b = AGENT_INDEX[nextAgent];
        if (a === undefined || b === undefined) return;
        // Forward sequential
        if (b === a + 1) {
            var key = a + '->' + b;
            if (edges[key]) edges[key].classList.add('active');
            return;
        }
        // Loopback: critic -> builder
        if (prevAgent === 'critic' && nextAgent === 'builder') {
            if (edges['loop']) edges['loop'].classList.add('active');
            return;
        }
    }

    function animatePacket(prevAgent, nextAgent, durationMs) {
        if (prefersReduced || !packetEl) return;
        if (prevAgent == null || nextAgent == null) return;
        var a = AGENT_INDEX[prevAgent], b = AGENT_INDEX[nextAgent];
        if (a === undefined || b === undefined) return;

        var pathEl = null;
        if (b === a + 1) pathEl = edges[a + '->' + b];
        else if (prevAgent === 'critic' && nextAgent === 'builder') pathEl = edges['loop'];

        if (!pathEl || typeof pathEl.getTotalLength !== 'function') return;

        var totalLen;
        try { totalLen = pathEl.getTotalLength(); } catch (e) { return; }
        if (!totalLen) return;

        var start = performance.now();
        var dur = Math.max(360, durationMs || 700);
        packetEl.classList.add('visible');

        function step(now) {
            if (!state.playing && !state.autoPaused === false) {
                // packet still finishes even if paused mid-flight; but if user
                // hard-paused, hide it
            }
            var t = (now - start) / dur;
            if (t >= 1) {
                packetEl.setAttribute('cx', '-100');
                packetEl.setAttribute('cy', '-100');
                packetEl.classList.remove('visible');
                state.packetTimer = null;
                return;
            }
            try {
                var pt = pathEl.getPointAtLength(totalLen * t);
                packetEl.setAttribute('cx', pt.x);
                packetEl.setAttribute('cy', pt.y);
            } catch (e) { /* ignore */ }
            state.packetTimer = requestAnimationFrame(step);
        }
        state.packetTimer = requestAnimationFrame(step);
    }

    function cancelPacket() {
        if (state.packetTimer) {
            cancelAnimationFrame(state.packetTimer);
            state.packetTimer = null;
        }
        if (packetEl) {
            packetEl.classList.remove('visible');
            packetEl.setAttribute('cx', '-100');
            packetEl.setAttribute('cy', '-100');
        }
    }

    // -----------------------------
    // Output rendering (with light syntax accent + typewriter)
    // -----------------------------
    function tokenize(line) {
        // Returns HTML string with span wrappers for OK / WARN / verdict / etc.
        var safe = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // OK marker
        safe = safe.replace(/^(\s*)(✓)/, '$1<span class="ok">$2</span>');
        // WARN marker
        safe = safe.replace(/^(\s*)(⚠)/, '$1<span class="warn">$2</span>');
        // Plus marker (revision)
        safe = safe.replace(/^(\s*)(\+)/, '$1<span class="ok">$2</span>');
        // Verdict line
        safe = safe.replace(/(Verdict:)\s*(APPROVED|REVISE)/,
            function (_m, p1, p2) {
                var cls = (p2 === 'APPROVED') ? 'ok' : 'warn';
                return '<span class="key">' + p1 + '</span> <span class="' + cls + '">' + p2 + '</span>';
            });
        // PLAN: header
        safe = safe.replace(/^(PLAN:|Found:|Routine:|Component:|Outputs saved.*?:)/,
            '<span class="key">$1</span>');
        return safe;
    }

    function setOutputMeta(agentKey, action) {
        if (outputAgent)  outputAgent.textContent  = agentKey || 'system';
        if (outputAction) outputAction.textContent = action  || 'idle';
    }

    function clearOutput() {
        if (outputCode) outputCode.innerHTML = '';
        if (outputBody) outputBody.scrollTop = 0;
    }

    function typeOutput(text, doneCb) {
        if (state.typingTimer) {
            clearTimeout(state.typingTimer);
            state.typingTimer = null;
        }
        if (!outputCode) { if (doneCb) doneCb(); return; }
        outputCode.innerHTML = '';

        // Reduced-motion: just dump everything, render line-by-line
        if (prefersReduced) {
            renderFinal(text);
            if (doneCb) doneCb();
            return;
        }

        // Split by newlines so we can colorize tokens at line completion.
        var lines = text.split('\n');
        var lineIdx = 0;
        var charIdx = 0;
        var rendered = ''; // accumulated HTML for completed lines
        var currentLineRaw = '';

        var baseDelay = 22;          // ms per character
        var speedFactor = 1 / state.speed;
        var charDelay = Math.max(8, baseDelay * speedFactor);
        var newlineDelay = Math.max(40, 110 * speedFactor);

        function tick() {
            if (lineIdx >= lines.length) {
                if (doneCb) doneCb();
                return;
            }
            var line = lines[lineIdx];

            if (charIdx < line.length) {
                currentLineRaw += line.charAt(charIdx);
                charIdx++;
                // Render: rendered (completed lines) + raw current line (no tokenization yet)
                outputCode.innerHTML = rendered +
                    currentLineRaw
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                if (outputBody) outputBody.scrollTop = outputBody.scrollHeight;
                state.typingTimer = setTimeout(tick, charDelay);
                return;
            }
            // End of line — tokenize the completed raw line
            rendered += tokenize(currentLineRaw) + '\n';
            outputCode.innerHTML = rendered;
            if (outputBody) outputBody.scrollTop = outputBody.scrollHeight;
            currentLineRaw = '';
            charIdx = 0;
            lineIdx++;
            state.typingTimer = setTimeout(tick, newlineDelay);
        }
        state.typingTimer = setTimeout(tick, 0);
    }

    function renderFinal(text) {
        if (!outputCode) return;
        var html = text.split('\n').map(tokenize).join('\n');
        outputCode.innerHTML = html;
        if (outputBody) outputBody.scrollTop = outputBody.scrollHeight;
    }

    // -----------------------------
    // Step runner
    // -----------------------------
    function buildCompletedStages(uptoIndex) {
        // Returns array of stages already completed before step uptoIndex
        var seen = {};
        for (var i = 0; i < uptoIndex; i++) {
            var s = state.steps[i].stage;
            seen[s] = true;
        }
        // 'done' is special: only completed when run finishes
        return Object.keys(seen).filter(function (k) { return k !== 'done'; });
    }

    function runStep(idx) {
        if (idx >= state.steps.length) {
            finishRun();
            return;
        }
        state.stepIndex = idx;
        var step = state.steps[idx];

        // Determine prev agent (for edge highlight + packet)
        var prevAgent = (idx > 0) ? state.steps[idx - 1].agent : null;

        // Highlight edge + packet between prev and current agent
        highlightEdgeBetween(prevAgent, step.agent);
        if (prevAgent && prevAgent !== step.agent) {
            animatePacket(prevAgent, step.agent, 700 / state.speed);
        }

        // Mark prev agent as completed (unless it'll be used again later)
        if (prevAgent && prevAgent !== step.agent) {
            // Only mark as completed if it doesn't appear again later as active
            var willReappear = false;
            for (var j = idx; j < state.steps.length; j++) {
                if (state.steps[j].agent === prevAgent) { willReappear = true; break; }
            }
            if (!willReappear) markAgentCompleted(prevAgent);
        }

        // Activate current agent
        setActiveAgent(step.agent, step.status || '...');
        setStageStatus(step.status || 'Running...', step.stage === 'done' ? 'done' : 'running');

        // Update timeline
        var completed = buildCompletedStages(idx);
        if (step.stage === 'done') {
            // mark all prior + 'done' as completed
            var allDone = completed.slice();
            ['planning','researching','building','critiquing','revising'].forEach(function (k) {
                if (allDone.indexOf(k) === -1) allDone.push(k);
            });
            setTimelineStage('done', allDone);
        } else {
            setTimelineStage(step.stage, completed);
        }

        // Update output meta
        setOutputMeta(step.agent, step.action || '');

        // Type output
        clearOutput();
        typeOutput(step.output || '', function () {
            // After typing finishes, schedule next step
            var gap = (step.stage === 'done') ? 600 : 950;
            gap = gap / state.speed;
            state.gapTimer = setTimeout(function () {
                state.gapTimer = null;
                if (!state.playing) return;
                runStep(idx + 1);
            }, gap);
        });
    }

    function finishRun() {
        state.playing = false;
        state.userPlaying = false;
        state.finished = true;
        // Mark all agents completed
        Object.keys(agentCards).forEach(function (k) {
            var c = agentCards[k];
            if (!c) return;
            c.classList.remove('active');
            c.classList.add('completed');
            var st = c.querySelector('.agent-status-text');
            if (st) st.textContent = 'Done';
        });
        // Mark all timeline steps completed
        Object.keys(timelineSteps).forEach(function (k) {
            timelineSteps[k].classList.remove('active');
            timelineSteps[k].classList.add('completed');
        });
        clearEdges();
        cancelPacket();
        setStageStatus('Run complete — verdict: APPROVED', 'done');
        setPlayUI(false);
    }

    function setPlayUI(isPlaying) {
        if (!playIcon || !playLabel) return;
        if (isPlaying) {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
            playLabel.textContent = 'Pause';
            btnPlay.setAttribute('aria-label', 'Pause demo');
        } else {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            playLabel.textContent = state.finished ? 'Replay' : (state.stepIndex >= 0 ? 'Resume' : 'Play');
            btnPlay.setAttribute('aria-label', state.finished ? 'Replay demo' : 'Play demo');
        }
    }

    // -----------------------------
    // Controls
    // -----------------------------
    function play() {
        if (state.finished) {
            reset();
        }
        state.playing = true;
        state.userPlaying = true;
        setPlayUI(true);
        if (state.stepIndex < 0) {
            runStep(0);
        } else {
            // Resuming mid-run: re-run current step from the start of its output
            runStep(state.stepIndex);
        }
    }

    function pause() {
        state.playing = false;
        state.userPlaying = false;
        if (state.typingTimer) { clearTimeout(state.typingTimer); state.typingTimer = null; }
        if (state.gapTimer)    { clearTimeout(state.gapTimer);    state.gapTimer = null; }
        cancelPacket();
        setPlayUI(false);
        setStageStatus('Paused', null);
    }

    function reset() {
        if (state.typingTimer) { clearTimeout(state.typingTimer); state.typingTimer = null; }
        if (state.gapTimer)    { clearTimeout(state.gapTimer);    state.gapTimer = null; }
        cancelPacket();
        clearEdges();
        clearAgents();
        clearTimeline();
        clearOutput();
        state.playing = false;
        state.userPlaying = false;
        state.finished = false;
        state.stepIndex = -1;
        setOutputMeta('orchestrator', 'awaiting start');
        if (outputCode) outputCode.innerHTML = '// Press play to launch the multi-agent run.';
        setStageStatus('Idle — press play to begin', null);
        setPlayUI(false);
    }

    function cycleSpeed() {
        state.speed = (state.speed === 1) ? 2 : 1;
        if (speedLabel) speedLabel.textContent = state.speed + '×';
    }

    function selectScene(key) {
        if (!SCENES[key]) return;
        state.sceneKey = key;
        state.steps = SCENES[key].steps;
        if (goalTextEl) goalTextEl.textContent = SCENES[key].goal;
        goalBtns.forEach(function (b) {
            var on = (b.dataset.scene === key);
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        reset();
    }

    // -----------------------------
    // Auto-pause: visibility + intersection
    // -----------------------------
    function onVisibilityChange() {
        if (document.hidden) {
            if (state.playing) {
                state.autoPaused = true;
                state.playing = false;
                if (state.typingTimer) { clearTimeout(state.typingTimer); state.typingTimer = null; }
                if (state.gapTimer)    { clearTimeout(state.gapTimer);    state.gapTimer = null; }
                cancelPacket();
            }
        } else {
            if (state.autoPaused && state.userPlaying) {
                state.autoPaused = false;
                state.playing = true;
                if (state.stepIndex >= 0) runStep(state.stepIndex);
                else runStep(0);
            }
        }
    }

    function setupIntersectionObserver() {
        if (!stageEl || !('IntersectionObserver' in window)) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    if (state.playing) {
                        state.autoPaused = true;
                        state.playing = false;
                        if (state.typingTimer) { clearTimeout(state.typingTimer); state.typingTimer = null; }
                        if (state.gapTimer)    { clearTimeout(state.gapTimer);    state.gapTimer = null; }
                        cancelPacket();
                    }
                } else {
                    if (state.autoPaused && state.userPlaying && !document.hidden) {
                        state.autoPaused = false;
                        state.playing = true;
                        if (state.stepIndex >= 0) runStep(state.stepIndex);
                        else runStep(0);
                    }
                }
            });
        }, { threshold: 0.15 });
        io.observe(stageEl);
    }

    // -----------------------------
    // Wire up
    // -----------------------------
    function init() {
        if (prefersReduced) {
            // Static "snapshot" state: all 4 agents lit, timeline lit, sample output
            Object.keys(agentCards).forEach(function (k) {
                var c = agentCards[k];
                if (!c) return;
                c.classList.add('active');
                var st = c.querySelector('.agent-status-text');
                if (st) st.textContent = 'Ready';
            });
            Object.keys(timelineSteps).forEach(function (k) {
                timelineSteps[k].classList.add('completed');
            });
            setStageStatus('Reduced-motion preview — animations disabled', 'done');
            setOutputMeta('system', 'static preview');
            renderFinal(
                "PLAN:\n" +
                "  1. Plan -> Research -> Build -> Critique -> Revise -> Done\n" +
                "  2. Each agent has a scripted role; Critic gates the run.\n\n" +
                "Verdict: APPROVED\n"
            );
            // Hide caret
            if (outputCaret) outputCaret.style.display = 'none';
            return;
        }

        if (btnPlay) btnPlay.addEventListener('click', function () {
            if (state.playing) pause();
            else play();
        });
        if (btnSpeed) btnSpeed.addEventListener('click', cycleSpeed);
        if (btnReset) btnReset.addEventListener('click', function () {
            reset();
        });

        goalBtns.forEach(function (b) {
            b.addEventListener('click', function () {
                selectScene(b.dataset.scene);
            });
        });

        document.addEventListener('visibilitychange', onVisibilityChange);
        setupIntersectionObserver();

        // Initial UI state
        setOutputMeta('orchestrator', 'awaiting start');
        setPlayUI(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
