// Simulation de facture KeffStation × kifftech.store - données fictives, calculs en centimes

(() => {
  const FACTURE = {
    numero: 'F-KT-2026-0113',
    date: '2026-11-13',
    periode: ['2026-11-01', '2026-11-13'],
    ventes: [
      { date: '2026-11-02', article: 'Écouteurs sans fil ANC', qte: 2, prixUnitaire: 129 },
      { date: '2026-11-04', article: 'Chargeur USB-C GaN 65 W', qte: 3, prixUnitaire: 49 },
      { date: '2026-11-06', article: 'Power bank 20 000 mAh', qte: 2, prixUnitaire: 119 },
      { date: '2026-11-09', article: 'Souris sans fil ergonomique', qte: 1, prixUnitaire: 89 },
      { date: '2026-11-11', article: 'Support magnétique voiture', qte: 4, prixUnitaire: 39 },
      { date: '2026-11-12', article: 'Câble USB-C tressé 2 m', qte: 4, prixUnitaire: 31 }
    ],
    commissions: [
      { libelle: 'Commission KeffStation', montant: 0.30 },
      { libelle: 'Commission kifftech.store', montant: 0.20 }
    ]
  };

  const cent = (v) => Math.round(v * 100);
  const formatNombre = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const montant = (c) => formatNombre.format(c / 100) + '\u00a0₪';
  const formatDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const totalVentes = FACTURE.ventes.reduce((s, l) => s + l.qte * cent(l.prixUnitaire), 0);
  const totalCommissions = FACTURE.commissions.reduce((s, c) => s + cent(c.montant), 0);
  const total = totalVentes + totalCommissions;

  const byId = (id) => document.getElementById(id);

  byId('numero').textContent = FACTURE.numero;
  byId('date').textContent = formatDate(FACTURE.date);
  byId('periode').textContent = formatDate(FACTURE.periode[0]) + ' – ' + formatDate(FACTURE.periode[1]);

  byId('ventes').innerHTML = FACTURE.ventes.map((l) => `
    <tr>
      <td class="date">${formatDate(l.date)}</td>
      <td class="article">${l.article}</td>
      <td class="num">${l.qte}</td>
      <td class="num">${montant(cent(l.prixUnitaire))}</td>
      <td class="num">${montant(l.qte * cent(l.prixUnitaire))}</td>
    </tr>`).join('');

  byId('commissions').innerHTML = FACTURE.commissions.map((c) => `
    <div class="ligne"><span>${c.libelle}</span><span class="pointilles"></span><span class="val">${montant(cent(c.montant))}</span></div>`).join('');

  byId('recap-ventes').textContent = montant(totalVentes);
  byId('recap-commissions').textContent = montant(totalCommissions);
  byId('recap-total').textContent = montant(total);

  byId('btnImprimer').addEventListener('click', () => window.print());
})();
