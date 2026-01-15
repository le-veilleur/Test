import React, { useEffect } from 'react';

interface ConnectedAccountProps {
  provider: 'gmail' | 'outlook' | 'instagram' | 'linkedin';
  email?: string;
  username?: string;
  onDisconnect: () => void;
}

const providerIcons: Record<string, { text: string; color: string }> = {
  gmail: { text: 'G', color: '#EA4335' },
  outlook: { text: 'O', color: '#0078D4' },
  instagram: { text: 'IG', color: '#E4405F' },
  linkedin: { text: 'in', color: '#0077B5' },
};

const providerNames: Record<string, string> = {
  gmail: 'Gmail',
  outlook: 'Outlook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

export const ConnectedAccount: React.FC<ConnectedAccountProps> = ({
  provider,
  email,
  username,
  onDisconnect,
}) => {
  const iconInfo = providerIcons[provider] || { text: '•', color: '#666' };
  
  // Pour les emails, afficher l'email, pour les réseaux sociaux, afficher @username
  const isEmailProvider = provider === 'gmail' || provider === 'outlook';
  const displayText = isEmailProvider 
    ? (email || `Compte ${providerNames[provider]}`)
    : (username ? `@${username}` : `Compte ${providerNames[provider]}`);

  // Log pour déboguer
  useEffect(() => {
    console.log(`🔍 ConnectedAccount [${provider}]:`, { email, username, displayText, isEmailProvider });
  }, [provider, email, username, displayText, isEmailProvider]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {/* Icône du provider */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#374151',
            flexShrink: 0,
          }}
        >
          {iconInfo.text}
        </div>
        
        {/* Email ou Username */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div 
            style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#111827',
              wordBreak: 'break-word',
            }}
          >
            {displayText}
          </div>
        </div>
        
        {/* Badge Connected */}
        <div
          style={{
            padding: '4px 12px',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            marginRight: '8px',
          }}
        >
          Connected
        </div>
        
        {/* Bouton de suppression */}
        <button
          onClick={onDisconnect}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#6b7280',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
          title="Déconnecter"
          aria-label="Déconnecter le compte"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
