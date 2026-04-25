const express = require("express");
const { body, param } = require("express-validator");

const { createEnrollment, getEnrollments, updateEnrollment } = require("../controllers/enrollmentController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("Admin"),
  [
    body("student").isMongoId().withMessage("Valid student id is required"),
    body("course").isMongoId().withMessage("Valid course id is required"),
    body("term").trim().notEmpty().withMessage("Term is required"),
  ],
  createEnrollment
);

router.get("/", authorize("Admin", "Teacher", "Student"), getEnrollments);

router.patch(
  "/:id",
  authorize("Admin"),
  [
    param("id").isMongoId().withMessage("Invalid enrollment id"),
    body("status")
      .optional()
      .isIn(["Enrolled", "Completed", "Dropped", "Withdrawn", "Waitlisted"]),
    body("finalPercentage").optional().isFloat({ min: 0, max: 100 }),
  ],
  updateEnrollment
);

module.exports = router;
