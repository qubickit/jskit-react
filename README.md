# @qubic-labs/react

[![CI](https://github.com/qubickit/jskit-react/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/qubickit/jskit-react/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@qubic-labs/react)](https://www.npmjs.com/package/@qubic-labs/react)

React bindings for `@qubic-labs/sdk` built on `@tanstack/react-query`.

## Install

```bash
bun add @qubic-labs/react @qubic-labs/sdk @tanstack/react-query react react-dom
```

## Quick start

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createSdk } from "@qubic-labs/sdk";
import { QubicQueryProvider, SdkProvider, useBalance } from "@qubic-labs/react";

const queryClient = new QueryClient();
const sdk = createSdk({ baseUrl: "https://rpc.qubic.org" });

function BalanceCard({ identity }: { identity: string }) {
  const balance = useBalance(identity, { refetchInterval: 10_000 });
  if (balance.isLoading) return <div>Loading...</div>;
  if (balance.error) return <div>{balance.error.message}</div>;
  return <div>Balance: {balance.data?.balance}</div>;
}

export function App() {
  return (
    <SdkProvider sdk={sdk}>
      <QubicQueryProvider client={queryClient}>
        <BalanceCard identity="..." />
      </QubicQueryProvider>
    </SdkProvider>
  );
}
```

## Docs

- `docs/setup.md`
- `docs/hooks.md`
- `docs/qbi.md`
- `docs/wallets.md`

## Examples

- `examples/basic.tsx`
- `examples/transactions.tsx`
- `examples/qbi.tsx`

## Local development (monorepo)

```bash
# from jskit-react/
bun add @qubic-labs/sdk@file:../jskit-sdk
```
