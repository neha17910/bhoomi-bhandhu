import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    let readable = error.message || "An unexpected error occurred.";
    try {
      const parsed = JSON.parse(error.message) as { error?: string; path?: string };
      if (parsed?.error) {
        readable = `Data access notice${parsed.path ? ` (${parsed.path})` : ""}: ${parsed.error}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, errorMessage: readable };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application ErrorBoundary caught:", error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: "" });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F3] text-[#1B2A20] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-[#2D6A4F] mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="text-lg font-semibold">Something went wrong</h1>
            </div>
            <p className="text-sm text-[#4A5A4F] leading-relaxed mb-5">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full min-h-[44px] rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
