// models/author.ts
import { Schema, model, Model, Types } from "mongoose";
import { DateTime } from "luxon";

interface Author {
  _id: Types.ObjectId;
  firstName: string;
  familyName: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
}

interface Virtuals {
  get name(): string;
  get dateOfBirthISO(): string;
  get dateOfDeathISO(): string;
  get lifespan(): string;
  get url(): string;
}

type AuthorModel = Model<Author, unknown, unknown, Virtuals>;

const authorSchema = new Schema<Author, AuthorModel, unknown>({
  firstName: { type: String, required: true, maxLength: 100 },
  familyName: { type: String, required: true, maxLength: 100 },
  dateOfBirth: { type: Date },
  dateOfDeath: { type: Date },
});

authorSchema.virtual("name").get(function (this: Author): string {
  return this.firstName && this.familyName
    ? `${this.firstName}, ${this.familyName}`
    : "";
});

authorSchema.virtual("dateOfBirthISO").get(function (this: Author): string {
  return this.dateOfBirth
    ? DateTime.fromJSDate(this.dateOfBirth).toISODate()
    : "";
});

authorSchema.virtual("dateOfDeathISO").get(function (this: Author): string {
  return this.dateOfDeath
    ? DateTime.fromJSDate(this.dateOfDeath).toISODate()
    : "";
});

authorSchema.virtual("lifespan").get(function (this: Author): string {
  const dateOfBirth = this.dateOfBirth
    ? DateTime.fromJSDate(this.dateOfBirth).toLocaleString(DateTime.DATE_MED)
    : "";
  const dateOfDeath = this.dateOfDeath
    ? DateTime.fromJSDate(this.dateOfDeath).toLocaleString(DateTime.DATE_MED)
    : "";
  return `${dateOfBirth} - ${dateOfDeath}`;
});

authorSchema.virtual("url").get(function (this: Author): string {
  return `/catalog/author/${this._id}`;
});

const Author = model<Author, AuthorModel, unknown>("Author", authorSchema);

export default Author;
