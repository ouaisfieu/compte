/* Le Compte — chrono des formations : tri et info-bulles. */
(function () {
  'use strict';
  var fig = document.querySelector('[data-chrono]');
  if (!fig) return;
  var rows = fig.querySelector('[data-rows]');
  var items = Array.prototype.slice.call(rows.children);
  var tip = fig.querySelector('[data-tooltip]');
  var seg = fig.querySelector('[data-sort]');
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };

  if (seg) {
    seg.hidden = false;
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]');
      if (!b) return;
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var mode = b.getAttribute('data-mode');
      items
        .slice()
        .sort(function (a, c) {
          if (mode === 'days') return c.dataset.days - a.dataset.days;
          return a.dataset.date < c.dataset.date ? -1 : 1;
        })
        .forEach(function (r) { rows.appendChild(r); });
    });
  }

  function show(row) {
    tip.textContent = '';
    var strong = document.createElement('strong');
    strong.textContent = fmt(row.dataset.days) + ' jours';
    var key = document.createElement('span');
    key.className = 'k';
    key.style.background = row.dataset.kind === 'regional' ? 'var(--series-2)' : 'var(--series-1)';
    var txt = document.createElement('span');
    txt.textContent = row.dataset.tip;
    tip.appendChild(strong);
    tip.appendChild(key);
    tip.appendChild(txt);
    tip.hidden = false;
    var fr = fig.getBoundingClientRect();
    var rr = row.getBoundingClientRect();
    var bar = row.querySelector('.hbar__bar').getBoundingClientRect();
    var x = Math.min(bar.right - fr.left + 12, fr.width - tip.offsetWidth - 8);
    var y = rr.top - fr.top + rr.height + 4;
    if (y + tip.offsetHeight > fr.height) y = rr.top - fr.top - tip.offsetHeight - 4;
    tip.style.left = Math.max(8, x) + 'px';
    tip.style.top = y + 'px';
  }
  function hide() { tip.hidden = true; }
  items.forEach(function (r) {
    r.addEventListener('pointerenter', function () { show(r); });
    r.addEventListener('pointerleave', hide);
    r.addEventListener('focus', function () { show(r); });
    r.addEventListener('blur', hide);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
})();
