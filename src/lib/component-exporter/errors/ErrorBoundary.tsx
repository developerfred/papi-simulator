/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>, 
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    return this.state.hasError ? (
      <div className="polkadot-error">
        <h3>Component Error</h3>
        <pre>{this.state.error?.toString()}</pre>
      </div>
    ) : this.props.children;
  }
}
