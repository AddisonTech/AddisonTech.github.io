(function () {
    'use strict';

    var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============================================================
       Crew + scripted data
       ============================================================ */
    var AGENT_META = {
        orchestrator:  { name: 'Orchestrator',         role: 'Plans & routes',     icon: 'fas fa-sitemap',          color: 'c' },
        researcher:    { name: 'Controls Researcher',  role: 'Retrieves context',  icon: 'fas fa-magnifying-glass', color: 'v' },
        frontend:      { name: 'Frontend Researcher',  role: 'Retrieves context',  icon: 'fas fa-magnifying-glass', color: 'v' },
        vlm:           { name: 'VLM Analyzer',         role: 'Analyzes frames',    icon: 'fas fa-camera',           color: 'v' },
        plcbuilder:    { name: 'PLC Builder',           role: 'Authors artifacts',  icon: 'fas fa-hammer',           color: 'a' },
        reactbuilder:  { name: 'React Builder',        role: 'Authors artifacts',  icon: 'fas fa-code',             color: 'a' },
        classifier:    { name: 'Defect Classifier',    role: 'Scores anomalies',   icon: 'fas fa-tags',             color: 'a' },
        safetycritic:  { name: 'Safety Critic',        role: 'Reviews & gates',    icon: 'fas fa-shield-halved',    color: 'g' },
        qasentinel:    { name: 'QA Sentinel',          role: 'Reviews & gates',    icon: 'fas fa-circle-check',     color: 'g' },
        reportgen:     { name: 'Report Generator',     role: 'Finalizes output',   icon: 'fas fa-file-lines',       color: 'g' }
    };

    var CREWS = {
        default: {
            label: 'Default',
            goal: 'A general-purpose crew for any engineering or development task. Select a preset goal to see a scripted demo.',
            hint: 'General purpose — handles any task. Pick a preset to see a demo.',
            steps: null,
            output: null
        },
        plc: {
            label: 'PLC',
            goal: 'Generate a PLC ladder logic routine for a conveyor start sequence.',
            hint: 'PLC crew — Orchestrator, Controls Researcher, PLC Builder, Safety Critic.',
            steps: [
                {
                    agent: 'orchestrator',
                    text: 'Task received. Breaking into sub-goals: (1) define I/O tags, (2) author ladder rungs, (3) verify safety interlocks. Routing to Controls Researcher.'
                },
                {
                    agent: 'researcher',
                    text: 'Querying vector store. Found: ControlLogix tag naming conventions, NFPA 79 E-stop requirements, and a prior conveyor routine in /outputs/2025-08. Passing context to PLC Builder.'
                },
                {
                    agent: 'plcbuilder',
                    text: 'Writing Conveyor_Start routine. Defined tags: Conveyor.Run, Motor.Enable, EStop.OK, Sensor.Proximity, Motor.OL. Authoring 4 rungs with safety chain. Draft ready for review.'
                },
                {
                    agent: 'safetycritic',
                    text: 'Review flagged two issues: Motor.OL contact missing from rung 2, and E-stop circuit lacks dual-channel confirmation per NFPA 79 §9.2.5. Returning to PLC Builder for revisions.'
                },
                {
                    agent: 'plcbuilder',
                    text: 'Revisions applied. Added Motor.OL contact to rung 2. Added dual-channel safety confirmation rung. Both changes verified against NFPA 79 §9.2.5.'
                },
                {
                    agent: 'safetycritic',
                    text: 'Final review passed. All interlocks verified. Dual-channel E-stop compliant with NFPA 79. Routine approved for delivery.'
                }
            ],
            outputAgent: 'plcbuilder',
            outputAction: 'run complete',
            output:
'Routine: Conveyor_Start\n' +
'  Rung 0: XIC EStop.OK     XIC Motor.OL    OTE Conveyor.Enable\n' +
'  Rung 1: XIC Conveyor.Run XIC Sensor.Prox OTE Motor.Enable\n' +
'  Rung 2: XIC Safety.Ch1   XIC Safety.Ch2  OTE Safety.OK\n' +
'  Rung 3: XIO Conveyor.Run                 RES Motor.Enable\n' +
'\n' +
'Verdict: APPROVED\n' +
'Saved: /outputs/conveyor_start.l5x\n'
        },
        react: {
            label: 'React',
            goal: 'Build a React component for a sortable data table.',
            hint: 'React crew — Orchestrator, Frontend Researcher, React Builder, QA Sentinel.',
            steps: [
                {
                    agent: 'orchestrator',
                    text: 'Decomposing task: schema typing, sort state, row rendering, accessibility. Sending to Frontend Researcher first.'
                },
                {
                    agent: 'frontend',
                    text: 'Reviewed /components. TanStack Table v8 is the right fit for sort and filter. Pulled WCAG 1.3.1 ARIA sort attribute requirements. Passing context to React Builder.'
                },
                {
                    agent: 'reactbuilder',
                    text: 'Scaffolding SortableTable<T> component. Implementing useReducer sort state, column header click handlers, and ARIA aria-sort attributes per WCAG 1.3.1. TypeScript generics added for column config. Draft ready.'
                },
                {
                    agent: 'qasentinel',
                    text: 'Review found three issues: missing key prop on row map, no empty-state handling, sort comparator only handles string columns. Returning to React Builder.'
                },
                {
                    agent: 'reactbuilder',
                    text: 'All three fixed: stable key props added, EmptyState component added, sort comparator extended to handle numbers and ISO dates. Types tightened.'
                },
                {
                    agent: 'qasentinel',
                    text: 'Second pass clear. All issues resolved. Accessibility verified. Component is production-ready.'
                }
            ],
            outputAgent: 'reactbuilder',
            outputAction: 'run complete',
            output:
'// SortableTable.tsx\n' +
'export function SortableTable<T>({ columns, data }: Props<T>) {\n' +
'  const [sort, dispatch] = useReducer(sortReducer, null);\n' +
'  const rows = useSortedRows(data, sort);\n' +
'  if (!rows.length) return <EmptyState />;\n' +
'  return (\n' +
'    <table role="grid">\n' +
'      <thead>\n' +
'        {columns.map(col => (\n' +
'          <th key={col.key}\n' +
'              aria-sort={ariaSort(sort, col)}\n' +
'              onClick={() => dispatch({ col })}>\n' +
'            {col.label}\n' +
'          </th>\n' +
'        ))}\n' +
'      </thead>\n' +
'      <tbody>\n' +
'        {rows.map(row => (\n' +
'          <tr key={row.id}>{/* cells */}</tr>\n' +
'        ))}\n' +
'      </tbody>\n' +
'    </table>\n' +
'  );\n' +
'}\n' +
'\n' +
'// Verdict: APPROVED\n'
        },
        vision: {
            label: 'Vision',
            goal: 'Analyze this manufacturing image for defects.',
            hint: 'Vision crew — Orchestrator, VLM Analyzer, Defect Classifier, Report Generator.',
            steps: [
                {
                    agent: 'orchestrator',
                    text: 'Frame loaded from capture buffer. Part #A1-2204 in position. Routing to VLM Analyzer.'
                },
                {
                    agent: 'vlm',
                    text: 'Running Qwen2.5-VL prompt against 640x480 frame. Checking surface texture, edge geometry, and finish uniformity. Analysis complete — response passed to Defect Classifier.'
                },
                {
                    agent: 'classifier',
                    text: 'VLM response parsed. Two anomalies identified: (1) edge chipping, lower-left quadrant, ~3mm. (2) surface oxidation, upper face, ~12mm. Scoring severity against tolerance database.'
                },
                {
                    agent: 'reportgen',
                    text: 'Compiling inspection report. Defects logged with pixel coordinates. Confidence scores: edge chip 0.91, oxidation 0.74. Generating structured JSON output.'
                },
                {
                    agent: 'classifier',
                    text: 'Tolerance check done. Edge chip: within spec for Part Class B (threshold 5mm). Oxidation: confidence 0.74 is below the 0.78 floor. Flagging for supervisor review.'
                },
                {
                    agent: 'reportgen',
                    text: 'Report finalized. Status: CONDITIONAL PASS. Writing verdict to PLC register. Supervisor review queued for oxidation flag.'
                }
            ],
            outputAgent: 'reportgen',
            outputAction: 'run complete',
            output:
'{\n' +
'  "part_id": "A1-2204",\n' +
'  "status": "CONDITIONAL_PASS",\n' +
'  "defects": [\n' +
'    {\n' +
'      "type": "edge_chip",\n' +
'      "severity": "minor",\n' +
'      "confidence": 0.91,\n' +
'      "within_tolerance": true\n' +
'    },\n' +
'    {\n' +
'      "type": "surface_oxidation",\n' +
'      "severity": "marginal",\n' +
'      "confidence": 0.74,\n' +
'      "requires_review": true\n' +
'    }\n' +
'  ],\n' +
'  "plc_verdict": 2\n' +
'}\n'
        }
    };

    /* ============================================================
       DOM refs
       ============================================================ */
    var convFeed    = document.getElementById('conv-feed');
    var convEmpty   = document.getElementById('conv-empty');
    var goalText    = document.getElementById('goal-text');
    var hintText    = document.getElementById('hint-text');
    var outputCode  = document.getElementById('output-code');
    var outputCaret = document.getElementById('output-caret');
    var outputBody  = document.getElementById('output-body');
    var outputAgent = document.getElementById('output-agent');
    var outputAction= document.getElementById('output-action');
    var btnRun      = document.getElementById('btn-run');
    var runIcon     = document.getElementById('run-icon');
    var runLabel    = document.getElementById('run-label');
    var btnReset    = document.getElementById('btn-reset');
    var crewBtns    = Array.prototype.slice.call(document.querySelectorAll('.crew-btn'));
    var presetBtns  = Array.prototype.slice.call(document.querySelectorAll('.preset-btn'));

    /* ============================================================
       State
       ============================================================ */
    var state = {
        crewKey: 'default',
        running: false,
        finished: false,
        stepIdx: 0,
        typingTimer: null,
        gapTimer: null
    };

    /* ============================================================
       Helpers
       ============================================================ */
    function setHint(text) {
        if (hintText) hintText.textContent = text;
    }

    function setRunUI(running, finished) {
        if (!runIcon || !runLabel) return;
        if (running) {
            runIcon.className = 'fas fa-stop';
            runLabel.textContent = 'Stop';
        } else {
            runIcon.className = 'fas fa-play';
            runLabel.textContent = finished ? 'Replay' : 'Run Crew';
        }
    }

    function clearTimers() {
        if (state.typingTimer) { clearTimeout(state.typingTimer); state.typingTimer = null; }
        if (state.gapTimer)    { clearTimeout(state.gapTimer);    state.gapTimer = null; }
    }

    function clearFeed() {
        if (!convFeed) return;
        convFeed.innerHTML = '';
        if (convEmpty) {
            var clone = convEmpty.cloneNode(true);
            clone.id = 'conv-empty';
            clone.style.display = '';
            convFeed.appendChild(clone);
        }
    }

    function hideFeedEmpty() {
        var el = document.getElementById('conv-empty');
        if (el) el.style.display = 'none';
    }

    function scrollFeed() {
        if (convFeed) convFeed.scrollTop = convFeed.scrollHeight;
    }

    /* ============================================================
       Crew / goal selection
       ============================================================ */
    function selectCrew(key) {
        var crew = CREWS[key];
        if (!crew) return;
        state.crewKey = key;
        crewBtns.forEach(function (b) {
            var on = b.dataset.crew === key;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        if (goalText) goalText.textContent = crew.goal;
        setHint(crew.hint);
        stopRun();
        clearFeed();
        resetOutput();
    }

    function selectPreset(crewKey) {
        selectCrew(crewKey);
        presetBtns.forEach(function (b) {
            b.classList.toggle('active', b.dataset.crew === crewKey);
        });
    }

    /* ============================================================
       Bubble rendering
       ============================================================ */
    function makeBubble(agentKey, typing) {
        var meta = AGENT_META[agentKey];
        if (!meta) return null;

        var bubble = document.createElement('div');
        bubble.className = 'bubble bubble-' + meta.color + (typing ? ' bubble-typing' : '');

        var side = document.createElement('div');
        side.className = 'bubble-side';

        var avatar = document.createElement('div');
        avatar.className = 'bubble-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.innerHTML = '<i class="' + meta.icon + '"></i>';
        side.appendChild(avatar);

        var content = document.createElement('div');
        content.className = 'bubble-content';

        var header = document.createElement('div');
        header.className = 'bubble-header';
        header.innerHTML =
            '<span class="bubble-name">' + meta.name + '</span>' +
            '<span class="bubble-role">' + meta.role + '</span>';

        var msg = document.createElement('div');
        msg.className = 'bubble-msg';

        if (typing) {
            msg.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        }

        content.appendChild(header);
        content.appendChild(msg);
        bubble.appendChild(side);
        bubble.appendChild(content);

        return { el: bubble, msg: msg };
    }

    function appendBubble(agentKey, text, done) {
        hideFeedEmpty();
        var parts = makeBubble(agentKey, true);
        if (!parts) { if (done) done(); return; }

        convFeed.appendChild(parts.el);
        scrollFeed();

        var delay = prefersReduced ? 0 : 700;

        state.gapTimer = setTimeout(function () {
            state.gapTimer = null;
            parts.el.classList.remove('bubble-typing');
            if (prefersReduced) {
                parts.msg.innerHTML = '';
                parts.msg.textContent = text;
                if (done) done();
                return;
            }
            typeText(parts.msg, text, done);
        }, delay);
    }

    function typeText(el, text, done) {
        el.innerHTML = '';
        el.textContent = '';
        var i = 0;
        var charDelay = 18;

        function tick() {
            if (i >= text.length) {
                scrollFeed();
                if (done) done();
                return;
            }
            el.textContent += text.charAt(i);
            i++;
            scrollFeed();
            state.typingTimer = setTimeout(tick, charDelay);
        }
        state.typingTimer = setTimeout(tick, 0);
    }

    /* ============================================================
       Output rendering
       ============================================================ */
    function resetOutput() {
        if (outputCode) outputCode.innerHTML = '// Output appears here after the run completes.';
        if (outputAgent) outputAgent.textContent = 'system';
        if (outputAction) outputAction.textContent = 'awaiting run';
        if (outputCaret) outputCaret.style.display = 'none';
        state.finished = false;
    }

    function tokenizeLine(line) {
        var s = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        s = s.replace(/^(\s*)(Verdict:)\s*(APPROVED|CONDITIONAL_PASS|REVISE)/,
            function (_m, ws, label, verdict) {
                var cls = (verdict === 'APPROVED' || verdict === 'CONDITIONAL_PASS') ? 'ok' : 'warn';
                return ws + '<span class="key">' + label + '</span> <span class="' + cls + '">' + verdict + '</span>';
            });
        s = s.replace(/^(\s*)(Saved:|Routine:|\/\/ Verdict:)/,
            '$1<span class="key">$2</span>');
        return s;
    }

    function typeOutput(text, agentKey, action, done) {
        if (!outputCode) { if (done) done(); return; }
        if (outputAgent) outputAgent.textContent = agentKey || 'system';
        if (outputAction) outputAction.textContent = action || '';
        if (outputCaret) outputCaret.style.display = 'inline-block';
        outputCode.innerHTML = '';

        if (prefersReduced) {
            var html = text.split('\n').map(tokenizeLine).join('\n');
            outputCode.innerHTML = html;
            if (done) done();
            return;
        }

        var lines = text.split('\n');
        var lineIdx = 0;
        var charIdx = 0;
        var rendered = '';
        var currentRaw = '';

        function tick() {
            if (lineIdx >= lines.length) {
                if (done) done();
                return;
            }
            var line = lines[lineIdx];
            if (charIdx < line.length) {
                currentRaw += line.charAt(charIdx);
                charIdx++;
                outputCode.innerHTML = rendered + currentRaw
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                if (outputBody) outputBody.scrollTop = outputBody.scrollHeight;
                state.typingTimer = setTimeout(tick, 14);
                return;
            }
            rendered += tokenizeLine(currentRaw) + '\n';
            outputCode.innerHTML = rendered;
            currentRaw = '';
            charIdx = 0;
            lineIdx++;
            state.typingTimer = setTimeout(tick, 50);
        }
        state.typingTimer = setTimeout(tick, 0);
    }

    /* ============================================================
       Run engine
       ============================================================ */
    function runSteps(steps, idx, crew) {
        if (!state.running) return;
        if (idx >= steps.length) {
            state.gapTimer = setTimeout(function () {
                state.gapTimer = null;
                if (!state.running) return;
                typeOutput(crew.output, crew.outputAgent, crew.outputAction, function () {
                    state.running = false;
                    state.finished = true;
                    setRunUI(false, true);
                    setHint('Run complete. Click Replay to run again.');
                });
            }, 600);
            return;
        }

        var step = steps[idx];
        appendBubble(step.agent, step.text, function () {
            if (!state.running) return;
            state.gapTimer = setTimeout(function () {
                state.gapTimer = null;
                if (!state.running) return;
                runSteps(steps, idx + 1, crew);
            }, prefersReduced ? 100 : 500);
        });
    }

    function startRun() {
        var crew = CREWS[state.crewKey];
        if (!crew || !crew.steps) {
            setHint('Default crew has no scripted demo. Select PLC, React, or Vision.');
            return;
        }
        clearTimers();
        clearFeed();
        resetOutput();
        state.running = true;
        state.finished = false;
        state.stepIdx = 0;
        setRunUI(true, false);
        setHint('Running ' + crew.label + ' crew...');
        runSteps(crew.steps, 0, crew);
    }

    function stopRun() {
        clearTimers();
        state.running = false;
        setRunUI(false, state.finished);
    }

    /* ============================================================
       Wire up events
       ============================================================ */
    crewBtns.forEach(function (b) {
        b.addEventListener('click', function () { selectCrew(b.dataset.crew); });
    });

    presetBtns.forEach(function (b) {
        b.addEventListener('click', function () { selectPreset(b.dataset.crew); });
    });

    if (btnRun) {
        btnRun.addEventListener('click', function () {
            if (state.running) {
                stopRun();
                setHint('Stopped. Click Run Crew to start again.');
            } else if (state.finished) {
                clearFeed();
                resetOutput();
                startRun();
            } else {
                startRun();
            }
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', function () {
            stopRun();
            clearFeed();
            resetOutput();
            setHint(CREWS[state.crewKey].hint);
            presetBtns.forEach(function (b) { b.classList.remove('active'); });
        });
    }

    /* ============================================================
       Init
       ============================================================ */
    if (outputCaret) outputCaret.style.display = 'none';
    selectCrew('default');

})();
