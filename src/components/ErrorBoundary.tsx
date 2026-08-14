import React, { Component } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends Component<{
  children: React.ReactNode;
  renderFallback: (error: Error) => React.ReactNode;
}> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    console.error("getDerivedStateFromError: ERROR BOUNDARY HIT:", error);
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("componentDidCatch: ERROR BOUNDARY HIT:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return this.props.renderFallback(this.state.error);
    }

    return this.props.children;
  }
}

export function DefaultRouteError({ error }: { error: Error }) {
  return (
    <div className="mx-auto flex max-w-md grow flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm font-medium text-foreground">
        Something went wrong.
      </p>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button nativeButton={false} render={<Link to="/dashboard" />}>
        Back to dashboard
      </Button>
    </div>
  );
}
