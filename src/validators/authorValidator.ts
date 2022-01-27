// validators/authorValidators.ts
import { checkSchema } from "express-validator";

export const authorValidator = checkSchema({
  firstName: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "First name must be specified",
    },
    isLength: {
      bail: true,
      errorMessage: "First name must be at most 100 chars long",
      options: { max: 100 },
    },
    isAlphanumeric: {
      bail: true,
      errorMessage: "First name has non-alphanumeric characters",
    },
  },
  familyName: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "Family name must be specified",
    },
    isLength: {
      bail: true,
      errorMessage: "Family name must be at most 100 chars long",
      options: { max: 100 },
    },
    isAlphanumeric: {
      bail: true,
      errorMessage: "Family name has non-alphanumeric characters",
    },
  },
  dateOfBirth: {
    in: ["body"],
    trim: true,
    escape: true,
    optional: true,
    default: { options: undefined },
    isISO8601: { bail: true, errorMessage: "Invalid date of birth" },
    toDate: true,
  },
  dateOfDeath: {
    in: ["body"],
    trim: true,
    escape: true,
    optional: true,
    default: { options: undefined },
    isISO8601: { bail: true, errorMessage: "Invalid date of death" },
    toDate: true,
  },
});
