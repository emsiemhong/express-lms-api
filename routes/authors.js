const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Manage book authors
 */

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Get all authors for selection
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   full_name:
 *                     type: string
 */
router.get("/", async (req, res) => {
  try {
    const [authors] = await db.execute("SELECT id, full_name FROM authors");
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
