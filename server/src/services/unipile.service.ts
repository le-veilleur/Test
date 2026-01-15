import axios from 'axios';
import { UNIPILE_CONFIG, Provider } from '../config/unipile.js';

const API_BASE_URL = `${UNIPILE_CONFIG.baseUrl}/api/v1`;

interface HostedAuthRequest {
  type: 'create' | 'reconnect';
  providers?: Provider[];
  notify_url?: string;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  expiresOn: string; // ISO 8601 UTC datetime
  api_url: string; // URL du serveur Unipile
}

interface HostedAuthResponse {
  url?: string;
  auth_url?: string;
}

interface AccountResponse {
  id?: string;
  account_id?: string;
  provider?: string;
  type?: string; // GOOGLE_OAUTH, MICROSOFT_OAUTH, etc.
  status?: string;
  username?: string;
  email?: string;
  name?: string;
  address?: string;
  connection_params?: {
    mail?: {
      id?: string;
      username?: string;
    };
    calendar?: {
      id?: string;
      username?: string;
    };
  };
  profile?: {
    email?: string;
    username?: string;
    name?: string;
  };
  [key: string]: any; // Pour capturer d'autres champs possibles
}

export class UnipileService {
  private getHeaders() {
    return {
      'X-API-KEY': UNIPILE_CONFIG.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Génère un lien d'authentification hébergé pour un provider
   */
  async generateAuthLink(
    provider: Provider,
    notifyUrl: string,
    successRedirectUrl: string,
    failureRedirectUrl: string
  ): Promise<string> {
    try {
      // Vérifier que la clé API est présente
      if (!UNIPILE_CONFIG.apiKey) {
        throw new Error('UNIPILE_API_KEY n\'est pas définie dans les variables d\'environnement');
      }

      // Générer une date d'expiration (24h à partir de maintenant)
      const expiresOn = new Date();
      expiresOn.setHours(expiresOn.getHours() + 24);
      const expiresOnISO = expiresOn.toISOString();

      const request: HostedAuthRequest = {
        type: 'create',
        providers: [provider],
        notify_url: notifyUrl,
        success_redirect_url: successRedirectUrl,
        failure_redirect_url: failureRedirectUrl,
        expiresOn: expiresOnISO,
        api_url: UNIPILE_CONFIG.baseUrl,
      };

      console.log('📤 Requête Unipile:', {
        url: `${API_BASE_URL}/hosted/accounts/link`,
        method: 'POST',
        provider,
        hasApiKey: !!UNIPILE_CONFIG.apiKey,
        requestBody: { ...request, providers: request.providers },
      });

      const response = await axios.post<HostedAuthResponse>(
        `${API_BASE_URL}/hosted/accounts/link`,
        request,
        { headers: this.getHeaders() }
      );

      const authUrl = response.data.url || response.data.auth_url;
      if (!authUrl) {
        throw new Error('URL d\'authentification non trouvée dans la réponse Unipile');
      }
      return authUrl;
    } catch (error: unknown) {
      console.error('❌ Erreur lors de la génération du lien auth:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const statusText = error.response?.statusText;
        const responseData = error.response?.data;
        
        console.error('📋 Détails de l\'erreur:', {
          status,
          statusText,
          responseData,
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          requestData: error.config?.data,
        });

        // Messages d'erreur plus détaillés
        if (status === 400) {
          const errorMessage = responseData?.message || responseData?.error || 'Requête invalide';
          throw new Error(
            `Erreur 400 - Requête invalide: ${errorMessage}. ` +
            `Vérifiez que la clé API est correcte et que les paramètres sont valides. ` +
            `Détails: ${JSON.stringify(responseData)}`
          );
        } else if (status === 401) {
          throw new Error(
            'Erreur 401 - Clé API invalide ou manquante. Vérifiez votre UNIPILE_API_KEY dans le fichier .env'
          );
        } else if (status === 404) {
          throw new Error(
            'Erreur 404 - Endpoint non trouvé. Vérifiez que l\'URL de l\'API Unipile est correcte.'
          );
        } else {
          throw new Error(
            `Erreur Unipile (${status}): ${responseData?.message || error.message}`
          );
        }
      }
      throw error;
    }
  }

  /**
   * Récupère les informations d'un compte via son account_id
   */
  async getAccount(accountId: string): Promise<AccountResponse> {
    try {
      const response = await axios.get<AccountResponse>(
        `${API_BASE_URL}/accounts/${accountId}`,
        { headers: this.getHeaders() }
      );

      console.log('📧 Détails du compte récupérés:', {
        accountId,
        data: response.data,
        email: response.data.email,
        profile: response.data.profile,
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Erreur lors de la récupération du compte:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Erreur Unipile: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Liste tous les comptes connectés
   */
  async listAccounts(): Promise<AccountResponse[]> {
    try {
      console.log('🔍 Appel API Unipile pour lister les comptes:', `${API_BASE_URL}/accounts`);
      const response = await axios.get<any>(
        `${API_BASE_URL}/accounts`,
        { headers: this.getHeaders() }
      );

      console.log('📦 Réponse complète de listAccounts:', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasAccounts: !!response.data?.accounts,
      });

      // L'API Unipile retourne les comptes dans data.items
      let accounts: AccountResponse[] = [];
      if (Array.isArray(response.data)) {
        accounts = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        accounts = response.data.items;
      } else if (response.data?.accounts && Array.isArray(response.data.accounts)) {
        accounts = response.data.accounts;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        accounts = response.data.data;
      }

      console.log('✅ Comptes extraits:', accounts.length);
      if (accounts.length > 0) {
        console.log('📋 Premier compte:', JSON.stringify(accounts[0], null, 2));
      }
      return accounts;
    } catch (error: unknown) {
      console.error('❌ Erreur lors de la récupération des comptes:', error);
      if (axios.isAxiosError(error)) {
        console.error('📋 Détails de l\'erreur:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        throw new Error(
          `Erreur Unipile: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Supprime un compte via son account_id
   */
  async deleteAccount(accountId: string): Promise<void> {
    try {
      console.log(`🗑️  Tentative de suppression du compte Unipile: ${accountId}`);
      const response = await axios.delete(
        `${API_BASE_URL}/accounts/${accountId}`,
        { headers: this.getHeaders() }
      );

      console.log(`✅ Compte supprimé de Unipile: ${accountId}`, {
        status: response.status,
        data: response.data,
      });
    } catch (error: unknown) {
      console.error(`❌ Erreur lors de la suppression du compte ${accountId}:`, error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        // Si le compte n'existe pas déjà (404), on considère que c'est OK
        if (status === 404) {
          console.warn(`⚠️  Compte ${accountId} non trouvé dans Unipile (déjà supprimé?)`);
          return;
        }
        throw new Error(
          `Erreur Unipile: ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }
}
