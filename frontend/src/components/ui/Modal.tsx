'use client'

import { ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

export function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96 h-auto relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          &times;
        </button>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
} 