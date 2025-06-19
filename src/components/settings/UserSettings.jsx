import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, Upload, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usersAPI } from '../../services/api';

const UserSettings = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    avatar: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Theme settings state
  const [themeSettings, setThemeSettings] = useState({
    accentColor: '#97e7aa',
    backgroundGif: 'Green.gif'
  });

  // Color options
  const colorOptions = [
    { name: 'Green', value: '#97e7aa', gif: 'Green.gif' },
    { name: 'Purple', value: '#a855f7', gif: 'Purple.gif' },
    { name: 'Blue', value: '#3b82f6', gif: 'Blue.gif' },
    { name: 'Red', value: '#ef4444', gif: 'Red.gif' },
    { name: 'Orange', value: '#f97316', gif: 'Orange.gif' },
    { name: 'Pink', value: '#ec4899', gif: 'Pink.gif' }
  ];

  // Load user data when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        title: user.title || '',
        avatar: null
      });
      setPreviewUrl(user.avatar || '');
      
      // Load theme settings from localStorage or user preferences
      const savedAccentColor = localStorage.getItem('accentColor') || user.preferences?.theme?.accentColor || '#97e7aa';
      const savedBackgroundGif = localStorage.getItem('backgroundGif') || user.preferences?.theme?.backgroundGif || 'Green.gif';
      
      setThemeSettings({
        accentColor: savedAccentColor,
        backgroundGif: savedBackgroundGif
      });
    }
  }, [user, isOpen]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' });
    
    if (tab === 'security') {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    setFormData(prev => ({ ...prev, avatar: file }));
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // If there's an avatar file, upload it first
      let avatarUrl = user?.avatar;
      
      if (formData.avatar) {
        const formDataObj = new FormData();
        formDataObj.append('avatar', formData.avatar);
        
        const response = await usersAPI.uploadAvatar(formDataObj);
        avatarUrl = response.data.avatarUrl;
      }

      // Update profile with new data
      const profileData = {
        name: formData.name,
        title: formData.title,
        ...(avatarUrl && { avatar: avatarUrl })
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };
  
  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'An error occurred while changing password' });
    } finally {
      setLoading(false);
    }
  };
  
  // Theme settings handlers
  const handleColorChange = (color, gif) => {
    setThemeSettings({
      accentColor: color,
      backgroundGif: gif
    });
  };
  
  const saveThemeSettings = () => {
    // Save to localStorage
    localStorage.setItem('accentColor', themeSettings.accentColor);
    localStorage.setItem('backgroundGif', themeSettings.backgroundGif);
    
    // Update CSS variable
    document.documentElement.style.setProperty('--accent-color', themeSettings.accentColor);
    
    // Dispatch custom event to notify GifContainer
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { 
        accentColor: themeSettings.accentColor, 
        backgroundGif: themeSettings.backgroundGif 
      } 
    }));
    
    // Show success message
    setMessage({ type: 'success', text: 'Theme settings saved successfully' });
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
            className="relative transform overflow-hidden rounded-xl bg-[#1a1a1a] border border-gray-700 text-left shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="bg-[#1a1a1a] px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <DialogTitle className="text-xl font-semibold text-white">
                  Settings
                </DialogTitle>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <div className="w-1/4 pr-4 border-r border-gray-700">
                  <nav className="space-y-1">
                    <button
                      onClick={() => handleTabChange('general')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === 'general' 
                          ? 'bg-accent text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      General
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('security')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === 'security' 
                          ? 'bg-accent text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Security
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('notifications')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === 'notifications' 
                          ? 'bg-accent text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Notifications
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('appearance')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === 'appearance' 
                          ? 'bg-accent text-white' 
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.5 11.5L17.5 3.5C18.3284 2.67157 19.6716 2.67157 20.5 3.5C21.3284 4.32843 21.3284 5.67157 20.5 6.5L12.5 14.5L8 16L9.5 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Appearance
                    </button>
                  </nav>
                </div>

                {/* Content */}
                <div className="w-3/4 pl-6">
                  {/* General Tab */}
                  {activeTab === 'general' && (
                    <div>
                      <h3 className="text-white font-medium mb-6">Profile Settings</h3>
                      
                      {message.text && (
                        <div className={`mb-4 p-3 rounded-lg ${
                          message.type === 'success' 
                            ? 'bg-green-900/20 border border-green-700/30 text-green-400' 
                            : 'bg-red-900/20 border border-red-700/30 text-red-400'
                        }`}>
                          <div className="flex items-center gap-2">
                            {message.type === 'success' ? (
                              <Check size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                            <span>{message.text}</span>
                          </div>
                        </div>
                      )}
                      
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-white font-medium mb-4">Profile Picture</h4>
                            <div className="flex items-center gap-4">
                              <div 
                                className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-700 cursor-pointer"
                                onClick={handleAvatarClick}
                              >
                                {previewUrl ? (
                                  <img 
                                    src={previewUrl} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User size={32} />
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <p className="text-gray-400 text-sm mb-2">
                                  JPG, PNG or GIF. Max size 5MB.
                                </p>
                                <button
                                  type="button"
                                  onClick={handleAvatarClick}
                                  className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                                >
                                  <Upload size={14} />
                                  Upload
                                </button>
                                <input 
                                  type="file"
                                  ref={fileInputRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              readOnly
                              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-400 focus:outline-none cursor-not-allowed"
                            />
                            <p className="text-gray-500 text-xs mt-1">
                              Email cannot be changed
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Title
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              placeholder="e.g. Student, Teacher, Developer"
                              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            />
                          </div>
                          
                          <div className="pt-4">
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div>
                      <h3 className="text-white font-medium mb-6">Security Settings</h3>
                      
                      {message.text && (
                        <div className={`mb-4 p-3 rounded-lg ${
                          message.type === 'success' 
                            ? 'bg-green-900/20 border border-green-700/30 text-green-400' 
                            : 'bg-red-900/20 border border-red-700/30 text-red-400'
                        }`}>
                          <div className="flex items-center gap-2">
                            {message.type === 'success' ? (
                              <Check size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                            <span>{message.text}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-[#2a2a2a] rounded-lg p-4 mb-6">
                        <h4 className="text-white font-medium mb-4">Change Password</h4>
                        
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                                  passwordErrors.currentPassword ? 'border-red-400' : ''
                                }`}
                                placeholder="Enter your current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {passwordErrors.currentPassword && (
                              <span className="text-red-400 text-sm mt-1">{passwordErrors.currentPassword}</span>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                                  passwordErrors.newPassword ? 'border-red-400' : ''
                                }`}
                                placeholder="Enter your new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {passwordErrors.newPassword && (
                              <span className="text-red-400 text-sm mt-1">{passwordErrors.newPassword}</span>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`w-full px-3 py-2 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                                  passwordErrors.confirmPassword ? 'border-red-400' : ''
                                }`}
                                placeholder="Confirm your new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                              <span className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword}</span>
                            )}
                          </div>
                          
                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                          </div>
                        </form>
                      </div>
                      
                      <div className="bg-[#2a2a2a] rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Two-Factor Authentication</h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Add an extra layer of security to your account.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Status: <span className="text-yellow-400">Not Enabled</span></span>
                          <button
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div>
                      <h3 className="text-white font-medium mb-6">Notification Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Exam Reminders</h4>
                            <p className="text-gray-400 text-sm">
                              Get notified about upcoming exams
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Assignment Reminders</h4>
                            <p className="text-gray-400 text-sm">
                              Get notified about upcoming assignments
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Birthday Reminders</h4>
                            <p className="text-gray-400 text-sm">
                              Get notified about upcoming birthdays
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">Email Notifications</h4>
                            <p className="text-gray-400 text-sm">
                              Receive notifications via email
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appearance Tab */}
                  {activeTab === 'appearance' && (
                    <div>
                      <h3 className="text-white font-medium mb-6">Appearance Settings</h3>
                      
                      {message.text && (
                        <div className={`mb-4 p-3 rounded-lg ${
                          message.type === 'success' 
                            ? 'bg-green-900/20 border border-green-700/30 text-green-400' 
                            : 'bg-red-900/20 border border-red-700/30 text-red-400'
                        }`}>
                          <div className="flex items-center gap-2">
                            {message.type === 'success' ? (
                              <Check size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                            <span>{message.text}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Theme Section */}
                      <div className="mb-6">
                        <h4 className="text-white font-medium mb-3">Theme</h4>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="theme" 
                              value="dark" 
                              checked={true}
                              readOnly
                              style={{ accentColor: 'var(--accent-color)' }}
                            />
                            <span className="text-gray-300">Dark</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="theme" 
                              value="light" 
                              disabled
                              className="opacity-50"
                              style={{ accentColor: 'var(--accent-color)' }}
                            />
                            <span className="text-gray-500">Light (in development)</span>
                          </label>
                        </div>
                      </div>

                      {/* Accent Color Section */}
                      <div className="mb-6">
                        <h4 className="text-white font-medium mb-3">Accent Color & Background</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => handleColorChange(color.value, color.gif)}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all hover:scale-105 ${
                                themeSettings.accentColor === color.value 
                                  ? 'border-white bg-gray-800 shadow-lg' 
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              <div 
                                className="w-4 h-4 rounded-full shadow-inner"
                                style={{ backgroundColor: color.value }}
                              />
                              <span className="text-gray-300 text-sm">{color.name}</span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-gray-400">
                          Current background: {themeSettings.backgroundGif}
                        </div>
                      </div>

                      {/* Language Section */}
                      <div>
                        <h4 className="text-white font-medium mb-3">Language</h4>
                        <select 
                          className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg text-white p-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                          <option value="English">English</option>
                          <option value="Ukrainian">Ukrainian (в розробці)</option>
                        </select>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={saveThemeSettings}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-80 transition-colors"
                        >
                          Save Appearance Settings
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

// Add missing User component
const User = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default UserSettings;