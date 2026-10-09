import type {
  BulkCreateBookCopyPayload,
  CreateBookCopyPayload,
} from "../api/bookCopies";

export interface BookCopyFormPayload extends Omit<
  CreateBookCopyPayload,
  "shelfSectionId"
> {
  shelfSectionIds: string[];
  count?: number;
}

export function buildBookCopyRequests(
  form: BookCopyFormPayload,
): (CreateBookCopyPayload | BulkCreateBookCopyPayload)[] {
  const { shelfSectionIds, count, ...details } = form;
  const sections = shelfSectionIds.length > 0 ? shelfSectionIds : [undefined];
  if (count !== undefined) {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error("Copy count must be a positive integer.");
    }
    const baseCount = Math.floor(count / sections.length);
    const remainder = count % sections.length;
    return sections.flatMap((shelfSectionId, index) => {
      const sectionCount = baseCount + (index < remainder ? 1 : 0);
      return sectionCount > 0
        ? [{ ...details, shelfSectionId, count: sectionCount }]
        : [];
    });
  }
  return [{ ...details, shelfSectionId: sections[0] }];
}
