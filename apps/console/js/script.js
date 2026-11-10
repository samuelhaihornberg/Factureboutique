// Console de facturation KeffStation x KiffTech
(function () {
  'use strict';

  var zone = document.getElementById('consoleZone');
  var puceTexte = document.getElementById('puceTexte');
  var puce = document.getElementById('puceSource');

  function majPuce() {
    var etat = window.KiffTechEngine.etat;
    if (etat.source === 'live') {
      puceTexte.textContent = 'Catalogue en direct · ' + etat.catalogue.length + ' références';
      puce.dataset.etat = 'live';
    } else if (etat.source === 'snapshot') {
      puceTexte.textContent = 'Base de référence locale · ' + etat.catalogue.length + ' références';
      puce.dataset.etat = 'snapshot';
    } else {
      puceTexte.textContent = 'Catalogue indisponible';
      puce.dataset.etat = 'erreur';
    }
  }

  window.KiffTechEngine.init().then(function () {
    window.KiffTechConsole.mount(zone, {});
    majPuce();
    window.KiffTechEngine.onUpdate(majPuce);

    // Liens dynamiques issus de la source
    var src = window.KiffTechEngine.etat.facture.source || {};
    if (src.depot) {
      document.getElementById('lienDepot').href = 'https://github.com/' + src.depot;
      document.getElementById('lienDepot').textContent = '📚 Dépôt ' + src.depot;
    }
    if (src.site) {
      document.getElementById('lienSite').href = src.site;
      document.getElementById('lienSite').textContent = '🌐 ' + src.site.replace(/^https?:\/\//, '');
    }
    if (src.pages) {
      document.getElementById('lienPages').href = src.pages;
    }
  }).catch(function (e) {
    zone.innerHTML = '<div class="erreur">Chargement impossible : ' + (e && e.message ? e.message : e) + '</div>';
  });

  document.getElementById('btnSync').addEventListener('click', function (e) {
    e.preventDefault();
    var etat = window.KiffTechEngine.etat;
    puceTexte.textContent = 'Synchronisation…';
    window.KiffTechEngine.rafraichir().then(function () {
      majPuce();
      var t = new Date();
      etat.evenements.unshift({
        texte: 'synchronisation manuelle · ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'),
        niveau: 'info', heure: t
      });
    });
  });

  document.getElementById('btnExport').addEventListener('click', function () {
    var r = window.KiffTechEngine.etat.rapport;
    if (!r) return;
    var blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rapport-' + r.reference + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });
})();
