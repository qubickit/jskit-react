import type { TransactionsForIdentityResponse } from "@qubic-labs/sdk";
import { useState } from "react";
import { useTransactions } from "../src/index.js";

export function TransactionsList({ identity }: { identity: string }) {
  const [pages, setPages] = useState(1);
  const txs = useTransactions({ identity, pageSize: 50, limit: BigInt(pages * 50) });

  return (
    <div>
      <div>
        Total:{" "}
        {txs.data?.pages.flatMap((page: TransactionsForIdentityResponse) => page.transactions)
          .length ?? 0}
      </div>
      <button type="button" onClick={() => setPages((current) => current + 1)}>
        Load more
      </button>
    </div>
  );
}
