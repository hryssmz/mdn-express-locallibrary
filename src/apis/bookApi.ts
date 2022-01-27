// apis/bookApi.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { bookValidator } from "../validators/bookValidator";
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
  // HTTP 200: return number of each record in the library
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
  // HTTP 200: return book list sorted by title
  return res.json({ bookList });
};

export const bookDetailApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Book not found");
  }
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id)
      .populate<{ author: Author }>("author")
      .populate<{ genre: Genre[] }>("genre"),
    BookInstance.find({ book: req.params.id }),
  ]);
  if (book === null) {
    // HTTP 404: book not found
    return res.status(404).json("Book not found");
  }
  // HTTP 200: return book and all its copies
  return res.json({ book, bookInstances });
};

export const bookCreateGetApi = async (req: Request, res: Response) => {
  const [authors, genres] = await Promise.all([
    Author.find().sort({ familyName: 1 }),
    Genre.find(),
  ]);
  // HTTP 200: return all related authors and genres
  return res.json({ authors, genres });
};

export const bookCreateApi = async (req: Request, res: Response) => {
  await bookValidator.run(req);
  const errors = validationResult(req);
  const bookData = {
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: req.body.genre,
  };
  if (!errors.isEmpty()) {
    const [authors, genres] = await Promise.all([
      Author.find().sort({ familyName: 1 }),
      Genre.find(),
    ]);
    // HTTP 400: return authors, genres, book data, and validation errors
    return res
      .status(400)
      .json({ authors, genres, book: bookData, errors: errors.mapped() });
  }
  // HTTP 302: create book and redirect to detail view
  const book = await Book.create(bookData);
  return res.redirect(book.url);
};

export const bookUpdateGetApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Book not found");
  }
  const [book, authors, genres] = await Promise.all([
    Book.findById(req.params.id),
    Author.find().sort({ familyName: 1 }),
    Genre.find(),
  ]);
  if (book === null) {
    // HTTP 404: book not found
    return res.status(404).json("Book not found");
  }
  // HTTP 200: return authors, genres, and book data
  return res.json({ authors, genres, book });
};

export const bookUpdateApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Book not found");
  }
  const book = await Book.findById(req.params.id);
  if (book === null) {
    // HTTP 404: book not found
    return res.status(404).json("Book not found");
  }
  await bookValidator.run(req);
  const errors = validationResult(req);
  const bookData = {
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: req.body.genre,
  };
  if (!errors.isEmpty()) {
    const [authors, genres] = await Promise.all([
      Author.find().sort({ familyName: 1 }),
      Genre.find(),
    ]);
    // HTTP 400: return authors, genres, book data, and validation errors
    return res
      .status(400)
      .json({ authors, genres, book: bookData, errors: errors.mapped() });
  }
  // HTTP 302: update book and redirect to detail view
  await book.updateOne(bookData);
  return res.redirect(book.url);
};

export const bookDeleteGetApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/books");
  }
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id),
    BookInstance.find({ book: req.params.id }),
  ]);
  if (book === null) {
    // HTTP 302: redirect to list view if book not found
    return res.redirect("/catalog/books");
  }
  // HTTP 200: return book and all its copies
  return res.json({ book, bookInstances });
};

export const bookDeleteApi = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.body.bookId);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/books");
  }
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.body.bookId),
    BookInstance.find({ book: req.body.bookId }),
  ]);
  if (book === null) {
    // HTTP 302: redirect to list view if book not found
    return res.redirect("/catalog/books");
  }
  if (bookInstances.length > 0) {
    // HTTP 200: return book and all its copies without deleting
    return res.json({ book, bookInstances });
  }
  // HTTP 302: delete book and redirect to list view
  await book.deleteOne();
  return res.redirect("/catalog/books");
};
