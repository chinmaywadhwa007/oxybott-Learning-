import React from 'react';
import { cn } from '../utils/cn';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
};
