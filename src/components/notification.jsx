import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const Notification = ({ 
  type = 'success', 
  title, 
  message, 
  isVisible, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(() => onClose?.(), 300) // Wait for animation to complete
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, autoClose, duration, onClose])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => onClose?.(), 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-400" />
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-400" />
      default:
        return <CheckCircle className="h-6 w-6 text-green-400" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500'
      case 'error':
        return 'border-red-500'
      case 'warning':
        return 'border-yellow-500'
      default:
        return 'border-green-500'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`max-w-md w-full bg-[#1a1a1a] shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 border-l-4 ${getBorderColor()} transform transition-all duration-300 ease-in-out ${
          show 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className="p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-4 w-0 flex-1 pt-0.5">
              <p className="text-base font-medium text-white">
                {title}
              </p>
              {message && (
                <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                  {message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notification