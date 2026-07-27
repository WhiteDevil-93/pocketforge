import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PocketForge failed to render:', error, info);
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-[100dvh] grid place-items-center px-6">
        <section className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-secondary p-6 text-center shadow-card">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-danger/10">
            <AlertTriangle className="text-danger" aria-hidden="true" />
          </div>
          <h1 className="font-headline text-text-primary">PocketForge needs a refresh</h1>
          <p className="mt-2 font-body text-text-secondary">
            An app file may have changed after an update. Your saved teams are still stored on this device.
          </p>
          <button
            type="button"
            onClick={this.reload}
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-primary px-5 font-body-medium text-white"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Reload app
          </button>
        </section>
      </main>
    );
  }
}
