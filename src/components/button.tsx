"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "glow"
  | "ink"
  | "secondary"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-dark text-white shadow-[0_8px_24px_rgba(19,27,255,0.18)] hover:bg-primary hover:text-paper hover:border-primary/40",
  glow:
    "border border-white/15 bg-[linear-gradient(135deg,#131bff_0%,#2f38ff_58%,#05c2ff_155%)] text-white shadow-[0_14px_45px_rgba(19,27,255,0.30),0_0_32px_rgba(5,194,255,0.12)] hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_18px_55px_rgba(19,27,255,0.38),0_0_38px_rgba(5,194,255,0.18)]",
  ink:
    "bg-ink text-paper shadow-[0_8px_24px_rgba(251,250,254,0.08)] hover:bg-ember hover:text-white",
  secondary:
    "border border-line bg-transparent text-ink hover:bg-paper",
  ghost: "bg-transparent text-mute hover:bg-paper hover:text-ink",
  danger:
    "bg-danger text-white shadow-xs hover:bg-danger/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3.5 text-xs",
  md: "h-10 rounded-full px-5 text-sm",
  lg: "h-12 rounded-2xl px-6 text-sm",
  icon: "size-9 rounded-xl",
};

export function buttonVariants(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md"
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium outline-none transition duration-200",
    "active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    variants[variant],
    sizes[size]
  );
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants(variant, size), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
