# Wallets

This package ships wallet connectors (MetaMask Snap + WalletConnect) and a provider/hook to manage connection state.

## Setup

```tsx
import { WalletProvider, MetaMaskSnapConnector, WalletConnectConnector } from "@qubic-labs/react";

const connectors = [
  new MetaMaskSnapConnector(),
  new WalletConnectConnector({
    projectId: "<walletconnect-project-id>",
    metadata: {
      name: "Qubic App",
      description: "Qubic wallet integration",
      url: "https://example.com",
      icons: ["https://example.com/icon.png"],
    },
  }),
  // Optional: vault connector (Node or browser vault)
  // new VaultConnector({ vault, defaultRef: "main" }),
];

export function App({ children }: { children: React.ReactNode }) {
  return <WalletProvider connectors={connectors}>{children}</WalletProvider>;
}
```

## Client-only usage

Connectors rely on browser APIs (window, storage, injected providers). Ensure they are created in client-only code paths.

## Auto-connect and storage

By default, the provider will attempt to restore the last connector using local storage.

```tsx
<WalletProvider connectors={connectors} autoConnect={false} storageKey="qubic.wallet.connector">
  {children}
</WalletProvider>
```

## Connect + approve

```tsx
import { useWallet } from "@qubic-labs/react";

export function WalletConnectButton() {
  const wallet = useWallet();

  const connectSnap = () => wallet.connect("metamask-snap");
  const connectWalletConnect = () => wallet.connect("walletconnect");

  return (
    <div>
      <button type="button" onClick={connectSnap}>
        MetaMask Snap
      </button>
      <button type="button" onClick={connectWalletConnect}>
        WalletConnect
      </button>
      {wallet.state.pendingUri && (
        <div>
          <p>Scan this QR in your wallet.</p>
          <code>{wallet.state.pendingUri}</code>
          <button type="button" onClick={() => wallet.approveWalletConnect()}>
            I scanned it
          </button>
        </div>
      )}
    </div>
  );
}
```

## Sign a transaction

```tsx
import { useWallet } from "@qubic-labs/react";

export function SignSnapTx({ txBytes, signatureOffset }: { txBytes: Uint8Array; signatureOffset: number }) {
  const wallet = useWallet();
  return (
    <button
      type="button"
      onClick={() =>
        wallet.signTransaction({
          kind: "snap",
          txBytes,
          signatureOffset,
        })
      }
    >
      Sign with Snap
    </button>
  );
}
```

```tsx
import { useWallet } from "@qubic-labs/react";

export function SignWalletConnectTx() {
  const wallet = useWallet();
  return (
    <button
      type="button"
      onClick={() =>
        wallet.signTransaction({
          kind: "walletconnect",
          from: "...",
          to: "...",
          amount: 1,
          inputType: 0,
          payloadBase64: null,
        })
      }
    >
      Sign with WalletConnect
    </button>
  );
}
```

## Sign with a vault connector

```tsx
import { useWallet } from "@qubic-labs/react";

export function SignVaultTx({ unsignedTxBytes }: { unsignedTxBytes: Uint8Array }) {
  const wallet = useWallet();
  return (
    <button
      type="button"
      onClick={() =>
        wallet.signTransaction({
          kind: "vault",
          unsignedTxBytes,
          vaultRef: "main",
        })
      }
    >
      Sign with Vault
    </button>
  );
}
```

If you provide `defaultRef` to `VaultConnector`, `vaultRef` becomes optional in the request.
