// validators/authorValidators.ts
import { checkSchema } from "express-validator";

export const authorValidator = checkSchema({
  firstName: {
    in: ["body"],
    trim: true,
    isLength: {
      bail: true,
      errorMessage: "First name must be specified.",
      options: { min: 1 },
    },
    isAlphanumeric: {
      bail: true,
      errorMessage: "First name has non-alphanumeric characters.",
    },
    escape: true,
  },
  familyName: {
    in: ["body"],
    trim: true,
    isLength: {
      bail: true,
      errorMessage: "Family name must be specified.",
      options: { min: 1 },
    },
    isAlphanumeric: {
      bail: true,
      errorMessage: "Family name has non-alphanumeric characters.",
    },
    escape: true,
  },
  dateOfBirth: {
    in: ["body"],
    errorMessage: "Invalid date of birth",
    optional: { options: { checkFalsy: true } },
    isISO8601: true,
    toDate: true,
  },
  dateOfDeath: {
    in: ["body"],
    errorMessage: "Invalid date of death",
    optional: { options: { checkFalsy: true } },
    isISO8601: true,
    toDate: true,
  },
});
