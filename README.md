# KeffStation — Projet multi-apps

Dépôt vitrine regroupant plusieurs applications web sous une même interface, avec un espace admin protégé par clé et une page de rapports statistiques en graphique 3D "montagne".

## Structure (monorepo multi-apps)

```
Factureboutique/                     # dépôt racine
├── index.html                       # redirection vers la vitrine
├── .env.example                     # exemple de variables d'environnement
├── .gitignore
├── README.md
├── data/
│   └── stats.json                   # données de référence des statistiques
└── apps/
    ├── factureboutique/             # App 1 : générateur de factures (existant)
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/script.js
    ├── vitrine/                     # App 2 : page d'accueil / vitrine
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/script.js
    ├── admin/                       # App 3 : connexion admin (clé 100 caractères)
    │   ├── index.html
    │   ├── css/style.css
    │   ├── js/script.js
    │   └── config.js                # contient la clé admin (démo)
    └── stats/                       # App 4 : rapport stats + montagne 3D
        ├── index.html
        ├── css/style.css
        └── js/script.js
```

## Vitrine

URL : `apps/vitrine/index.html` (ou racine du dépôt)

La vitrine présente les applications, un résumé des statistiques (vues, clics, durée moyenne) et un bouton **Admin** en haut à droite.

## Espace admin — connexion par clé

L'admin est protégé par une clé de sécurité de **100 caractères**.

### Clé de démonstration (générée)

```
5nYvCZpSvSRhVgxgw0peyuk80TaWijWdb4n6605op5sbuckwkfxNMuDqy7t4IrHtP9MxKsJaihJJksu0i2C2kqAAsf8A8ZwDaqUG
```

Longueur : 100 caractères alphanumériques.

### Comment se connecter

1. Ouvrez `apps/admin/index.html`.
2. Collez la clé de 100 caractères dans le champ "Clé d'administration".
3. Cliquez sur **Se connecter**.
4. Vous êtes redirigé vers le rapport statistique (`apps/stats/index.html`).

Le jeton de connexion est stocké dans `localStorage` (`keff_admin_token`).

> **⚠️ Sécurité :** Pour la démonstration, la clé est présente dans `apps/admin/config.js` et committée. En production, ne jamais commettre un vrai secret : définissez-le via une variable d'environnement `ADMIN_KEY` (voir `.env.example`), ajoutez `.env` au `.gitignore`, et lisez la clé côté serveur.

## Rapport statistique — graphique 3D "montagne"

URL : `apps/stats/index.html`

Affiche :
- Vues totales, clics totaux, durée totale, nombre de pages suivies.
- Tableau détaillé par page (vues, clics, durée en secondes).
- Un graphique 3D "montagne" (Three.js) où chaque sommet représente une page :
  - **Hauteur** = nombre de vues
  - **Couleur** = durée de consultation
  - **Largeur** = nombre de clics

Les données de suivi (vues, clics, durée) sont collectées côté navigateur et stockées dans `localStorage` (`keffstation_stats`). Un bouton **Exporter JSON** permet de télécharger les données.

## Lancer en local

Aucun build nécessaire. Ouvrez simplement les fichiers HTML dans un navigateur :

```bash
cd Factureboutique
# puis ouvrez
open apps/vitrine/index.html
```

Ou servez le dossier avec un serveur statique (ex. Python) :

```bash
python3 -m http.server 8000
# http://localhost:8000/apps/vitrine/index.html
```

## Déploiement GitHub Pages

Ce dépôt est configuré pour GitHub Pages. Activez Pages dans les paramètres du dépôt (source : branche `main`, dossier `/` ou `/docs`), puis accédez à l'URL Pages pour consulter la vitrine.

## Avertissement

Projet fictif à des fins de démonstration/test. Les factures générées sont des documents fictifs.
