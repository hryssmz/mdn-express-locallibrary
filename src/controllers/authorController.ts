// apis/authorController.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
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

export const authorCreate = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("familyName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("dateOfBirth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("dateOfDeath", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("authorForm", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
    }
    try {
      const author = await Author.create(req.body);
      return res.redirect(author.url);
    } catch (err) {
      return next(err);
    }
  },
];

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

export const authorUpdate = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("familyName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("dateOfBirth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("dateOfDeath", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("authorForm", {
        title: "Update Author",
        author: req.body,
        errors: errors.array(),
      });
    }
    try {
      const author = await Author.findByIdAndUpdate(req.params.id, req.body);
      if (author === null) {
        return res.status(404).json("Author not found");
      }
      return next(createError(404, "Author not found"));
    } catch (err) {
      return next(err);
    }
  },
];
