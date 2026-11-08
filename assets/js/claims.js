/* Le Compte — vrai ou faux : pronostic avant verdict. */
(function () {
  'use strict';
  var cards = Array.prototype.slice.call(document.querySelectorAll('.claim'));
  var scoreEl = document.querySelector('[data-claims-score]');
  if (!cards.length) return;
  var played = 0, right = 0;
  function update() {
    if (!played) return;
    scoreEl.hidden = false;
    scoreEl.textContent = 'Votre flair : ' + right + ' bon' + (right > 1 ? 's' : '') + ' pronostic' + (right > 1 ? 's' : '') + ' sur ' + played + '.';
  }
  cards.forEach(function (card) {
    var guess = card.querySelector('[data-guess]');
    var details = card.querySelector('[data-reveal]');
    var you = card.querySelector('[data-you]');
    var rating = Number(card.getAttribute('data-rating'));
    guess.hidden = false;
    guess.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-g]');
      if (!b || guess.dataset.done) return;
      guess.dataset.done = '1';
      var g = b.getAttribute('data-g');
      guess.querySelectorAll('button').forEach(function (x) { x.disabled = true; x.setAttribute('aria-pressed', String(x === b)); });
      var ok = (g === 'vrai' && rating >= 4) || (g === 'faux' && rating <= 2);
      var msg;
      if (rating === 3) { msg = 'Ni l’un ni l’autre : c’est nuancé.'; right += 0.5; }
      else { msg = ok ? 'Bien vu.' : 'Raté.'; if (ok) right++; }
      played++;
      you.textContent = 'Votre pronostic : ' + (g === 'vrai' ? 'plutôt vrai' : 'plutôt faux') + '. ' + msg;
      details.open = true;
      update();
    });
  });
})();
