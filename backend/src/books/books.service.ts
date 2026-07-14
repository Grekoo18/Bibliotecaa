import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBookDto) {
    return this.prisma.book.create({
      data,
    });
  }

  async findAll(query?: string, category?: string) {
    const year = query && !Number.isNaN(Number(query)) ? Number(query) : undefined;

    return this.prisma.book.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { author: { name: { contains: query, mode: 'insensitive' } } },
                  { isbn: { contains: query, mode: 'insensitive' } },
                  { publisher: { contains: query, mode: 'insensitive' } },
                  ...(year ? [{ publicationYear: year }] : []),
                ],
              }
            : {},
          category
            ? { category: { name: { equals: category, mode: 'insensitive' } } }
            : {},
        ],
      },
      include: {
        author: true,
        category: true,
        _count: {
          select: {
            copies: { where: { status: 'DISPONIBLE' } },
            loans: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        copies: true,
        ratings: {
          include: { user: { select: { id: true, name: true } } },
        },
        _count: {
          select: { copies: { where: { status: 'DISPONIBLE' } } },
        },
      },
    });

    if (!book) throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    return book;
  }

  async update(id: number, data: UpdateBookDto) {
    return this.prisma.book.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.book.delete({
      where: { id },
    });
  }

  // BookCopies Management
  async addCopy(bookId: number, code: string, location?: string) {
    return this.prisma.bookCopy.create({
      data: {
        bookId,
        code,
        location,
        status: 'DISPONIBLE',
      },
    });
  }

  async updateCopyStatus(copyId: number, status: string) {
    return this.prisma.bookCopy.update({
      where: { id: copyId },
      data: { status },
    });
  }

  // Ratings
  async rateBook(bookId: number, userId: number, rating: number, comment?: string) {
    return this.prisma.bookRating.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      update: { rating, comment },
      create: { bookId, userId, rating, comment },
    });
  }
}
