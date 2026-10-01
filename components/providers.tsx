'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  // useState biar instance QueryClient cuma dibuat sekali per browser session,
  // bukan dibuat ulang tiap render (yang bikin cache-nya kereset terus)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // data dianggap "fresh" 30 detik, tidak refetch otomatis
            refetchOnWindowFocus: false, // jangan refetch tiap balik ke tab ini
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
