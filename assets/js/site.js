/* Le Compte — comportements communs (thème, partage, citation, progression, votes). */
(function () {
  'use strict';
  var doc = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } },
  };
  window.CompteStore = store;

  // ——— Thème clair / sombre ———
  var toggle = document.querySelector('[data-theme-toggle]');
  var label = document.querySelector('[data-theme-label]');
  function current() {
    return doc.getAttribute('data-theme') || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function paint() {
    var c = current();
    if (label) label.textContent = c === 'dark' ? 'Thème clair' : 'Thème sombre';
    if (toggle) toggle.setAttribute('aria-pressed', c === 'dark' ? 'true' : 'false');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      doc.setAttribute('data-theme', next);
      store.set('compte:theme', next);
      paint();
    });
  }
  paint();

  // ——— Onglet actif visible dans la navigation défilante (mobile) ———
  var navList = document.querySelector('.nav ul');
  var activeTab = navList && navList.querySelector('[aria-current="page"]');
  if (navList && activeTab && navList.scrollWidth > navList.clientWidth) {
    navList.scrollLeft = Math.max(0, activeTab.parentElement.offsetLeft - (navList.clientWidth - activeTab.offsetWidth) / 2);
  }

  // ——— Toast ———
  var toastTimer;
  window.compteToast = function (msg) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  };
  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { window.compteToast(okMsg || 'Copié'); }, fallback);
    }
    fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); window.compteToast(okMsg || 'Copié'); } catch (e) { window.compteToast('Copie impossible'); }
      document.body.removeChild(ta);
    }
  }
  window.compteCopy = copyText;

  // ——— Partager, copier, citer, imprimer ———
  document.querySelectorAll('[data-actions]').forEach(function (box) {
    box.hidden = false;
    var canonical = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
    var title = document.title;
    var share = box.querySelector('[data-share]');
    if (share) {
      if (!navigator.share) share.hidden = true;
      share.addEventListener('click', function () {
        navigator.share({ title: title, url: canonical }).catch(function () {});
      });
    }
    var cp = box.querySelector('[data-copy-link]');
    if (cp) cp.addEventListener('click', function () { copyText(canonical, 'Lien copié'); });
    var pr = box.querySelector('[data-print]');
    if (pr) pr.addEventListener('click', function () { window.print(); });
    var cite = box.querySelector('[data-cite]');
    if (cite) cite.addEventListener('click', function () { openCite(cite.getAttribute('data-title'), cite.getAttribute('data-url')); });
  });

  function openCite(t, url) {
    var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var now = new Date();
    var today = now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    var formats = [
      ['Presse', '« ' + t + ' », Le Compte, 8 novembre 2026. ' + url],
      ['APA', 'ouaisfieu. (2026, 8 novembre). ' + t + '. Le Compte. ' + url],
      ['MLA', 'ouaisfieu. « ' + t + ' ». Le Compte, 8 nov. 2026, ' + url + '. Consulté le ' + today + '.'],
    ];
    var dlg = document.createElement('dialog');
    dlg.className = 'cite';
    dlg.setAttribute('aria-labelledby', 'cite-t');
    var h = document.createElement('h2');
    h.id = 'cite-t';
    h.textContent = 'Citer cet article';
    dlg.appendChild(h);
    formats.forEach(function (f) {
      var p = document.createElement('p');
      p.className = 'sans';
      p.style.margin = '0.75rem 0 0.25rem';
      p.style.fontWeight = '700';
      p.textContent = f[0];
      var pre = document.createElement('pre');
      pre.textContent = f[1];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--small';
      b.textContent = 'Copier';
      b.addEventListener('click', function () { copyText(f[1], 'Référence copiée'); });
      dlg.appendChild(p);
      dlg.appendChild(pre);
      dlg.appendChild(b);
    });
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn btn--solid';
    close.style.marginTop = '1rem';
    close.style.display = 'flex';
    close.textContent = 'Fermer';
    close.addEventListener('click', function () { dlg.close(); });
    dlg.appendChild(close);
    dlg.addEventListener('close', function () { dlg.remove(); });
    document.body.appendChild(dlg);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  // ——— Barre de progression de lecture ———
  var bar = document.querySelector('.progress');
  var art = document.querySelector('.article__body, .longread__body');
  if (bar && art) {
    var ticking = false;
    var update = function () {
      var r = art.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var done = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      bar.style.width = (done * 100).toFixed(1) + '%';
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // ——— Votes (notes personnelles des griefs) ———
  function readVotes() {
    try { return JSON.parse(store.get('compte:votes') || '{}') || {}; } catch (e) { return {}; }
  }
  window.CompteVotes = {
    read: readVotes,
    write: function (v) { store.set('compte:votes', JSON.stringify(v)); },
  };
  document.querySelectorAll('[data-vote]').forEach(function (box) {
    var slug = box.getAttribute('data-vote');
    var out = box.querySelector('.vote__out');
    var buttons = box.querySelectorAll('button[data-n]');
    box.hidden = false;
    function render() {
      var n = readVotes()[slug] || 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-n')) === n)); });
      out.textContent = n ? 'Votre note : ' + n + '/5. Elle figure dans votre palmarès.' : '';
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = readVotes();
        var n = Number(b.getAttribute('data-n'));
        if (v[slug] === n) delete v[slug]; else v[slug] = n;
        window.CompteVotes.write(v);
        render();
      });
    });
    render();
  });
})();
