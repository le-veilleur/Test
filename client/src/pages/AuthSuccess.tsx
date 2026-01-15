import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const AuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const provider = searchParams.get('provider');

  useEffect(() => {
    // Attendre 2 secondes puis rediriger vers la page principale
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '16px'
    }}>
      <div style={{ fontSize: '48px' }}>✓</div>
      <h2 style={{ fontSize: '24px', fontWeight: '600' }}>
        Connexion réussie !
      </h2>
      {provider && (
        <p style={{ color: '#666' }}>
          Votre compte {provider} a été connecté avec succès.
        </p>
      )}
      <p style={{ color: '#999', fontSize: '14px' }}>
        Redirection en cours...
      </p>
    </div>
  );
};
