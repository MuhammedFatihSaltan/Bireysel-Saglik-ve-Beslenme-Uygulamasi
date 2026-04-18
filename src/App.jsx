import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './login/AuthPage';
import HomePage from './home/HomePage';
import ProfilePage from './profile/ProfilePage';
import SaglikTakipPage from './saglik_takip/SaglikTakipPage';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-white">Yükleniyor...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Navigate to="/home" replace /> : <AuthPage />} 
        />
        <Route 
          path="/home" 
          element={session ? <HomePage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/profile" 
          element={session ? <ProfilePage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/saglik-takip" 
          element={session ? <SaglikTakipPage /> : <Navigate to="/" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
