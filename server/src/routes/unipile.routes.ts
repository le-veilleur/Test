import { Router } from 'express';
import { UnipileService } from '../services/unipile.service.js';
import { PROVIDERS, Provider, PROVIDER_DISPLAY_NAMES } from '../config/unipile.js';

const router = Router();
const unipileService = new UnipileService();

// Mapping frontend -> API
const FRONTEND_TO_API: Record<string, Provider> = {
  gmail: PROVIDERS.GMAIL,
  outlook: PROVIDERS.OUTLOOK,
  instagram: PROVIDERS.INSTAGRAM,
  linkedin: PROVIDERS.LINKEDIN,
};

// Mapping API -> frontend
const API_TO_FRONTEND: Record<string, string> = {
  GOOGLE: 'gmail',
  MICROSOFT: 'outlook',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
};

// Stockage simple en mémoire (en production, utiliser une DB)
interface ConnectedAccount {
  accountId: string;
  provider: Provider;
  status: string;
  email?: string;
  username?: string;
}
const connectedAccounts = new Map<string, ConnectedAccount>();

/**
 * POST /api/unipile/auth-link
 * Génère un lien d'authentification pour un provider
 */
router.post('/auth-link', async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider || !FRONTEND_TO_API[provider]) {
      return res.status(400).json({ error: 'Provider invalide' });
    }

    const apiProvider = FRONTEND_TO_API[provider];
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const notifyUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/unipile/webhook`;
    const successRedirectUrl = `${baseUrl}/auth/success?provider=${provider}`;
    const failureRedirectUrl = `${baseUrl}/auth/failure?provider=${provider}`;

    const authUrl = await unipileService.generateAuthLink(
      apiProvider,
      notifyUrl,
      successRedirectUrl,
      failureRedirectUrl
    );

    res.json({ auth_url: authUrl });
  } catch (error) {
    console.error('Erreur auth-link:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur serveur',
    });
  }
});

/**
 * POST /api/unipile/webhook
 * Reçoit les callbacks Unipile après connexion OAuth
 */
router.post('/webhook', async (req, res) => {
  try {
    const { account_id, provider, status, username, email } = req.body;

    console.log('Webhook reçu:', { account_id, provider, status, username, email });

    if (account_id && provider) {
      // Normaliser le provider (gérer GOOGLE_OAUTH, MICROSOFT_OAUTH, etc.)
      let normalizedProvider = provider;
      if (provider.includes('GOOGLE')) {
        normalizedProvider = 'GOOGLE';
      } else if (provider.includes('MICROSOFT')) {
        normalizedProvider = 'MICROSOFT';
      }
      
      // Convertir le provider API en nom frontend pour le stockage
      const frontendProvider = API_TO_FRONTEND[normalizedProvider] || API_TO_FRONTEND[provider] || provider.toLowerCase();
      
      console.log('🔄 Normalisation du provider:', {
        original: provider,
        normalized: normalizedProvider,
        frontendProvider,
      });
      
      // Récupérer les détails du compte depuis l'API Unipile
      try {
        const accountDetails = await unipileService.getAccount(account_id);
        
        // Extraire l'email depuis différents champs possibles
        const extractedEmail = 
          accountDetails.email || 
          accountDetails.profile?.email || 
          accountDetails.address || 
          accountDetails.name || 
          email;
        
        // Extraire le username depuis différents champs possibles
        const extractedUsername = 
          accountDetails.username || 
          accountDetails.profile?.username || 
          accountDetails.profile?.name || 
          username;
        
        console.log('💾 Stockage du compte:', {
          frontendProvider,
          accountId: account_id,
          email: extractedEmail,
          username: extractedUsername,
        });
        
        connectedAccounts.set(frontendProvider, {
          accountId: account_id,
          provider: provider as Provider,
          status: status || 'connected',
          email: extractedEmail,
          username: extractedUsername,
        });
      } catch (error) {
        console.warn('⚠️ Impossible de récupérer les détails du compte, utilisation des données du webhook:', error);
        // Si l'API échoue, stocker quand même les infos du webhook
        connectedAccounts.set(frontendProvider, {
          accountId: account_id,
          provider: provider as Provider,
          status: status || 'connected',
          email: email,
          username: username,
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
});

/**
 * GET /api/unipile/account-status
 * Récupère le statut de connexion pour tous les providers avec leurs détails
 */
router.get('/account-status', async (req, res) => {
  try {
    const accounts: Record<string, { connected: boolean; email?: string; username?: string; accountId?: string }> = {
      gmail: { connected: false },
      outlook: { connected: false },
      instagram: { connected: false },
      linkedin: { connected: false },
    };

    // Vérifier les comptes stockés
    for (const [provider, account] of connectedAccounts.entries()) {
      if (account.status === 'connected' && accounts[provider]) {
        accounts[provider] = {
          connected: true,
          email: account.email,
          username: account.username,
          accountId: account.accountId,
        };
      }
    }

    // Vérifier aussi via l'API Unipile pour plus de précision et récupérer les détails
    try {
      const unipileAccounts = await unipileService.listAccounts();
      console.log('📋 Comptes récupérés depuis Unipile:', unipileAccounts);
      
      unipileAccounts.forEach((account) => {
        // Utiliser type si provider n'existe pas (format Unipile)
        const accountType = account.type || account.provider;
        const accountId = account.id || account.account_id;
        
        console.log('🔍 Traitement du compte:', {
          accountId,
          type: account.type,
          provider: account.provider,
          name: account.name,
          connection_params: account.connection_params,
        });
        
        // Mapper le type Unipile vers notre format
        // GOOGLE_OAUTH -> GOOGLE, MICROSOFT_OAUTH -> MICROSOFT, etc.
        let mappedProvider = accountType;
        if (accountType === 'GOOGLE_OAUTH') {
          mappedProvider = 'GOOGLE';
        } else if (accountType === 'MICROSOFT_OAUTH') {
          mappedProvider = 'MICROSOFT';
        } else if (accountType?.startsWith('GOOGLE')) {
          mappedProvider = 'GOOGLE';
        } else if (accountType?.startsWith('MICROSOFT')) {
          mappedProvider = 'MICROSOFT';
        }
        
        // Essayer plusieurs formats de provider
        const providerUpper = mappedProvider ? mappedProvider.toUpperCase() : undefined;
        const providerLower = mappedProvider ? mappedProvider.toLowerCase() : undefined;
        const frontendProvider = (mappedProvider && API_TO_FRONTEND[mappedProvider]) || 
                                 (providerUpper && API_TO_FRONTEND[providerUpper]) ||
                                 (providerLower && API_TO_FRONTEND[providerLower]);
        
        console.log('🔗 Mapping provider:', {
          accountType,
          mappedProvider,
          providerUpper,
          frontendProvider,
          availableMappings: Object.entries(API_TO_FRONTEND),
        });
        
        if (frontendProvider && accounts[frontendProvider]) {
          // Extraire l'email depuis différents champs possibles
          const extractedEmail = 
            account.email || 
            account.name || // Le name contient l'email pour Gmail
            account.connection_params?.mail?.id ||
            account.connection_params?.mail?.username ||
            account.profile?.email || 
            account.address;
          
          // Extraire le username depuis différents champs possibles
          const extractedUsername = 
            account.username || 
            account.connection_params?.mail?.username ||
            account.profile?.username || 
            account.profile?.name;
          
          console.log('✅ Compte mappé:', {
            frontendProvider,
            email: extractedEmail,
            username: extractedUsername,
            accountId,
          });
          
          accounts[frontendProvider] = {
            connected: true,
            email: extractedEmail,
            username: extractedUsername,
            accountId: accountId,
          };
          
          // Mettre à jour le stockage local
          if (accountId && mappedProvider) {
            connectedAccounts.set(frontendProvider, {
              accountId: accountId,
              provider: mappedProvider as Provider,
              status: account.status || 'connected',
              email: extractedEmail,
              username: extractedUsername,
            });
          }
        }
      });
    } catch (error) {
      console.warn('Impossible de récupérer les comptes via API:', error);
    }
    
    console.log('📤 Envoi du statut des comptes:', accounts);

    res.json({ accounts });
  } catch (error) {
    console.error('Erreur account-status:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur serveur',
    });
  }
});

/**
 * DELETE /api/unipile/disconnect/:provider
 * Déconnecte un compte
 */
router.delete('/disconnect/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    console.log(`🔴 Demande de déconnexion reçue pour: ${provider}`);
    console.log(`📦 Comptes actuellement stockés:`, Array.from(connectedAccounts.keys()));
    
    if (!FRONTEND_TO_API[provider]) {
      console.error(`❌ Provider invalide: ${provider}`);
      return res.status(400).json({ error: 'Provider invalide' });
    }

    // Récupérer le compte avant de le supprimer pour avoir l'accountId
    const account = connectedAccounts.get(provider);
    console.log(`🔍 Compte trouvé dans le stockage:`, account ? { accountId: account.accountId, provider: account.provider } : 'aucun');

    // Supprimer le compte via l'API Unipile si on a l'accountId
    if (account?.accountId) {
      try {
        await unipileService.deleteAccount(account.accountId);
        console.log(`✅ Compte ${provider} supprimé de Unipile: ${account.accountId}`);
      } catch (error) {
        console.warn(`⚠️  Erreur lors de la suppression Unipile (on continue quand même):`, error);
        // On continue même si la suppression Unipile échoue
      }
    } else {
      console.warn(`⚠️  Aucun accountId trouvé pour ${provider}, suppression uniquement du stockage local`);
    }

    // Supprimer du stockage local
    const deleted = connectedAccounts.delete(provider);
    console.log(`🗑️  Suppression du stockage local pour ${provider}: ${deleted ? 'réussie' : 'échec (non trouvé)'}`);
    console.log(`📦 Comptes restants:`, Array.from(connectedAccounts.keys()));

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur disconnect:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur serveur',
    });
  }
});

export default router;
