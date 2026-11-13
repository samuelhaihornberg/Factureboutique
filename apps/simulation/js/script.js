// Simulation de facture KeffStation × kifftech.store
// Relevé de ventes généré aléatoirement : 8 clients aux caisses remplies,
// 2 clients avec abonnement KeffStation. Les prix sont tirés au hasard puis
// mis à l'échelle pour que la marge KeffStation tombe sur 1 012,00 ₪.

(() => {
  'use strict';

  const DATE_FACTURE = '2026-11-13';
  const PERIODE = ['2026-11-01', '2026-11-13'];
  const BENEFICE_CIBLE = 101200;   // centimes : marge KeffStation visée
  const TAUX_MARGE = 0.25;         // marge KeffStation sur le total des ventes
  const TAUX_COMMISSION = 0.01;    // commission kifftech.store
  const PRIX_ABONNEMENT = 24900;   // centimes
  const NB_CLIENTS = 8;
  const NB_ABONNES = 2;
  const LIBELLE_ABONNEMENT = 'Abonnement KeffStation Premium – mensuel';

  const CATALOGUE = [
    { nom: 'Chargeur USB-C GaN 65 W', prix: 4900 },
    { nom: 'Chargeur sans fil 15 W', prix: 2900 },
    { nom: 'Chargeur voiture allume-cigare', prix: 1900 },
    { nom: 'Power bank 20 000 mAh', prix: 11900 },
    { nom: 'Power bank 10 000 mAh', prix: 6900 },
    { nom: 'Câble USB-C tressé 2 m', prix: 3100 },
    { nom: 'Câble USB-C tressé 3 m', prix: 3900 },
    { nom: 'Écouteurs sans fil ANC', prix: 12900 },
    { nom: 'Écouteurs sport Bluetooth', prix: 7900 },
    { nom: 'Souris sans fil ergonomique', prix: 8900 },
    { nom: 'Clavier mécanique compact', prix: 9900 },
    { nom: 'Support magnétique voiture', prix: 3900 },
    { nom: 'Support écran portable', prix: 4900 },
    { nom: 'Webcam HD 1080p', prix: 5900 },
    { nom: 'Hub USB-C 7 ports', prix: 6900 },
    { nom: 'Enceinte Bluetooth portable', prix: 5900 },
    { nom: 'Bracelet connecté fitness', prix: 8900 },
    { nom: 'Lampe de bureau à LED', prix: 3900 },
    { nom: 'Mini-projecteur portable', prix: 14900 }
  ];

  const formatNombre = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const montant = (centimes) => formatNombre.format(centimes / 100) + '\u00a0₪';
  const formatDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatJour = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  const tirage = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const choisir = (liste) => liste[tirage(0, liste.length - 1)];
  const byId = (id) => document.getElementById(id);

  function dateAleatoire() {
    return '2026-11-' + String(tirage(1, 13)).padStart(2, '0');
  }

  function prixAleatoire(base) {
    const ecarts = [-1000, -500, 0, 1000, 2000];
    return Math.max(500, base + choisir(ecarts));
  }

  // 8 clients, 2 d'entre eux avec abonnement
  function genererClients() {
    const abonnes = [];
    while (abonnes.length < NB_ABONNES) {
      const n = tirage(1, NB_CLIENTS);
      if (!abonnes.includes(n)) abonnes.push(n);
    }

    const clients = [];
    for (let i = 1; i <= NB_CLIENTS; i++) {
      const produits = [];
      const nbArticles = tirage(2, 5);
      while (produits.length < nbArticles) {
        const p = choisir(CATALOGUE);
        if (produits.some((x) => x.article === p.nom)) continue;
        produits.push({ article: p.nom, qte: tirage(1, 3), prix: prixAleatoire(p.prix), date: dateAleatoire() });
      }
      if (abonnes.includes(i)) {
        produits.unshift({ article: LIBELLE_ABONNEMENT, qte: 1, prix: PRIX_ABONNEMENT, date: '2026-11-01', abonnement: true });
      }
      clients.push({ nom: 'Client ' + i, lignes: produits });
    }
    return clients;
  }

  // Met les prix à l'échelle pour atteindre exactement la cible de ventes
  // (en centimes), puis absorbe l'écart résiduel.
  function mettreALEchelle(clients) {
    const produits = [];
    const abonnements = [];
    clients.forEach((c) => c.lignes.forEach((l) => (l.abonnement ? abonnements : produits).push(l)));

    const sousTotal = produits.reduce((s, l) => s + l.prix * l.qte, 0);
    const totalAbonnements = abonnements.reduce((s, l) => s + l.prix * l.qte, 0);
    const cible = Math.round(BENEFICE_CIBLE / TAUX_MARGE) - totalAbonnements;
    if (sousTotal <= 0) return;

    const k = cible / sousTotal;
    produits.forEach((l) => { l.prix = Math.round(l.prix * k); });

    let ecart = cible - produits.reduce((s, l) => s + l.prix * l.qte, 0);
    for (const l of produits.slice().sort((a, b) => a.qte - b.qte)) {
      if (ecart === 0) break;
      const delta = Math.trunc(ecart / l.qte);
      if (delta === 0) continue;
      l.prix += delta;
      ecart -= delta * l.qte;
    }
    // Filet de sécurité : le reliquat porterait sur l'abonnement.
    if (ecart !== 0 && abonnements.length) abonnements[0].prix += ecart;
  }

  function calculer(clients) {
    let ventes = 0;
    let articles = 0;
    clients.forEach((c) => c.lignes.forEach((l) => {
      ventes += l.prix * l.qte;
      articles += l.qte;
    }));
    const benefice = Math.round(ventes * TAUX_MARGE);
    const commission = Math.round(ventes * TAUX_COMMISSION);
    return { ventes, articles, benefice, commission, total: ventes + benefice + commission };
  }

  function numeroAleatoire() {
    return 'F-KT-2026-0' + tirage(100, 199);
  }

  function rendre() {
    const clients = genererClients();
    mettreALEchelle(clients);
    const t = calculer(clients);
    const nbAbonnes = clients.filter((c) => c.lignes.some((l) => l.abonnement)).length;

    byId('numero').textContent = numeroAleatoire();
    byId('date').textContent = formatDate(DATE_FACTURE);
    byId('periode').textContent = formatDate(PERIODE[0]) + ' – ' + formatDate(PERIODE[1]);
    byId('facture-detail').textContent = t.articles + ' articles · ' + NB_CLIENTS + ' clients, dont ' + nbAbonnes + ' abonnements';

    byId('caisses').innerHTML = clients.map((c) => {
      const total = c.lignes.reduce((s, l) => s + l.prix * l.qte, 0);
      const articles = c.lignes.reduce((s, l) => s + l.qte, 0);
      const abonne = c.lignes.some((l) => l.abonnement);
      const lignes = c.lignes.map((l) => `
        <div class="ligne">
          <span class="caisse-item"><span class="caisse-date">${formatJour(l.date)}</span>${l.article}${l.qte > 1 ? ' ×' + l.qte : ''}</span>
          <span class="pointilles"></span>
          <span class="val">${montant(l.prix * l.qte)}</span>
        </div>`).join('');
      return `
        <article class="caisse">
          <header class="caisse-tete">
            <span class="caisse-nom">${c.nom}</span>
            ${abonne ? '<span class="caisse-tag">Abonnement</span>' : ''}
          </header>
          <div class="caisse-lignes">${lignes}</div>
          <div class="ligne caisse-total">
            <span>${articles} article${articles > 1 ? 's' : ''}</span>
            <span class="pointilles"></span>
            <span class="val">${montant(total)}</span>
          </div>
        </article>`;
    }).join('');

    byId('recap-detail').textContent = '(' + NB_CLIENTS + ' clients · ' + t.articles + ' articles)';
    byId('recap-ventes').textContent = montant(t.ventes);
    byId('recap-benefice').textContent = montant(t.benefice);
    byId('recap-commission').textContent = montant(t.commission);
    byId('recap-total').textContent = montant(t.total);
  }

  function init() {
    rendre();
    byId('btnRegenerer').addEventListener('click', rendre);
    byId('btnImprimer').addEventListener('click', () => window.print());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
