'use client'

import React from 'react'

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  isPrimary?: boolean
  icon?: 'play' | 'trash' | 'copy' | 'link'
  children: React.ReactNode
}

export default function ActionButton({
  onClick,
  disabled = false,
  isPrimary = false,
  icon,
  children
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2
        py-2 px-4 rounded-md text-sm font-medium
        transition-colors duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
        ${isPrimary 
          ? 'bg-primary-600 text-white' 
          : 'border border-gray-700 hover:border-gray-500'
        }
      `}
    >
      {icon && <ButtonIcon type={icon} />}
      {children}
    </button>
  )
}

interface ButtonIconProps {
  type: 'play' | 'trash' | 'copy' | 'link'
}

function ButtonIcon({ type }: ButtonIconProps) {
  switch (type) {
    case 'play':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 2.75A.75.75 0 0 0 2.75 3.5v9a.75.75 0 0 0 1.153.63L12 8.766a.75.75 0 0 0 0-1.26L3.903 3.12A.75.75 0 0 0 3.5 2.75Z" fill="currentColor" />
        </svg>
      )
    case 'trash':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 1a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5ZM2 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-1v7.5a2.5 2.5 0 0 1-2.5 2.5h-4A2.5 2.5 0 0 1 3.5 12V4.5h-1a.5.5 0 0 1-.5-.5Zm2.5 0h7V12a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 4.5 12V4ZM6 6a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0V6Zm2 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0V6Zm2 0a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0V6Z" fill="currentColor" />
        </svg>
      )
    case 'copy':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v7A1.5 1.5 0 0 0 3.5 12H4v-1H3.5a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V4h1v-.5A1.5 1.5 0 0 0 10.5 2h-7ZM5.5 5A1.5 1.5 0 0 0 4 6.5v7A1.5 1.5 0 0 0 5.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 12.5 5h-7ZM5 6.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7Z" fill="currentColor" />
        </svg>
      )
    case 'link':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.657 5.586a.5.5 0 0 0-.707 0L4.757 7.757a2.5 2.5 0 1 0 3.535 3.536l1.237-1.237a.5.5 0 1 0-.707-.707L7.586 10.586a1.5 1.5 0 1 1-2.121-2.122L7.657 6.293a.5.5 0 0 0 0-.707Zm3.536-.707a.5.5 0 0 0-.707.707l1.237 1.237a1.5 1.5 0 1 1-2.122 2.121L7.414 6.757a.5.5 0 1 0-.707.707l2.187 2.187a2.5 2.5 0 0 0 3.536-3.535l-1.237-1.237Z" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}