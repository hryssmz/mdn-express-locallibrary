// validators/bookInstanceValidator.ts
import { checkSchema } from "express-validator";

export const bookInstanceValidator = checkSchema({
  book: {
    in: ["body"],
    errorMessage: "Book must be specified",
    trim: true,
    isLength: { options: { min: 1 } },
    escape: true,
  },
  imprint: {
    in: ["body"],
    errorMessage: "Imprint must be specified",
    trim: true,
    isLength: { options: { min: 1 } },
    escape: true,
  },
  status: {
    in: ["body"],
    escape: true,
  },
  dueBack: {
    in: ["body"],
    errorMessage: "Invalid date",
    optional: true,
    default: { options: undefined }, // remove "", null from body parameter
    isISO8601: true,
    toDate: true,
  },
});
