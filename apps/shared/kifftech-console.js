/* =====================================================================
   KeffStation × KiffTech — rendu de la console rétro + tampon
   ===================================================================== */
(function (global) {
  'use strict';

  var E = global.KiffTechEngine;
  if (!E) { console.error('[KiffTechConsole] moteur introuvable'); return; }

  var BANNIERE = [
    ' ██╗  ██╗███████╗██████╗ ███████╗████████╗ █████╗ ████████╗██╗ ██████╗ ██╗   ██╗',
    '██║ ██╔╝██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔════╝ ██║   ██║',
    '█████╔╝ ██████╗  ██████╔╝█████╗     ██║   ███████║   ██║   ██║██║██║  ██║   ██║',
    '██╔══██╗██╔══╝  ██╔══██╗██╔══╝     ██║   ██╔══██║   ██║   ██║██║██║  ██║   ██║',
    '██║  ██║███████╗██║  ██║███████╗   ██║   ██║  ██║   ██║   ██║██║╚██████╗╚██████╔╝',
    '╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝ ╚═════╝ ╚═════╝'
  ].join('\n');

  /* --------------------------------------------------------------- tampon */
  function tamponSVG() {
    return '' +
      '<svg viewBox="0 0 240 240" role="img" aria-label="Tampon de certification KeffStation — approuvé">' +
      '<defs>' +
      '<path id="ktArcHaut" d="M 120 120 m -93 0 a 93 93 0 1 1 186 0" fill="none"/>' +
      '<path id="ktArcBas" d="M 120 120 m 93 0 a 93 93 0 1 1 -186 0" fill="none"/>' +
      '</defs>' +
      '<circle class="encre" cx="120" cy="120" r="116"/>' +
      '<circle class="encre-fine" cx="120" cy="120" r="107"/>' +
      '<circle class="disque" cx="120" cy="120" r="74"/>' +
      '<text class="texte-anneau"><textPath href="#ktArcHaut" startOffset="50%" text-anchor="middle">CERTIFICATION KEFFSTATION</textPath></text>' +
      '<text class="texte-anneau"><textPath href="#ktArcBas" startOffset="50%" text-anchor="middle">KEFFTECH · KIFFSTATION.COM</textPath></text>' +
      '<g transform="rotate(-11 120 140)">' +
      '<rect x="26" y="126" width="188" height="28" fill="currentColor" opacity=".95" style="fill:var(--kt-encre)"/>' +
      '<text class="texte-bandeau" x="120" y="146" text-anchor="middle">APPROUVÉ</text>' +
      '</g>' +
      '</svg>';
  }

  function signatureSVG() {
    return '' +
      '<svg viewBox="0 0 260 84" role="img" aria-label="Signature A.g.u.s">' +
      '<path d="M 10 56 C 18 34 26 12 36 9 C 44 7 46 20 41 33 C 36 46 24 56 16 59"/>' +
      '<path d="M 12 42 C 26 37 40 40 48 47"/>' +
      '<path d="M 62 40 C 62 40 58 54 66 56 C 74 58 78 50 74 42 C 71 36 64 40 66 48 C 68 58 78 62 86 56"/>' +
      '<path d="M 98 40 C 96 50 98 58 106 58 C 113 58 116 50 118 42 C 119 36 124 36 124 42 C 124 50 126 58 134 57"/>' +
      '<path d="M 152 44 C 158 38 168 38 168 44 C 168 50 156 50 152 54 C 150 58 160 60 168 56 C 190 56 214 44 236 30"/>' +
      '<path class="flèche" d="M 14 70 C 60 80 150 78 210 58"/>' +
      '<circle cx="54" cy="53" r="2.3" fill="currentColor" style="fill:var(--kt-encre);stroke:none"/>' +
      '<circle cx="90" cy="55" r="2.3" fill="currentColor" style="fill:var(--kt-encre);stroke:none"/>' +
      '<circle cx="139" cy="55" r="2.3" fill="currentColor" style="fill:var(--kt-encre);stroke:none"/>' +
      '</svg>';
  }

  function blocTampon(urlLogo) {
    return '<div class="kt-tampon" aria-hidden="true">' + tamponSVG() +
      '<img class="logo" src="' + urlLogo + '" alt="">' + signatureSVG() + '</div>';
  }

  /* ------------------------------------------------------------- helpers */
  function m(v) { return E.formatMontant(v); }
  function e(v) { return E.escapeHtml(v); }

  function ligneHtml(lbl, val, cls) {
    return '<div class="kt-row ' + (cls || '') + '">' +
      '<span class="kt-lbl">' + e(lbl) + '</span>' +
      '<span class="kt-dots"></span>' +
      '<span class="kt-val">' + val + '</span></div>';
  }

  function heure(d) {
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
  }

  /* -------------------------------------------------------------- rendu */
  function rendreLignes(r) {
    if (!r) return '';
    var s = '<div class="kt-reveal">' +
      ligneHtml('Prix officiels (catalogue)', m(r.totalOfficiel) + ' ' + e(r.symbole)) +
      ligneHtml('Promotions −' + r.remise.remise + ' %', '−' + m(r.promotions) + ' ' + e(r.symbole), 'neg') +
      ligneHtml('Prix de vente facturé', m(r.totalVente) + ' ' + e(r.symbole), 'pos') +
      '</div>';

    s += '<div class="kt-reveal">' + ligneHtml('Décompte du compte', '', 'rule') + '</div>';
    r.decompte.forEach(function (d) {
      var signe = d.signe === '-' ? '−' : '+';
      var cls = d.signe === '-' ? 'neg' : 'pos';
      s += '<div class="kt-reveal">' + ligneHtml(d.libelle, signe + m(d.montant) + ' ' + e(r.symbole), cls + ' sous') + '</div>';
    });

    s += '<hr class="kt-sep kt-reveal">';
    s += '<div class="kt-reveal">' +
      ligneHtml('Total de gain', m(r.totalGain) + ' ' + e(r.symbole), 'pos') +
      '</div>';

    s += '<div class="kt-reveal" style="margin-top:10px">' +
      ligneHtml('Facture ' + r.reference, r.client ? r.client.nom : '', 'dim') +
      ligneHtml('Conversion EUR → ILS', '1 € = ' + m(r.tauxEURILS) + ' ' + e(r.symbole), 'dim') +
      '</div>';
    return s;
  }

  function rendreKpis(r) {
    if (!r) return '';
    var items = [
      { v: r.lignes.length, l: 'Lignes de facture' },
      { v: r.articles, l: 'Articles vendus' },
      { v: '−' + r.remise.remise + ' %', l: 'Taux de remise' },
      { v: m(r.totalVente - r.decompte[0].montant) + ' ' + r.symbole, l: 'Marge brute' }
    ];
    return items.map(function (i) {
      return '<div class="kt-kpi"><div class="v">' + e(i.v) + '</div><div class="l">' + e(i.l) + '</div></div>';
    }).join('');
  }

  function rendreJournal(evenements) {
    return evenements.slice(0, 6).map(function (ev) {
      return '<div class="' + (ev.niveau === 'erreur' ? 'erreur' : '') + '"><span class="h">' + heure(ev.heure) +
        '</span>  ' + e(ev.texte) + '</div>';
    }).join('');
  }

  /* ------------------------------------------------------------- montage */
  function mount(hote, options) {
    options = options || {};
    var racine = document.createElement('div');
    racine.className = 'kt-console' + (options.papier ? ' papier' : '');
    racine.innerHTML =
      '<div class="kt-crt">' +
      '<pre class="kt-banner">' + e(BANNIERE) + '</pre>' +
      '<div class="kt-head">' +
      '<span class="kt-led" data-kt="led"></span>' +
      '<span class="kt-marque">KeffStation</span><span class="kt-sep"> // </span>' +
      '<span>Console facturation · KiffTech</span>' +
      '<span class="kt-droite">' +
      '<span data-kt="source">catalogue —</span>' +
      '<span data-kt="clock">--:--:--</span>' +
      '</span></div>' +
      '<div class="kt-tete">' +
      '<div><div class="kt-tete-lbl">Total de vente</div>' +
      '<div class="kt-tete-sub" data-kt="sub">facturation en temps réel — KeffTech</div></div>' +
      '<div class="kt-montant" data-kt="total">—<span class="kt-devise">₪</span></div>' +
      '</div>' +
      '<div class="kt-lignes" data-kt="lignes"></div>' +
      '<div class="kt-kpis" data-kt="kpis"></div>' +
      '<div class="kt-journal" data-kt="journal"></div>' +
      '</div>' +
      blocTampon(options.logo || E.base('../../assets/logo-kiffstation.png'));

    hote.innerHTML = '';
    hote.appendChild(racine);

    var q = function (n) { return racine.querySelector('[data-kt="' + n + '"]'); };

    function maj() {
      var etat = E.etat;
      var r = etat.rapport;
      var led = q('led');
      led.className = 'kt-led' + (etat.source === 'live' ? '' : etat.source === 'erreur' ? ' err' : ' wait');

      var src = q('source');
      src.textContent = 'catalogue ' + (etat.source === 'live' ? 'live' : etat.source === 'snapshot' ? 'local' : 'indispo.');

      if (r) {
        q('total').innerHTML = m(r.totalVente) + '<span class="kt-devise">' + e(r.symbole) + '</span>';
        q('sub').textContent = 'facture ' + r.reference + ' · ' + r.lignes.length + ' lignes · ' +
          r.articles + ' articles · remise −' + r.remise.remise + ' % · ' + r.remise.raison;
        q('lignes').innerHTML = rendreLignes(r);
        q('kpis').innerHTML = rendreKpis(r);
      }
      q('journal').innerHTML = rendreJournal(etat.evenements);

      var rv = racine.querySelectorAll('.kt-reveal');
      for (var i = 0; i < rv.length; i++) {
        (function (el, idx) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(3px)';
          el.style.transition = 'opacity .22s ease, transform .22s ease';
          setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'none'; }, 40 + idx * 38);
        })(rv[i], i);
      }
    }

    function horloge() {
      q('clock').textContent = heure(new Date());
    }

    maj();
    horloge();
    setInterval(horloge, 1000);
    E.onUpdate(maj);
    setInterval(function () { E.rafraichir(); }, 90000);

    return racine;
  }

  /* ------------------------------------------------------ vignette vitrine */
  function mountKpi(hote, options) {
    options = options || {};
    function maj() {
      var r = E.etat.rapport;
      if (!r) return;
      hote.innerHTML =
        '<div class="kt-kpi-valeur">' + m(r.totalVente) + ' ' + e(r.symbole) + '</div>' +
        '<div class="kt-kpi-libelle">Total de vente KiffTech</div>';
    }
    maj();
    E.onUpdate(maj);
    return hote;
  }

  global.KiffTechConsole = {
    mount: mount,
    mountKpi: mountKpi,
    banniere: BANNIERE
  };
})(window);
