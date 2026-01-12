import { useContractMutation, useContractQuery } from "../src/index.js";

export function QbiQueryExample() {
  const query = useContractQuery("QUTIL", "getFee", { inputBytes: new Uint8Array() });
  if (query.isLoading) return <div>Loading...</div>;
  if (query.error) return <div>{query.error.message}</div>;
  return <pre>{query.data?.responseBase64}</pre>;
}

export function QbiProcedureExample() {
  const mutation = useContractMutation("QUTIL");
  return (
    <button
      type="button"
      onClick={() =>
        mutation.mutate({
          name: "issueAsset",
          fromSeed: "...",
          inputBytes: new Uint8Array(),
        })
      }
    >
      Send
    </button>
  );
}
