import axios from 'axios';

// Базова конфігурація API
const API_BASE_URL = 'http://localhost:5000/api';

// Створюємо екземпляр axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Інтерцептор для додавання токена до запитів
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Інтерцептор для обробки відповідей
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Якщо токен недійсний, видаляємо його
      localStorage.removeItem('token');
      // Не перенаправляємо автоматично, щоб не порушити UX
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Реєстрація
  register: (userData) => api.post('/auth/register', userData),
  
  // Логін
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Логаут
  logout: () => api.post('/auth/logout'),
  
  // Отримати поточного користувача
  getMe: () => api.get('/auth/me'),
  
  // Оновити профіль
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  
  // Змінити пароль
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  
  // Google OAuth
  googleAuth: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }
};

// Tasks API
export const tasksAPI = {
  // Отримати всі завдання
  getTasks: (params = {}) => api.get('/tasks', { params }),
  
  // Отримати завдання за ID
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // Створити завдання
  createTask: (taskData) => api.post('/tasks', taskData),
  
  // Оновити завдання
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  
  // Видалити завдання
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  
  // Отримати сьогоднішні завдання
  getTodaysTasks: () => api.get('/tasks/today'),
  
  // Отримати активні завдання
  getActiveTasks: () => api.get('/tasks/active'),
  
  // Позначити завдання як виконане
  completeTask: (id) => api.put(`/tasks/${id}/complete`),
  
  // Отримати статистику завдань
  getTaskStats: () => api.get('/tasks/stats')
};

// Events API
export const eventsAPI = {
  // Отримати всі події
  getEvents: (params = {}) => api.get('/events', { params }),
  
  // Створити подію
  createEvent: (eventData) => api.post('/events', eventData),
  
  // Оновити подію
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  
  // Видалити подію
  deleteEvent: (id) => api.delete(`/events/${id}`),
  
  // Отримати майбутні події
  getUpcomingEvents: () => api.get('/events/upcoming')
};

// Birthdays API
export const birthdaysAPI = {
  // Отримати всі дні народження
  getBirthdays: () => api.get('/birthdays'),
  
  // Створити день народження
  createBirthday: (birthdayData) => api.post('/birthdays', birthdayData),
  
  // Оновити день народження
  updateBirthday: (id, birthdayData) => api.put(`/birthdays/${id}`, birthdayData),
  
  // Видалити день народження
  deleteBirthday: (id) => api.delete(`/birthdays/${id}`),
  
  // Отримати майбутні дні народження
  getUpcomingBirthdays: () => api.get('/birthdays/upcoming')
};

// Trips API
export const tripsAPI = {
  // Отримати всі поїздки
  getTrips: () => api.get('/trips'),
  
  // Створити поїздку
  createTrip: (tripData) => api.post('/trips', tripData),
  
  // Оновити поїздку
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  
  // Видалити поїздку
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  
  // Отримати майбутні поїздки
  getUpcomingTrips: () => api.get('/trips/upcoming')
};

// Reminders API
export const remindersAPI = {
  // Отримати всі нагадування
  getReminders: () => api.get('/reminders'),
  
  // Створити нагадування
  createReminder: (reminderData) => api.post('/reminders', reminderData),
  
  // Оновити нагадування
  updateReminder: (id, reminderData) => api.put(`/reminders/${id}`, reminderData),
  
  // Видалити нагадування
  deleteReminder: (id) => api.delete(`/reminders/${id}`),
  
  // Отримати термінові нагадування
  getUrgentReminders: () => api.get('/reminders/urgent'),
  
  // Позначити нагадування як виконане
  completeReminder: (id) => api.put(`/reminders/${id}/complete`)
};

// Notes API
export const notesAPI = {
  // Отримати всі нотатки
  getNotes: () => api.get('/notes'),
  
  // Створити нотатку
  createNote: (noteData) => api.post('/notes', noteData),
  
  // Оновити нотатку
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  
  // Видалити нотатку
  deleteNote: (id) => api.delete(`/notes/${id}`),
  
  // Отримати сьогоднішні нотатки
  getTodaysNotes: () => api.get('/notes/today'),
  
  // Пошук нотаток
  searchNotes: (query) => api.get('/notes/search', { params: { q: query } })
};

// Users API
export const usersAPI = {
  // Отримати налаштування користувача
  getPreferences: () => api.get('/users/preferences'),
  
  // Оновити налаштування користувача
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  
  // Отримати статистику користувача
  getUserStats: () => api.get('/users/stats'),
  
  // Видалити акаунт
  deleteAccount: () => api.delete('/users/account')
};

export default api;