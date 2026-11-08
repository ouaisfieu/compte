/* Le Compte — parcours interactif du citoyen. */
(function () {
  'use strict';
  var box = document.querySelector('[data-parcours]');
  var dataEl = document.getElementById('parcours-data');
  if (!box || !dataEl) return;
  var data = JSON.parse(dataEl.textContent);
  var region = box.querySelector('[data-region]');
  var steps = Array.prototype.slice.call(box.querySelectorAll('[data-step]'));
  var byId = {};
  data.steps.forEach(function (s) { byId[s.id] = s; });
  var openAll = box.querySelector('[data-open-all]');
  var reset = box.querySelector('[data-reset-parcours]');
  var chev = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  steps.forEach(function (li, k) {
    var s = byId[li.getAttribute('data-step')];
    var head = li.querySelector('.parcours__head');
    var detail = li.querySelector('.parcours__detail');
    detail.id = 'parcours-' + s.id;
    detail.hidden = true;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', detail.id);
    while (head.firstChild) btn.appendChild(head.firstChild);
    var n = document.createElement('span');
    n.className = 'n';
    n.textContent = s.levels.length + ' niveau' + (s.levels.length > 1 ? 'x' : '');
    btn.appendChild(n);
    btn.insertAdjacentHTML('beforeend', chev);
    head.appendChild(btn);
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      detail.hidden = !open;
      if (open) { li.setAttribute('data-done', 'true'); score(); }
    });
  });

  function excluded() { return region.value === 'B' ? ['provinces'] : ['bruxelles']; }
  function levelsOf(s) { var ex = excluded(); return s.levels.filter(function (l) { return ex.indexOf(l) === -1; }); }
  function guichets(s) {
    var r = region.value;
    return (s.guichets['*'] || []).concat(s.guichets[r] || []);
  }
  function renderGuichets() {
    steps.forEach(function (li) {
      var s = byId[li.getAttribute('data-step')];
      var ul = li.querySelector('[data-guichets]');
      ul.textContent = '';
      guichets(s).forEach(function (g) { var x = document.createElement('li'); x.textContent = g; ul.appendChild(x); });
      var line = li.querySelector('[data-levels-line]');
      var lv = levelsOf(s);
      line.textContent = 'Niveaux : ' + lv.map(function (l) { return data.levels[l]; }).join(', ') + '.';
      li.querySelector('.parcours__head .n').textContent = lv.length + ' niveau' + (lv.length > 1 ? 'x' : '');
    });
    score();
  }
  function score() {
    var done = steps.filter(function (li) { return li.getAttribute('data-done') === 'true'; });
    var levels = {}, g = {};
    done.forEach(function (li) {
      var s = byId[li.getAttribute('data-step')];
      levelsOf(s).forEach(function (l) { levels[l] = true; });
      guichets(s).forEach(function (x) { g[x] = true; });
    });
    box.querySelector('[data-score-steps]').textContent = done.length + '/' + steps.length;
    var ex = excluded();
    box.querySelector('[data-score-levels]').textContent = Object.keys(levels).length + '/' + (7 - ex.length);
    box.querySelector('[data-score-guichets]').textContent = String(Object.keys(g).length);
    box.querySelectorAll('[data-levels-bar] [data-level]').forEach(function (sp) {
      var k = sp.getAttribute('data-level');
      sp.classList.toggle('on', !!levels[k]);
      sp.hidden = ex.indexOf(k) > -1;
    });
  }
  region.addEventListener('change', renderGuichets);
  openAll.hidden = false;
  reset.hidden = false;
  openAll.addEventListener('click', function () {
    steps.forEach(function (li) {
      var b = li.querySelector('.parcours__head button');
      if (b.getAttribute('aria-expanded') !== 'true') b.click();
    });
  });
  reset.addEventListener('click', function () {
    steps.forEach(function (li) {
      li.setAttribute('data-done', 'false');
      var b = li.querySelector('.parcours__head button');
      b.setAttribute('aria-expanded', 'false');
      li.querySelector('.parcours__detail').hidden = true;
    });
    score();
  });
  region.setAttribute('aria-describedby', 'parcours-titre');
  renderGuichets();
})();
