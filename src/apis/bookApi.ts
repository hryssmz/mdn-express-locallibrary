// apis/bookApi.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
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

export const bookCreateGetApi = async (req: Request, res: Response) => {
  const [authors, genres] = await Promise.all([
    Author.find().sort({ familyName: 1 }),
    Genre.find(),
  ]);
  return res.json({ authors, genres });
};

export const bookCreateApi = [
  (req: Request, res: Response, next: NextFunction) => {
    if (!(req.body.genre instanceof Array)) {
      req.body.genre = req.body.genre === undefined ? [] : [req.body.genre];
    }
    return next();
  },

  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [authors, genres] = await Promise.all([
        Author.find().sort({ familyName: 1 }),
        Genre.find(),
      ]);
      return res
        .status(400)
        .json({ authors, genres, book: req.body, errors: errors.array() });
    }
    try {
      const book = await Book.create(req.body);
      return res.redirect(book.url);
    } catch (err) {
      return res.status(500).json(err);
    }
  },
];
