(function () {
    'use strict';

    var tabs   = Array.prototype.slice.call(document.querySelectorAll('.chalk-tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.tab-panel'));

    function activateTab(key) {
        tabs.forEach(function (t) {
            var on = t.dataset.tab === key;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(function (p) {
            p.classList.toggle('active', p.id === 'panel-' + key);
        });
    }

    tabs.forEach(function (t) {
        t.addEventListener('click', function () { activateTab(t.dataset.tab); });
    });

    tabs.forEach(function (t) {
        t.addEventListener('keydown', function (e) {
            var idx = tabs.indexOf(t);
            if (e.key === 'ArrowRight') { tabs[(idx + 1) % tabs.length].focus(); activateTab(tabs[(idx + 1) % tabs.length].dataset.tab); }
            if (e.key === 'ArrowLeft')  { tabs[(idx - 1 + tabs.length) % tabs.length].focus(); activateTab(tabs[(idx - 1 + tabs.length) % tabs.length].dataset.tab); }
        });
    });
})();
