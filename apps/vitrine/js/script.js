/* Vitrine KeffStation - Suivi des vues, clics et durées (stockage local) */

(function () {
  const STORAGE_KEY = 'keffstation_stats';
  const TRACKED_PAGES = [
    { path: 'apps/vitrine/index.html', label: 'Vitrine' },
    { path: 'apps/factureboutique/index.html', label: 'Facture Boutique' },
    { path: 'apps/console/index.html', label: 'Console de facturation' },
    { path: 'apps/admin/index.html', label: 'Admin' },
    { path: 'apps/stats/index.html', label: 'Rapport statistiques' }
  ];

  // Données de suivi (démo, stockées en localStorage)
  function getStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function setStats(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function inc(pagePath, field, amount = 1) {
    const s = getStats();
    if (!s[pagePath]) s[pagePath] = { views: 0, clicks: 0, duration: 0, sessions: 0 };
    s[pagePath][field] = (s[pagePath][field] || 0) + amount;
    setStats(s);
    render();
  }

  // Compte une vue à chaque chargement de cette page
  const current = (location.pathname.replace(/\/+$/, '') || '/');
  const match = TRACKED_PAGES.find(p => current.endsWith(p.path)) || { path: current, label: current };
  const now = Date.now();
  let s = getStats();
  if (!s[match.path]) s[match.path] = { views: 0, clicks: 0, duration: 0, sessions: 0, _start: now };
  s[match.path].views += 1;
  s[match.path].sessions += 1;
  s[match.path]._start = now;
  setStats(s);

  // Temps passé sur la page (duration) envoyé à l'unload / visibilitychange
  let startTime = now;
  function saveDuration() {
    const elapsed = Math.max(0, Math.round((Date.now() - startTime) / 1000));
    const ss = getStats();
    if (ss[match.path]) {
      ss[match.path].duration = (ss[match.path].duration || 0) + elapsed;
    }
    setStats(ss);
    render();
  }
  window.addEventListener('beforeunload', saveDuration);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveDuration();
    else startTime = Date.now();
  });

  // Clics sur les liens sortants de la vitrine
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => inc(current, 'clicks', 1));
  });

  function render() {
    const s = getStats();
    const byId = (id) => document.getElementById(id);
    let totalViews = 0, totalClicks = 0, totalDuration = 0;
    Object.values(s).forEach(v => {
      totalViews += v.views || 0;
      totalClicks += v.clicks || 0;
      totalDuration += v.duration || 0;
    });
    const trackedCount = Object.keys(s).length;
    const avgDuration = trackedCount ? Math.round(totalDuration / trackedCount) : 0;

    const elViews = byId('statViews');
    const elClicks = byId('statClicks');
    const elDuration = byId('statDuration');
    const elPages = byId('statPages');
    if (elViews) elViews.textContent = totalViews;
    if (elClicks) elClicks.textContent = totalClicks;
    if (elDuration) elDuration.textContent = avgDuration;
    if (elPages) elPages.textContent = trackedCount;
  }

  // Bouton admin -> ouvre la page admin
  const btnAdmin = document.getElementById('btnAdmin');
  const btnOpenAdmin = document.getElementById('btnOpenAdmin');
  const adminUrl = '../admin/index.html';
  function openAdmin() { window.location.href = adminUrl; }
  if (btnAdmin) btnAdmin.addEventListener('click', (e) => { e.preventDefault(); openAdmin(); });
  if (btnOpenAdmin) btnOpenAdmin.addEventListener('click', (e) => { e.preventDefault(); openAdmin(); });

  // Statistiques de facturation KiffTech affichées en direct sur la carte
  const kpiValeur = document.getElementById('appKpiValeur');
  if (kpiValeur && window.KiffTechEngine) {
    window.KiffTechEngine.init().then(() => {
      const maj = () => {
        const r = window.KiffTechEngine.etat.rapport;
        if (!r) return;
        kpiValeur.textContent = window.KiffTechEngine.formatMontant(r.totalVente) + ' ' + r.symbole;
      };
      maj();
      window.KiffTechEngine.onUpdate(maj);
    }).catch(() => {
      kpiValeur.textContent = '—';
    });
  }

  render();
})();
