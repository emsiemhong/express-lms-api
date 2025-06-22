const express = require("express");
const db = require("../db/connection");
const auth = require("../middleware/auth");
const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book created successfully
 */
router.post("", auth(["liberian"]), async (req, res) => {
  const { title, description, author_id, quantity, category_id } = req.body;

  try {
    await db.execute(
      "INSERT INTO books (title, description, author_id, quantity, category_id, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, author_id, quantity, category_id, req.user.id]
    );
    res.status(201).json({ message: "Book created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - author_id
 *         - quantity
 *         - category_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Title of the book
 *         description:
 *           type: string
 *           description: Description of the book
 *         author_id:
 *           type: integer
 *           description: ID of the author
 *         category_id:
 *           type: integer
 *           description: ID of the category
 *         quantity:
 *           type: integer
 *           description: Available number of books
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the book
 *       example:
 *         title: "Data Structures"
 *         description: "Intro to data structures"
 *         author_id: 1
 *         category_id: 3
 *         quantity: 5
 *         created_by: 1
 */


/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with pagination and author name
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of books per page
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of books with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 totalBooks:
 *                   type: integer
 *                   example: 50
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       created_by:
 *                         type: integer
 *                       author_name:
 *                         type: string
 */

router.get("", auth(["liberian"]), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const totalBooksQuery = "SELECT COUNT(*) AS total FROM books";
  const [totalBooksResult] = await db.execute(totalBooksQuery);
  const totalBooks = totalBooksResult[0].total;
  const totalPages = Math.ceil(totalBooks / limit);

  const query = `
    SELECT
      books.id, books.title, books.description, books.quantity,
      authors.full_name AS author_name,
      categories.name AS category,
      books.created_by
    FROM books
    LEFT JOIN authors ON books.author_id = authors.id
    LEFT JOIN categories ON books.category_id = categories.id
    LIMIT ${limit} OFFSET ${offset}
  `;


  try {
    const [books] = await db.execute(query);
    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalBooks: totalBooks,
      limit: limit,
      books: books
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */
router.get("/:id", auth(["liberian"]), async (req, res) => {
  const bookId = req.params.id;

  try {
    const [book] = await db.execute(
      `SELECT
        books.id, books.title, books.description, books.quantity,
        authors.full_name AS author_name,
        categories.name AS category,
        books.created_by
      FROM books
      LEFT JOIN authors ON books.author_id = authors.id
      LEFT JOIN categories ON books.category_id = categories.id
      WHERE books.id = ?`, [bookId]
    );

    if (book.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
}
);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 */
router.put("/:id", auth(["liberian"]), async (req, res) => {
  const bookId = req.params.id;
  const { title, description, author_id, quantity, category_id } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE books SET title = ?, description = ?, author_id = ?, quantity = ?, category_id = ? WHERE id = ?`,
      [title, description, author_id, quantity, category_id, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book to delete
 *     responses:
 *       200:
 *         description: Book deleted successfully
 */
router.delete("/:id", auth(["liberian"]), async (req, res) => {
  const bookId = req.params.id;

  try {
    const [result] = await db.execute("DELETE FROM books WHERE id = ?", [bookId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete book" });
  }
}
);

module.exports = router;
