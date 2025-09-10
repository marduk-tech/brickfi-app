import { Suspense, ReactNode } from 'react';

interface StreamWrapperProps {
  fallback: ReactNode;
  children: ReactNode;
  errorFallback?: ReactNode;
}

export function StreamWrapper({ 
  fallback, 
  children, 
  errorFallback: _errorFallback 
}: StreamWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}