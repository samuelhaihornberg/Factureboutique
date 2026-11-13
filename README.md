# KeffStation — Projet multi-apps

Dépôt vitrine regroupant plusieurs applications web sous une même interface, avec un espace admin protégé par clé et une page de rapports statistiques en graphique 3D "montagne".

## Structure (monorepo multi-apps)

```
Factureboutique/                     # dépôt racine
├── index.html                       # redirection vers la vitrine
├── .env.example                     # exemple de variables d'environnement
├── .gitignore
├── README.md
├── assets/
│   └── logo-kiffstation.png         # monogramme KS (tampon de certification)
├── data/
│   ├── stats.json                   # données de référence des statistiques
│   ├── kifftech-catalogue.json      # base de référence du catalogue KiffTech
│   └── kifftech-ventes.json         # facture KiffTech + paramètres de calcul
└── apps/
    ├── shared/                      # moteur + rendu partagés
    │   ├── kifftech-engine.js       # lecture catalogue, calcul des prix, compte
    │   ├── kifftech-console.js      # rendu de la console rétro + tampon
    │   └── kifftech-console.css     # styles du terminal et du tampon
    ├── factureboutique/             # App 1 : générateur de factures
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/script.js
    ├── console/                     # App 2 : console de facturation temps réel
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/script.js
    ├── vitrine/                     # App 3 : page d'accueil / vitrine
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/script.js
    ├── admin/                       # App 4 : connexion admin (clé 100 caractères)
    │   ├── index.html
    │   ├── css/style.css
    │   ├── js/script.js
    │   └── config.js                # contient la clé admin (démo)
    ├── stats/                       # App 5 : rapport stats + montagne 3D
    │   ├── index.html
    │   ├── css/style.css
    │   └── js/script.js
    └── simulation/                  # App 6 : simulation de facture (relevé de ventes & commissions)
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

## Console de facturation — KeffStation × KiffTech

URL : `apps/console/index.html` (aussi affichée en tête de l'app Facture Boutique et sur la carte « Facture Boutique » de la vitrine).

La console lit le catalogue KiffTech **en direct** depuis le dépôt `samuelhaihornberg/keffstation` :

```
https://raw.githubusercontent.com/samuelhaihornberg/keffstation/main/kifftech/app.v2.js
```

Si le réseau est indisponible, `data/kifftech-catalogue.json` (base versionnée dans le dépôt) prend le relais. Le bandeau en haut à droite indique la source active : `catalogue live` ou `catalogue local`.

### Règles tarifaires

Identiques à `kifftech/app.v2.js` (`calcKiffTechPrice`) :

```
prix de vente = prix officiel − 20 % de base
                + 1 % par article présent en caisse (jusqu'à +7 %)
                plafond : 27 %
```

La facture de référence `F-KT-2026-0142` comporte 4 articles, soit une remise de −24 %. Les montants sont affichés en shekels (`₪`) au taux EUR → ILS déclaré dans la console (`3,9266`).

### Le compte

```
PRIX OFFICIELS (CATALOGUE)          557,58 ₪
PROMOTIONS −24 %                    −133,51 ₪
──────────────────────────────────────────────
TOTAL DE VENTE                       424,07 ₪
──────────────────────────────────────────────
PRIX DE GROS (déduction fournisseur)  −254,44 ₪
PARTS KEFFSTATION (commission)         +38,17 ₪
INTÉRÊT / FRAIS DE PAIEMENT            +10,18 ₪
MARGE NETTE REVENDEUR                 +121,28 ₪
──────────────────────────────────────────────
TOTAL DE GAIN                         424,07 ₪
```

Les taux (`tauxGros`, `tauxParts`, `tauxInteret`) sont paramétrables dans `data/kifftech-ventes.json`. La marge nette est calculée en résiduel : la somme du décompte redonne toujours le total de vente.

### Tampon de certification

Le terminal porte un tampon circulaire (monogramme KeffStation, mention « APPROUVÉ ») avec la signature **A.g.u.s**, en surimpression dans le coin inférieur droit.

### Fichiers utiles

| Fichier | Rôle |
|---|---|
| `data/kifftech-ventes.json` | facture de référence, taux de change, taux de décomposition |
| `data/kifftech-catalogue.json` | base de référence du catalogue (repli hors ligne) |
| `apps/shared/kifftech-engine.js` | lecture du catalogue, calcul des prix, agrégation |
| `apps/shared/kifftech-console.js` | rendu du terminal et du tampon |
| `apps/shared/kifftech-console.css` | styles du terminal et du tampon |

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

## Simulation de facture

URL : `apps/simulation/index.html` — accessible via le badge **Simulation** dans le footer de la vitrine.

La mention « Simulation — données de démonstration » figure dans le pied de page général de l'application (vitrine et page de simulation), hors de la facture : la facture, son titre, son en-tête et son rendu imprimable ou exporté ne portent aucune mention.

Facture fictive (données de démonstration, non liées au catalogue) : relevé de ventes de plusieurs articles populaires et commissions KeffStation / kifftech.store.

| Élément | Montant |
|---|---|
| Total des ventes (6 lignes d'articles) | 1 012,00 ₪ |
| Total des commissions | 0,50 ₪ |
| **Total** | **1 012,50 ₪** |

Les lignes de vente et les commissions sont définies dans l'objet `FACTURE` de `apps/simulation/js/script.js`. Le bouton **Imprimer** n'imprime que la facture.

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

Projet de démonstration. La facture `F-KT-2026-0142` est une base de référence versionnée dans le dépôt ; le catalogue et les prix affichés proviennent du dépôt KeffStation (`samuelhaihornberg/keffstation`).
