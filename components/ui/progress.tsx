'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  indicatorColor?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorColor = 'bg-blue-600', ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100"
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={`h-full w-full flex-1 transition-all ${indicatorColor}`}
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };