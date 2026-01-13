import type {
  OpenSeedVaultBrowserInput,
  SeedVault,
  VaultExport,
  VaultStore,
} from "@qubic-labs/sdk";

export type CreateBrowserVaultInput = Omit<OpenSeedVaultBrowserInput, "create">;

export async function openBrowserVault(input: OpenSeedVaultBrowserInput): Promise<SeedVault> {
  const sdk = await import("@qubic-labs/sdk");
  const openSeedVaultBrowser =
    (
      sdk as {
        openSeedVaultBrowser?: (value: OpenSeedVaultBrowserInput) => Promise<SeedVault>;
      }
    ).openSeedVaultBrowser ??
    (
      sdk as {
        default?: {
          openSeedVaultBrowser?: (value: OpenSeedVaultBrowserInput) => Promise<SeedVault>;
        };
      }
    ).default?.openSeedVaultBrowser;
  if (!openSeedVaultBrowser) {
    throw new Error("openSeedVaultBrowser is not available in @qubic-labs/sdk");
  }
  return openSeedVaultBrowser(input);
}

export async function createBrowserVault(input: CreateBrowserVaultInput): Promise<SeedVault> {
  return openBrowserVault({ ...input, create: true });
}

export async function importBrowserVault(
  input: Readonly<{
    store: VaultStore;
    passphrase: string;
    exportData: VaultExport | string;
    mode?: "merge" | "replace";
    sourcePassphrase?: string;
  }>,
): Promise<SeedVault> {
  const vault = await openBrowserVault({
    store: input.store,
    passphrase: input.passphrase,
    create: true,
  });
  await vault.importEncrypted(input.exportData, {
    mode: input.mode,
    sourcePassphrase: input.sourcePassphrase,
  });
  return vault;
}

export async function createLocalStorageVaultStore(key: string): Promise<VaultStore> {
  const sdk = await import("@qubic-labs/sdk");
  const factory =
    (sdk as { createLocalStorageVaultStore?: (key: string) => VaultStore })
      .createLocalStorageVaultStore ??
    (sdk as { default?: { createLocalStorageVaultStore?: (key: string) => VaultStore } }).default
      ?.createLocalStorageVaultStore;
  if (!factory) {
    throw new Error("createLocalStorageVaultStore is not available in @qubic-labs/sdk");
  }
  return factory(key);
}

export async function createMemoryVaultStore(label?: string): Promise<VaultStore> {
  const sdk = await import("@qubic-labs/sdk");
  const factory =
    (sdk as { createMemoryVaultStore?: (label?: string) => VaultStore }).createMemoryVaultStore ??
    (sdk as { default?: { createMemoryVaultStore?: (label?: string) => VaultStore } }).default
      ?.createMemoryVaultStore;
  if (!factory) {
    throw new Error("createMemoryVaultStore is not available in @qubic-labs/sdk");
  }
  return factory(label);
}
