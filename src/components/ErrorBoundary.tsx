import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">
              Bir şeyler ters gitti
            </h1>
            
            <p className="text-gray-600">
              Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
              Sorun devam ederse lütfen destek ekibiyle iletişime geçin.
            </p>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto text-xs font-mono max-h-40">
                {this.state.error.toString()}
              </div>
            )}

            <Button onClick={this.handleReload} className="w-full">
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
