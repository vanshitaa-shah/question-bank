import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  variant?: "spinner" | "dots" | "pulse";
  showText?: boolean;
}

export function Loader({
  size = "md",
  text = "Loading...",
  className,
  variant = "spinner",
  showText = true,
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (variant === "spinner") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div
          className={cn(
            "border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin",
            sizeClasses[size]
          )}
        />
        {showText && (
          <span className={cn("text-gray-500", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div className="flex gap-1">
          <div
            className={cn(
              "bg-gray-400 rounded-full animate-bounce",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-1.5 h-1.5" : "w-2 h-2"
            )}
            style={{ animationDelay: "0ms" }}
          />
          <div
            className={cn(
              "bg-gray-400 rounded-full animate-bounce",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-1.5 h-1.5" : "w-2 h-2"
            )}
            style={{ animationDelay: "150ms" }}
          />
          <div
            className={cn(
              "bg-gray-400 rounded-full animate-bounce",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-1.5 h-1.5" : "w-2 h-2"
            )}
            style={{ animationDelay: "300ms" }}
          />
        </div>
        {showText && (
          <span className={cn("text-gray-500", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div
          className={cn(
            "bg-gray-400 rounded-full animate-pulse",
            sizeClasses[size]
          )}
        />
        {showText && (
          <span className={cn("text-gray-500", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return null;
}

// Centered loader for full-screen loading
export function CenteredLoader({
  size = "lg",
  text = "Loading...",
  className,
  variant = "spinner",
}: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <Loader size={size} text={text} variant={variant} />
    </div>
  );
}

// Inline loader for buttons and smaller components
export function InlineLoader({
  size = "sm",
  text,
  className,
  variant = "spinner",
}: LoaderProps) {
  return (
    <Loader
      size={size}
      text={text}
      className={className}
      variant={variant}
      showText={!!text}
    />
  );
}
