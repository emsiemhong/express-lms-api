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
  const { title, description, author_id } = req.body;

  try {
    await db.execute("INSERT INTO books (title, description, author_id, created_by) VALUES (?, ?, ?, ?)", [
      title, description, author_id, req.user.id
    ]);
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
 *         - created_by
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
 *         created_by:
 *          type: integer
 *          description: ID of the user who created the book(liberian)
 *       example:
 *          title: "Introduction to Programming"
 *          description: "A comprehensive guide to programming."
 *          author_id: 1
 *          created_by: 1
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get("", auth(["liberian"]), async (req, res) => {
  const [books] = await db.execute("SELECT id, title, description, author_id, created_by FROM books");
  res.json(books);
});

module.exports = router;
