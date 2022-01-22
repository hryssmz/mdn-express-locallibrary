// controllers/bookInstanceController.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { bookInstanceValidator } from "../validators/bookInstanceValidator";
import createError from "http-errors";
import Book from "../models/book";
import BookInstance, { statusChoices } from "../models/bookInstance";

export const bookInstanceList = async (req: Request, res: Response) => {
  const bookInstanceList = await BookInstance.find().populate<{ book: Book }>(
    "book"
  );
  return res.render("bookInstanceList", {
    title: "Book Instance List",
    bookInstanceList,
  });
};

export const bookInstanceDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).populate<{
      book: Book;
    }>("book");
    if (bookInstance === null) {
      return next(createError(404, "Book copy not found"));
    }
    return res.render("bookInstanceDetail", {
      title: `Copy: ${bookInstance.book.title}`,
      bookInstance,
    });
  } catch (err) {
    return next(err);
  }
};

export const bookInstanceCreateGet = async (req: Request, res: Response) => {
  const bookList = await Book.find({}, "title").sort({ title: 1 });
  return res.render("bookInstanceForm", {
    title: "Create BookInstance",
    bookList,
    statusChoices,
  });
};

export const bookInstanceCreate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await bookInstanceValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const bookList = await Book.find({}, "title").sort({ title: 1 });
    return res.render("bookInstanceForm", {
      title: "Create BookInstance",
      bookList,
      statusChoices,
      bookInstance: req.body,
      errors: errors.mapped(),
    });
  }
  try {
    const bookInstance = await BookInstance.create(req.body);
    return res.redirect(bookInstance.url);
  } catch (err) {
    return next(err);
  }
};

export const bookInstanceUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [bookInstance, bookList] = await Promise.all([
      BookInstance.findById(req.params.id),
      Book.find({}, "title").sort({ title: 1 }),
    ]);
    if (bookInstance === null) {
      return next(createError(404, "BookInstance not found"));
    }
    return res.render("bookInstanceForm", {
      title: "Update BookInstance",
      bookInstance,
      bookList,
      statusChoices,
    });
  } catch (err) {
    return next(err);
  }
};

export const bookInstanceUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await bookInstanceValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const bookList = await Book.find({}, "title").sort({ title: 1 });
    return res.render("bookInstanceForm", {
      title: "Update BookInstance",
      bookList,
      statusChoices,
      bookInstance: req.body,
      errors: errors.mapped(),
    });
  }
  try {
    const bookInstance = await BookInstance.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    if (bookInstance === null) {
      return next(createError(404, "BookInstance not found"));
    }
    return res.redirect(bookInstance.url);
  } catch (err) {
    return next(err);
  }
};

export const bookInstanceDeleteGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id);
    if (bookInstance === null) {
      return res.redirect("/catalog/book-instances");
    }
    return res.render("bookInstanceDelete", {
      title: "Delete BookInstance",
      bookInstance,
    });
  } catch (err) {
    return next(err);
  }
};

export const bookInstanceDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await BookInstance.findByIdAndRemove(req.body.bookInstanceId);
    return res.redirect("/catalog/book-instances");
  } catch (err) {
    return next(err);
  }
};
