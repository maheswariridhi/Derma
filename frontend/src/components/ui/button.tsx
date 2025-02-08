import React from "react";

// Define Props interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "ghost";
  size?: "default" | "sm";
  className?: string;
}

export function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants: Record<ButtonProps["variant"], string> = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    ghost: "hover:bg-gray-100",
  };

  const sizes: Record<ButtonProps["size"], string> = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
