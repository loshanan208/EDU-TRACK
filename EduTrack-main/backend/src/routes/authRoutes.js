const express = require("express");
const { body } = require("express-validator");

const { register, signup, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role").optional().isIn(["Admin", "Teacher", "Student"]),
  ],
  register
);

router.post(
  "/signup",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("dateOfBirth").isISO8601().withMessage("Valid dateOfBirth is required"),
    body("program").trim().notEmpty().withMessage("Program is required"),
    body("department").trim().notEmpty().withMessage("Department is required"),
    body("currentSemester")
      .isInt({ min: 1, max: 12 })
      .withMessage("Current semester must be between 1 and 12"),
    body("gender")
      .optional()
      .isIn(["Male", "Female", "Other", "Prefer not to say"])
      .withMessage("Invalid gender value"),
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/me", protect, getMe);

module.exports = router;
