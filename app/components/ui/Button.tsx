import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClass = "btn";
  const variantClass = variant ? `btn--variant-${variant}` : "";
  const sizeClass = size ? `btn--size-${size}` : "";
  const fullWidthClass = fullWidth ? "btn--full-width" : "";

  const combinedClasses =
    `${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim();

  return <button className={combinedClasses} {...props} />;
};
