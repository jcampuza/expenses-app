import { expect, it } from "bun:test";
import { createRoot, flush } from "solid-js";
import { createPendingFn } from "./pending";

it("distinguishes successful null mutations from rejection and resets pending state", async () => {
  const { pending, dispose } = createRoot((dispose) => ({
    dispose,
    pending: createPendingFn(async (fail: boolean) => {
      if (fail) throw new Error("Denied");
      return null;
    }),
  }));
  const failed = pending.mutate(true);
  flush();
  expect(pending.isPending()).toBe(true);
  expect(await failed).toEqual({ ok: false, error: "Denied" });
  flush();
  expect(pending.isPending()).toBe(false);
  expect(pending.error()).toBe("Denied");
  expect(await pending.mutate(false)).toEqual({ ok: true, value: null });
  flush();
  expect(pending.error()).toBeNull();
  expect(pending.isPending()).toBe(false);
  dispose();
});
