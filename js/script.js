// Facture KeffStation par App - Logique JavaScript

(() => {
  const DATE_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric' };

  // État des articles : description, quantité, prix unitaire
  let items = [
    { description: 'Abonnement KeffStation Premium – mensuel', qty: 1, price: 49900 },
    { description: 'Pack SMS marketing – 5 000 unités', qty: 1, price: 15000 },
    { description: 'Frais de mise en service', qty: 1, price: 25000 },
  ];

  const TVA_RATE = 0.20;
  const CURRENCY = 'FCFA';

  // Sélecteurs DOM
  const tbody = document.getElementById('items-body');
  const addBtn = document.getElementById('add-row');
  const resetBtn = document.getElementById('reset-form');
  const elNumber = document.getElementById('invoice-number');
  const elDate = document.getElementById('invoice-date');
  const elDue = document.getElementById('invoice-due');
  const elSubtotal = document.getElementById('subtotal');
  const elTax = document.getElementById('tax');
  const elTotal = document.getElementById('grand-total');

  // Initialisation des dates
  const now = new Date();
  elDate.textContent = now.toLocaleDateString('fr-FR', DATE_OPTIONS);

  const due = new Date(now);
  due.setDate(due.getDate() + 30);
  elDue.textContent = due.toLocaleDateString('fr-FR', DATE_OPTIONS);

  // Formatage nombre à la française (ex: 49 900,00)
  function formatNumber(value) {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  // Calcul des totaux
  function compute() {
    const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
    const tax = subtotal * TVA_RATE;
    const total = subtotal + tax;

    elSubtotal.textContent = formatNumber(subtotal);
    elTax.textContent = formatNumber(tax);
    elTotal.textContent = formatNumber(total);
  }

  // Rendu du tableau
  function render() {
    tbody.innerHTML = '';

    items.forEach((it, idx) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>
          <input type="text" data-field="description" data-idx="${idx}" value="${it.description}">
        </td>
        <td class="right">
          <input type="number" data-field="qty" data-idx="${idx}" value="${it.qty}" min="0">
        </td>
        <td class="right">
          <input type="number" data-field="price" data-idx="${idx}" value="${it.price}" min="0" step="0.01">
        </td>
        <td class="right">${formatNumber(it.qty * it.price)} ${CURRENCY}</td>
        <td>
          <button type="button" class="item-remove" data-idx="${idx}">&times;</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    compute();
  }

  // Écouteur centralisé sur le tbody
  tbody.addEventListener('input', (e) => {
    const target = e.target;
    const idx = Number(target.dataset.idx);
    const field = target.dataset.field;
    if (idx === undefined || !field) return;

    let value = target.value;
    if (field === 'qty' || field === 'price') {
      value = Number(value) || 0;
    }

    items[idx][field] = value;
    render();
  });

  // Supprimer une ligne
  tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('item-remove')) {
      const idx = Number(e.target.dataset.idx);
      items.splice(idx, 1);
      render();
    }
  });

  // Ajouter une ligne vide
  addBtn.addEventListener('click', () => {
    items.push({ description: 'Nouvel article', qty: 1, price: 0 });
    render();
  });

  // Réinitialiser
  resetBtn.addEventListener('click', () => {
    items = [
      { description: 'Abonnement KeffStation Premium – mensuel', qty: 1, price: 49900 },
      { description: 'Pack SMS marketing – 5 000 unités', qty: 1, price: 15000 },
      { description: 'Frais de mise en service', qty: 1, price: 25000 },
    ];
    render();
  });

  // Lancement
  render();
})();
