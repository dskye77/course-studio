// src/components/ErrorBoundary.jsx
"use client";

import { PLATFORM_CONFIG } from '@/config/platform.config';

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // In production, you would send this to an error tracking service like Sentry
    this.setState({
      error,
      errorInfo,
    });

    // Example: Send to Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, errorInfo }) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === "development";

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We apologize for the inconvenience. An unexpected error has
              occurred.
            </p>
            <p className="text-sm text-muted-foreground">
              Our team has been notified and is working on a fix.
            </p>
          </div>

          {isDevelopment && error && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">
                Error Details (Development Only):
              </h3>
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-4 overflow-auto">
                <pre className="text-xs text-red-800 dark:text-red-300">
                  {error.toString()}
                </pre>
                {errorInfo && (
                  <pre className="text-xs text-red-700 dark:text-red-400 mt-2">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleRefresh} className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            If this problem persists, please contact support at{" "}
            <a
              href={`mailto:${PLATFORM_CONFIG.contact.email}`}
              className="text-primary hover:underline"
            >
              {PLATFORM_CONFIG.contact.email}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;
