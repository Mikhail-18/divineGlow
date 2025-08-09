
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import * as React from "react"

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> & {
    tagName?: keyof JSX.IntrinsicElements
  }
>(({ tagName = 'div', ...props }, ref) => {
  const Comp = CollapsiblePrimitive.Root as any
  return <Comp ref={ref} as={tagName} {...props} />
})
Collapsible.displayName = 'Collapsible'


export { Collapsible, CollapsibleTrigger, CollapsibleContent }

    