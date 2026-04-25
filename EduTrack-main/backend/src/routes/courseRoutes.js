const express = require("express");
const { body, param } = require("express-validator");

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  archiveCourse,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("Admin"),
  [
    body("code").trim().notEmpty().withMessage("Course code is required"),
    body("title").trim().notEmpty().withMessage("Course title is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("teacher").isMongoId().withMessage("Valid teacher id is required"),
    body("semester").isInt({ min: 1, max: 12 }).withMessage("Semester must be 1-12"),
    body("academicYear").isInt({ min: 2000 }).withMessage("Valid academic year is required"),
    body("schedule").isArray({ min: 1 }).withMessage("At least one schedule entry is required"),
    body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
  ],
  createCourse
);

router.get("/", authorize("Admin", "Teacher", "Student"), getCourses);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid course id")],
  authorize("Admin", "Teacher", "Student"),
  getCourseById
);

router.put(
  "/:id",
  authorize("Admin"),
  [param("id").isMongoId().withMessage("Invalid course id")],
  updateCourse
);

router.delete(
  "/:id",
  authorize("Admin"),
  [param("id").isMongoId().withMessage("Invalid course id")],
  archiveCourse
);

module.exports = router;
