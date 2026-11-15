# Secret Santa 🎁

Petit site de tirage au sort pour Noël. Aucune base de données : le résultat de chaque personne est brouillé dans son lien.

## Les fichiers

- `admin.html` : ta page à toi (prénoms, restrictions, date, tirage, envoi des liens).
- `index.html` : la page que voient les participants quand ils ouvrent leur lien.
- `style.css` : le design (kraft, vert sapin, rouge).
- `app.js` : tout le fonctionnement.

## Tester sur ton ordinateur

1. Ouvre le dossier dans VS Code.
2. Installe l’extension **Live Server**, puis clic droit sur `admin.html` → **Open with Live Server**.

## Mettre en ligne avec GitHub Pages

1. Sur github.com, crée un dépôt nommé `secret-santa` (public).
2. Envoie les 4 fichiers dedans (bouton **Add file → Upload files**, ou via VS Code).
3. Dans le dépôt : **Settings → Pages → Source : Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Après une ou deux minutes, ton site est en ligne :
   - ta page admin : `https://TON-PSEUDO.github.io/secret-santa/admin.html`
   - les liens des participants sont créés automatiquement à partir de cette adresse.

## À savoir

- Tes prénoms et ton tirage sont gardés **dans le navigateur où tu utilises l’admin**. Fais le tirage et l’envoi depuis le même appareil (ton téléphone, par exemple), et ne vide pas les données de ce navigateur avant Noël.
- Si quelqu’un ouvre la page admin sur son propre appareil, il la voit vide : il n’a pas accès à tes données.
- Chaque lien contient le résultat. Si tu refais le tirage, renvoie les nouveaux liens à tout le monde.
