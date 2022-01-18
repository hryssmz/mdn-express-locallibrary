// apis/bookApi.ts
import { Request, Response } from "express";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import Genre from "../models/genre";

export async function indexApi(req: Request, res: Response) {
  const [
    bookCount,
    bookInstanceCount,
    bookInstanceAvailableCount,
    authorCount,
    genreCount,
  ] = await Promise.all([
    Book.countDocuments(),
    BookInstance.countDocuments(),
    BookInstance.countDocuments({ status: "Available" }),
    Author.countDocuments(),
    Genre.countDocuments(),
  ]);
  return res.json({
    data: {
      bookCount,
      bookInstanceCount,
      bookInstanceAvailableCount,
      authorCount,
      genreCount,
    },
  });
}
