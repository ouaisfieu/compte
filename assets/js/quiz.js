/* Le Compte — quiz « Citoyen ou brol ? ». */
(function () {
  'use strict';
  var root = document.querySelector('[data-quiz]');
  var dataEl = document.getElementById('quiz-data');
  if (!root || !dataEl) return;
  var Q = JSON.parse(dataEl.textContent);
  var i = 0, score = 0, answers = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(href, text) { var a = el('a', null, text); a.href = href + '.html'; return a; }

  function question(noFocus) {
    var q = Q[i];
    root.textContent = '';
    var prog = el('div', 'quiz__progress');
    prog.setAttribute('role', 'progressbar');
    prog.setAttribute('aria-valuemin', '0');
    prog.setAttribute('aria-valuemax', String(Q.length));
    prog.setAttribute('aria-valuenow', String(i));
    prog.setAttribute('aria-label', 'Progression du quiz');
    var fill = el('span');
    fill.style.width = (i / Q.length) * 100 + '%';
    prog.appendChild(fill);
    root.appendChild(prog);
    root.appendChild(el('p', 'quiz__count', 'Question ' + (i + 1) + ' sur ' + Q.length + ' · score : ' + score));
    var h = el('h2', 'quiz__q', q.q);
    h.tabIndex = -1;
    root.appendChild(h);
    var ul = el('ul', 'quiz__choices');
    var buttons = [];
    q.choices.forEach(function (c, j) {
      var li = el('li');
      var b = el('button');
      b.type = 'button';
      b.appendChild(el('span', null, c));
      var mark = el('span', 'sans');
      mark.setAttribute('aria-hidden', 'true');
      b.appendChild(mark);
      b.addEventListener('click', function () { answer(j, buttons, mark); });
      buttons.push(b);
      li.appendChild(b);
      ul.appendChild(li);
    });
    root.appendChild(ul);
    if (!noFocus) h.focus();
  }

  function answer(j, buttons, mark) {
    var q = Q[i];
    var ok = j === q.answer;
    if (ok) score++;
    answers.push({ ok: ok, given: q.choices[j] });
    buttons.forEach(function (b, k) {
      b.disabled = true;
      if (k === q.answer) { b.setAttribute('data-state', 'right'); b.lastChild.textContent = '✓ bonne réponse'; }
      else if (k === j) { b.setAttribute('data-state', 'wrong'); b.lastChild.textContent = '✗'; }
    });
    var fb = el('div', 'quiz__feedback');
    fb.setAttribute('role', 'status');
    fb.appendChild(el('strong', null, ok ? 'Bien vu !' : 'Raté : la réponse était « ' + q.choices[q.answer] + ' ».'));
    var p = el('p', null, q.expl + ' ');
    p.style.margin = '0';
    p.appendChild(link(q.link, 'En savoir plus'));
    fb.appendChild(p);
    root.appendChild(fb);
    var next = el('button', 'btn btn--solid', i < Q.length - 1 ? 'Question suivante' : 'Voir mon résultat');
    next.type = 'button';
    next.addEventListener('click', function () { i++; if (i < Q.length) question(); else result(); });
    root.appendChild(next);
    next.focus();
  }

  function verdict(s) {
    var r = s / Q.length;
    if (r >= 0.9) return ['Citoyen modèle', 'Vous pourriez expliquer la lasagne institutionnelle à un formateur royal.'];
    if (r >= 0.65) return ['Belge averti', 'Vous vous y retrouvez dans le brol — mieux que la plupart.'];
    if (r >= 0.4) return ['Citoyen en formation', 'Comme le gouvernement : ça prend du temps, mais ça avance.'];
    return ['Grand brol', 'Rassurez-vous : la Belgique non plus ne s’y retrouve pas toujours.'];
  }

  function result() {
    root.textContent = '';
    var v = verdict(score);
    var box = el('div', 'quiz__result');
    var h = el('h2', null, v[0]);
    h.tabIndex = -1;
    box.appendChild(el('p', 'big', score + '/' + Q.length));
    box.appendChild(h);
    box.appendChild(el('p', 'dek', v[1]));
    var best = Number((window.CompteStore && window.CompteStore.get('compte:quiz-best')) || 0);
    if (score > best && window.CompteStore) window.CompteStore.set('compte:quiz-best', String(score));
    box.appendChild(el('p', 'sans', 'Votre meilleur score : ' + Math.max(best, score) + '/' + Q.length + ' (enregistré dans ce navigateur).'));
    var actions = el('div', 'actions');
    var share = el('button', 'btn btn--solid', 'Partager mon score');
    share.type = 'button';
    var text = 'J’ai obtenu ' + score + '/' + Q.length + ' au quiz « Citoyen ou brol ? » du Compte : ' + v[0] + '. Et vous ?';
    var url = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
    share.addEventListener('click', function () {
      if (navigator.share) navigator.share({ title: 'Citoyen ou brol ?', text: text, url: url }).catch(function () {});
      else window.compteCopy(text + ' ' + url, 'Score copié');
    });
    var again = el('button', 'btn', 'Recommencer');
    again.type = 'button';
    again.addEventListener('click', function () { i = 0; score = 0; answers = []; question(); });
    actions.appendChild(share);
    actions.appendChild(again);
    box.appendChild(actions);
    var recap = el('ol', 'recap');
    Q.forEach(function (q, k) {
      var li = el('li', null, (answers[k].ok ? '✓ ' : '✗ ') + q.q + ' — ' + q.choices[q.answer] + '. ');
      li.appendChild(link(q.link, 'Le dossier'));
      recap.appendChild(li);
    });
    box.appendChild(el('h3', null, 'Récapitulatif'));
    box.appendChild(recap);
    root.appendChild(box);
    h.focus();
  }

  question(true);
})();
