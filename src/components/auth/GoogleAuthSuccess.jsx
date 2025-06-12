import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const GoogleAuthSuccess = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      // Отримуємо токен з URL параметрів
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Зберігаємо токен
        localStorage.setItem('token', token);
        
        // Перевіряємо аутентифікацію
        await checkAuth();
        
        // Перенаправляємо на головну сторінку
        navigate('/');
      } else {
        // Якщо токена немає, перенаправляємо на головну з помилкою
        navigate('/?error=auth_failed');
      }
    };

    handleGoogleAuth();
  }, [checkAuth, navigate]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;