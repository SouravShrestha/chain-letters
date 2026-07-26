"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ViewErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[ViewErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Something went wrong in this view.{" "}
              <button
                className="underline"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
