// validators/bookValidator.ts
import { checkSchema } from "express-validator";

export const bookValidator = checkSchema({
  title: {
    in: ["body"],
    errorMessage: "Title must not be empty.",
    trim: true,
    isLength: { bail: true, options: { min: 1 } },
    escape: true,
  },
  author: {
    in: ["body"],
    errorMessage: "Author must not be empty.",
    trim: true,
    isLength: { bail: true, options: { min: 1 } },
    escape: true,
  },
  summary: {
    in: ["body"],
    errorMessage: "Summary must not be empty.",
    trim: true,
    isLength: { bail: true, options: { min: 1 } },
    escape: true,
  },
  isbn: {
    in: ["body"],
    errorMessage: "ISBN must not be empty",
    trim: true,
    isLength: { bail: true, options: { min: 1 } },
    escape: true,
  },
  genre: {
    in: ["body"],
    toArray: true,
  },
  "genre.*": {
    in: ["body"],
    escape: true,
  },
});
