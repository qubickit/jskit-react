import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMemo } from "react";

export type QubicQueryProviderProps = Readonly<{
  client?: QueryClient;
  children: ReactNode;
}>;

export function QubicQueryProvider({ client, children }: QubicQueryProviderProps) {
  const value = useMemo(() => client ?? new QueryClient(), [client]);
  return <QueryClientProvider client={value}>{children}</QueryClientProvider>;
}
