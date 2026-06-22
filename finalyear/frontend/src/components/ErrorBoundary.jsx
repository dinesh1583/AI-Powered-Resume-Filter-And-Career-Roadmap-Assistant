import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary — catches React rendering errors and shows a recovery UI
 * instead of a blank white screen. Wraps the entire application.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen px-4"
          style={{ background: 'var(--bg-primary)' }}>
          <div className="glass-panel p-10 max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(251,113,133,0.15)' }}>
              <AlertTriangle className="w-8 h-8" style={{ color: 'var(--accent-rose)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleReload}
                className="btn-primary py-2.5 px-5 text-sm rounded-xl flex items-center gap-2">
                <RefreshCw size={14} /> Reload Page
              </button>
              <button onClick={this.handleGoHome}
                className="btn-secondary py-2.5 px-5 text-sm rounded-xl">
                Go Home
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                  Error details
                </summary>
                <pre className="mt-2 text-xs p-3 rounded-lg overflow-auto max-h-32"
                  style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--accent-rose)' }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
