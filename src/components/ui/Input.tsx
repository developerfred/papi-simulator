'use client'

import React, { InputHTMLAttributes, ReactNode } from 'react'
import { useTheme } from '@/lib/theme/ThemeProvider'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export default function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}: InputProps) {
    const { getColor } = useTheme();

    
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base'
    };

    
    const inputStyle = {
        backgroundColor: getColor('surface'),
        color: getColor('textPrimary'),
        borderColor: error ? getColor('error') : getColor('border'),
    };

    
    const labelStyle = {
        color: getColor('textSecondary')
    };

    const errorStyle = {
        color: getColor('error')
    };

    return (
        <div className={`${fullWidth ? 'w-full' : ''} space-y-1`}>
            {label && (
                <label
                    htmlFor={props.id}
                    className="block text-sm font-medium"
                    style={labelStyle}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {leftIcon}
                    </div>
                )}

                <input
                    className={`
            border rounded-md w-full transition-colors focus:outline-none focus-visible:ring-2
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${className}
          `}
                    style={inputStyle}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && (
                <p
                    className="text-xs mt-1"
                    style={errorStyle}
                >
                    {error}
                </p>
            )}
        </div>
    );
}