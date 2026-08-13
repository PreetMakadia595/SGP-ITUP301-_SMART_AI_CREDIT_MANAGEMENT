import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      default: "bg-brand-600 hover:bg-brand-500 text-white shadow-glow hover:shadow-glow-strong",
      secondary: "bg-surface-700 hover:bg-surface-600 text-slate-100 border border-white/10",
      outline: "border border-white/15 bg-transparent hover:bg-white/5 text-slate-200",
      ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
      danger: "bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs rounded-lg",
      lg: "h-12 px-6 text-base rounded-2xl",
      icon: "h-10 w-10 p-0",
    };

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
