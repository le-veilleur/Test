# 🔧 Guide de dépannage - Erreur 400 Unipile

## ❌ Erreur : "Request failed with status code 400"

Cette erreur signifie que l'API Unipile rejette votre requête. Voici les causes possibles et leurs solutions :

### 1. 🔑 Clé API manquante ou incorrecte

**Symptôme :** Erreur 400 ou 401

**Solution :**
```bash
# 1. Créer le fichier .env dans le dossier server/
cd server
cp ../env.example .env

# 2. Éditer server/.env et ajouter votre clé API
UNIPILE_API_KEY=wU+2vV8i.Rxs+W0qDKDh8ljO968bNZl4LVHHdxL/vBh7onWcE6iU=

# 3. Redémarrer le serveur
npm run dev
```

**Vérification :**
- Le fichier `server/.env` existe bien
- La variable `UNIPILE_API_KEY` est définie (sans espaces)
- Le serveur a été redémarré après modification du `.env`

### 2. 📍 Endpoint incorrect

**Symptôme :** Erreur 400 avec message "endpoint not found" ou similaire

**Solution :**
Vérifiez que l'URL de l'API est correcte dans `server/.env` :
```env
UNIPILE_BASE_URL=https://api25.unipile.com:15594
```

### 3. 📝 Format de requête incorrect

**Symptôme :** Erreur 400 avec détails dans la réponse

**Solution :**
Les logs du serveur affichent maintenant les détails complets de l'erreur. Vérifiez :
- Le format des URLs de redirection (doivent être des URLs valides)
- Le format du provider (doit être en majuscules : GOOGLE, MICROSOFT, etc.)

### 4. 🔍 Comment déboguer

Le code a été amélioré pour afficher des logs détaillés :

1. **Vérifiez les logs du serveur** - Vous verrez :
   - La requête envoyée à Unipile
   - La réponse complète de l'API
   - Les détails de l'erreur

2. **Vérifiez la console du navigateur** - Les erreurs sont maintenant plus explicites

3. **Testez la clé API** :
   ```bash
   # Dans server/.env, vérifiez que la clé est bien chargée
   # Le serveur affichera un avertissement si elle est manquante
   ```

### 5. ✅ Checklist de vérification

- [ ] Le fichier `server/.env` existe
- [ ] `UNIPILE_API_KEY` est défini dans `server/.env`
- [ ] `UNIPILE_BASE_URL` est défini (ou utilise la valeur par défaut)
- [ ] Le serveur a été redémarré après modification du `.env`
- [ ] Les URLs de redirection sont valides (http://localhost:5173 pour le dev)
- [ ] Le port 3000 est disponible pour le backend

### 6. 📞 Informations à fournir en cas de problème persistant

Si l'erreur persiste, fournissez :
1. Les logs complets du serveur (avec les détails de l'erreur)
2. Le contenu de `server/.env` (sans la clé API complète, juste confirmer qu'elle est là)
3. Le provider que vous essayez de connecter
4. La version de Node.js : `node --version`
