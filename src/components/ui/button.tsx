import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#002D62] text-white hover:bg-[#001D40] active:scale-[0.98] shadow-xs transition-all",
        gold:
          "bg-[#D4AF37] text-slate-950 font-bold hover:bg-[#C49A25] active:scale-[0.98] shadow-xs transition-all",
        emerald:
          "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-950 shadow-2xs",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-950",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
        link: "text-[#002D62] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 gap-2 px-4 py-2 text-sm",
        xs: "h-6 gap-1 rounded-md px-2 text-xs",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-12 gap-2 rounded-lg px-6 text-base font-semibold",
        icon: "size-10",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants, type ButtonProps };
