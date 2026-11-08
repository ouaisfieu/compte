/* Le Compte — recherche plein texte côté client. */
(function () {
  'use strict';
  var form = document.querySelector('[data-search]');
  var out = document.querySelector('[data-results]');
  var status = document.querySelector('[data-status]');
  var index = window.COMPTE_INDEX || [];
  if (!form || !out) return;
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, ' '); };
  var prepared = index.map(function (e) {
    return { e: e, t: norm(e.t), k: norm(e.k), d: norm(e.d), x: norm(e.x) };
  });
  var ACC = { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]', y: '[yÿ]' };
  function pattern(term) {
    return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[aeiouyc]/g, function (ch) { return ACC[ch]; });
  }
  function highlight(text, terms) {
    var frag = document.createDocumentFragment();
    if (!terms.length) { frag.appendChild(document.createTextNode(text)); return frag; }
    var re = new RegExp('(' + terms.map(pattern).join('|') + ')', 'gi');
    var last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var mk = document.createElement('mark');
      mk.textContent = m[0];
      frag.appendChild(mk);
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }
  function excerpt(entry, terms) {
    var src = entry.e.x || entry.e.d;
    var n = norm(src);
    var pos = -1;
    for (var i = 0; i < terms.length && pos < 0; i++) pos = n.indexOf(terms[i]);
    if (pos < 0 || !entry.e.x) return entry.e.d;
    var start = Math.max(0, pos - 90);
    if (start) { var sp = src.indexOf(' ', start); if (sp > -1 && sp < pos) start = sp + 1; }
    var end = Math.min(src.length, start + 240);
    if (end < src.length) { var ep = src.lastIndexOf(' ', end); if (ep > pos) end = ep; }
    return (start ? '… ' : '') + src.slice(start, end).trim() + (end < src.length ? ' …' : '');
  }
  function run(q) {
    out.textContent = '';
    var terms = norm(q).split(/\s+/).filter(function (w) { return w.length > 1; });
    if (!terms.length) { status.textContent = ''; return; }
    var res = [];
    prepared.forEach(function (p) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var w = terms[i], s = 0;
        if (p.t.indexOf(w) > -1) s += 10;
        if (p.k.indexOf(w) > -1) s += 3;
        if (p.d.indexOf(w) > -1) s += 4;
        if (p.x.indexOf(w) > -1) s += 1 + Math.min(4, p.x.split(w).length - 2);
        if (!s) return;
        score += s;
      }
      res.push({ p: p, score: score });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    status.textContent = res.length ? res.length + ' résultat' + (res.length > 1 ? 's' : '') + ' pour « ' + q + ' »' : 'Aucun résultat pour « ' + q + ' ». Essayez un autre mot, ou parcourez les griefs.';
    res.slice(0, 40).forEach(function (r) {
      var li = document.createElement('li');
      var k = document.createElement('span');
      k.className = 'kicker';
      k.textContent = r.p.e.k;
      var h = document.createElement('h2');
      var a = document.createElement('a');
      a.href = r.p.e.u;
      a.appendChild(highlight(r.p.e.t, terms));
      h.appendChild(a);
      var p = document.createElement('p');
      p.appendChild(highlight(excerpt(r.p, terms), terms));
      li.appendChild(k);
      li.appendChild(h);
      li.appendChild(p);
      out.appendChild(li);
    });
  }
  var input = form.querySelector('input[name="q"]');
  var initial = new URLSearchParams(location.search).get('q') || '';
  input.value = initial;
  run(initial);
  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      run(input.value);
      if (history.replaceState) history.replaceState(null, '', location.pathname + (input.value ? '?q=' + encodeURIComponent(input.value) : ''));
    }, 120);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); });
})();
