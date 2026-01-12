# Hooks

## useBalance

```tsx
import { useBalance } from "@qubic-labs/react";

export function BalanceCard({ identity }: { identity: string }) {
  const balance = useBalance(identity, { refetchInterval: 10_000 });
  if (balance.isLoading) return <div>Loading...</div>;
  if (balance.error) return <div>{balance.error.message}</div>;
  return <div>{balance.data?.balance}</div>;
}
```

## useTickInfo

```tsx
import { useTickInfo } from "@qubic-labs/react";

export function TickInfo() {
  const query = useTickInfo({ refetchInterval: 5_000 });
  return <div>{query.data?.tick}</div>;
}
```

## useLastProcessedTick

```tsx
import { useLastProcessedTick } from "@qubic-labs/react";

export function LastProcessedTick() {
  const query = useLastProcessedTick();
  return <div>{query.data?.tickNumber}</div>;
}
```

## useTransactions

```tsx
import { useTransactions } from "@qubic-labs/react";

export function Transactions({ identity }: { identity: string }) {
  const txs = useTransactions({ identity, pageSize: 50 });
  return (
    <div>
      {txs.data?.pages.flatMap((page) => page.transactions).length ?? 0} txs
    </div>
  );
}
```

## useSend / useSendAndConfirm

```tsx
import { useSend, useSendAndConfirm } from "@qubic-labs/react";

export function SendButton() {
  const send = useSend();
  return (
    <button
      onClick={() =>
        send.mutate({
          fromSeed: "...",
          toIdentity: "...",
          amount: 1n,
        })
      }
    >
      Send
    </button>
  );
}
```
