/* Admin KeffStation - Connexion par clé de 100 caractères */

(function () {
  const ADMIN_KEY = window.__KEFF_ADMIN_KEY || '';
  const TOKEN_KEY = 'keff_admin_token';
  const STATS_URL = 'apps/stats/index.html';

  const form = document.getElementById('loginForm');
  const input = document.getElementById('adminKey');
  const error = document.getElementById('error');
  const btnShow = document.getElementById('btnShowKey');
  const msgKey = document.getElementById('msgKey');
  const codeKey = document.getElementById('codeKey');

  // Affiche la clé de démo (à usage de démonstration uniquement)
  if (btnShow && msgKey && codeKey && ADMIN_KEY) {
    codeKey.textContent = ADMIN_KEY;
    msgKey.style.display = 'block';
    btnShow.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      btnShow.textContent = input.type === 'password' ? 'Afficher la clé de démo' : 'Masquer la clé';
    });
  }

  // Si déjà connecté, rediriger vers les stats
  if (localStorage.getItem(TOKEN_KEY)) {
    window.location.replace(STATS_URL);
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = input.value.trim();
    error.style.display = 'none';

    if (key === ADMIN_KEY) {
      localStorage.setItem(TOKEN_KEY, '1');
      window.location.replace(STATS_URL);
    } else {
      error.style.display = 'block';
      input.focus();
      // Secouage léger du champ
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
    }
  });
})();
