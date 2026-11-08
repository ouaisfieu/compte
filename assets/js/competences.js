/* Le Compte — outil « Qui est compétent ? ». */
(function () {
  'use strict';
  var dataEl = document.getElementById('competences-data');
  var select = document.getElementById('c-select');
  var out = document.querySelector('[data-c-result]');
  if (!dataEl || !select || !out) return;
  var data = JSON.parse(dataEl.textContent);
  var levels = data.levels;
  var byId = {};
  data.items.forEach(function (c) { byId[c.id] = c; });

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function render(id) {
    var c = byId[id];
    if (!c) return;
    out.textContent = '';
    out.appendChild(el('h2', null, c.label));
    var bm = el('div', 'brolometre');
    var lab = el('span', 'sans');
    lab.appendChild(el('strong', null, 'Indice de brol'));
    bm.appendChild(lab);
    var track = el('span', 'brolometre__track');
    track.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 7; i++) track.appendChild(el('i', i < c.roles.length ? 'on' : ''));
    bm.appendChild(track);
    bm.appendChild(el('span', null, c.roles.length + (c.roles.length > 1 ? ' niveaux' : ' niveau') + ' de pouvoir sur 7'));
    out.appendChild(bm);
    var ul = el('ul', 'level-rows');
    c.roles
      .slice()
      .sort(function (a, b) { return levels[a[0]].order - levels[b[0]].order; })
      .forEach(function (r) {
        var li = el('li');
        li.appendChild(el('span', 'lvl', levels[r[0]].label));
        li.appendChild(el('span', null, r[1]));
        ul.appendChild(li);
      });
    out.appendChild(ul);
    out.appendChild(el('p', 'note', c.note));
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
  select.addEventListener('change', function () { render(select.value); });
  var rnd = document.querySelector('[data-random]');
  if (rnd) {
    rnd.hidden = false;
    rnd.addEventListener('click', function () {
      var ids = Object.keys(byId).filter(function (k) { return k !== select.value; });
      select.value = ids[Math.floor(Math.random() * ids.length)];
      render(select.value);
    });
  }
  document.querySelectorAll('[data-pick]').forEach(function (b) {
    b.addEventListener('click', function () {
      select.value = b.getAttribute('data-pick');
      render(select.value);
      out.scrollIntoView({ behavior: 'smooth', block: 'center' });
      select.focus({ preventScroll: true });
    });
  });
  var h = location.hash.slice(1);
  if (byId[h]) { select.value = h; render(h); }
})();
