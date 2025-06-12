import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api';

// Створюємо контекст для аутентифікації
const AuthContext = createContext();

// Хук для використання контексту аутентифікації
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Функція для очищення локальних даних при вході нового користувача
const clearUserSpecificData = () => {
  const keysToRemove = [
    'trips',
    'manualBirthdays',
    'timetableSchedule',
    'tasks',
    'events',
    'notes',
    'reminders'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

// Функція для створення ключа з ID користувача
const getUserKey = (userId, key) => {
  return userId ? `${userId}_${key}` : key;
};

// Функція для міграції даних до користувацького простору
const migrateDataToUser = (userId) => {
  const keysToMigrate = [
    'trips',
    'manualBirthdays',
    'timetableSchedule'
  ];
  
  keysToMigrate.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      // Зберігаємо дані з префіксом користувача
      localStorage.setItem(getUserKey(userId, key), data);
      // Видаляємо старі дані без префіксу
      localStorage.removeItem(key);
    }
  });
};

// Функція для завантаження даних користувача
const loadUserData = (userId) => {
  const keysToLoad = [
    'trips',
    'manualBirthdays',
    'timetableSchedule'
  ];
  
  keysToLoad.forEach(key => {
    const userData = localStorage.getItem(getUserKey(userId, key));
    if (userData) {
      // Завантажуємо дані користувача в загальний простір
      localStorage.setItem(key, userData);
    }
  });
};

// Функція для збереження даних користувача
const saveUserData = (userId) => {
  const keysToSave = [
    'trips',
    'manualBirthdays',
    'timetableSchedule'
  ];
  
  keysToSave.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      // Зберігаємо дані з префіксом користувача
      localStorage.setItem(getUserKey(userId, key), data);
    }
  });
};

// Провайдер аутентифікації
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Перевіряємо аутентифікацію при завантаженні
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        const userData = response.data.data;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Завантажуємо дані користувача
        loadUserData(userData.id);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Очищуємо локальні дані та завантажуємо дані користувача
      clearUserSpecificData();
      loadUserData(userData.id);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      
      localStorage.setItem('token', token);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Очищуємо локальні дані для нового користувача
      clearUserSpecificData();
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // Зберігаємо дані поточного користувача перед виходом
      if (user?.id) {
        saveUserData(user.id);
      }
      
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      
      // Очищуємо дані в загальному просторі
      clearUserSpecificData();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  // Автоматично зберігаємо дані користувача при зміні
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const handleBeforeUnload = () => {
        saveUserData(user.id);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Також зберігаємо дані кожні 30 секунд
      const interval = setInterval(() => {
        saveUserData(user.id);
      }, 30000);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, user?.id]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};