import { API_BASE_URL, Provider } from '../config/api.js';

export interface AccountInfo {
  connected: boolean;
  email?: string;
  username?: string;
  accountId?: string;
}

export interface AccountsStatus {
  gmail: AccountInfo;
  outlook: AccountInfo;
  instagram: AccountInfo;
  linkedin: AccountInfo;
}

export class ApiService {
  /**
   * Génère un lien d'authentification pour un provider
   */
  async generateAuthLink(provider: Provider): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/unipile/auth-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.auth_url;
  }

  /**
   * Récupère le statut de connexion pour tous les providers avec leurs détails
   */
  async getAccountStatus(): Promise<AccountsStatus> {
    const response = await fetch(`${API_BASE_URL}/api/unipile/account-status`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.accounts;
  }

  /**
   * Déconnecte un compte
   */
  async disconnectAccount(provider: string): Promise<{ success: boolean }> {
    const url = `${API_BASE_URL}/api/unipile/disconnect/${provider}`;
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
    });

    console.log(`📥 Réponse: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json().catch(() => ({ success: true }));
    return data;
  }
}
