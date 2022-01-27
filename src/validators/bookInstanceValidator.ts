// validators/bookInstanceValidator.ts
import { checkSchema } from "express-validator";

export const bookInstanceValidator = checkSchema({
  book: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "Book must be specified",
    },
    isMongoId: {
      bail: true,
      errorMessage: "Please specify a valid Mongo ID",
    },
  },
  imprint: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "Imprint must be specified",
    },
  },
  status: {
    in: ["body"],
    trim: true,
    escape: true,
    default: { options: "Maintenance" },
    isIn: {
      bail: true,
      options: [["Available", "Maintenance", "Loaned", "Reserved"]],
      errorMessage: (value: string) => `Status '${value}' is not allowed`,
    },
  },
  dueBack: {
    in: ["body"],
    trim: true,
    escape: true,
    optional: true,
    default: { options: undefined },
    isISO8601: { bail: true, errorMessage: "Invalid date" },
    toDate: true,
  },
});
