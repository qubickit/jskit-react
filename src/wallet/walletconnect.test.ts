import { describe, expect, it } from "bun:test";
import type { WalletConnectClient } from "./walletconnect.js";
import { WalletConnectConnector } from "./walletconnect.js";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

function createFakeClient(): WalletConnectClient {
  let sessionTopic = "";
  const sessions = new Map<string, { topic: string }>();
  return {
    async connect() {
      return {
        uri: "wc://example",
        approval: async () => {
          sessionTopic = "topic-1";
          const session = { topic: sessionTopic };
          sessions.set(sessionTopic, session);
          return session as never;
        },
      };
    },
    async request({ request }: { request: { method: string } }) {
      if (request.method === "qubic_requestAccounts") {
        return [{ address: "QUBICADDRESS1", alias: "wallet" }];
      }
      if (request.method === "qubic_signTransaction") {
        return { signedTransaction: Buffer.from([1, 2, 3]).toString("base64") };
      }
      return null;
    },
    async disconnect() {
      sessions.clear();
      sessionTopic = "";
    },
    on() {
      return this;
    },
    session: {
      get: (topic: string) => sessions.get(topic),
    } as WalletConnectClient["session"],
  } as unknown as WalletConnectClient;
}

describe("WalletConnectConnector", () => {
  it("connects and approves", async () => {
    const storage = createMemoryStorage();
    const connector = new WalletConnectConnector({
      projectId: "project",
      metadata: {
        name: "Test",
        description: "Test",
        url: "https://example.com",
        icons: ["https://example.com/icon.png"],
      },
      storage,
      signClientFactory: async () => createFakeClient(),
    });

    const result = await connector.connect();
    expect(result.status).toBe("pending");
    if (result.status !== "pending") throw new Error("Expected pending WalletConnect session");
    const accounts = await result.approve();
    expect(accounts[0]?.address).toBe("QUBICADDRESS1");
    expect(storage.getItem("wcSessionTopic")).toBe("topic-1");
  });

  it("restores a session", async () => {
    const storage = createMemoryStorage();
    const client = createFakeClient();
    const connector = new WalletConnectConnector({
      projectId: "project",
      metadata: {
        name: "Test",
        description: "Test",
        url: "https://example.com",
        icons: ["https://example.com/icon.png"],
      },
      storage,
      signClientFactory: async () => client,
    });
    const pending = await connector.connect();
    if (pending.status !== "pending") throw new Error("Expected pending WalletConnect session");
    await pending.approve();

    const restoredConnector = new WalletConnectConnector({
      projectId: "project",
      metadata: {
        name: "Test",
        description: "Test",
        url: "https://example.com",
        icons: ["https://example.com/icon.png"],
      },
      storage,
      signClientFactory: async () => client,
    });
    const accounts = await restoredConnector.restore();
    expect(accounts?.[0]?.address).toBe("QUBICADDRESS1");
  });
});
