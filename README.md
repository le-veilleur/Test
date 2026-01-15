# Test technique – Intégration Unipile

Application d'intégration Unipile permettant de connecter des comptes Gmail, Outlook, Instagram et LinkedIn.

## 🚀 Démarrage rapide

### Installation

```bash
# Installer toutes les dépendances (root, server, client)
npm run install:all

# Créer les fichiers .env (optionnel, les valeurs par défaut fonctionnent en dev)
# Backend
cp env.example server/.env
# Frontend
cp env.example client/.env
```

> 💡 **Note** : Les valeurs par défaut fonctionnent pour le développement local. Pour la production, créez les fichiers `.env` et configurez vos variables d'environnement.

### Développement

```bash
# Démarrer le serveur backend et le frontend en parallèle
npm run dev
```

Le serveur backend sera disponible sur `http://localhost:3000`
Le frontend sera disponible sur `http://localhost:5173`

### Structure du projet

```
.
├── server/          # Backend Node.js + TypeScript + Express
│   ├── src/
│   │   ├── config/      # Configuration Unipile
│   │   ├── services/    # Service Unipile
│   │   ├── routes/      # Routes API
│   │   └── index.ts     # Point d'entrée
│   └── package.json
├── client/          # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages
│   │   ├── services/    # Services API
│   │   └── config/      # Configuration
│   └── package.json
└── package.json
```

## 📋 Fonctionnalités

- ✅ Connexion OAuth pour Gmail, Outlook, Instagram, LinkedIn
- ✅ Gestion de l'état connecté/non connecté
- ✅ Webhook pour recevoir les callbacks Unipile
- ✅ Interface utilisateur simple et fonctionnelle

## 🔧 Configuration

### Variables d'environnement

Le projet utilise des fichiers `.env` pour la configuration. 

**1. Créer le fichier `.env` pour le backend :**

```bash
cd server
cp ../env.example .env
```

Puis éditez `server/.env` avec vos valeurs :

```env
PORT=3000
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
UNIPILE_BASE_URL=https://api25.unipile.com:15594
UNIPILE_API_KEY=votre_clé_api_unipile
```

**2. Créer le fichier `.env` pour le frontend :**

```bash
cd client
cp ../env.example .env
```

Puis éditez `client/.env` avec vos valeurs :

```env
VITE_API_URL=http://localhost:3000
```

**Variables disponibles :**

**Backend (`server/.env`) :**
- `PORT` : Port du serveur backend (défaut: 3000)
- `BACKEND_URL` : URL du backend (pour les webhooks)
- `FRONTEND_URL` : URL du frontend (pour les redirections OAuth)
- `UNIPILE_BASE_URL` : URL de l'API Unipile
- `UNIPILE_API_KEY` : Clé API Unipile

**Frontend (`client/.env`) :**
- `VITE_API_URL` : URL de l'API backend (défaut: http://localhost:3000)

> ⚠️ **Important** : Les fichiers `.env` sont ignorés par Git. Ne commitez jamais vos clés API !

## 📚 API Endpoints

### POST `/api/unipile/auth-link`
Génère un lien d'authentification pour un provider.

**Body:**
```json
{
  "provider": "gmail" | "outlook" | "instagram" | "linkedin"
}
```

**Response:**
```json
{
  "auth_url": "https://..."
}
```

### POST `/api/unipile/webhook`
Endpoint pour recevoir les callbacks Unipile après connexion OAuth.

### GET `/api/unipile/account-status`
Récupère le statut de connexion pour tous les providers.

**Response:**
```json
{
  "status": {
    "gmail": true,
    "outlook": false,
    "instagram": true,
    "linkedin": false
  }
}
```

## 🛠️ Technologies

- **Backend**: Node.js, TypeScript, Express, Axios
- **Frontend**: React, TypeScript, Vite
- **API**: Unipile

# Test
