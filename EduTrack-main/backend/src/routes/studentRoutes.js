const express = require("express");
const { body, param } = require("express-validator");

const {
  createStudent,
  getStudents,
  getStudentById,
  getMyStudentProfile,
  updateStudent,
  deactivateStudent,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/me", authorize("Student"), getMyStudentProfile);

router.post(
  "/",
  authorize("Admin"),
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("studentId").trim().notEmpty().withMessage("Student ID is required"),
    body("dateOfBirth").isISO8601().withMessage("Valid dateOfBirth is required"),
    body("enrollment.admissionYear").isInt({ min: 2000 }).withMessage("Valid admission year is required"),
    body("enrollment.currentSemester")
      .isInt({ min: 1, max: 12 })
      .withMessage("Current semester must be 1-12"),
    body("enrollment.program").trim().notEmpty().withMessage("Program is required"),
    body("enrollment.department").trim().notEmpty().withMessage("Department is required"),
    body("studentId").optional().trim(),
  ],
  createStudent
);

router.get("/", authorize("Admin", "Teacher"), getStudents);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid student id")],
  authorize("Admin", "Teacher", "Student"),
  getStudentById
);

router.put(
  "/:id",
  authorize("Admin"),
  [param("id").isMongoId().withMessage("Invalid student id")],
  updateStudent
);

router.delete(
  "/:id",
  authorize("Admin"),
  [param("id").isMongoId().withMessage("Invalid student id")],
  deactivateStudent
);

module.exports = router;
