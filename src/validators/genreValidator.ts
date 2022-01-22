// validators/genreValidator.ts
import { checkSchema } from "express-validator";

export const genreValidator = checkSchema({
  name: {
    in: ["body"],
    errorMessage: "Genre name required",
    trim: true,
    isLength: { options: { min: 1 } },
    escape: true,
  },
});
