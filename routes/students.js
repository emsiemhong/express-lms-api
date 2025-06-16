const express = require("express");
const db = require("../db/connection");
const auth = require("../middleware/auth");
const router = express.Router();


/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 */
router.post("", auth(["liberian"]), async (req, res) => {
  const { full_name, id_card, student_class } = req.body;

  try {
    await db.execute("INSERT INTO students (full_name, id_card, class, created_by) VALUES (?, ?, ?, ?)", [
      full_name,
      id_card,
      student_class
    ]);
    res.status(201).json({ message: "Student created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - full_name
 *         - id_card
 *         - student_class
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         full_name:
 *           type: string
 *           description: First name
 *         id_card:
 *           type: string
 *           description: Student ID card number
 *         student_class:
 *           type: string
 *           description: Class of the student
 *       example:
 *         full_name: kakada
 *         id_card: STU0001
 *         student_class: wmad
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
router.get("", auth(["liberian"]), async (req, res) => {
  const [students] = await db.execute("SELECT id, full_name, id_card, class, created_by FROM students");
  res.json(students);
});

module.exports = router;
