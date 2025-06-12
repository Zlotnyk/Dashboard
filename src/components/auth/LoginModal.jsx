import React, { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, showNotification }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищуємо помилки при введенні
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    
    if (result.success) {
      onClose();
      setFormData({ email: '', password: '' });
      setErrors({});
      if (showNotification) {
        showNotification('success', 'Logged in successfully');
      }
    } else {
      setErrors({ general: result.error });
      if (showNotification) {
        showNotification('error', result.error || 'Login failed');
      }
    }
  };

  const handleGoogleLogin = () => {
    // Перенаправляємо на Google OAuth
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop 
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel 
            transition
            className="relative transform overflow-hidden rounded-xl bg-[#1a1a1a] border border-gray-700 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <DialogTitle className="text-xl font-semibold text-white">
                  Sign In
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400" />
                    <span className="text-red-400 text-sm">{errors.general}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b-2 transition-colors ${
                      errors.email ? 'border-red-400' : 'border-gray-600 focus:border-transparent'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <span className="text-red-400 text-sm mt-1">{errors.email}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-3 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-accent border-b-2 transition-colors ${
                      errors.password ? 'border-red-400' : 'border-gray-600 focus:border-transparent'
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <span className="text-red-400 text-sm mt-1">{errors.password}</span>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white rounded-lg hover:opacity-80 transition-colors font-medium mt-6 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1a1a1a] text-gray-400">Or continue with</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Don't have an account?{' '}
                <button 
                  onClick={onSwitchToRegister}
                  className="hover:underline transition-colors"
                  style={{ color: 'var(--accent-color)' }}
                >
                  Sign up
                </button>
              </p>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default LoginModal;