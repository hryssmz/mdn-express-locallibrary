// apis/bookApi.ts
import { Request, Response } from "express";
import Author from "../models/author";
import Book from "../models/book";
import BookInstance from "../models/bookInstance";
import Genre from "../models/genre";

export const indexApi = async (req: Request, res: Response) => {
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
};

export const bookListApi = async (req: Request, res: Response) => {
  const bookList = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate<{ author: Author }>("author");
  return res.json({ bookList });
};

export const bookDetailApi = async (req: Request, res: Response) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id)
        .populate<{ author: Author }>("author")
        .populate<{ genre: Genre[] }>("genre"),
      BookInstance.find({ book: req.params.id }),
    ]);
    if (book === null) {
      return res.status(404).json("Book not found");
    }
    return res.json({ book, bookInstances });
  } catch (err) {
    return res.status(500).json(err);
  }
};
