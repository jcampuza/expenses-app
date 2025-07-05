import { Component } from "react";

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
