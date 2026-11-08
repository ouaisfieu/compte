# Le Compte — ce qu’on peut reprocher à l’État belge

Site statique (HTML, CSS, JavaScript sans dépendance), prêt pour GitHub Pages à l’adresse
https://ouaisfieu.github.io/compte/

## Mise en ligne

1. Poussez le contenu de ce dossier à la racine du dépôt `ouaisfieu/compte` (branche `main`).
2. Dans *Settings → Pages*, choisissez *Deploy from a branch*, branche `main`, dossier `/ (root)`.
3. Le site est servi sur https://ouaisfieu.github.io/compte/. Le fichier `.nojekyll` désactive Jekyll.

## SEO

- Déclarez `https://ouaisfieu.github.io/compte/sitemap.xml` dans la Google Search Console et Bing Webmaster Tools.
- Le `robots.txt` d’un site de projet n’est pas lu par les moteurs : seul celui du dépôt
  `ouaisfieu.github.io` (racine du domaine) compte. Ajoutez-y au besoin :
  `Sitemap: https://ouaisfieu.github.io/compte/sitemap.xml`
- Données structurées : JSON-LD schema.org dans chaque page (NewsMediaOrganization, AnalysisNewsArticle,
  BreadcrumbList, FAQPage, ClaimReview, Quiz, DefinedTermSet, Dataset, ItemList d’Event).

## Structure

- `index.html` — la une ; `griefs.html` — l’inventaire filtrable
- `dossiers/*.html` — 28 dossiers ; `rubriques/*.html` — 9 rubriques
- `citoyennete-brol.html` — grand format « La citoyenneté, c’est le brol ? »
- Outils : `qui-est-competent.html`, `chrono-formations.html`, `compteurs.html`, `quiz-citoyen.html`,
  `mon-palmares.html`, `vrai-ou-faux.html`
- `chronologie.html`, `glossaire.html`, `donnees.html` (+ `data/`), `methode.html`, `a-propos.html`, `recherche.html`, `404.html`
- `feed.xml` (Atom), `sitemap.xml`, `manifest.webmanifest`, `og/` (images de partage)

Tous les liens internes sont relatifs : le site fonctionne aussi en ouvrant `index.html` localement
(la recherche et les outils inclus).

## Licence

Textes et données : CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/deed.fr). Police Newsreader : SIL OFL.
