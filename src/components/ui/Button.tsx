import React from 'react';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: LucideIcon;
    isLoading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
}

/**
 * Reusable button component with different variants and sizes
 */
const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    isLoading = false,
    fullWidth = false,
    children,
    className,
    disabled,
    ...props
}) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';

    // Classes based on variant
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
        outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-300',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    };

    // Classes based on size
    const sizeClasses = {
        sm: 'text-xs px-2.5 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
    };

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combine all classes
    const buttonClasses = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className,
    ].join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}

            {Icon && !isLoading && (
                <Icon className="mr-2" size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} />
            )}

            {children}
        </button>
    );
};

export default Button;