
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import * as React from "react"

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>, "asChild"> & {
    tagName?: keyof JSX.IntrinsicElements
  }
>(({ tagName, ...props }, ref) => {
    const Comp = tagName || 'div';
    return <CollapsiblePrimitive.Root ref={ref} asChild {...props}><Comp/></CollapsiblePrimitive.Root>;
})
Collapsible.displayName = 'Collapsible'


export { Collapsible, CollapsibleTrigger, CollapsibleContent }

    
