// models/bookInstance.ts
import { Schema, model, Model, Types } from "mongoose";
import { DateTime } from "luxon";

export const statusChoices = ["Available", "Maintenance", "Loaned", "Reserved"];

interface BookInstance {
  _id: Types.ObjectId;
  book: Types.ObjectId;
  imprint: string;
  status?: "Available" | "Maintenance" | "Loaned" | "Reserved";
  dueBack?: Date;
}

interface Virtuals {
  get url(): string;
  get dueBackFormatted(): string;
  get dueBackISO(): string;
}

type BookInstanceModel = Model<BookInstance, unknown, unknown, Virtuals>;

const bookInstanceSchema = new Schema<BookInstance, BookInstanceModel, unknown>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    imprint: { type: String, required: true },
    status: {
      type: String,
      enum: statusChoices,
      default: "Maintenance",
    },
    dueBack: { type: Date, default: () => new Date() },
  }
);

bookInstanceSchema.virtual("url").get(function (this: BookInstance) {
  return `/catalog/book-instance/${this._id}`;
});

bookInstanceSchema
  .virtual("dueBackFormatted")
  .get(function (this: BookInstance) {
    return this.dueBack
      ? DateTime.fromJSDate(this.dueBack).toLocaleString(DateTime.DATE_MED)
      : "";
  });

bookInstanceSchema.virtual("dueBackISO").get(function (this: BookInstance) {
  return this.dueBack ? DateTime.fromJSDate(this.dueBack).toISODate() : "";
});

const BookInstance = model<BookInstance, BookInstanceModel, unknown>(
  "BookInstance",
  bookInstanceSchema
);

export default BookInstance;
