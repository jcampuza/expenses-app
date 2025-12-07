import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, LinkProps } from "@tanstack/react-router";

type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps;

const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <Link
        className={cn(buttonVariants({ variant: "link" }), className, "px-0")}
        ref={ref}
        {...props}
      />
    );
  },
);

AppLink.displayName = "Link";

export { AppLink };
