import React from 'react';

interface ProviderCardProps {
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
  children: React.ReactNode;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  title,
  description,
  icon,
  iconColor = '#7c3aed',
  children,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
            }}
          >
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
};
