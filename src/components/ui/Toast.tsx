'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#1e293b',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#1e293b',
          },
        },
      }}
    />
  )
}
