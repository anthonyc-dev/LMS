import assert from "node:assert/strict";
import test from "node:test";
import { getPaginationPages } from "../src/shared/utils/pagination.ts";

test("small page counts stay directly accessible", () => {
  assert.deepEqual(getPaginationPages(1, 0), [1]);
  assert.deepEqual(getPaginationPages(3, 5), [1, 2, 3, 4, 5]);
});

test("large page counts show first, last, neighbors and gaps", () => {
  assert.deepEqual(getPaginationPages(50, 100), [
    1,
    "start-ellipsis",
    49,
    50,
    51,
    "end-ellipsis",
    100,
  ]);
  assert.deepEqual(getPaginationPages(1, 100), [
    1,
    2,
    3,
    4,
    5,
    "end-ellipsis",
    100,
  ]);
  assert.deepEqual(getPaginationPages(100, 100), [
    1,
    "start-ellipsis",
    96,
    97,
    98,
    99,
    100,
  ]);
});

test("mobile keeps current page and endpoints within five slots", () => {
  assert.deepEqual(getPaginationPages(50, 100, 0), [
    1,
    "start-ellipsis",
    50,
    "end-ellipsis",
    100,
  ]);
});

test("every page stays ordered, bounded and reachable across transitions", () => {
  for (const siblings of [0, 1]) {
    for (let total = 1; total <= 100; total++) {
      for (let page = 1; page <= total; page++) {
        const items = getPaginationPages(page, total, siblings);
        const numbers = items.filter((item) => typeof item === "number");
        assert.ok(items.length <= siblings * 2 + 5);
        assert.equal(numbers[0], 1);
        assert.equal(numbers.at(-1), total);
        assert.ok(numbers.includes(page));
        assert.deepEqual(
          numbers,
          [...new Set(numbers)].sort((a, b) => a - b),
        );
      }
    }
  }
});

test("out-of-range pages clamp to available pages without huge arrays", () => {
  assert.deepEqual(getPaginationPages(-1, 100), getPaginationPages(1, 100));
  assert.deepEqual(getPaginationPages(101, 100), getPaginationPages(100, 100));
  assert.equal(getPaginationPages(500000, 1000000).length, 7);
});
