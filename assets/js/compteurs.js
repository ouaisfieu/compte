/* Le Compte — compteurs en temps réel. */
(function () {
  'use strict';
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-counter]'));
  if (!nodes.length) return;
  var DAY = 86400000;
  var fmt = function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var utc = function (iso) { var p = iso.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counters = nodes.map(function (n) {
    return { cfg: JSON.parse(n.getAttribute('data-counter')), out: n.querySelector('[data-value]') };
  });
  function todayUTC() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
  function value(c, now) {
    switch (c.type) {
      case 'debt': return fmt(c.base + (c.perYear * (now - utc(c.baseDate))) / (365 * DAY));
      case 'since': return fmt((todayUTC() - utc(c.from)) / DAY);
      case 'since-years': {
        var d = (todayUTC() - utc(c.from)) / DAY;
        var y = Math.floor(d / 365.25);
        return y + ' ans et ' + fmt(Math.floor(d - y * 365.25)) + ' jours';
      }
      case 'until': return fmt(Math.max(0, (utc(c.to) - todayUTC()) / DAY));
      case 'deadline': {
        var r = (utc(c.to) - todayUTC()) / DAY;
        return r > 0 ? 'J−' + r : r === 0 ? 'Aujourd’hui' : 'Échue';
      }
      case 'fixed': return fmt(c.value);
      default: return '';
    }
  }
  function tick() {
    var now = Date.now();
    counters.forEach(function (c) { var v = value(c.cfg, now); if (c.out.textContent !== v) c.out.textContent = v; });
  }
  tick();
  setInterval(tick, reduce ? 1000 : 100);
})();
