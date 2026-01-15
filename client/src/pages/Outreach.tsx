import React, { useEffect, useState } from 'react';
import { ConnectButton } from '../components/ConnectButton';
import { ConnectedAccount } from '../components/ConnectedAccount';
import { ProviderCard } from '../components/ProviderCard';
import { ApiService, AccountsStatus } from '../services/api.service';

const apiService = new ApiService();

export const Outreach: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountsStatus>({
    gmail: { connected: false },
    outlook: { connected: false },
    instagram: { connected: false },
    linkedin: { connected: false },
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAccountStatus();
    // Vérifier le statut toutes les 5 secondes (pour détecter les changements via webhook)
    const interval = setInterval(loadAccountStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAccountStatus = async () => {
    try {
      const accountStatus = await apiService.getAccountStatus();
      console.log('📊 Statut des comptes reçu:', accountStatus);
      setAccounts(accountStatus);
    } catch (error) {
      console.error('Erreur lors du chargement du statut:', error);
    }
  };

  const handleConnect = async (provider: keyof AccountsStatus) => {
    try {
      setLoading((prev) => ({ ...prev, [provider]: true }));
      const authUrl = await apiService.generateAuthLink(provider as 'gmail' | 'outlook' | 'instagram' | 'linkedin');
      // Rediriger vers l'URL d'authentification Unipile
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Erreur lors de la connexion ${provider}:`, error);
      alert(`Erreur lors de la connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleDisconnect = async (provider: keyof AccountsStatus) => {
    if (window.confirm(`Êtes-vous sûr de vouloir déconnecter votre compte ${provider} ?`)) {
      try {
        await apiService.disconnectAccount(provider);
        await loadAccountStatus();
      } catch (error) {
        console.error(`Erreur lors de la déconnexion ${provider}:`, error);
        alert(`Erreur lors de la déconnexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const emailAccounts = [
    { key: 'gmail' as const, label: 'Gmail' },
    { key: 'outlook' as const, label: 'Outlook' },
  ];

  const socialAccounts = [
    { key: 'instagram' as const, label: 'Instagram' },
    { key: 'linkedin' as const, label: 'LinkedIn' },
  ];

  const connectedEmailCount = emailAccounts.filter((acc) => accounts[acc.key].connected).length;
  const connectedSocialCount = socialAccounts.filter((acc) => accounts[acc.key].connected).length;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Connections
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Manage and sync outreach and campaign tracking across accounts.
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Outreach
        </h2>

        {/* Section Email */}
        <ProviderCard
          title="Email"
          description="Connect your email address to send messages and manage replies."
          icon="✉️"
          iconColor="#7c3aed"
        >
          {connectedEmailCount > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {emailAccounts.map((acc) => {
                const account = accounts[acc.key];
                if (account.connected) {
                  return (
                    <ConnectedAccount
                      key={acc.key}
                      provider={acc.key}
                      email={account.email}
                      username={account.username}
                      onDisconnect={() => handleDisconnect(acc.key)}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {emailAccounts.map((acc) => {
              const account = accounts[acc.key];
              if (!account.connected) {
                return (
                  <ConnectButton
                    key={acc.key}
                    provider={acc.key}
                    label={acc.label}
                    onClick={() => handleConnect(acc.key)}
                    isLoading={loading[acc.key]}
                  />
                );
              }
              return null;
            })}
          </div>
        </ProviderCard>

        {/* Section Social Media Inbox */}
        <ProviderCard
          title="Social Media Inbox"
          description="Connect your social media accounts to send direct messages and manage replies."
          icon="💬"
          iconColor="#7c3aed"
        >
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
            Your plan allows {socialAccounts.length} account{socialAccounts.length > 1 ? 's' : ''}. {connectedSocialCount}/{socialAccounts.length} account{socialAccounts.length > 1 ? 's' : ''} connected
          </div>
          {connectedSocialCount > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {socialAccounts.map((acc) => {
                const account = accounts[acc.key];
                if (account.connected) {
                  return (
                    <ConnectedAccount
                      key={acc.key}
                      provider={acc.key}
                      email={account.email}
                      username={account.username}
                      onDisconnect={() => handleDisconnect(acc.key)}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {socialAccounts.map((acc) => {
              const account = accounts[acc.key];
              if (!account.connected) {
                return (
                  <ConnectButton
                    key={acc.key}
                    provider={acc.key}
                    label={acc.label}
                    onClick={() => handleConnect(acc.key)}
                    isLoading={loading[acc.key]}
                  />
                );
              }
              return null;
            })}
          </div>
        </ProviderCard>
      </div>
    </div>
  );
};
