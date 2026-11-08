/* Le Compte — filtres de l’inventaire des griefs. */
(function () {
  'use strict';
  var form = document.querySelector('[data-filters]');
  var list = document.querySelector('[data-list]');
  if (!form || !list) return;
  form.hidden = false;
  form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
  var cards = Array.prototype.slice.call(list.querySelectorAll('.card'));
  var count = form.querySelector('[data-count]');
  var empty = document.querySelector('[data-empty]');
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, ' '); };

  function state() {
    return {
      q: form.q.value.trim(),
      theme: form.theme.value,
      level: form.level.value,
      sort: form.sort.value,
      condamne: form.condamne.checked,
      encours: form.encours.checked,
    };
  }
  function apply(push) {
    var s = state();
    var terms = norm(s.q).split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (c) {
      var ok = true;
      if (s.theme && c.dataset.theme !== s.theme) ok = false;
      if (ok && s.level && (' ' + c.dataset.levels + ' ').indexOf(' ' + s.level + ' ') === -1) ok = false;
      if (ok && s.condamne && c.dataset.condamne !== '1') ok = false;
      if (ok && s.encours && c.dataset.status !== 'en-cours') ok = false;
      if (ok && terms.length) {
        var hay = c.dataset.search;
        for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) === -1) { ok = false; break; }
      }
      c.classList.toggle('is-hidden', !ok);
      if (ok) shown++;
    });
    var key = s.sort;
    var sorted = cards.slice().sort(function (a, b) {
      if (key === 'gravite') return b.dataset.gravite - a.dataset.gravite || a.dataset.order - b.dataset.order;
      if (key === 'brol') return b.dataset.brol - a.dataset.brol || a.dataset.order - b.dataset.order;
      if (key === 'alpha') return a.querySelector('h3, h2').textContent.localeCompare(b.querySelector('h3, h2').textContent, 'fr');
      return a.dataset.order - b.dataset.order;
    });
    sorted.forEach(function (c) { list.appendChild(c); });
    count.textContent = shown + (shown > 1 ? ' griefs' : ' grief');
    empty.classList.toggle('is-hidden', shown !== 0);
    if (push !== false && window.history && history.replaceState) {
      var p = new URLSearchParams();
      Object.keys(s).forEach(function (k) {
        if (s[k] === true) p.set(k, '1');
        else if (s[k] && s[k] !== 'order') p.set(k, s[k]);
      });
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }
  }
  // État initial depuis l’URL
  var params = new URLSearchParams(location.search);
  ['q', 'theme', 'level', 'sort'].forEach(function (k) { if (params.get(k) && form[k]) form[k].value = params.get(k); });
  ['condamne', 'encours'].forEach(function (k) { if (params.get(k) === '1') form[k].checked = true; });
  var timer;
  form.addEventListener('input', function (e) {
    clearTimeout(timer);
    timer = setTimeout(apply, e.target.name === 'q' ? 150 : 0);
  });
  form.addEventListener('change', function () { apply(); });
  var reset = document.querySelector('[data-reset]');
  if (reset) reset.addEventListener('click', function () { form.reset(); apply(); });
  apply(false);
})();
