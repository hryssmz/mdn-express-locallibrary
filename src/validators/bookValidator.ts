// validators/bookValidator.ts
import { checkSchema } from "express-validator";

export const bookValidator = checkSchema({
  title: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "Title must not be empty",
    },
  },
  author: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "Author must not be empty",
    },
    isMongoId: {
      bail: true,
      errorMessage: "Please specify a valid Mongo ID",
    },
  },
  summary: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "Summary must not be empty",
    },
  },
  isbn: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "ISBN must not be empty",
    },
    isISBN: {
      bail: true,
      errorMessage: "Please specify a valid ISBN-13",
      options: 13,
    },
  },
  genre: {
    in: ["body"],
    toArray: true,
  },
  "genre.*": {
    in: ["body"],
    trim: true,
    escape: true,
    isMongoId: {
      bail: true,
      errorMessage: "Please specify a valid Mongo ID",
    },
  },
});
