import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI, usersAPI } from '../services/api';
import { toast } from 'react-hot-toast';

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

// Функція для очищення всіх локальних даних
const clearAllLocalData = () => {
  const keysToRemove = [
    'trips',
    'manualBirthdays',
    'timetableSchedule',
    'tasks',
    'events',
    'notes',
    'reminders',
    'accentColor',
    'backgroundGif',
    'language',
    'notifications',
    'todaysNotes'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Також очищуємо всі ключі з префіксом user_
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('user_')) {
      localStorage.removeItem(key);
    }
  });
};

// Функція для створення ключа з ID користувача
const getUserKey = (userId, key) => {
  return userId ? `user_${userId}_${key}` : key;
};

// Функція для збереження даних користувача
const saveUserData = (userId) => {
  if (!userId) return;
  
  const keysToSave = [
    'trips',
    'manualBirthdays',
    'timetableSchedule',
    'todaysNotes',
    'accentColor',
    'backgroundGif',
    'tasks'
  ];
  
  keysToSave.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      // Зберігаємо дані з префіксом користувача
      localStorage.setItem(getUserKey(userId, key), data);
    }
  });
};

// Функція для завантаження даних користувача
const loadUserData = (userId) => {
  if (!userId) return;
  
  // Спочатку очищуємо поточні дані
  clearAllLocalData();
  
  const keysToLoad = [
    'trips',
    'manualBirthdays',
    'timetableSchedule',
    'todaysNotes',
    'accentColor',
    'backgroundGif',
    'tasks'
  ];
  
  keysToLoad.forEach(key => {
    const userData = localStorage.getItem(getUserKey(userId, key));
    if (userData) {
      // Завантажуємо дані користувача
      localStorage.setItem(key, userData);
      
      // Якщо це налаштування теми, застосовуємо їх
      if (key === 'accentColor') {
        document.documentElement.style.setProperty('--accent-color', userData);
      }
    } else {
      // Якщо даних немає, створюємо порожні структури
      switch (key) {
        case 'trips':
          localStorage.setItem(key, JSON.stringify([]));
          break;
        case 'manualBirthdays':
          localStorage.setItem(key, JSON.stringify([]));
          break;
        case 'timetableSchedule':
          localStorage.setItem(key, JSON.stringify({
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
          }));
          break;
        case 'todaysNotes':
          localStorage.setItem(key, JSON.stringify([]));
          break;
        case 'accentColor':
          localStorage.setItem(key, '#97e7aa');
          document.documentElement.style.setProperty('--accent-color', '#97e7aa');
          break;
        case 'backgroundGif':
          localStorage.setItem(key, 'Green.gif');
          break;
        case 'tasks':
          localStorage.setItem(key, JSON.stringify([]));
          break;
        default:
          localStorage.setItem(key, JSON.stringify([]));
      }
    }
  });
  
  // Після завантаження даних, оновлюємо тему
  const accentColor = localStorage.getItem('accentColor');
  const backgroundGif = localStorage.getItem('backgroundGif');
  
  if (accentColor && backgroundGif) {
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { accentColor, backgroundGif } 
    }));
  }
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
      } else {
        // Якщо токена немає, очищуємо всі дані
        clearAllLocalData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      clearAllLocalData();
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
      
      // Завантажуємо дані користувача
      loadUserData(userData.id);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed');
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
      
      // Для нового користувача створюємо порожні структури даних
      loadUserData(newUser.id);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
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
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      
      // Очищуємо всі дані
      clearAllLocalData();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // If there's an avatar in the form data, it's handled separately
      if (profileData.avatar && profileData.avatar instanceof File) {
        const formData = new FormData();
        formData.append('avatar', profileData.avatar);
        
        const avatarResponse = await usersAPI.uploadAvatar(formData);
        profileData.avatar = avatarResponse.data.avatarUrl;
      }
      
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
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