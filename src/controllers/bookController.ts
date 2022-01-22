// controllers/bookController.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
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

export const bookDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id)
        .populate<{ author: Author }>("author")
        .populate<{ genre: Genre[] }>("genre"),
      BookInstance.find({ book: req.params.id }),
    ]);
    if (book === null) {
      return next(createError(404, "Book not found"));
    }
    return res.render("bookDetail", { title: book.title, book, bookInstances });
  } catch (err) {
    return next(err);
  }
};

export const bookCreateGet = async (req: Request, res: Response) => {
  const [authors, genres] = await Promise.all([
    Author.find().sort({ familyName: 1 }),
    Genre.find(),
  ]);
  return res.render("bookForm", { title: "Create Book", authors, genres });
};

export const bookCreate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await bookValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [authors, genres] = await Promise.all([
      Author.find().sort({ familyName: 1 }),
      Genre.find(),
    ]);
    return res.render("bookForm", {
      title: "Create Book",
      authors,
      genres,
      book: req.body,
      errors: errors.mapped(),
    });
  }
  try {
    const book = await Book.create(req.body);
    return res.redirect(book.url);
  } catch (err) {
    return next(err);
  }
};

export const bookUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [book, authors, genres] = await Promise.all([
      Book.findById(req.params.id),
      Author.find().sort({ familyName: 1 }),
      Genre.find(),
    ]);
    if (book === null) {
      return next(createError(404, "Book not found"));
    }
    return res.render("bookForm", {
      title: "Update Book",
      authors,
      genres,
      book,
    });
  } catch (err) {
    return next(err);
  }
};

export const bookUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await bookValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [authors, genres] = await Promise.all([
      Author.find().sort({ familyName: 1 }),
      Genre.find(),
    ]);
    return res.render("bookForm", {
      title: "Update Book",
      authors,
      genres,
      book: req.body,
      errors: errors.mapped(),
    });
  }
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body);
    if (book === null) {
      return next(createError(404, "Book not found"));
    }
    return res.redirect(book.url);
  } catch (err) {
    return next(err);
  }
};

export const bookDeleteGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id),
      BookInstance.find({ book: req.params.id }),
    ]);
    if (book === null) {
      return res.redirect("/catalog/books");
    }
    return res.render("bookDelete", {
      title: "Delete Book",
      book,
      bookInstances,
    });
  } catch (err) {
    return next(err);
  }
};

export const bookDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.body.bookId),
      BookInstance.find({ book: req.body.bookId }),
    ]);
    if (bookInstances.length > 0) {
      return res.render("bookDelete", {
        title: "Delete Book",
        book,
        bookInstances,
      });
    }
    await Book.findByIdAndRemove(req.body.bookId);
    return res.redirect("/catalog/books");
  } catch (err) {
    return next(err);
  }
};
