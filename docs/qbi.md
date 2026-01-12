# QBI Hooks

Use QBI hooks to query contracts and send procedures through the SDK.

## Setup

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createSdk, createQbiRegistry } from "@qubic-labs/sdk";
import { QubicQueryProvider, SdkProvider } from "@qubic-labs/react";

const registry = createQbiRegistry({ files: [] });
const sdk = createSdk({ qbi: { files: registry.byName ? [] : [] } });
const client = new QueryClient();

export function App({ children }: { children: React.ReactNode }) {
  return (
    <SdkProvider sdk={sdk}>
      <QubicQueryProvider client={client}>{children}</QubicQueryProvider>
    </SdkProvider>
  );
}
```

## Query a function

For type safety, define a schema and provide it as a generic parameter.

```tsx
import { useContractQuery } from "@qubic-labs/react";

type QutilSchema = {
  functions: {
    getFee: { input: void; output: { fee: bigint } };
  };
  procedures: {
    issueAsset: { input: { payload: Uint8Array } };
  };
};

export function ContractInfo() {
  const query = useContractQuery<QutilSchema, "getFee">("QUTIL", "getFee", {
    inputBytes: new Uint8Array(),
  });
  if (query.isLoading) return <div>Loading...</div>;
  if (query.error) return <div>{query.error.message}</div>;
  return <pre>{query.data?.responseBase64}</pre>;
}
```

## Send a procedure

```tsx
import { useContractMutation } from "@qubic-labs/react";

export function IssueAsset() {
  const mutation = useContractMutation<QutilSchema, "issueAsset">("QUTIL");
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
