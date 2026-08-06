import React from 'react';
import { motion } from 'framer-motion';
import { buttonHover } from '../animations/motionVariants';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'right',
  className,
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#5BE4FF]/50';

  const variantStyles = {
    primary:
      'bg-[#5BE4FF] text-[#091320] font-bold shadow-[0_0_20px_rgba(91,228,255,0.3)] hover:bg-[#7AE8FF] hover:shadow-[0_0_30px_rgba(91,228,255,0.5)]',
    secondary:
      'bg-[#13233A]/80 text-[#FFDF6D] border border-[#FFDF6D]/30 backdrop-blur-md hover:bg-[#18283D] hover:border-[#FFDF6D]/60',
    outline:
      'bg-transparent text-white border border-white/15 hover:bg-white/5 hover:border-white/30',
    glass:
      'bg-[#18283D]/60 text-white border border-white/10 backdrop-blur-md hover:bg-[#18283D]/90 hover:border-white/20',
    ghost:
      'bg-transparent text-[#9BA9C2] hover:text-white hover:bg-white/5',
  };

  const sizeStyles = {
    sm: 'text-sm px-3.5 py-2 rounded-lg gap-1.5',
    md: 'text-base px-5 py-3 rounded-xl gap-2 text-button',
    lg: 'text-lg px-7 py-3.5 rounded-2xl gap-2.5',
  };

  return (
    <motion.button
      variants={buttonHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      onClick={onClick}
      {...(props as any)}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </motion.button>
  );
};
