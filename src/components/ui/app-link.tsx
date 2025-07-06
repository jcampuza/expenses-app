import React from "react";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Link, LinkProps } from "@tanstack/react-router";

const AppLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps
>(({ className, ...props }, ref) => {
  return (
    <Link
      className={cn(buttonVariants({ variant: "link" }), className, "px-0")}
      ref={ref}
      {...props}
    />
  );
});

AppLink.displayName = "Link";

export { AppLink };
