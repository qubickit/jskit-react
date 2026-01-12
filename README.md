# @qubic-labs/react

React bindings for `@qubic-labs/sdk` built on `@tanstack/react-query`.

## Install

```bash
bun add @qubic-labs/react @qubic-labs/sdk @tanstack/react-query react react-dom
```

## Quick start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSdk } from "@qubic-labs/sdk";

const queryClient = new QueryClient();
const sdk = createSdk({ baseUrl: "https://rpc.qubic.org" });

// TODO: add providers/hooks in REACT-002+
```

## Status

Scaffolded package; hooks/providers coming next.

## Local development (monorepo)

```bash
# from jskit-react/
bun add @qubic-labs/sdk@file:../jskit-sdk
```
