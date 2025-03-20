
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    children, 
    icon, 
    iconPosition = 'right',
    ...props 
  }, ref) => {
    const variants = {
      primary: 'button-primary',
      secondary: 'button-secondary',
      ghost: 'inline-flex items-center justify-center px-4 py-2 text-primary font-medium transition-all duration-300 hover:bg-gray-100/50 active:scale-[0.98] rounded-full',
    };
    
    const sizes = {
      sm: 'text-sm px-4 py-2',
      md: 'text-base px-6 py-3',
      lg: 'text-lg px-8 py-4',
    };
    
    return (
      <button
        className={cn(
          variants[variant],
          sizes[size],
          'relative overflow-hidden group',
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {icon && iconPosition === 'left' && (
            <span className="transition-transform duration-300 group-hover:-translate-x-1">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="transition-transform duration-300 group-hover:translate-x-1">{icon}</span>
          )}
        </span>
        <span className="absolute inset-0 z-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export { AnimatedButton };
