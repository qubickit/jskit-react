import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MetaMaskSnapConnector } from "./metamask-snap.js";

type FakeProvider = {
  request: (input: { method: string; params?: unknown }) => Promise<unknown>;
};

describe("MetaMaskSnapConnector", () => {
  const previous = (globalThis as typeof globalThis & { ethereum?: FakeProvider }).ethereum;

  beforeEach(() => {
    (globalThis as typeof globalThis & { ethereum?: FakeProvider }).ethereum = {
      request: async ({ method }) => {
        if (method === "wallet_requestSnaps") return {};
        if (method === "wallet_invokeSnap") {
          return [{ address: "QUBICADDRESS1", alias: "main" }, { address: "QUBICADDRESS2" }];
        }
        return {};
      },
    };
  });

  afterEach(() => {
    (globalThis as typeof globalThis & { ethereum?: FakeProvider }).ethereum = previous;
  });

  it("detects availability", () => {
    const connector = new MetaMaskSnapConnector();
    expect(connector.isAvailable()).toBe(true);
  });

  it("requests accounts", async () => {
    const connector = new MetaMaskSnapConnector();
    const accounts = await connector.requestAccounts();
    expect(accounts.length).toBe(2);
    expect(accounts[0]?.address).toBe("QUBICADDRESS1");
  });

  it("signs transactions", async () => {
    const signed = Buffer.from([1, 2, 3]).toString("base64");
    (globalThis as typeof globalThis & { ethereum?: FakeProvider }).ethereum = {
      request: async ({ method }) => {
        if (method === "wallet_requestSnaps") return {};
        if (method === "wallet_invokeSnap") return { signedTx: signed };
        return {};
      },
    };
    const connector = new MetaMaskSnapConnector();
    const result = await connector.signTransaction({
      kind: "snap",
      txBytes: new Uint8Array([9, 9, 9]),
      signatureOffset: 0,
    });
    expect(result.signedTxBase64).toBe(signed);
    expect(result.signedTxBytes?.length).toBe(3);
  });
});
