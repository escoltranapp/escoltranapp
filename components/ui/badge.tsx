import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wider transition-colors focus:outline-none uppercase",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-accent-foreground",
        secondary:
          "border-border-default bg-surface text-text-secondary",
        destructive:
          "border-danger/30 bg-danger/15 text-[#F87171]",
        outline: "border-border-strong text-text-primary",
        novo: 
          "border-info/30 bg-info/15 text-[#60A5FA]",
        alta: 
          "border-danger/30 bg-danger/15 text-[#F87171]",
        media: 
          "border-warning/30 bg-warning/15 text-[#FBBF24]",
        baixa: 
          "border-success/30 bg-success/15 text-[#4ADE80]",
        ativa: 
          "border-success/30 bg-success/15 text-[#4ADE80]",
        inativa: 
          "border-danger/30 bg-danger/15 text-[#F87171]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
