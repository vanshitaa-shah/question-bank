"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormStatusButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  readonly size?: "default" | "sm" | "lg" | "icon";
  readonly className?: string;
  readonly loadingText?: string;
  readonly disabled?: boolean;
}

/**
 * React 19: Enhanced submit button using useFormStatus
 * Automatically shows loading state when form is submitting
 */
export function FormStatusButton({
  children,
  variant = "default",
  size = "default",
  className,
  loadingText,
  disabled = false,
  ...props
}: FormStatusButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending || disabled}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || "Submitting..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

interface FormStatusIndicatorProps {
  readonly className?: string;
  readonly showText?: boolean;
}

/**
 * React 19: Form status indicator using useFormStatus
 * Shows loading state independently of submit button
 */
export function FormStatusIndicator({ 
  className = "", 
  showText = true 
}: FormStatusIndicatorProps) {
  const { pending, method } = useFormStatus();

  if (!pending) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      {showText && (
        <span>
          {method === "POST" ? "Creating..." : 
           method === "PUT" ? "Updating..." : 
           method === "DELETE" ? "Deleting..." : 
           "Processing..."}
        </span>
      )}
    </div>
  );
}

interface FormErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * React 19: Enhanced error boundary for forms
 */
export function FormErrorBoundary({ 
  children, 
  fallback: Fallback 
}: FormErrorBoundaryProps) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(new Error(event.message));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const retry = React.useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    if (Fallback) {
      return <Fallback error={error} retry={retry} />;
    }

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-medium">Something went wrong</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="mt-2"
        >
          Try again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

// Export default for backward compatibility
export default FormStatusButton;
