import { privateKeyFromSeed } from "@qubic-labs/core";
import type { SeedVault } from "@qubic-labs/sdk";
import type {
  WalletAccount,
  WalletConnector,
  WalletConnectResult,
  WalletSignTransactionRequest,
  WalletSignTransactionResult,
} from "./types.js";
import { bytesToBase64 } from "./utils.js";

export type VaultConnectorConfig = Readonly<{
  vault: SeedVault;
  defaultRef?: string;
}>;

export class VaultConnector implements WalletConnector {
  readonly type = "vault" as const;
  private readonly vault: SeedVault;
  private readonly defaultRef?: string;

  constructor(config: VaultConnectorConfig) {
    this.vault = config.vault;
    this.defaultRef = config.defaultRef;
  }

  isAvailable(): boolean {
    return true;
  }

  async connect(): Promise<WalletConnectResult> {
    const accounts = this.listAccounts();
    return { status: "connected", accounts };
  }

  async disconnect(): Promise<void> {
    return;
  }

  async requestAccounts(): Promise<readonly WalletAccount[]> {
    return this.listAccounts();
  }

  async signTransaction(input: WalletSignTransactionRequest): Promise<WalletSignTransactionResult> {
    if (input.kind !== "vault") {
      throw new Error("Vault connector expects kind: 'vault'");
    }
    const ref = input.vaultRef ?? this.defaultRef;
    if (!ref) {
      throw new Error("vaultRef is required for vault signing");
    }
    const seed = await this.vault.getSeed(ref);
    const secretKey32 = await privateKeyFromSeed(seed);
    const core = await import("@qubic-labs/core");
    const signer =
      (core as { signTransaction?: (tx: Uint8Array, key: Uint8Array) => Promise<Uint8Array> })
        .signTransaction ??
      (
        core as {
          default?: { signTransaction?: (tx: Uint8Array, key: Uint8Array) => Promise<Uint8Array> };
        }
      ).default?.signTransaction;
    if (!signer) {
      throw new Error("signTransaction is not available in @qubic-labs/core");
    }
    const signature64 = await signer(input.unsignedTxBytes, secretKey32);
    const signed = new Uint8Array(input.unsignedTxBytes.length + signature64.length);
    signed.set(input.unsignedTxBytes, 0);
    signed.set(signature64, input.unsignedTxBytes.length);
    return {
      signedTxBase64: bytesToBase64(signed),
      signedTxBytes: signed,
    };
  }

  private listAccounts(): readonly WalletAccount[] {
    return this.vault.list().map((entry: { identity: string; name: string }) => ({
      address: entry.identity,
      alias: entry.name,
    }));
  }
}
