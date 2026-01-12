# Setup

This package builds on `@tanstack/react-query` and `@qubic-labs/sdk`.

## Install

```bash
bun add @qubic-labs/react @qubic-labs/sdk @tanstack/react-query react react-dom
```

## Providers

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createSdk } from "@qubic-labs/sdk";
import { QubicQueryProvider, SdkProvider } from "@qubic-labs/react";

const queryClient = new QueryClient();
const sdk = createSdk({ baseUrl: "https://rpc.qubic.org" });

export function App({ children }: { children: React.ReactNode }) {
  return (
    <SdkProvider sdk={sdk}>
      <QubicQueryProvider client={queryClient}>{children}</QubicQueryProvider>
    </SdkProvider>
  );
}
```
