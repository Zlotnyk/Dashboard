import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

export const Notification = ({ type = 'info', message, onClose, autoClose = true, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, 300) // Match transition duration
  }

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-600',
          icon: <CheckCircle size={20} className="text-white" />,
          border: 'border-green-700'
        }
      case 'error':
        return {
          bg: 'bg-red-600',
          icon: <AlertCircle size={20} className="text-white" />,
          border: 'border-red-700'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-600',
          icon: <AlertTriangle size={20} className="text-white" />,
          border: 'border-yellow-700'
        }
      case 'info':
      default:
        return {
          bg: 'bg-blue-600',
          icon: <Info size={20} className="text-white" />,
          border: 'border-blue-700'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ease-in-out ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className={`${styles.bg} text-white rounded-md shadow-lg border ${styles.border} flex items-center p-4`}>
        <div className="flex-shrink-0 mr-3">
          {styles.icon}
        </div>
        <div className="flex-1 mr-2">
          {message}
        </div>
        <button 
          onClick={handleClose}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState([])

  const showNotification = (type, message, options = {}) => {
    const id = crypto.randomUUID()
    setNotifications(prev => [...prev, { id, type, message, ...options }])
    
    if (options.autoClose !== false) {
      const duration = options.duration || 3000
      setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }
    
    return id
  }

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => dismissNotification(notification.id)}
          autoClose={false}
        />
      ))}
    </div>
  )

  return {
    showNotification,
    dismissNotification,
    NotificationContainer
  }
}

export default Notification