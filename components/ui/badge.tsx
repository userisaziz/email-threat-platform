import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold font-mono transition-colors",
  {
    variants: {
      variant: {
        default: "border-gray-700 bg-gray-800 text-gray-300",
        destructive: "border-red-500/40 bg-red-500/20 text-red-300",
        warning: "border-yellow-500/40 bg-yellow-500/20 text-yellow-300",
        success: "border-green-500/30 bg-green-500/10 text-green-400",
        outline: "border-gray-700 text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
