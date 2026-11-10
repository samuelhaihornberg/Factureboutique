/* =====================================================================
   KeffStation × KiffTech — moteur de facturation & statistiques
   ---------------------------------------------------------------------
   · Source catalogue : dépôt GitHub samuelhaihornberg/keffstation
   · Règles tarifaires : identiques à kifftech/app.v2.js (calcKiffTechPrice)
       prix officiels −20 % de base, +1 % par article en caisse
       (jusqu'à +7 %), plafond 27 %
   · Montants affichés en shekels (₪), conversion EUR → ILS déclarée
   ===================================================================== */
(function (global) {
  'use strict';

  /* URL de base = dossier du script (apps/shared/) */
  var SCRIPT_URL = (document.currentScript && document.currentScript.src) || '';
  var BASE = SCRIPT_URL ? SCRIPT_URL.replace(/[^\/]*$/, '') : '';

  /* Extraction des produits depuis kifftech/app.v2.js (mêmes clés que le dépôt) */
  var RE_PRODUIT = /\{id:'([^']+)'[^{}]*?brand:'([^']*)',model:'([^']*)',year:(\d+)(?:,category:'([^']*)')?[^{}]*?price:\{official:(\d+)\}/g;

  /* Copie de secours : sert quand le JSON n'est pas accessible (ouverture file://) */
  var FACTURE_SECOURS = {
    reference: 'F-KT-2026-0142', date: '2026-11-10',
    devise: 'ILS', symbole: '₪', tauxEURILS: 3.9266,
    remiseBase: 20, bonusCaisseParArticle: 1, bonusCaisseMax: 7, plafondRemise: 27,
    tauxGros: 0.6, tauxParts: 0.09, tauxInteret: 0.024,
    source: {
      depot: 'samuelhaihornberg/keffstation', branche: 'main',
      catalogue: 'https://raw.githubusercontent.com/samuelhaihornberg/keffstation/main/kifftech/app.v2.js',
      site: 'https://kiffstation.com', pages: 'https://samuelhaihornberg.github.io/keffstation/'
    },
    lignes: [{ id: 'pi-zero-2-w', qte: 2 }, { id: 'arduino-uno-r4', qte: 1 }, { id: 'ac66', qte: 1 }]
  };

  /* ---------------------------------------------------------------- utils */
  function r2(v) { return Math.round((Number(v) + Number.EPSILON) * 100) / 100; }

  function formatMontant(v, decimales) {
    var n = Number(v) || 0;
    var s = n.toFixed(decimales === undefined ? 2 : decimales);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join(',');
  }

  function formatEntier(v) {
    return String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + url);
      return r.json();
    });
  }

  /* ------------------------------------------------------- lecture catalogue */
  function parseCatalogueJS(texte) {
    var out = [], m;
    RE_PRODUIT.lastIndex = 0;
    while ((m = RE_PRODUIT.exec(texte)) !== null) {
      out.push({
        id: m[1], marque: m[2], modele: m[3],
        annee: parseInt(m[4], 10), rayon: m[5] || '',
        prixOfficiel: parseInt(m[6], 10)
      });
    }
    return out;
  }

  /* --------------------------------------------------------- calcul de prix */
  function calcRemise(nbArticles, cfg) {
    var bonus = Math.min(Math.max(0, nbArticles || 0), cfg.bonusCaisseMax);
    var remise = Math.min(cfg.remiseBase + bonus * cfg.bonusCaisseParArticle, cfg.plafondRemise);
    var raison = 'Prix officiels −' + cfg.remiseBase + ' %'
      + (bonus > 0 ? ' + ' + bonus + ' % caisse (' + remise + ' % total)' : '');
    return { remise: remise, bonus: bonus, raison: raison };
  }

  /* ---------------------------------------------------------- computation */
  function compute(facture, catalogue) {
    var index = {};
    (catalogue || []).forEach(function (p) { index[p.id] = p; });

    var articles = facture.lignes.reduce(function (s, l) { return s + (Number(l.qte) || 0); }, 0);
    var r = calcRemise(articles, facture);
    var taux = Number(facture.tauxEURILS) || 1;

    var lignes = facture.lignes.map(function (l) {
      var p = index[l.id];
      if (!p) return null;
      var qte = Number(l.qte) || 0;
      var officielEUR = p.prixOfficiel;
      var venteEUR = Math.round(officielEUR * (100 - r.remise) / 100);
      var officielILS = r2(officielEUR * taux);
      var venteILS = r2(venteEUR * taux);
      return {
        id: p.id, marque: p.marque, modele: p.modele, annee: p.annee, rayon: p.rayon,
        qte: qte, remise: r.remise,
        prixOfficielEUR: officielEUR,
        prixVenteEUR: venteEUR,
        prixOfficiel: r2(officielILS * qte),
        prixVente: r2(venteILS * qte),
        economie: r2((officielILS - venteILS) * qte)
      };
    }).filter(Boolean);

    var totalOfficiel = r2(lignes.reduce(function (s, l) { return s + l.prixOfficiel; }, 0));
    var totalVente = r2(lignes.reduce(function (s, l) { return s + l.prixVente; }, 0));
    var promotions = r2(totalOfficiel - totalVente);

    var gros = r2(totalVente * facture.tauxGros);
    var parts = r2(totalVente * facture.tauxParts);
    var interet = r2(totalVente * facture.tauxInteret);
    var marge = r2(totalVente - gros - parts - interet);

    return {
      reference: facture.reference,
      date: facture.date,
      client: facture.client,
      devise: facture.devise || 'ILS',
      symbole: facture.symbole || '₪',
      tauxEURILS: taux,
      source: facture.source || {},
      remise: r,
      articles: articles,
      lignes: lignes,
      totalOfficiel: totalOfficiel,
      promotions: promotions,
      totalVente: totalVente,
      totalGain: r2(gros + parts + interet + marge),
      decompte: [
        { cle: 'gros', libelle: 'Prix de gros (déduction fournisseur)', montant: gros, signe: '-' },
        { cle: 'parts', libelle: 'Parts KeffStation (commission)', montant: parts, signe: '+' },
        { cle: 'interet', libelle: 'Intérêt / frais de paiement', montant: interet, signe: '+' },
        { cle: 'marge', libelle: 'Marge nette revendeur', montant: marge, signe: '+' }
      ]
    };
  }

  /* ------------------------------------------------------------- moteur */
  var etat = {
    pret: false,
    source: '—',
    catalogue: [],
    facture: null,
    rapport: null,
    synchroniseLe: null,
    erreur: null,
    evenements: []
  };

  var abonnes = [];

  function notifier() {
    abonnes.forEach(function (fn) { try { fn(etat); } catch (e) { console.error(e); } });
  }

  function journaliser(texte, niveau) {
    etat.evenements.unshift({ texte: texte, niveau: niveau || 'info', heure: new Date() });
    if (etat.evenements.length > 40) etat.evenements.length = 40;
  }

  function base(relatif) { return BASE + relatif; }

  function chargerFacture() {
    return getJSON(base('../../data/kifftech-ventes.json'))
      .catch(function () { return FACTURE_SECOURS; });
  }

  function chargerCatalogue(facture) {
    var url = (facture.source && facture.source.catalogue) || '';
    var distant = url ? fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (t) {
      var produits = parseCatalogueJS(t);
      if (!produits.length) throw new Error('catalogue vide');
      return produits;
    }) : Promise.reject(new Error('aucune URL catalogue'));

    return distant.then(function (produits) {
      etat.source = 'live';
      journaliser('catalogue kefftech synchronisé · ' + produits.length + ' références');
      return produits;
    }).catch(function (e) {
      return getJSON(base('../../data/kifftech-catalogue.json')).then(function (snap) {
        etat.source = 'snapshot';
        journaliser('catalogue local chargé · ' + (snap.produits || []).length + ' références');
        return snap.produits || [];
      }).catch(function (e2) {
        etat.source = 'erreur';
        etat.erreur = String(e2.message || e2);
        journaliser('catalogue indisponible', 'erreur');
        return [];
      });
    });
  }

  function recalculer() {
    if (!etat.facture) return;
    etat.rapport = compute(etat.facture, etat.catalogue);
    etat.synchroniseLe = new Date();
    notifier();
  }

  var initEnCours = null;

  function init() {
    if (etat.pret) return Promise.resolve(etat);
    if (initEnCours) return initEnCours;
    initEnCours = chargerFacture().then(function (f) {
      etat.facture = f;
      return chargerCatalogue(f);
    }).then(function (c) {
      etat.catalogue = c;
      etat.pret = true;
      recalculer();
      return etat;
    });
    return initEnCours;
  }

  function rafraichir() {
    if (!etat.facture) return Promise.resolve(etat);
    return chargerCatalogue(etat.facture).then(function (c) {
      etat.catalogue = c;
      recalculer();
      return etat;
    });
  }

  global.KiffTechEngine = {
    init: init,
    rafraichir: rafraichir,
    etat: etat,
    onUpdate: function (fn) { abonnes.push(fn); return fn; },
    formatMontant: formatMontant,
    formatEntier: formatEntier,
    escapeHtml: escapeHtml,
    base: base
  };
})(window);
