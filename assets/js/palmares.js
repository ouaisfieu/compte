/* Le Compte — palmarès personnel des griefs. */
(function () {
  'use strict';
  var root = document.querySelector('[data-palmares]');
  if (!root || !window.CompteVotes) return;
  var list = root.querySelector('[data-p-list]');
  var items = Array.prototype.slice.call(list.children);
  var order = items.slice().sort(function (a, b) { return a.dataset.order - b.dataset.order; }).map(function (li) { return li.dataset.slug; });
  var summary = root.querySelector('[data-summary]');
  var actions = root.querySelector('[data-p-actions]');
  var sharedNote = root.querySelector('[data-p-shared]');
  var mode = 'user';
  var shared = null;

  // Palmarès partagé via l’URL (#n=5304…)
  var m = /(?:^|&)n=([0-5]+)/.exec(location.hash.slice(1));
  if (m && m[1].length === order.length) {
    shared = {};
    order.forEach(function (slug, k) { var n = Number(m[1][k]); if (n) shared[slug] = n; });
  }
  function votes() { return shared || window.CompteVotes.read(); }

  summary.hidden = false;
  actions.hidden = false;
  items.forEach(function (li) {
    var stars = li.querySelector('.stars');
    stars.hidden = false;
    stars.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (shared) return;
        var v = window.CompteVotes.read();
        var n = Number(b.getAttribute('data-n'));
        if (v[li.dataset.slug] === n) delete v[li.dataset.slug]; else v[li.dataset.slug] = n;
        window.CompteVotes.write(v);
        render();
      });
    });
  });

  function render() {
    var v = votes();
    var rated = 0, sum = 0, diff = 0;
    items.forEach(function (li) {
      var n = v[li.dataset.slug] || 0;
      li.querySelectorAll('.stars button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-n')) === n));
        b.disabled = !!shared;
      });
      if (n) { rated++; sum += n; diff += Math.abs(n - Number(li.dataset.gravite)); }
    });
    var sorted = items.slice().sort(function (a, b) {
      if (mode === 'redac') return b.dataset.gravite - a.dataset.gravite || a.dataset.order - b.dataset.order;
      var na = v[a.dataset.slug] || 0, nb = v[b.dataset.slug] || 0;
      return nb - na || b.dataset.gravite - a.dataset.gravite || a.dataset.order - b.dataset.order;
    });
    sorted.forEach(function (li, k) { li.querySelector('[data-rank]').textContent = k + 1; list.appendChild(li); });
    root.querySelector('[data-s-count]').textContent = rated + '/' + items.length;
    root.querySelector('[data-s-avg]').textContent = rated ? (sum / rated).toFixed(1).replace('.', ',') + '/5' : '—';
    root.querySelector('[data-s-agree]').textContent = rated ? Math.round(100 - (diff / rated / 4) * 100) + ' %' : '—';
    if (shared) {
      sharedNote.hidden = false;
      sharedNote.textContent = 'Vous consultez un palmarès partagé (lecture seule). ';
      var back = document.createElement('a');
      back.href = location.pathname;
      back.textContent = 'Revenir à mes propres notes';
      sharedNote.appendChild(back);
    }
  }

  actions.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-p-sort')) {
      mode = b.getAttribute('data-p-sort');
      actions.querySelectorAll('[data-p-sort]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      render();
    } else if (b.hasAttribute('data-p-share')) {
      var v = votes();
      var code = order.map(function (slug) { return v[slug] || 0; }).join('');
      var url = ((document.querySelector('link[rel="canonical"]') || {}).href || location.href.split('#')[0]) + '#n=' + code;
      if (navigator.share) navigator.share({ title: 'Mon palmarès des griefs', url: url }).catch(function () {});
      else window.compteCopy(url, 'Lien de votre palmarès copié');
    } else if (b.hasAttribute('data-p-reset')) {
      if (shared) { location.href = location.pathname; return; }
      if (window.confirm('Effacer toutes vos notes ?')) { window.CompteVotes.write({}); render(); }
    }
  });
  render();
})();
