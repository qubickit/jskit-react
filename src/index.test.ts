import { describe, expect, it } from "bun:test";
import { jskitReactVersion } from "./index.js";

describe("jskit-react", () => {
  it("exports a version marker", () => {
    expect(jskitReactVersion).toBe("0.0.0-development");
  });
});
