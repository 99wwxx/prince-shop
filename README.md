# Prince Shop — boutique en ligne (démo)

Boutique mode pour **Prince Shop, Fès** (`@princeshop_ali`) : chaussures, sacs, accessoires.
Français + arabe (vrai RTL), pensée pour le téléphone, commande envoyée sur WhatsApp.
Aucune dépendance, aucun `npm install` : des fichiers HTML/CSS/JS simples.

> **Mode démo actif.** Les 20 produits, leurs prix et leurs photos sont des exemples.
> Rien n'est présenté comme le vrai catalogue. Voir « Passer en production ».

---

## Voir le site

```bash
node tools/serve.js
```

Puis ouvrir http://localhost:5200 — ou double-cliquer sur `index.html` (fonctionne aussi sans serveur).

## Modifier le contenu : 3 fichiers

| Je veux changer… | Fichier |
|---|---|
| un produit, un prix, une photo, une couleur, une taille | `data/products.js` |
| un numéro, l'adresse, la livraison, le paiement, les tranches de budget, le mode démo | `data/config.js` |
| un texte de l'interface (français ou arabe) | `data/i18n.js` |
| les pages Livraison / Retours / Conditions / Confidentialité | `data/legal.js` |

Chaque fichier commence par un mode d'emploi. Après une modification :

```bash
node tools/check.js
```

```bash
node tools/build.js
```

`check` signale les oublis (texte manquant, photo introuvable, couleur inconnue).
`build` régénère les pages (une par produit et par langue), le `404.html`, `robots.txt` et le sitemap.

### Remplacer un produit de démo par un vrai

1. Photo dans `assets/products/shoes|bags|accessories/` (portrait 4:5, ~1200 × 1500 px).
2. Dans `data/products.js`, changer `name`, `price` et `images` du produit.
3. `node tools/build.js`.

La mise en page ne bouge pas : même design avec les vraies données.
Une photo introuvable n'affiche jamais d'image cassée, seulement « Photo à venir ».

## Passer en production

Dans `data/config.js` :

1. Remplacer les produits, prix et photos de démo.
2. `siteUrl: 'https://…'` (domaine final).
3. Confirmer avec la boutique, puis remplir — tant que c'est vide, le site reste neutre :
   - `payment.cashOnDelivery` (paiement à la livraison ?)
   - `delivery.fee`, `delivery.freeFrom`, `delivery.eta`
   - `store.hours`, `store.googleReviewCount`
   - `sizeGuide.rows`
   - le numéro WhatsApp qui reçoit les commandes (`contact.WHATSAPP_NUMBER`)
4. Compléter les pages de `data/legal.js` et passer leur `status` à `'final'`.
5. `DEMO_MODE: false` → le repère « Démo » disparaît et le site devient indexable par Google.
6. `node tools/check.js` puis `node tools/build.js`, et mettre le dossier en ligne
   (hébergement statique : GitHub Pages, Netlify, Vercel, OVH…).

`node tools/check.js` liste à tout moment ce qui reste « à confirmer ».

## Ce qui est vérifié, et ce qui ne l'est pas

Vérifié sur le profil Instagram et la fiche Google Maps du lien de la bio (6–7 oct. 2026) :

- Téléphone `+212 664 479 449` (Instagram **et** Google Maps) ; WhatsApp `+212 662 520 130` (bio Instagram).
- « Livraison disponible partout au Maroc ».
- Fiche Google Maps « Prince shop », catégorie « Boutique d'accessoires de mode », note 4,3.
- Adresse de la bio : Av. Oran, Montfleuri 1, Zohour, Fès. Google Maps affiche « 2256+RPV, Rue d'Alep, Fès 30050 » :
  le site montre les deux et pointe vers la fiche Maps ; **le nom de rue est à trancher avec la boutique**.

Non vérifié, donc non affiché : nombre d'avis, horaires complets, frais et délais de livraison,
modes de paiement, politique d'échange, prix réels, matières.

La fiche Google Maps n'est pas revendiquée (« Revendiquer cet établissement ») : la boutique peut
la réclamer gratuitement pour corriger l'adresse, ajouter les horaires et le lien du site.

## Photos de démonstration

Images libres (licence Unsplash), chargées depuis leur CDN et recadrées à la volée.
Elles ne montrent pas les articles de Prince Shop. Aucune marque de luxe n'est nommée, et les
photos où une marque tierce était lisible ont été écartées. Crédits : page `/infos/credits`
(visible en mode démo seulement).

## Fonctionnement

- **Commande** : panier → coordonnées (nom, téléphone, ville, adresse) → vérification → WhatsApp
  s'ouvre avec le message déjà écrit. Pas de compte, pas de paiement en ligne.
  Le panier n'est vidé que lorsque le client confirme avoir envoyé le message.
- **Langues** : français par défaut, arabe sous `/ar/…`. Le choix est mémorisé sur l'appareil.
- **Données du client** : panier, langue, articles vus et coordonnées restent dans son navigateur.
- **Recherche** : nom, catégorie, type, couleur, mots-clés — en français, en arabe et en darija.

## Structure

```
index.html            coquille du site (+ pages générées : produit/, boutique/, ar/…)
css/styles.css        styles, mobile d'abord, propriétés logiques (RTL automatique)
data/                 config.js · products.js · i18n.js · legal.js   ← le contenu
js/                   util · i18n · icons · catalog · cart · whatsapp · router · ui
                      views · shop · pdp · panels · checkout · app
tools/                serve.js (aperçu) · check.js (contrôle) · build.js (pages) · icons.js
assets/products/      vos photos
```
