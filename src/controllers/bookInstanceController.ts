// controllers/bookInstanceController.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import createError from "http-errors";
import { Types } from "mongoose";
import { bookInstanceValidator } from "../validators/bookInstanceValidator";
import Book from "../models/book";
import BookInstance, { statusChoices } from "../models/bookInstance";

export const bookInstanceList = async (req: Request, res: Response) => {
  const bookInstanceList = await BookInstance.find().populate<{ book: Book }>(
    "book"
  );
  // HTTP 200: render book copy list
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
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Book copy not found"));
  }
  const bookInstance = await BookInstance.findById(req.params.id).populate<{
    book: Book;
  }>("book");
  if (bookInstance === null) {
    // HTTP 404: book copy not found
    return next(createError(404, "Book copy not found"));
  }
  // HTTP 200: render book copy
  return res.render("bookInstanceDetail", {
    title: `Copy: ${bookInstance.book.title}`,
    bookInstance,
  });
};

export const bookInstanceCreateGet = async (req: Request, res: Response) => {
  const bookList = await Book.find({}, "title").sort({ title: 1 });
  // HTTP 200: return books and status choices
  return res.render("bookInstanceForm", {
    title: "Create BookInstance",
    bookList,
    statusChoices,
  });
};

export const bookInstanceCreate = async (req: Request, res: Response) => {
  await bookInstanceValidator.run(req);
  const errors = validationResult(req);
  const bookInstanceData = {
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    dueBack: req.body.dueBack,
  };
  if (!errors.isEmpty()) {
    const bookList = await Book.find({}, "title").sort({ title: 1 });
    // HTTP 200: render choices, book copy, and validation errors
    return res.render("bookInstanceForm", {
      title: "Create BookInstance",
      bookList,
      statusChoices,
      bookInstance: bookInstanceData,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: create book copy and redirect to detail view
  const bookInstance = await BookInstance.create(req.body);
  return res.redirect(bookInstance.url);
};

export const bookInstanceUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return res.status(404).json("Book copy not found");
  }
  const [bookInstance, bookList] = await Promise.all([
    BookInstance.findById(req.params.id),
    Book.find({}, "title").sort({ title: 1 }),
  ]);
  if (bookInstance === null) {
    // HTTP 404: book copy not found
    return next(createError(404, "Book copy not found"));
  }
  // HTTP 200: render books, status choices and book copy
  return res.render("bookInstanceForm", {
    title: "Update BookInstance",
    bookInstance,
    bookList,
    statusChoices,
  });
};

export const bookInstanceUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Book copy not found"));
  }
  const bookInstance = await BookInstance.findById(req.params.id);
  if (bookInstance === null) {
    // HTTP 404: book copy not found
    return next(createError(404, "Book copy not found"));
  }
  await bookInstanceValidator.run(req);
  const errors = validationResult(req);
  const bookInstanceData = {
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    dueBack: req.body.dueBack,
  };
  if (!errors.isEmpty()) {
    const bookList = await Book.find({}, "title").sort({ title: 1 });
    // HTTP 200: render choices, book copy, and validation errors
    return res.render("bookInstanceForm", {
      title: "Update BookInstance",
      bookList,
      statusChoices,
      bookInstance: req.body,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: update book copy and redirect to detail view
  await bookInstance.updateOne(bookInstanceData);
  return res.redirect(bookInstance.url);
};

export const bookInstanceDeleteGet = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/book-instances");
  }
  const bookInstance = await BookInstance.findById(req.params.id);
  if (bookInstance === null) {
    // HTTP 302: redirect to list view if book copy not found
    return res.redirect("/catalog/book-instances");
  }
  // HTTP 200: render book copy
  return res.render("bookInstanceDelete", {
    title: "Delete BookInstance",
    bookInstance,
  });
};

export const bookInstanceDelete = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.body.bookInstanceId);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/book-instances");
  }
  const bookInstance = await BookInstance.findById(req.body.bookInstanceId);
  if (bookInstance === null) {
    // HTTP 302: redirect to list view if book copy not found
    return res.redirect("/catalog/book-instances");
  }
  // HTTP 302: delete book and redirect to list view
  await bookInstance.deleteOne();
  return res.redirect("/catalog/book-instances");
};
