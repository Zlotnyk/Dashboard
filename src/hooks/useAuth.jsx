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
    'tasks'
  ];
  
  keysToLoad.forEach(key => {
    const userData = localStorage.getItem(getUserKey(userId, key));
    if (userData) {
      // Завантажуємо дані користувача
      localStorage.setItem(key, userData);
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
        case 'tasks':
          localStorage.setItem(key, JSON.stringify([]));
          break;
        default:
          localStorage.setItem(key, JSON.stringify([]));
      }
    }
  });
};

// Провайдер аутентифікації
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState({
    accentColor: localStorage.getItem('accentColor') || '#97e7aa',
    backgroundGif: localStorage.getItem('backgroundGif') || 'Green.gif'
  });

  // Встановлюємо CSS змінну при ініціалізації
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    
    // Надсилаємо подію для GifContainer
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { 
        accentColor: theme.accentColor, 
        backgroundGif: theme.backgroundGif 
      } 
    }));
  }, [theme]);

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
        
        // Зберігаємо поточні налаштування теми
        const currentAccentColor = localStorage.getItem('accentColor') || '#97e7aa';
        const currentBackgroundGif = localStorage.getItem('backgroundGif') || 'Green.gif';
        
        // Оновлюємо стан теми
        setTheme({
          accentColor: currentAccentColor,
          backgroundGif: currentBackgroundGif
        });
      } else {
        // Якщо токена немає, очищуємо всі дані
        clearAllLocalData();
        
        // Але зберігаємо поточні налаштування теми
        const currentAccentColor = localStorage.getItem('accentColor') || '#97e7aa';
        const currentBackgroundGif = localStorage.getItem('backgroundGif') || 'Green.gif';
        
        localStorage.setItem('accentColor', currentAccentColor);
        localStorage.setItem('backgroundGif', currentBackgroundGif);
        
        setTheme({
          accentColor: currentAccentColor,
          backgroundGif: currentBackgroundGif
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      clearAllLocalData();
      
      // Зберігаємо поточні налаштування теми
      const currentAccentColor = localStorage.getItem('accentColor') || '#97e7aa';
      const currentBackgroundGif = localStorage.getItem('backgroundGif') || 'Green.gif';
      
      localStorage.setItem('accentColor', currentAccentColor);
      localStorage.setItem('backgroundGif', currentBackgroundGif);
      
      setTheme({
        accentColor: currentAccentColor,
        backgroundGif: currentBackgroundGif
      });
    } finally {
      setLoading(false);
    }
  };

  const updateThemeSettings = (newTheme) => {
    // Оновлюємо стан
    setTheme(newTheme);
    
    // Зберігаємо в localStorage
    localStorage.setItem('accentColor', newTheme.accentColor);
    localStorage.setItem('backgroundGif', newTheme.backgroundGif);
    
    // Оновлюємо CSS змінну
    document.documentElement.style.setProperty('--accent-color', newTheme.accentColor);
    
    // Надсилаємо подію для GifContainer
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { 
        accentColor: newTheme.accentColor, 
        backgroundGif: newTheme.backgroundGif 
      } 
    }));
    
    // Якщо користувач авторизований, зберігаємо налаштування на сервері
    if (isAuthenticated && user?.id) {
      try {
        usersAPI.updatePreferences({
          theme: {
            accentColor: newTheme.accentColor,
            backgroundGif: newTheme.backgroundGif
          }
        });
      } catch (error) {
        console.error('Failed to save theme preferences to server:', error);
      }
    }
    
    return true;
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      // Зберігаємо поточні налаштування теми
      const currentTheme = { ...theme };
      
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Завантажуємо дані користувача
      loadUserData(userData.id);
      
      // Відновлюємо налаштування теми
      localStorage.setItem('accentColor', currentTheme.accentColor);
      localStorage.setItem('backgroundGif', currentTheme.backgroundGif);
      
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
      
      // Зберігаємо поточні налаштування теми
      const currentTheme = { ...theme };
      
      localStorage.setItem('token', token);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Для нового користувача створюємо порожні структури даних
      loadUserData(newUser.id);
      
      // Відновлюємо налаштування теми
      localStorage.setItem('accentColor', currentTheme.accentColor);
      localStorage.setItem('backgroundGif', currentTheme.backgroundGif);
      
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
      
      // Зберігаємо поточні налаштування теми
      const currentTheme = { ...theme };
      
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
      
      // Відновлюємо налаштування теми
      localStorage.setItem('accentColor', currentTheme.accentColor);
      localStorage.setItem('backgroundGif', currentTheme.backgroundGif);
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
    checkAuth,
    theme,
    updateThemeSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};