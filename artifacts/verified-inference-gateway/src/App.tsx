import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';

import NotFound from '@/pages/not-found';
import UploadPage from '@/pages/Upload';
import QuantizePage from '@/pages/Quantize';
import AuditPage from '@/pages/Audit';
import ChatPage from '@/pages/Chat';
import LeanPage from '@/pages/Lean';
import TrainingPage from '@/pages/Training';
import LimitsPage from '@/pages/Limits';
import SourcesPage from '@/pages/Sources';

import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function HomeRedirect() {
  const [, setLocation] = useLocation();
  const { stage } = useApp();
  
  useEffect(() => {
    setLocation(`/${stage}`);
  }, [stage, setLocation]);
  
  return null;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/quantize" component={QuantizePage} />
        <Route path="/audit" component={AuditPage} />
        <Route path="/chat" component={ChatPage} />
        <Route path="/lean" component={LeanPage} />
        <Route path="/training" component={TrainingPage} />
        <Route path="/limits" component={LimitsPage} />
        <Route path="/sources" component={SourcesPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
              <Sidebar />
              <main className="flex-1 overflow-y-auto relative">
                <Router />
              </main>
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AppProvider>
  );
}

export default App;
