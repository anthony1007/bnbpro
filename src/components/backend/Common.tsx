'use client';

import React from 'react';

// SearchBar Component
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 bg-bnb-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-bnb-yellow focus:ring-1 focus:ring-bnb-yellow"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400">🔍</span>
      </div>
    </div>
  );
};

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bnb-gray rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>

      {/* Page numbers */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bnb-gray rounded transition-colors"
          >
            1
          </button>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm rounded transition-colors ${
            page === currentPage
              ? 'bg-bnb-yellow text-bnb-black'
              : 'text-gray-300 hover:text-white hover:bg-bnb-gray'
          }`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bnb-gray rounded transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bnb-gray rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
};

// EmptyState Component
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = '📄',
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

// LoadingSpinner Component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        animate-spin rounded-full border-b-2 border-bnb-yellow
        ${sizeClasses[size]}
      `}></div>
    </div>
  );
};

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" 
          onClick={onClose}
        ></div>
        
        <div className={`
          inline-block align-bottom bg-bnb-black rounded-lg text-left overflow-hidden shadow-xl 
          transform transition-all sm:my-8 sm:align-middle ${maxWidth} sm:w-full ${className}
        `}>
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-bnb-yellow text-bnb-black hover:bg-bnb-gold focus:ring-bnb-yellow',
    secondary: 'bg-bnb-gray text-white hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-300 hover:text-white hover:bg-bnb-gray focus:ring-gray-500'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="mr-2">
          <LoadingSpinner size="small" />
        </div>
      )}
      {children}
    </button>
  );
};