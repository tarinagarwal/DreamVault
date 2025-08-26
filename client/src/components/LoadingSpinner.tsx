import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "theme-spinner-sm",
    md: "theme-spinner-md",
    lg: "theme-spinner-lg",
  };

  return <div className={`${sizeClasses[size]} ${className}`} />;
};

export default LoadingSpinner;
