// models/genre.ts
import { Schema, model, Model, Types } from "mongoose";

interface Genre {
  _id: Types.ObjectId;
  name: string;
}

interface Virtuals {
  get url(): string;
}

type GenreModel = Model<Genre, unknown, unknown, Virtuals>;

const genreSchema = new Schema<Genre, GenreModel, unknown>({
  name: { type: String, required: true, minlength: 3, maxLength: 100 },
});

genreSchema.virtual("url").get(function (this: Genre) {
  return `/catalog/genre/${this._id}`;
});

const Genre = model<Genre, GenreModel, unknown>("Genre", genreSchema);

export default Genre;
