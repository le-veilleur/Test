import React from 'react';
import { Provider } from '../config/api';

interface ConnectButtonProps {
  provider: Provider;
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}

const providerIcons: Record<string, { text: string; color: string }> = {
  gmail: { text: 'G', color: '#EA4335' },
  outlook: { text: 'O', color: '#0078D4' },
  instagram: { text: 'IG', color: '#E4405F' },
  linkedin: { text: 'in', color: '#0077B5' },
};

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  provider,
  label,
  onClick,
  isLoading = false,
}) => {
  const iconInfo = providerIcons[provider] || { text: '•', color: '#666' };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '500',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        backgroundColor: 'white',
        color: '#374151',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.borderColor = '#9ca3af';
          e.currentTarget.style.backgroundColor = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.backgroundColor = 'white';
        }
      }}
    >
      <span
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: iconInfo.color,
        }}
      >
        {iconInfo.text}
      </span>
      <span>{isLoading ? 'Connexion...' : `Connect ${label} Account`}</span>
    </button>
  );
};
