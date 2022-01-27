// scripts/initCatalog.ts
import { connect, connection } from "mongoose";
import { mongoURL } from "../src/utils";
import Author from "../src/models/author";
import Book from "../src/models/book";
import BookInstance from "../src/models/bookInstance";
import Genre from "../src/models/genre";

run();

async function run() {
  await connect(mongoURL);
  await initCatalog();
  await connection.close();
}

async function initCatalog() {
  const authors = await initAuthors();
  console.log(`Initialized ${authors.length} authors!`);
  const genres = await initGenres();
  console.log(`Initialized ${genres.length} genres!`);
  const books = await initBooks(authors, genres);
  console.log(`Initialized ${books.length} books!`);
  const bookInstances = await initBookInstances(books);
  console.log(`Initialized ${bookInstances.length} book instances!`);
}

async function initAuthors(): Promise<Author[]> {
  const data: [string, string, string | undefined, string | undefined][] = [
    ["Patrick", "Rothfuss", "1973-06-06", undefined],
    ["Ben", "Bova", "1932-11-08", undefined],
    ["Isaac", "Asimov", "1920-01-02", "1992-04-06"],
    ["Bob", "Billings", undefined, undefined],
    ["Jim", "Jones", "1971-12-16", undefined],
  ];

  await Author.deleteMany();
  const authors = await Promise.all(
    data.map(arr =>
      Author.create({
        firstName: arr[0],
        familyName: arr[1],
        dateOfBirth: arr[2] ? new Date(arr[2]) : undefined,
        dateOfDeath: arr[3] ? new Date(arr[3]) : undefined,
      })
    )
  );
  return authors;
}

async function initGenres(): Promise<Genre[]> {
  const data: [string][] = [
    ["Fantasy"],
    ["Science Fiction"],
    ["French Poetry"],
  ];

  await Genre.deleteMany();
  const genres = await Promise.all(
    data.map(arr => Genre.create({ name: arr[0] }))
  );
  return genres;
}

async function initBooks(authors: Author[], genres: Genre[]): Promise<Book[]> {
  const data: [string, Author, string, string, Genre[]][] = [
    [
      "The Name of the Wind (The Kingkiller Chronicle, #1)",
      authors[0],
      "I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.",
      "9781473211896",
      [genres[0]],
    ],
    [
      "The Wise Man's Fear (The Kingkiller Chronicle, #2)",
      authors[0],
      "Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.",
      "9788401352836",
      [genres[0]],
    ],
    [
      "The Slow Regard of Silent Things (Kingkiller Chronicle)",
      authors[0],
      "Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.",
      "9780756411336",
      [genres[0]],
    ],
    [
      "Apes and Angels",
      authors[1],
      "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...",
      "9780765379528",
      [genres[1]],
    ],
    [
      "Death Wave",
      authors[1],
      "In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...",
      "9780765379504",
      [genres[1]],
    ],
    [
      "Test Book 1",
      authors[4],
      "Summary of test book 1",
      "9781234567897",
      [genres[0], genres[1]],
    ],
    ["Test Book 2", authors[4], "Summary of test book 2", "9781234567903", []],
  ];

  await Book.deleteMany();
  const books = await Promise.all(
    data.map(arr =>
      Book.create({
        title: arr[0],
        author: arr[1],
        summary: arr[2],
        isbn: arr[3],
        genre: arr[4],
      })
    )
  );
  return books;
}

async function initBookInstances(books: Book[]): Promise<BookInstance[]> {
  const data: [Book, string, BookInstance["status"], string | undefined][] = [
    [books[0], "London Gollancz, 2014.", "Available", undefined],
    [books[1], " Gollancz, 2011.", "Loaned", undefined],
    [books[2], " Gollancz, 2015.", undefined, undefined],
    [
      books[3],
      "New York Tom Doherty Associates, 2016.",
      "Available",
      undefined,
    ],
    [
      books[3],
      "New York Tom Doherty Associates, 2016.",
      "Available",
      undefined,
    ],
    [
      books[3],
      "New York Tom Doherty Associates, 2016.",
      "Available",
      undefined,
    ],
    [
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      "Available",
      undefined,
    ],
    [
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      "Maintenance",
      undefined,
    ],
    [
      books[4],
      "New York, NY Tom Doherty Associates, LLC, 2015.",
      "Loaned",
      undefined,
    ],
    [books[0], "Imprint XXX2", undefined, undefined],
    [books[1], "Imprint XXX3", undefined, undefined],
  ];

  await BookInstance.deleteMany();
  const bookInstances = await Promise.all(
    data.map(arr =>
      BookInstance.create({
        book: arr[0],
        imprint: arr[1],
        status: arr[2],
        dueBack: arr[3] ? new Date(arr[3]) : undefined,
      })
    )
  );
  return bookInstances;
}
