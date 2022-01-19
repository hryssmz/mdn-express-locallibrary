// models/book.ts
import { Schema, model, Model, Types } from "mongoose";

interface Book {
  _id: Types.ObjectId;
  title: string;
  author: Types.ObjectId;
  summary: string;
  isbn: string;
  genre?: Types.ObjectId[];
}

interface Virtuals {
  get url(): string;
}

type BookModel = Model<Book, unknown, unknown, Virtuals>;

const bookSchema = new Schema<Book, BookModel, unknown>({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
});

bookSchema.virtual("url").get(function (this: Book): string {
  return `/catalog/book/${this._id}`;
});

const Book = model<Book, BookModel, unknown>("Book", bookSchema);

export default Book;
