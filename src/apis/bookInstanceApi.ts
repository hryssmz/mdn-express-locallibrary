// apis/bookInstanceApi.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import Book from "../models/book";
import BookInstance, { statusChoices } from "../models/bookInstance";

export const bookInstanceListApi = async (req: Request, res: Response) => {
  const bookInstanceList = await BookInstance.find().populate<{ book: Book }>(
    "book"
  );
  return res.json({ bookInstanceList });
};

export const bookInstanceDetailApi = async (req: Request, res: Response) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).populate<{
      book: Book;
    }>("book");
    if (bookInstance === null) {
      return res.status(404).json("Book copy not found");
    }
    return res.json({ bookInstance });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const bookInstanceCreateGetApi = async (req: Request, res: Response) => {
  const bookList = await Book.find({}, "title").sort({ title: 1 });
  return res.json({ bookList, statusChoices });
};

export const bookInstanceCreateApi = [
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.dueBack === "") {
      req.body.dueBack = undefined;
    }
    return next();
  },

  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const bookList = await Book.find({}, "title").sort({ title: 1 });
      return res.status(400).json({
        bookList,
        statusChoices,
        bookInstance: req.body,
        errors: errors.array(),
      });
    }
    try {
      const bookInstance = await BookInstance.create(req.body);
      return res.redirect(bookInstance.url);
    } catch (err) {
      res.status(500).json(err);
    }
  },
];

export const bookInstanceUpdateGetApi = async (req: Request, res: Response) => {
  try {
    const [bookInstance, bookList] = await Promise.all([
      BookInstance.findById(req.params.id),
      Book.find({}, "title").sort({ title: 1 }),
    ]);
    if (bookInstance === null) {
      return res.status(404).json("BookInstance not found");
    }
    return res.json({ bookInstance, bookList, statusChoices });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const bookInstanceUpdateApi = [
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.dueBack === "") {
      req.body.dueBack = undefined;
    }
    return next();
  },

  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const bookList = await Book.find({}, "title").sort({ title: 1 });
      return res.status(400).json({
        bookList,
        statusChoices,
        bookInstance: req.body,
        errors: errors.array(),
      });
    }
    try {
      const bookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        req.body
      );
      if (bookInstance === null) {
        return res.status(404).json("BookInstance not found");
      }
      return res.redirect(bookInstance.url);
    } catch (err) {
      res.status(500).json(err);
    }
  },
];

export const bookInstanceDeleteGetApi = async (req: Request, res: Response) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id);
    if (bookInstance === null) {
      return res.redirect("/catalog/book-instances");
    }
    return res.json({ bookInstance });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const bookInstanceDeleteApi = async (req: Request, res: Response) => {
  try {
    await BookInstance.findByIdAndRemove(req.body.bookInstanceId);
    return res.redirect("/catalog/book-instances");
  } catch (err) {
    return res.status(500).json(err);
  }
};
