"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { WidgetFallback } from "./WidgetFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
  widgetId: string;
  widgetTitle: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[WidgetError] ${this.props.widgetTitle} (${this.props.widgetId}):`,
      error,
      info.componentStack
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <WidgetFallback
          type="error"
          title={this.props.widgetTitle}
          message={this.state.error?.message ?? "An unexpected error occurred"}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
