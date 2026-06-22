import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

// TanStack Query holds server/mock state (PRD §12.1). Mock data is local so it
// never goes stale on its own.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: false },
  },
});

// AntD `App` provides the context-based message/notification/modal API
// (App.useApp()), the React-19-safe alternative to static methods (ADR-0001 R1).
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
