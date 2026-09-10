import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-[8px] border border-transparent bg-clip-padding text-[14px] font-[650] whitespace-nowrap transition-[background-color,border-color] duration-200 outline-none select-none disabled:pointer-events-none disabled:cursor-default disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-pm-accent text-white hover:bg-pm-accent-hover',
        outline:
          'border-pm-line bg-pm-surface text-pm-ink hover:bg-pm-bg',
        secondary:
          'border-pm-line bg-pm-surface text-pm-ink hover:bg-pm-bg',
        ghost: 'bg-transparent px-0 text-pm-accent hover:text-pm-accent-hover',
        destructive:
          'border-pm-line bg-pm-surface text-pm-ink hover:bg-pm-bg',
        link: 'bg-transparent px-0 text-pm-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-auto px-[18px] py-[11px]',
        xs: 'h-auto rounded-[6px] px-2 py-1 text-xs',
        sm: 'h-auto px-3 py-2 text-[13px]',
        lg: 'h-auto px-5 py-3',
        icon: 'size-9 p-0',
        'icon-xs': 'size-6 p-0',
        'icon-sm': 'size-7 p-0',
        'icon-lg': 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
