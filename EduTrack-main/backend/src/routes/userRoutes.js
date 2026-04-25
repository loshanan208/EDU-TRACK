const express = require("express");
const { body } = require("express-validator");

const { createTeacher, getTeachers } = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("Admin"));

router.get("/teachers", getTeachers);

router.post(
  "/teachers",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  createTeacher
);

module.exports = router;
