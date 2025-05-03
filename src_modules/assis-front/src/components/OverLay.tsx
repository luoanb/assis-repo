import React, { useState } from 'react'

interface OverLayProps {
  isOpen: boolean
  onOpenChange: (value: boolean) => void
  children: React.ReactNode
}

export const OverLay: React.FC<OverLayProps> = ({ isOpen, children, onOpenChange }) => {
  return (
    <div
      onClick={() => onOpenChange(false)}
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        className="rounded shadow-lg overflow-auto max-h-full max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
