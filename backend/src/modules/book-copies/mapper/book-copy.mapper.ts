import { BookCopy } from '../entities/book-copy.entity';

export class BookCopyMapper {
  static toResponse(copy: BookCopy) {
    return {
      id: copy.id,
      barcode: copy.barcode,
      status: copy.status,
      condition: copy.condition,
      notes: copy.notes,
      acquiredAt: copy.acquiredAt,
      purchasePrice: copy.purchasePrice,

      book: copy.book
        ? {
            id: copy.book.id,
            title: copy.book.title,
            author: copy.book.author,
            description: copy.book.description,
            isbn: copy.book.isbn,
            category: copy.book.category,
          }
        : null,

      location: {
        shelfId: copy.shelfSection?.shelf?.id ?? null,
        shelfName: copy.shelfSection?.shelf?.name ?? null,
        sectionId: copy.shelfSection?.id ?? null,
        sectionName: copy.shelfSection?.name ?? null,
      },

      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
    };
  }

  static toResponseList(copies: BookCopy[]) {
    return copies.map((copy) => this.toResponse(copy));
  }
}
