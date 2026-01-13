# Vaults

Vault helpers are exposed for Node/Electron usage and browsers. Node vaults use the filesystem, while browser vaults use a storage-backed store (localStorage or custom).

## Create a vault (Node)

```ts
import { createNodeVault } from "@qubic-labs/react";

const vault = await createNodeVault({
  path: "/tmp/qubic.vault.json",
  passphrase: "strong-passphrase",
});
```

## Import a vault (Node)

```ts
import { importNodeVault } from "@qubic-labs/react";

await importNodeVault({
  path: "/tmp/qubic.vault.json",
  passphrase: "strong-passphrase",
  exportData: "{...}",
  mode: "replace",
});
```

## Open an existing vault (Node)

```ts
import { openNodeVault, vaultExists } from "@qubic-labs/react";

if (await vaultExists("/tmp/qubic.vault.json")) {
  const vault = await openNodeVault({
    path: "/tmp/qubic.vault.json",
    passphrase: "strong-passphrase",
  });
  const entries = vault.list();
}
```

## Create a vault (Browser)

```ts
import { createBrowserVault, createLocalStorageVaultStore } from "@qubic-labs/react";

const store = await createLocalStorageVaultStore("qubic.vault");
const vault = await createBrowserVault({
  store,
  passphrase: "strong-passphrase",
});
```

## Import a vault (Browser)

```ts
import { importBrowserVault, createLocalStorageVaultStore } from "@qubic-labs/react";

const store = await createLocalStorageVaultStore("qubic.vault");
await importBrowserVault({
  store,
  passphrase: "strong-passphrase",
  exportData: "{...}",
  mode: "replace",
});
```

## Custom storage (Browser)

```ts
const store = {
  async read() {
    return await loadFromIndexedDb();
  },
  async write(value: string) {
    await saveToIndexedDb(value);
  },
};
```
