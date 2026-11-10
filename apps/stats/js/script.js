/* Rapport statistique KeffStation - Graphique 3D "montagne" avec Three.js */
import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js';

(function () {
  const container = document.getElementById('mountain3d');
  if (!container) return;

  // ---------- Données ----------
  const PAGE_PATHS = [
    { path: 'apps/vitrine/index.html', label: 'Vitrine' },
    { path: 'apps/factureboutique/index.html', label: 'Facture Boutique' },
    { path: 'apps/admin/index.html', label: 'Espace Admin' },
    { path: 'apps/stats/index.html', label: 'Rapport statistiques' }
  ];

  function getLocalStats() {
    try {
      const raw = localStorage.getItem('keffstation_stats');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  async function loadStats() {
    const local = getLocalStats();
    let seed = {};
    try {
      const res = await fetch('data/stats.json', { cache: 'no-store' });
      if (res.ok) seed = await res.json();
    } catch (e) { /* ignore */ }
    const pages = (seed.pages || {});
    const data = {};
    PAGE_PATHS.forEach(p => {
      const s = local[p.path] || {};
      const sd = pages[p.path] || {};
      data[p.label] = {
        label: p.label,
        views: Number(s.views || sd.views || 0),
        clicks: Number(s.clicks || sd.clicks || 0),
        duration: Number(s.duration || sd.duration || 0)
      };
    });
    return { pages: data, totals: seed.totals || {} };
  }

  // ---------- Tableau de bord ----------
  function renderDashboard(stats) {
    const pages = stats.pages;
    const totals = stats.totals;
    const views = Object.values(pages).reduce((a, v) => a + v.views, 0);
    const clicks = Object.values(pages).reduce((a, v) => a + v.clicks, 0);
    const duration = Object.values(pages).reduce((a, v) => a + v.duration, 0);
    const n = Object.keys(pages).length;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('kpiViews', totals.views !== undefined ? totals.views : views);
    set('kpiClicks', totals.clicks !== undefined ? totals.clicks : clicks);
    set('kpiDuration', totals.duration !== undefined ? totals.duration : duration);
    set('kpiPages', n);

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    Object.entries(pages).forEach(([label, v]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(label)}</strong></td>
        <td class="num">${v.views}</td>
        <td class="num">${v.clicks}</td>
        <td class="num">${v.duration}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[c]));
  }

  // ---------- Scène 3D ----------
  let scene, camera, renderer, controls, mesh, raycaster, pointer;
  let animationId;

  function init3D(pages) {
    const labels = Object.keys(pages);
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.035);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 10, 14);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 6;
    controls.maxDistance = 40;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;

    // Lumière
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0x22d3ee, 0.9);
    dir.position.set(8, 12, 6);
    dir.castShadow = true;
    scene.add(dir);
    const fill = new THREE.PointLight(0xf472b6, 0.5);
    fill.position.set(-8, 4, -6);
    scene.add(fill);

    // Sol
    const planeGeo = new THREE.PlaneGeometry(60, 60, 60, 60);
    const planeMat = new THREE.MeshStandardMaterial({ color: 0x10182c, roughness: 1 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Grille au sol
    const grid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
    scene.add(grid);

    // ---------- Montagnes ----------
    const group = new THREE.Group();

    // Normalisation des hauteurs
    const views = labels.map(l => pages[l].views);
    const durations = labels.map(l => pages[l].duration);
    const clicks = labels.map(l => pages[l].clicks);
    const maxViews = Math.max(...views, 1);
    const maxDur = Math.max(...durations, 1);
    const maxClicks = Math.max(...clicks, 1);

    // Brouillard de particules au-dessus
    const particleCount = 220;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pCol = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 1] = Math.random() * 12 + 2;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      const h = Math.random();
      pCol[i * 3] = 0.1 + h * 0.6;
      pCol[i * 3 + 1] = 0.4 + h * 0.5;
      pCol[i * 3 + 2] = 0.9;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    labels.forEach((label, i) => {
      const p = pages[label];
      // Hauteur = vues (échelle log pour lisibilité)
      const hBase = 1.2 + Math.log10(Math.max(p.views, 1)) * 2.2;
      // Largeur = clics
      const wScale = 0.9 + Math.log10(Math.max(p.clicks, 1)) * 1.6;
      // Profondeur = durée (modérée)
      const dScale = 0.9 + Math.log10(Math.max(p.duration, 1)) * 1.4;
      // Couleur = durée (bleu -> cyan -> rose)
      const tDur = Math.min(p.duration / maxDur, 1);
      const color = new THREE.Color().setHSL(0.58 - tDur * 0.4, 0.8, 0.45 + tDur * 0.3);

      // Terrain à hauteurs (bruit de sinus superposé)
      const res = 40;
      const geo = new THREE.PlaneGeometry(wScale * 2.2, dScale * 2.2, res, res);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      const colors = [];
      const cx = i % 3 - 1;
      const cz = Math.floor(i / 3) - 1;
      const ox = cx * 9;
      const oz = cz * 9;

      for (let y = 0; y <= res; y++) {
        for (let x = 0; x <= res; x++) {
          const u = x / res;
          const v = y / res;
          const n1 = Math.sin(u * 4 * Math.PI) * Math.cos(v * 4 * Math.PI);
          const n2 = Math.sin(u * 7 * Math.PI + 1.3) * Math.cos(v * 5 * Math.PI + 2.1) * 0.6;
          const n3 = Math.sin(u * 11 * Math.PI - 0.8) * 0.35;
          let h = (n1 + n2 + n3) / 2 + 0.5;
          h = Math.pow(h, 1.4); // contraste
          h *= hBase;
          pos.setZ(x * (wScale * 2.2 / res) - wScale * 1.1, y * (dScale * 2.2 / res) - dScale * 1.1, h);
          const t = h / hBase;
          const c = new THREE.Color().setHSL(0.62 - t * 0.45, 0.85, 0.4 + t * 0.35);
          colors.push(c.r, c.g, c.b);
        }
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: false,
        roughness: 0.55,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(ox, 0, oz);
      m.castShadow = true;
      m.receiveShadow = true;

      // Sommet décoré par une sphère proportionnelle
      const peakGeo = new THREE.SphereGeometry(0.18 + Math.log10(Math.max(p.views, 1)) * 0.14, 10, 10);
      const peakMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 });
      const peak = new THREE.Mesh(peakGeo, peakMat);
      peak.position.set(ox, hBase + 0.4, oz);
      peak.castShadow = true;

      // Étiquette
      // (pas de texte 3D pour rester léger ; on affiche dans le tableau)

      group.add(m);
      group.add(peak);
    });

    group.position.y = -1;
    scene.add(group);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    // ---------- Animation ----------
    let time = 0;
    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.015;
      if (particles) {
        particles.rotation.y = time * 0.12;
      }
      // Ondulation légère des sommets
      group.children.forEach((child, i) => {
        if (child.isMesh && child.geometry.attributes.color) {
          const positions = child.geometry.attributes.position;
          for (let k = 0; k < positions.count; k++) {
            const z = positions.getZ(k);
            const base = 1.2 + Math.log10(1) * 2.2; // approximatif
            positions.setZ(k, z); // placeholder (statique)
          }
          positions.needsUpdate = true;
          child.geometry.computeVertexNormals();
        }
      });
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', onResize);
  }

  function onResize() {
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // ---------- Lancement ----------
  loadStats().then(stats => {
    renderDashboard(stats);
    init3D(stats.pages);
  });

  // Export JSON
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const data = getLocalStats();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'keffstation-stats.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
})();
