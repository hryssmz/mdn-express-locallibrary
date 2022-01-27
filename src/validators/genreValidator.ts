// validators/genreValidator.ts
import { checkSchema } from "express-validator";

export const genreValidator = checkSchema({
  name: {
    in: ["body"],
    trim: true,
    escape: true,
    isEmpty: {
      bail: true,
      negated: true,
      errorMessage: "Genre name required",
    },
    isLength: {
      bail: true,
      errorMessage: "Genre name must between 3 chars and 100 chars long",
      options: { min: 3, max: 100 },
    },
  },
});
