// apis/authorController.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { authorValidator } from "../validators/authorValidator";
import createError from "http-errors";
import Author from "../models/author";
import Book from "../models/book";

export const authorList = async (req: Request, res: Response) => {
  const authorList = await Author.find().sort({ familyName: 1 });
  return res.render("authorList", { title: "Author List", authorList });
};

export const authorDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }, "title summary"),
    ]);
    if (author === null) {
      return next(createError(404, "Author not found"));
    }
    return res.render("authorDetail", {
      title: "Author Detail",
      author,
      authorsBooks,
    });
  } catch (err) {
    return next(err);
  }
};

export const authorCreateGet = async (req: Request, res: Response) => {
  return res.render("authorForm", { title: "Create Author" });
};

export const authorCreate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await authorValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("authorForm", {
      title: "Create Author",
      author: req.body,
      errors: errors.mapped(),
    });
  }
  try {
    const author = await Author.create(req.body);
    return res.redirect(author.url);
  } catch (err) {
    return next(err);
  }
};

export const authorUpdateGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const author = await Author.findById(req.params.id);
    if (author === null) {
      return next(createError(404, "Author not found"));
    }
    return res.render("authorForm", { title: "Update Author", author });
  } catch (err) {
    return next(err);
  }
};

export const authorUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await authorValidator.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("authorForm", {
      title: "Update Author",
      author: req.body,
      errors: errors.mapped(),
    });
  }
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body);
    if (author === null) {
      return next(createError(404, "Author not found"));
    }
    return res.redirect(author.url);
  } catch (err) {
    return next(err);
  }
};

export const authorDeleteGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.params.id),
      Book.find({ author: req.params.id }),
    ]);
    if (author === null) {
      return res.redirect("/catalog/authors");
    }
    return res.render("authorDelete", {
      title: "Delete Author",
      author,
      authorsBooks,
    });
  } catch (err) {
    return next(err);
  }
};

export const authorDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [author, authorsBooks] = await Promise.all([
      Author.findById(req.body.authorId),
      Book.find({ author: req.body.authorId }),
    ]);
    if (authorsBooks.length > 0) {
      return res.render("authorDelete", {
        title: "Delete Author",
        author,
        authorsBooks,
      });
    }
    await Author.findByIdAndRemove(req.body.authorId);
    return res.redirect("/catalog/authors");
  } catch (err) {
    return next(err);
  }
};
