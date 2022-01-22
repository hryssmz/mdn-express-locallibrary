// apis/authorController.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import { authorValidator } from "../validators/authorValidator";
import createError from "http-errors";
import Author from "../models/author";
import Book from "../models/book";

export const authorList = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  // HTTP 200: render author list sorted by family name
  return res.render("authorList", { title: "Author List", authorList });
};

export const authorDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Author not found"));
  }
  const [author, authorsBooks] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }, "title summary"),
  ]);
  if (author === null) {
    // HTTP 404: author not found
    return next(createError(404, "Author not found"));
  }
  // HTTP 200: render author and all her/his books
  return res.render("authorDetail", {
    title: "Author Detail",
    author,
    authorsBooks,
  });
};

export const authorCreateGet = async (req: Request, res: Response) => {
  return res.render("authorForm", { title: "Create Author" });
};

export const authorCreate = async (req: Request, res: Response) => {
  await authorValidator.run(req);
  const errors = validationResult(req);
  const authorData = {
    firstName: req.body.firstName,
    familyName: req.body.familyName,
    dateOfBirth: req.body.dateOfBirth,
    dateOfDeath: req.body.dateOfDeath,
  };
  if (!errors.isEmpty()) {
    // HTTP 200: render author data and validation errors
    return res.render("authorForm", {
      title: "Create Author",
      author: authorData,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: create author and redirect to detail view
  const author = await Author.create(authorData);
  return res.redirect(author.url);
};

export const authorUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Author not found"));
  }
  const author = await Author.findById(req.params.id);
  if (author === null) {
    // HTTP 404: author not found
    return next(createError(404, "Author not found"));
  }
  // HTTP 200: render author
  return res.render("authorForm", { title: "Update Author", author });
};

export const authorUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 404: bad ID provided
    return next(createError(404, "Author not found"));
  }
  const author = await Author.findById(req.params.id);
  if (author === null) {
    // HTTP 404: author not found
    return next(createError(404, "Author not found"));
  }
  await authorValidator.run(req);
  const errors = validationResult(req);
  const authorData = {
    firstName: req.body.firstName,
    familyName: req.body.familyName,
    dateOfBirth: req.body.dateOfBirth,
    dateOfDeath: req.body.dateOfDeath,
  };
  if (!errors.isEmpty()) {
    // HTTP 200: render author data and validation errors
    return res.render("authorForm", {
      title: "Update Author",
      author: authorData,
      errors: errors.mapped(),
    });
  }
  // HTTP 302: update author and redirect to detail view
  await author.updateOne(authorData);
  return res.redirect(author.url);
};

export const authorDeleteGet = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.params.id);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/authors");
  }
  const [author, authorsBooks] = await Promise.all([
    Author.findById(req.params.id),
    Book.find({ author: req.params.id }),
  ]);
  if (author === null) {
    // HTTP 302: redirect to list view if author not found
    return res.redirect("/catalog/authors");
  }
  // HTTP 200: render author and all her/his books
  return res.render("authorDelete", {
    title: "Delete Author",
    author,
    authorsBooks,
  });
};

export const authorDelete = async (req: Request, res: Response) => {
  try {
    new Types.ObjectId(req.body.authorId);
  } catch (err) {
    // HTTP 302: redirect to list view if bad ID provided
    return res.redirect("/catalog/authors");
  }
  const [author, authorsBooks] = await Promise.all([
    Author.findById(req.body.authorId),
    Book.find({ author: req.body.authorId }),
  ]);
  if (author === null) {
    // HTTP 302: redirect to list view if author not found
    return res.redirect("/catalog/authors");
  }
  if (authorsBooks.length > 0) {
    // HTTP 200: render author and all her/his books without deleting
    return res.render("authorDelete", {
      title: "Delete Author",
      author,
      authorsBooks,
    });
  }
  // HTTP 302: delete author and redirect to list view
  await Author.findByIdAndRemove(req.body.authorId);
  return res.redirect("/catalog/authors");
};
