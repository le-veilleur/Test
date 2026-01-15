import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Outreach } from './pages/Outreach';
import { AuthSuccess } from './pages/AuthSuccess';
import { AuthFailure } from './pages/AuthFailure';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Outreach />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/failure" element={<AuthFailure />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
