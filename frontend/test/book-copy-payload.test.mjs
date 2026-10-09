import assert from "node:assert/strict";
import test from "node:test";
import { buildBookCopyRequests } from "../src/features/books/utils/bookCopyPayload.ts";

const details = {
  status: "AVAILABLE",
  condition: "GOOD",
  bookId: "7452f42f-996b-40d0-8a5b-70c0a8354fca",
  acquiredAt: "2026-10-09T00:00:00.000Z",
  purchasePrice: 0,
};

test("single copy omits UI-only section array and bulk count", () => {
  const [request] = buildBookCopyRequests({ ...details, shelfSectionIds: [] });
  assert.deepEqual(request, { ...details, shelfSectionId: undefined });
  assert.equal("shelfSectionIds" in request, false);
  assert.equal("count" in request, false);
});

test("single copy keeps selected section", () => {
  const [request] = buildBookCopyRequests({
    ...details,
    shelfSectionIds: ["section-1"],
  });
  assert.equal(request.shelfSectionId, "section-1");
});

test("bulk copies without a section keep total count", () => {
  assert.deepEqual(
    buildBookCopyRequests({ ...details, shelfSectionIds: [], count: 3 }),
    [{ ...details, shelfSectionId: undefined, count: 3 }],
  );
});

test("bulk copies distribute total across sections without sending UI fields", () => {
  const requests = buildBookCopyRequests({
    ...details,
    shelfSectionIds: ["section-1", "section-2"],
    count: 5,
  });
  assert.deepEqual(requests, [
    { ...details, shelfSectionId: "section-1", count: 3 },
    { ...details, shelfSectionId: "section-2", count: 2 },
  ]);
  assert.ok(requests.every((request) => !("shelfSectionIds" in request)));
});

test("more sections than copies never sends a zero-count request", () => {
  const requests = buildBookCopyRequests({
    ...details,
    shelfSectionIds: ["section-1", "section-2", "section-3"],
    count: 2,
  });
  assert.equal(requests.length, 2);
  assert.ok(requests.every((request) => request.count === 1));
});

test("invalid bulk counts fail before API requests", () => {
  for (const count of [0, -1, 2.5, NaN]) {
    assert.throws(() =>
      buildBookCopyRequests({ ...details, shelfSectionIds: [], count }),
    );
  }
});
