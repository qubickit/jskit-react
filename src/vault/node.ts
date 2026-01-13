import type { OpenSeedVaultInput, SeedVault, VaultExport } from "@qubic-labs/sdk";

export type CreateVaultInput = Omit<OpenSeedVaultInput, "create">;

export async function openNodeVault(input: OpenSeedVaultInput): Promise<SeedVault> {
  const sdk = await import("@qubic-labs/sdk");
  const openSeedVault =
    (sdk as { openSeedVault?: (value: OpenSeedVaultInput) => Promise<SeedVault> }).openSeedVault ??
    (sdk as { default?: { openSeedVault?: (value: OpenSeedVaultInput) => Promise<SeedVault> } })
      .default?.openSeedVault;
  if (!openSeedVault) throw new Error("openSeedVault is not available in @qubic-labs/sdk");
  return openSeedVault(input);
}

export async function createNodeVault(input: CreateVaultInput): Promise<SeedVault> {
  const sdk = await import("@qubic-labs/sdk");
  const openSeedVault =
    (sdk as { openSeedVault?: (value: OpenSeedVaultInput) => Promise<SeedVault> }).openSeedVault ??
    (sdk as { default?: { openSeedVault?: (value: OpenSeedVaultInput) => Promise<SeedVault> } })
      .default?.openSeedVault;
  if (!openSeedVault) throw new Error("openSeedVault is not available in @qubic-labs/sdk");
  return openSeedVault({ ...input, create: true });
}

export async function importNodeVault(
  input: Readonly<{
    path: string;
    passphrase: string;
    exportData: VaultExport | string;
    mode?: "merge" | "replace";
    sourcePassphrase?: string;
  }>,
): Promise<SeedVault> {
  const vault = await openNodeVault({
    path: input.path,
    passphrase: input.passphrase,
    create: true,
  });
  await vault.importEncrypted(input.exportData, {
    mode: input.mode,
    sourcePassphrase: input.sourcePassphrase,
  });
  return vault;
}

export async function vaultExists(path: string): Promise<boolean> {
  const sdk = await import("@qubic-labs/sdk");
  const exists =
    (sdk as { vaultExists?: (value: string) => Promise<boolean> }).vaultExists ??
    (sdk as { default?: { vaultExists?: (value: string) => Promise<boolean> } }).default
      ?.vaultExists;
  if (!exists) throw new Error("vaultExists is not available in @qubic-labs/sdk");
  return exists(path);
}
