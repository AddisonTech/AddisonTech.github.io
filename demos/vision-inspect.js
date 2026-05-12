(function () {
    'use strict';

    var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============================================================
       Scripted outcomes for "Run New Inspection"
       ============================================================ */
    var OUTCOMES = [
        {
            id: 'C3-4412',
            status: 'pass',
            badge: '<i class="fas fa-check" aria-hidden="true"></i> PASS',
            badgeClass: 'badge-pass',
            conf: '97.8%',
            confClass: 'conf-high',
            desc: 'No defects detected. Surface and edges within spec.',
            feedStatus: 'PASS',
            feedClass: 'feed-pass',
            svgColor: '#22d3ee',
            svgFill: 'rgba(34,211,238,0.06)',
            svgStroke: 'rgba(34,211,238,0.25)',
            bgClass: 'insp-img-e'
        },
        {
            id: 'C3-4413',
            status: 'fail',
            badge: '<i class="fas fa-xmark" aria-hidden="true"></i> FAIL',
            badgeClass: 'badge-fail',
            conf: '91.3%',
            confClass: 'conf-mid',
            desc: 'Detected pitting on upper surface, multiple points. Outside spec for Part Class C.',
            feedStatus: 'FAIL',
            feedClass: 'feed-fail',
            svgColor: '#ef4444',
            svgFill: 'rgba(239,68,68,0.06)',
            svgStroke: 'rgba(239,68,68,0.3)',
            bgClass: 'insp-img-c'
        },
        {
            id: 'C3-4414',
            status: 'review',
            badge: '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i> REVIEW',
            badgeClass: 'badge-review',
            conf: '82.1%',
            confClass: 'conf-low',
            desc: 'Finish irregularity on right face. Confidence below threshold. Manual review recommended.',
            feedStatus: 'REVIEW',
            feedClass: 'feed-review',
            svgColor: '#f59e0b',
            svgFill: 'rgba(245,158,11,0.06)',
            svgStroke: 'rgba(245,158,11,0.28)',
            bgClass: 'insp-img-d'
        }
    ];

    var outcomeIdx = 0;

    /* ============================================================
       DOM refs
       ============================================================ */
    var inspGrid  = document.getElementById('insp-grid');
    var feedLog   = document.getElementById('feed-log');
    var btnInspect= document.getElementById('btn-inspect');
    var statusText= document.getElementById('status-text');

    /* ============================================================
       Helpers
       ============================================================ */
    function timestamp() {
        var now = new Date();
        var h = String(now.getHours()).padStart(2, '0');
        var m = String(now.getMinutes()).padStart(2, '0');
        var s = String(now.getSeconds()).padStart(2, '0');
        return h + ':' + m + ':' + s;
    }

    function addLog(ts, text, cls) {
        var div = document.createElement('div');
        div.className = 'feed-entry entry-new';
        div.innerHTML =
            '<span class="feed-ts">' + ts + '</span>' +
            '<span class="' + (cls || '') + '">' + text + '</span>';
        feedLog.appendChild(div);
        feedLog.scrollTop = feedLog.scrollHeight;
        setTimeout(function () { div.classList.remove('entry-new'); }, 1200);
    }

    function makePlaceholderSVG(color, fill, stroke, partId) {
        return '<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<rect x="12" y="10" width="96" height="70" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>' +
            '<rect x="22" y="20" width="76" height="50" rx="3" fill="' + fill + '" stroke="' + stroke + '" stroke-width="0.8"/>' +
            '<circle cx="60" cy="45" r="12" fill="none" stroke="' + stroke + '" stroke-width="1"/>' +
            '<line x1="60" y1="33" x2="60" y2="57" stroke="' + stroke + '" stroke-width="0.8"/>' +
            '<line x1="48" y1="45" x2="72" y2="45" stroke="' + stroke + '" stroke-width="0.8"/>' +
            '<text x="60" y="80" font-size="7" fill="rgba(255,255,255,0.28)" text-anchor="middle" font-family="monospace">' + partId + '</text>' +
            '</svg>';
    }

    function makeAnalyzingCard(partId, bgClass) {
        var article = document.createElement('article');
        article.className = 'insp-card card-new is-analyzing';
        article.setAttribute('aria-label', 'Part ' + partId + ' analyzing');

        var imgDiv = document.createElement('div');
        imgDiv.className = 'insp-img ' + bgClass;
        imgDiv.innerHTML =
            '<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<rect x="12" y="10" width="96" height="70" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>' +
            '<rect x="22" y="20" width="76" height="50" rx="3" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.15)" stroke-width="0.8"/>' +
            '<text x="60" y="80" font-size="7" fill="rgba(255,255,255,0.25)" text-anchor="middle" font-family="monospace">' + partId + '</text>' +
            '</svg>' +
            '<span class="img-scan-line" aria-hidden="true"></span>';

        var body = document.createElement('div');
        body.className = 'insp-card-body';
        body.innerHTML =
            '<div class="insp-card-top">' +
                '<span class="insp-id">Part #' + partId + '</span>' +
                '<span class="insp-badge badge-analyzing">' +
                    '<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Analyzing' +
                '</span>' +
            '</div>' +
            '<div class="insp-conf-row">' +
                '<span class="insp-conf-label">Confidence</span>' +
                '<span class="insp-conf-val conf-analyzing">--.--%</span>' +
            '</div>' +
            '<p class="insp-desc">Analyzing frame via Qwen2.5-VL...</p>';

        article.appendChild(imgDiv);
        article.appendChild(body);
        return article;
    }

    function resolveCard(article, outcome) {
        article.classList.remove('is-analyzing');
        article.setAttribute('aria-label', 'Part ' + outcome.id + ' inspection result');

        var imgDiv = article.querySelector('.insp-img');
        if (imgDiv) {
            imgDiv.className = 'insp-img ' + outcome.bgClass;
            imgDiv.innerHTML =
                makePlaceholderSVG(outcome.svgColor, outcome.svgFill, outcome.svgStroke, outcome.id) +
                '<span class="img-scan-line" aria-hidden="true"></span>';
        }

        var body = article.querySelector('.insp-card-body');
        if (body) {
            body.innerHTML =
                '<div class="insp-card-top">' +
                    '<span class="insp-id">Part #' + outcome.id + '</span>' +
                    '<span class="insp-badge ' + outcome.badgeClass + '">' + outcome.badge + '</span>' +
                '</div>' +
                '<div class="insp-conf-row">' +
                    '<span class="insp-conf-label">Confidence</span>' +
                    '<span class="insp-conf-val ' + outcome.confClass + '">' + outcome.conf + '</span>' +
                '</div>' +
                '<p class="insp-desc">' + outcome.desc + '</p>';
        }
    }

    /* ============================================================
       Pre-populate feed log
       ============================================================ */
    var INITIAL_LOG = [
        { ts: '12:44:01', text: 'Frame captured - Part #A1-2201', cls: 'feed-sys' },
        { ts: '12:44:02', text: 'VLM analysis complete - PASS (96.4%)', cls: 'feed-pass' },
        { ts: '12:44:03', text: 'Verdict written to PLC register', cls: 'feed-sys' },
        { ts: '12:44:07', text: 'Frame captured - Part #A1-2202', cls: 'feed-sys' },
        { ts: '12:44:08', text: 'VLM analysis complete - PASS (94.1%)', cls: 'feed-pass' },
        { ts: '12:44:09', text: 'Verdict written to PLC register', cls: 'feed-sys' },
        { ts: '12:44:14', text: 'Frame captured - Part #B2-1087', cls: 'feed-sys' },
        { ts: '12:44:16', text: 'VLM analysis complete - FAIL (88.7%)', cls: 'feed-fail' },
        { ts: '12:44:16', text: 'Defect logged: surface crack 7mm', cls: 'feed-fail' },
        { ts: '12:44:17', text: 'Alert sent to supervisor queue', cls: 'feed-sys' },
        { ts: '12:44:22', text: 'Frame captured - Part #B2-1088', cls: 'feed-sys' },
        { ts: '12:44:24', text: 'VLM analysis complete - REVIEW (79.2%)', cls: 'feed-review' },
        { ts: '12:44:24', text: 'Low confidence — supervisor review queued', cls: 'feed-review' }
    ];

    INITIAL_LOG.forEach(function (entry) {
        var div = document.createElement('div');
        div.className = 'feed-entry';
        div.innerHTML =
            '<span class="feed-ts">' + entry.ts + '</span>' +
            '<span class="' + entry.cls + '">' + entry.text + '</span>';
        feedLog.appendChild(div);
    });
    feedLog.scrollTop = feedLog.scrollHeight;

    /* ============================================================
       Run New Inspection
       ============================================================ */
    if (btnInspect) {
        btnInspect.addEventListener('click', function () {
            var outcome = OUTCOMES[outcomeIdx % OUTCOMES.length];
            outcomeIdx++;

            btnInspect.disabled = true;
            if (statusText) statusText.textContent = 'Capturing frame...';

            var ts1 = timestamp();
            addLog(ts1, 'Frame captured - Part #' + outcome.id, 'feed-sys');

            var card = makeAnalyzingCard(outcome.id, outcome.bgClass);
            inspGrid.appendChild(card);
            inspGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            var analyzeDelay = prefersReduced ? 100 : 1600;

            setTimeout(function () {
                var ts2 = timestamp();
                addLog(ts2, 'VLM analysis complete - ' + outcome.feedStatus + ' (' + outcome.conf + ')', outcome.feedClass);

                resolveCard(card, outcome);

                if (outcome.status === 'fail') {
                    var ts3 = timestamp();
                    addLog(ts3, 'Defect logged — alert sent to supervisor queue', 'feed-fail');
                } else if (outcome.status === 'review') {
                    var ts3b = timestamp();
                    addLog(ts3b, 'Low confidence — supervisor review queued', 'feed-review');
                } else {
                    var ts3c = timestamp();
                    addLog(ts3c, 'Verdict written to PLC register', 'feed-sys');
                }

                if (statusText) statusText.textContent = 'System online — monitoring active';
                btnInspect.disabled = false;
            }, analyzeDelay);
        });
    }

})();
