const express = require("express");
const { body, param } = require("express-validator");

const { recordGrade, getGrades, updateGrade } = require("../controllers/gradeController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("Teacher", "Admin"),
  [
    body("student").isMongoId().withMessage("Valid student id is required"),
    body("course").isMongoId().withMessage("Valid course id is required"),
    body("assessmentType")
      .isIn(["Quiz", "Assignment", "Midterm", "Final", "Project", "Lab", "Other"])
      .withMessage("Invalid assessment type"),
    body("assessmentTitle").trim().notEmpty().withMessage("Assessment title is required"),
    body("assessmentDate").isISO8601().withMessage("Valid assessment date is required"),
    body("maxMarks").isFloat({ min: 1 }).withMessage("maxMarks must be > 0"),
    body("obtainedMarks").isFloat({ min: 0 }).withMessage("obtainedMarks must be >= 0"),
    body("weightage").isFloat({ min: 0, max: 100 }).withMessage("weightage must be 0-100"),
    body("term").trim().notEmpty().withMessage("Term is required"),
  ],
  recordGrade
);

router.get("/", authorize("Admin", "Teacher", "Student"), getGrades);

router.patch(
  "/:id",
  authorize("Teacher", "Admin"),
  [param("id").isMongoId().withMessage("Invalid grade id")],
  updateGrade
);

module.exports = router;
