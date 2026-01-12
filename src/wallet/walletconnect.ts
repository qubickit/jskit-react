import SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import type {
  WalletAccount,
  WalletConnector,
  WalletConnectResult,
  WalletSignTransactionRequest,
  WalletSignTransactionResult,
} from "./types.js";
import { base64ToBytes } from "./utils.js";

export type WalletConnectConfig = Readonly<{
  projectId: string;
  metadata: Readonly<{
    name: string;
    description: string;
    url: string;
    icons: readonly string[];
  }>;
  chainId?: string;
  methods?: readonly string[];
  events?: readonly string[];
  storageKey?: string;
  storage?: Storage;
}>;

export class WalletConnectConnector implements WalletConnector {
  readonly type = "walletconnect" as const;
  private readonly config: WalletConnectConfig;
  private client: SignClient | null = null;
  private sessionTopic = "";

  constructor(config: WalletConnectConfig) {
    this.config = config;
  }

  isAvailable(): boolean {
    return true;
  }

  async connect(): Promise<WalletConnectResult> {
    const client = await this.getClient();
    const { uri, approval } = await client.connect({
      requiredNamespaces: {
        qubic: {
          chains: [this.config.chainId ?? "qubic:mainnet"],
          methods: [
            ...(this.config.methods ?? [
              "qubic_requestAccounts",
              "qubic_sendQubic",
              "qubic_signTransaction",
              "qubic_sign",
            ]),
          ],
          events: [...(this.config.events ?? ["accountsChanged", "amountChanged"])],
        },
      },
    });

    const approve = async () => {
      const session = await approval();
      await this.storeSession(session);
      return this.requestAccounts();
    };

    return {
      status: "pending",
      uri: uri ?? "",
      approve,
    };
  }

  async disconnect(): Promise<void> {
    if (!this.client || !this.sessionTopic) return;
    await this.client.disconnect({
      topic: this.sessionTopic,
      reason: { code: 6000, message: "User disconnected" },
    });
    this.clearSession();
  }

  async requestAccounts(): Promise<readonly WalletAccount[]> {
    const client = await this.getClient();
    if (!this.sessionTopic) {
      const restored = await this.restore();
      if (!restored) throw new Error("WalletConnect session not connected");
    }
    const result = (await client.request({
      topic: this.sessionTopic,
      chainId: this.config.chainId ?? "qubic:mainnet",
      request: {
        method: "qubic_requestAccounts",
        params: { nonce: Date.now().toString() },
      },
    })) as Array<{ address: string; alias?: string }>;
    return result.map((entry) => ({ address: entry.address, alias: entry.alias }));
  }

  async signTransaction(input: WalletSignTransactionRequest): Promise<WalletSignTransactionResult> {
    if (input.kind !== "walletconnect") {
      throw new Error("WalletConnect expects kind: 'walletconnect'");
    }
    const client = await this.getClient();
    if (!this.sessionTopic) {
      const restored = await this.restore();
      if (!restored) throw new Error("WalletConnect session not connected");
    }
    const signed = (await client.request({
      topic: this.sessionTopic,
      chainId: this.config.chainId ?? "qubic:mainnet",
      request: {
        method: "qubic_signTransaction",
        params: {
          from: input.from,
          to: input.to,
          amount: input.amount,
          tick: input.tick,
          inputType: input.inputType,
          payload: input.payloadBase64 ?? null,
          nonce: input.nonce ?? Date.now().toString(),
        },
      },
    })) as { signedTransaction: string };
    return {
      signedTxBase64: signed.signedTransaction,
      signedTxBytes: base64ToBytes(signed.signedTransaction),
    };
  }

  async restore(): Promise<readonly WalletAccount[] | null> {
    const client = await this.getClient();
    const storage = this.config.storage ?? getDefaultStorage();
    if (!storage) return null;
    const storedTopic = storage.getItem(this.config.storageKey ?? "wcSessionTopic");
    if (!storedTopic) return null;
    const session = client.session.get(storedTopic);
    if (!session) {
      storage.removeItem(this.config.storageKey ?? "wcSessionTopic");
      return null;
    }
    this.sessionTopic = storedTopic;
    return this.requestAccounts();
  }

  private async getClient(): Promise<SignClient> {
    if (this.client) return this.client;
    const client = await SignClient.init({
      projectId: this.config.projectId,
      metadata: {
        ...this.config.metadata,
        icons: [...this.config.metadata.icons],
      },
    });
    client.on("session_delete", () => this.clearSession());
    client.on("session_expire", () => this.clearSession());
    this.client = client;
    return client;
  }

  private async storeSession(session: SessionTypes.Struct): Promise<void> {
    this.sessionTopic = session.topic;
    const storage = this.config.storage ?? getDefaultStorage();
    if (storage) {
      storage.setItem(this.config.storageKey ?? "wcSessionTopic", session.topic);
    }
  }

  private clearSession(): void {
    this.sessionTopic = "";
    const storage = this.config.storage ?? getDefaultStorage();
    if (storage) {
      storage.removeItem(this.config.storageKey ?? "wcSessionTopic");
    }
  }
}

function getDefaultStorage(): Storage | undefined {
  const anyGlobal = globalThis as typeof globalThis & { localStorage?: Storage };
  return anyGlobal.localStorage;
}
