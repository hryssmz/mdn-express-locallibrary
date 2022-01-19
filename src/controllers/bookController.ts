// controllers/bookController.ts
import { Request, Response } from "express";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import Genre from "../models/genre";

export const index = async (req: Request, res: Response) => {
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
  return res.render("index", {
    title: "Local Library Home",
    data: {
      bookCount,
      bookInstanceCount,
      bookInstanceAvailableCount,
      authorCount,
      genreCount,
    },
  });
};

export const bookList = async (req: Request, res: Response) => {
  const bookList = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate<{ author: Author }>("author");
  return res.render("bookList", { title: "Book List", bookList });
};
