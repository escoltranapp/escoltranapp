import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground font-black uppercase tracking-[0.2em] rounded-full hover:bg-accent-hover hover:scale-105 shadow-[0_0_20px_rgba(224,176,80,0.2)] focus:animate-gold-pulse",
        primary:
          "bg-accent text-accent-foreground font-black uppercase tracking-[0.2em] rounded-full hover:bg-accent-hover hover:scale-105 shadow-[0_0_20px_rgba(224,176,80,0.2)] focus:animate-gold-pulse",
        secondary:
          "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:border-accent hover:text-accent hover:bg-white/10 rounded-md",
        outline:
          "border border-border-default bg-transparent text-text-primary hover:bg-surface-elevated hover:border-border-strong rounded-md",
        ghost: 
          "text-text-secondary hover:text-text-primary hover:bg-surface rounded-md",
        danger:
          "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 rounded-md",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-6 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
