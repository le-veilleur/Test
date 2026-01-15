import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtenir le répertoire du fichier actuel (pour ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement depuis server/.env
dotenv.config({ path: join(__dirname, '../../.env') });

export const UNIPILE_CONFIG = {
  baseUrl: process.env.UNIPILE_BASE_URL || 'https://api25.unipile.com:15594',
  apiKey: process.env.UNIPILE_API_KEY,
};

// Afficher un avertissement si la clé API n'est pas définie
if (!UNIPILE_CONFIG.apiKey) {
  console.warn('⚠️  ATTENTION: UNIPILE_API_KEY n\'est pas définie dans server/.env');
  console.warn('   Créez le fichier server/.env avec: UNIPILE_API_KEY=votre_clé');
}

export const PROVIDERS = {
  GMAIL: 'GOOGLE',
  OUTLOOK: 'MICROSOFT',
  INSTAGRAM: 'INSTAGRAM',
  LINKEDIN: 'LINKEDIN',
} as const;

// Mapping pour l'affichage frontend
export const PROVIDER_DISPLAY_NAMES = {
  GOOGLE: 'gmail',
  MICROSOFT: 'outlook',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
} as const;

export type Provider = typeof PROVIDERS[keyof typeof PROVIDERS];
