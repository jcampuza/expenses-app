import React from "react";
import { default as NextLink, LinkProps } from "next/link";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const AppLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps
>(({ className, ...props }, ref) => {
  return (
    <NextLink
      className={cn(buttonVariants({ variant: "link" }), className, "px-0")}
      ref={ref}
      {...props}
    />
  );
});
AppLink.displayName = "Link";

export { AppLink };
