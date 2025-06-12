import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../ui/notification';

const GoogleAuthSuccess = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = React.useState(null);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

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
        
        // Показуємо повідомлення про успіх
        showNotification('success', 'Successfully signed in with Google');
        
        // Перенаправляємо на головну сторінку
        navigate('/');
      } else {
        // Якщо токена немає, перенаправляємо на головну з помилкою
        showNotification('error', 'Authentication failed');
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
      
      {/* Notification */}
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default GoogleAuthSuccess;