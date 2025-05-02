import React, { useEffect } from 'react'
import { useNotification, Notification } from '../../context/NotificationContext'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// Animation classes for notifications
const enterClass = 'animate-enter'
const exitClass = 'animate-exit'

// Define notification styles based on type
const notificationStyles = {
  success: 'bg-green-100 border-green-500 text-green-800',
  error: 'bg-red-100 border-red-500 text-red-800',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  info: 'bg-blue-100 border-blue-500 text-blue-800'
}

// Define notification icons based on type
const notificationIcons = {
  success: <CheckCircle className="size-5" />,
  error: <AlertCircle className="size-5" />,
  warning: <AlertTriangle className="size-5" />,
  info: <Info className="size-5" />
}

interface NotificationItemProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const { id, message, type } = notification

  return (
    <div
      className={`${notificationStyles[type]} ${enterClass} mb-2 flex items-center justify-between rounded-md border-l-4 p-3 shadow-md`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="mr-2">{notificationIcons[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="ml-4 rounded-full p-1 hover:bg-gray-200"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification()

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .animate-enter {
        animation: slideInRight 0.3s ease-out forwards;
      }
      
      .animate-exit {
        animation: slideOutRight 0.3s ease-in forwards;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (notifications.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-50 w-72">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  )
}

