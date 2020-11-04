const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

const book1 = {
  isbn: "039912442X",
  amazon_url: "amazon.com/red-dragon",
  author: "Hannibal Lecter",
  language: "eng",
  publisher: "penguin",
  title: "RED DRAGON",
  year: 2005,
  pages: 300
};
const book2 = {
  isbn: "1234567X",
  amazon_url: "amazon.com/test",
  author: "Test Testy",
  language: "eng",
  publisher: "Test Org",
  title: "THIS IS A TEST",
  year: 1900,
  pages: 250
};
describe("book route tests", function () {

  beforeEach(async function () {
    await db.query(`DELETE FROM books`);

    await Book.create(book2);
  });


  describe("Post /books", function () {
    test("creates new book, returns book details", async function () {
      const response = await request(app)
        .post(`/books`)
        .send(book1)
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        book: {
          isbn: "039912442X",
          amazon_url: "amazon.com/red-dragon",
          author: "Hannibal Lecter",
          language: "eng",
          publisher: "penguin",
          title: "RED DRAGON",
          year: 2005,
          pages: 300
        }
      });
      const bookRes = await request(app).get(`/books`)
      expect(bookRes.body).toEqual({
        books: [
          book1,
          book2
        ]
      });
    });
  });
  // end post to "/books"

  describe("Put /:isbn updates a book", function () {
    test("update the book", async function () {
      const book2Update = {
        isbn: "1234567X",
        amazon_url: "amazon.com/test",
        author: "Not a great Writer",
        language: "eng",
        publisher: "Test Org",
        title: "THIS IS A TEST",
        year: 1803,
        pages: 200
      }
      const response = await request(app)
        .put(`/books/1234567X`)
        .send(book2Update)
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        book: book2Update
      });
      const bookRes = await request(app).get("/books/1234567X");
      expect(bookRes.body.book.author).not.toEqual(book2.author);
      expect(bookRes.body).toEqual({
        book: book2Update
      });
    });
  });
  // end Put /:isbn

  describe("Delete /:isbn deletes a book", function () {
    test("respond with empty data", async function () {
      const bookRes = await request(app).delete(`/books/1234567X`)
      expect(bookRes.body).toEqual({
        message: "Book deleted"
      });

      const bookListRes = await request(app).get('/books');
      expect(bookListRes.body).toEqual({ books: [] });
    });
  });
  // end Delete /:isbn


  describe("GET books/isbn get a specific book", function () {
    test("get the specific book with id", async function () {
      const bookRes = await request(app).get(`/books/1234567X`)
      expect(bookRes.body).toEqual({
        book: book2
      });
    });
  });
  // end Get /:id

  describe("GET /books", function () {
    test("get all books", async function () {
      const bookRes = await request(app).get(`/books`)
      expect(bookRes.body).toEqual({
        books: [
          book2
        ]
      });
    });
  });
  // end Get all

  // end all tests
});

afterAll(async function () {
  await db.end();
});