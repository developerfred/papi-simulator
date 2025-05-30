export class BaseTemplates {
  static readonly ERROR_BOUNDARY = `
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} reset={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-red-800 mb-4">Something went wrong</h2>
      <pre className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4 overflow-auto">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  </div>
);`;

  static readonly DEMO_COMPONENT = (componentName: string, packageName: string) => `
import React, { useState, useCallback } from 'react';
import ${componentName} from '${packageName}';

interface DemoState {
  result: unknown;
  error: string;
}

export const ComponentDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({ result: null, error: '' });

  const handleSuccess = useCallback((data: unknown) => {
    setState({ result: data, error: '' });
  }, []);

  const handleError = useCallback((err: Error) => {
    setState({ result: null, error: err.message });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 ${componentName}</h1>
        <p className="text-gray-600">Production-ready Polkadot component demo</p>
      </header>

      {state.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      {state.result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-semibold">Success</h3>
          <pre className="text-green-600 text-sm mt-2 overflow-auto">
            {JSON.stringify(state.result, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <${componentName} onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
};`;

  static readonly PACKAGE_JSON_BASE = {
    version: '0.1.0',
    private: true,
    engines: { node: '>=18.0.0', npm: '>=8.0.0' },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'polkadot-api': '^0.12.0',
      '@polkadot-api/descriptors': '^0.12.0'
    }
  };
}