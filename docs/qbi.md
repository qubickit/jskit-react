# QBI Hooks

Use QBI hooks to query contracts and send procedures through the SDK.

## Setup

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createSdk, createQbiRegistry } from "@qubic-labs/sdk";
import { createSdkProvider, QubicQueryProvider } from "@qubic-labs/react";

type QbiSchemas = {
  QUTIL: {
    functions: {
      getFee: { input: void; output: { fee: bigint } };
    };
    procedures: {
      issueAsset: { input: { payload: Uint8Array } };
    };
  };
};

const registry = createQbiRegistry({ files: [] });
const sdk = createSdk({ qbi: { files: registry.byName ? [] : [] } });
const client = new QueryClient();
const { SdkProvider, useContractMutation, useContractQuery } = createSdkProvider<QbiSchemas>();

export function App({ children }: { children: React.ReactNode }) {
  return (
    <SdkProvider sdk={sdk}>
      <QubicQueryProvider client={client}>{children}</QubicQueryProvider>
    </SdkProvider>
  );
}
```

## Query a function

```tsx
export function ContractInfo() {
  const query = useContractQuery("QUTIL", "getFee", {
    inputBytes: new Uint8Array(),
  });
  if (query.isLoading) return <div>Loading...</div>;
  if (query.error) return <div>{query.error.message}</div>;
  return <pre>{query.data?.responseBase64}</pre>;
}
```

## Send a procedure

```tsx
export function IssueAsset() {
  const mutation = useContractMutation("QUTIL");
  return (
    <button
      onClick={() =>
        mutation.mutate({
          name: "issueAsset",
          fromSeed: "...",
          inputBytes: new Uint8Array(),
        })
      }
    >
      Send
    </button>
  );
}
```
