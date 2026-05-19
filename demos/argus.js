(function () {
    'use strict';

    var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ============================================================
       Register config
       ============================================================ */
    var REGISTERS = [
        { address: 40001, name: 'Supply Temperature', unit: 'F',   low: 60,  high: 200,  normal: 142, std: 4,  decimals: 1 },
        { address: 40002, name: 'Discharge Pressure', unit: 'PSI', low: 0,   high: 150,  normal: 75,  std: 3,  decimals: 1 },
        { address: 40003, name: 'Motor Current',      unit: 'A',   low: 0,   high: 50,   normal: 28,  std: 2,  decimals: 1 },
        { address: 40004, name: 'Tank Level',         unit: 'gal', low: 0,   high: 1000, normal: 650, std: 15, decimals: 0 },
    ];

    var DIAGNOSES = {
        40001: [
            'Bearing friction or insufficient lubrication detected. Check lube system and bearing temperatures.',
            'Heat exchanger fouling suspected. Verify cooling water flow rate and schedule inspection.',
        ],
        40002: [
            'Discharge valve partially closed or downstream blockage. Inspect valve position and line.',
            'Cavitation onset possible -- check suction pressure and NPSH margin.',
        ],
        40003: [
            'Motor overload detected. Check for mechanical binding, belt tension, or phase imbalance.',
            'VFD output anomaly or rotor fault suspected. Inspect drive parameters and motor windings.',
        ],
        40004: [
            'Rapid level change detected. Verify inlet/outlet valve positions and inspect for leaks.',
            'Sensor drift suspected. Confirm instrument calibration and check for condensate buildup.',
        ],
    };

    /* ============================================================
       State
       ============================================================ */
    var HIST_LEN   = 40;
    var DET_WINDOW = 20;
    var state      = {};

    REGISTERS.forEach(function (reg) {
        var hist = [];
        for (var i = 0; i < HIST_LEN; i++) {
            hist.push(reg.normal + (Math.random() - 0.5) * reg.std * 1.4);
        }
        state[reg.address] = {
            value:          hist[hist.length - 1],
            history:        hist,
            status:         'normal',
            fault_ticks:    0,
            fault_dir:      1,
            recovering:     false,
            diag_idx:       0,
        };
    });

    /* ============================================================
       DOM refs
       ============================================================ */
    var feedLog    = document.getElementById('feed-log');
    var statusText = document.getElementById('status-text');
    var btnFault   = document.getElementById('btn-fault');

    /* ============================================================
       Helpers
       ============================================================ */
    function ts() {
        var n = new Date();
        return String(n.getHours()).padStart(2, '0') + ':' +
               String(n.getMinutes()).padStart(2, '0') + ':' +
               String(n.getSeconds()).padStart(2, '0');
    }

    function addLog(text, cls) {
        var div = document.createElement('div');
        div.className = 'feed-entry entry-new';
        div.innerHTML = '<span class="feed-ts">' + ts() + '</span>' +
                        '<span class="' + (cls || 'feed-sys') + '">' + text + '</span>';
        feedLog.appendChild(div);
        feedLog.scrollTop = feedLog.scrollHeight;
        setTimeout(function () { div.classList.remove('entry-new'); }, 1200);
    }

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    /* ============================================================
       Sparkline
       ============================================================ */
    var SW = 200, SH = 50, SP = 4;

    function renderSparkline(address, history, status) {
        var svg = document.getElementById('spark-' + address);
        if (!svg) return;

        var vals = history.slice(-30);
        if (vals.length < 2) return;

        var minV = Math.min.apply(null, vals);
        var maxV = Math.max.apply(null, vals);
        var range = maxV - minV;
        if (range < 0.001) range = 1;

        var pts = vals.map(function (v, i) {
            var x = (i / (vals.length - 1)) * (SW - SP * 2) + SP;
            var y = SP + (1 - (v - minV) / range) * (SH - SP * 2);
            return x.toFixed(1) + ',' + y.toFixed(1);
        }).join(' ');

        var color = status === 'fault' ? 'rgba(239,68,68,0.72)' :
                    status === 'drift' ? 'rgba(245,158,11,0.72)' :
                                         'rgba(34,211,238,0.65)';

        svg.innerHTML =
            '<polyline points="' + pts + '" fill="none" stroke="' + color +
            '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>';
    }

    /* ============================================================
       Card update
       ============================================================ */
    function updateCard(reg, s) {
        var card = document.getElementById('reg-' + reg.address);
        if (!card) return;

        card.className = 'reg-card' +
            (s.status === 'fault' ? ' is-fault' :
             s.status === 'drift' ? ' is-drift' : '');

        var valEl = card.querySelector('.reg-value');
        if (valEl) {
            var formatted = s.value.toFixed(reg.decimals);
            if (valEl.textContent !== formatted) {
                valEl.classList.remove('val-flash');
                void valEl.offsetWidth;
                valEl.classList.add('val-flash');
                valEl.textContent = formatted;
            }
        }

        var badge = card.querySelector('.reg-badge');
        if (badge) {
            badge.className = 'reg-badge badge-' + s.status;
            if (s.status === 'fault') {
                badge.innerHTML = '<i class="fas fa-triangle-exclamation" aria-hidden="true"></i> FAULT';
            } else if (s.status === 'drift') {
                badge.innerHTML = '<i class="fas fa-arrow-trend-up" aria-hidden="true"></i> DRIFT';
            } else {
                badge.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> NORMAL';
            }
        }

        var marker = card.querySelector('.reg-range-marker');
        if (marker) {
            var pct = Math.max(0, Math.min(100,
                (s.value - reg.low) / (reg.high - reg.low) * 100));
            marker.style.left = pct.toFixed(1) + '%';
        }

        renderSparkline(reg.address, s.history, s.status);
    }

    /* ============================================================
       Detection (simplified 3-sigma)
       ============================================================ */
    function detect(reg, s) {
        var win = s.history.slice(-DET_WINDOW);
        if (win.length < 8) return;

        var mean = win.reduce(function (a, b) { return a + b; }, 0) / win.length;
        var variance = win.reduce(function (a, v) { return a + (v - mean) * (v - mean); }, 0) / win.length;
        var stddev = Math.sqrt(variance);
        if (stddev < 0.01) return;

        var z    = Math.abs(s.value - mean) / stddev;
        var prev = s.status;

        if (z > 3.0)      { s.status = 'fault'; }
        else if (z > 2.0) { s.status = 'drift'; }
        else              { s.status = 'normal'; }

        if (s.status === 'fault' && prev !== 'fault') {
            var diags  = DIAGNOSES[reg.address];
            var diag   = diags[s.diag_idx % diags.length];
            s.diag_idx++;
            addLog('[' + reg.name + '] FAULT -- z=' + z.toFixed(1) + ', value=' + s.value.toFixed(reg.decimals) + ' ' + reg.unit, 'feed-fault');
            addLog('Diagnosis: ' + diag, 'feed-diag');
            if (statusText) statusText.textContent = 'FAULT detected -- ' + reg.name;
        } else if (s.status === 'drift' && prev === 'normal') {
            addLog('[' + reg.name + '] drift detected -- approaching threshold', 'feed-drift');
        } else if (s.status === 'normal' && prev !== 'normal') {
            addLog('[' + reg.name + '] returned to normal range', 'feed-ok');
            var anyFault = REGISTERS.some(function (r) { return state[r.address].status !== 'normal'; });
            if (!anyFault && statusText) statusText.textContent = 'Monitoring active -- 4 registers online';
        }
    }

    /* ============================================================
       Tick
       ============================================================ */
    function tick() {
        REGISTERS.forEach(function (reg) {
            var s = state[reg.address];
            var drift = 0;

            if (s.fault_ticks > 0) {
                drift = s.fault_dir * reg.std * rand(0.5, 0.9);
                s.fault_ticks--;
                if (s.fault_ticks === 0 && !s.recovering) {
                    s.recovering  = true;
                    s.fault_dir  *= -1;
                    s.fault_ticks = 10;
                } else if (s.fault_ticks === 0 && s.recovering) {
                    s.recovering = false;
                    s.fault_dir  = 1;
                }
            }

            var noise  = (Math.random() - 0.5) * reg.std * 0.45;
            var newVal = s.value + noise + drift;
            newVal = Math.max(reg.low * 0.88, Math.min(reg.high * 1.06, newVal));
            s.value = newVal;
            s.history.push(newVal);
            if (s.history.length > HIST_LEN) s.history.shift();

            detect(reg, s);
            updateCard(reg, s);
        });
    }

    /* ============================================================
       Initial render
       ============================================================ */
    REGISTERS.forEach(function (reg) {
        updateCard(reg, state[reg.address]);
    });

    /* ============================================================
       Initial feed log
       ============================================================ */
    var INIT_LOG = [
        { text: 'Argus started -- monitoring 4 registers',  cls: 'feed-sys' },
        { text: 'ModBridge connected at localhost:3000',     cls: 'feed-sys' },
        { text: 'Ollama model llama3.2 ready',               cls: 'feed-sys' },
        { text: '[Supply Temperature] baseline established', cls: 'feed-ok'  },
        { text: '[Discharge Pressure] baseline established', cls: 'feed-ok'  },
        { text: '[Motor Current] baseline established',      cls: 'feed-ok'  },
        { text: '[Tank Level] baseline established',         cls: 'feed-ok'  },
        { text: 'All registers nominal -- detection active', cls: 'feed-ok'  },
    ];

    INIT_LOG.forEach(function (entry) {
        var div = document.createElement('div');
        div.className = 'feed-entry';
        div.innerHTML = '<span class="feed-ts">--:--:--</span>' +
                        '<span class="' + entry.cls + '">' + entry.text + '</span>';
        feedLog.appendChild(div);
    });
    feedLog.scrollTop = feedLog.scrollHeight;

    /* ============================================================
       Simulate Fault button
       ============================================================ */
    if (btnFault) {
        btnFault.addEventListener('click', function () {
            var eligible = REGISTERS.filter(function (r) {
                return state[r.address].fault_ticks === 0 && !state[r.address].recovering;
            });
            if (!eligible.length) return;

            var reg = eligible[Math.floor(Math.random() * eligible.length)];
            var s   = state[reg.address];
            s.fault_dir   = Math.random() > 0.5 ? 1 : -1;
            s.fault_ticks = 10;
            s.recovering  = false;

            addLog('[' + reg.name + '] fault injected -- watching for threshold breach', 'feed-sys');
        });
    }

    /* ============================================================
       Auto-run
       ============================================================ */
    if (!prefersReduced) {
        setInterval(tick, 2000);

        setTimeout(function () {
            if (btnFault) btnFault.click();
        }, 14000);
    }

})();
