import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const AuthFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const provider = searchParams.get('provider');

  useEffect(() => {
    // Attendre 3 secondes puis rediriger vers la page principale
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

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
      <div style={{ fontSize: '48px', color: '#dc3545' }}>✗</div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#dc3545' }}>
        Échec de la connexion
      </h2>
      {provider && (
        <p style={{ color: '#666' }}>
          La connexion de votre compte {provider} a échoué.
        </p>
      )}
      <p style={{ color: '#999', fontSize: '14px' }}>
        Redirection en cours...
      </p>
    </div>
  );
};
