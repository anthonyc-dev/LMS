export type PaginationPage = number | "start-ellipsis" | "end-ellipsis";

export function getPaginationPages(
  currentPage: number,
  totalPages: number,
  siblings: 0 | 1 = 1,
): PaginationPage[] {
  const total = Math.max(1, Math.trunc(totalPages));
  const current = Math.min(total, Math.max(1, Math.trunc(currentPage)));
  const maxItems = siblings * 2 + 5;

  if (total <= maxItems) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const start = Math.max(
    2,
    Math.min(current - siblings, total - siblings * 2 - 2),
  );
  const end = Math.min(
    total - 1,
    Math.max(current + siblings, siblings * 2 + 3),
  );
  const pages: PaginationPage[] = [1];

  if (start > 2) pages.push("start-ellipsis");
  for (let page = start; page <= end; page++) pages.push(page);
  if (end < total - 1) pages.push("end-ellipsis");
  pages.push(total);

  return pages;
}
