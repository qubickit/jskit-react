import type { MetaMaskInpageProvider } from "@metamask/providers";
import type {
  WalletAccount,
  WalletConnector,
  WalletConnectResult,
  WalletSignTransactionRequest,
  WalletSignTransactionResult,
} from "./types.js";
import { base64ToBytes, bytesToBase64 } from "./utils.js";

export type MetaMaskSnapConfig = Readonly<{
  snapId?: string;
  requestAccountsMethod?: string;
  signTransactionMethod?: string;
  accountIndex?: number;
}>;

export class MetaMaskSnapConnector implements WalletConnector {
  readonly type = "metamask-snap" as const;
  private readonly snapId: string;
  private readonly requestAccountsMethod: string;
  private readonly signTransactionMethod: string;
  private readonly accountIndex?: number;

  constructor(config: MetaMaskSnapConfig = {}) {
    this.snapId = config.snapId ?? "npm:@qubic-lib/qubic-mm-snap";
    this.requestAccountsMethod = config.requestAccountsMethod ?? "getAccounts";
    this.signTransactionMethod = config.signTransactionMethod ?? "signTransaction";
    this.accountIndex = config.accountIndex;
  }

  isAvailable(): boolean {
    return Boolean(this.getProvider());
  }

  async connect(): Promise<WalletConnectResult> {
    const provider = this.requireProvider();
    await provider.request({
      method: "wallet_requestSnaps",
      params: {
        [this.snapId]: {},
      },
    });
    const accounts = await this.requestAccounts();
    return { status: "connected", accounts };
  }

  async disconnect(): Promise<void> {
    // Snaps do not expose an explicit disconnect; clear local state in provider.
  }

  async requestAccounts(): Promise<readonly WalletAccount[]> {
    const provider = this.requireProvider();
    try {
      const result = await provider.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: this.snapId,
          request: {
            method: this.requestAccountsMethod,
            params: {
              accountIdx: this.accountIndex ?? 0,
            },
          },
        },
      });
      if (Array.isArray(result)) {
        return result
          .filter((entry) => entry && typeof entry.address === "string")
          .map((entry) => ({ address: entry.address, alias: entry.alias }));
      }
      return [];
    } catch {
      return [];
    }
  }

  async signTransaction(input: WalletSignTransactionRequest): Promise<WalletSignTransactionResult> {
    if (input.kind !== "snap") {
      throw new Error("MetaMask Snap expects kind: 'snap'");
    }
    const provider = this.requireProvider();
    const signed = await provider.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: this.snapId,
        request: {
          method: this.signTransactionMethod,
          params: {
            base64Tx: bytesToBase64(input.txBytes),
            offset: input.signatureOffset,
            accountIdx: input.accountIndex ?? this.accountIndex ?? 0,
          },
        },
      },
    });
    const result = signed as { signedTx?: string } | undefined;
    const signedBase64 = result?.signedTx ?? String(signed);
    return {
      signedTxBase64: signedBase64,
      signedTxBytes: base64ToBytes(signedBase64),
    };
  }

  private getProvider(): MetaMaskInpageProvider | undefined {
    const anyGlobal = globalThis as typeof globalThis & { ethereum?: MetaMaskInpageProvider };
    return anyGlobal.ethereum;
  }

  private requireProvider(): MetaMaskInpageProvider {
    const provider = this.getProvider();
    if (!provider) {
      throw new Error("MetaMask provider not available");
    }
    return provider;
  }
}
