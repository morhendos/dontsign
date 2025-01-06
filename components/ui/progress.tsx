'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorColor?: string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    indicatorColor = 'bg-blue-600 dark:bg-blue-500',
    indicatorClassName,
    ...props 
  }, ref) => {

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 transition-all',
            indicatorClassName || indicatorColor
          )}
          style={{ 
            transform: `translateX(-${100 - (Math.min(Math.max(value, 0), 100))}%)`
          }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };