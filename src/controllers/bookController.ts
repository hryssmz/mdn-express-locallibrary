// controllers/bookController.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { bookValidator } from "../validators/bookValidator";
import createError from "http-errors";
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
  // HTTP 200: render number of each record in the library
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
  // HTTP 200: render book list sorted by title
  return res.render("bookList", { title: "Book List", bookList });
};

export const bookDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Book not found"));
  }
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id)
      .populate<{ author: Author }>("author")
      .populate<{ genre: Genre[] }>("genre"),
    BookInstance.find({ book: req.params.id }),
  ]);
  if (book === null) {
    // HTTP 404: book not found
    return next(createError(404, "Book not found"));
  }
  // HTTP 200: render book and all its copies
  return res.render("bookDetail", { title: book.title, book, bookInstances });
};

export const bookCreateGet = async (req: Request, res: Response) => {
  const [authors, genres] = await Promise.all([
    Author.find().sort({ familyName: 1 }),
    Genre.find(),
  ]);
  // HTTP 200: render all related authors and genres
  return res.render("bookForm", { title: "Create Book", authors, genres });
};

export const bookCreate = async (req: Request, res: Response) => {
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
    // HTTP 200: render authors, genres, book data, and validation errors
    return res.render("bookForm", {
      title: "Create Book",
      authors,
      genres,
      book: bookData,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: create book and redirect to detail view
  const book = await Book.create(bookData);
  return res.redirect(book.url);
};

export const bookUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Book not found"));
  }
  const [book, authors, genres] = await Promise.all([
    Book.findById(req.params.id),
    Author.find().sort({ familyName: 1 }),
    Genre.find(),
  ]);
  if (book === null) {
    // HTTP 404: book not found
    return next(createError(404, "Book not found"));
  }
  // HTTP 200: render authors, genres, and book data
  return res.render("bookForm", {
    title: "Update Book",
    authors,
    genres,
    book,
  });
};

export const bookUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Book not found"));
  }
  const book = await Book.findByIdAndUpdate(req.params.id, req.body);
  if (book === null) {
    // HTTP 404: book not found
    return next(createError(404, "Book not found"));
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
    // HTTP 200: render authors, genres, book data, and validation errors
    return res.render("bookForm", {
      title: "Update Book",
      authors,
      genres,
      book: req.body,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: update book and redirect to detail view
  await book.updateOne(bookData);
  return res.redirect(book.url);
};

export const bookDeleteGet = async (req: Request, res: Response) => {
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
  return res.render("bookDelete", {
    title: "Delete Book",
    book,
    bookInstances,
  });
};

export const bookDelete = async (req: Request, res: Response) => {
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
    // HTTP 200: render book and all its copies without deleting
    return res.render("bookDelete", {
      title: "Delete Book",
      book,
      bookInstances,
    });
  }
  // HTTP 302: delete book and redirect to list view
  await Book.findByIdAndRemove(req.body.bookId);
  return res.redirect("/catalog/books");
};
