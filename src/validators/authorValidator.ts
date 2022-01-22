// validators/authorValidators.ts
import { checkSchema } from "express-validator";

export const authorValidator = checkSchema({
  firstName: {
    in: ["body"],
    trim: true,
    escape: true,
    isLength: {
      bail: true,
      errorMessage: "First name must be 1 to 100 chars long.",
      options: { min: 1, max: 100 },
    },
    isAlphanumeric: {
      bail: true,
      errorMessage: "First name has non-alphanumeric characters.",
    },
  },
  familyName: {
    in: ["body"],
    trim: true,
    escape: true,
    isLength: {
      bail: true,
      errorMessage: "Family name must be 1 to 100 chars long.",
      options: { min: 1, max: 100 },
    },
    isAlphanumeric: {
      bail: true,
      errorMessage: "Family name has non-alphanumeric characters.",
    },
  },
  dateOfBirth: {
    in: ["body"],
    errorMessage: "Invalid date of birth",
    optional: true,
    default: { options: undefined },
    isISO8601: true,
    toDate: true,
  },
  dateOfDeath: {
    in: ["body"],
    errorMessage: "Invalid date of death",
    optional: true,
    default: { options: undefined },
    isISO8601: true,
    toDate: true,
  },
});
