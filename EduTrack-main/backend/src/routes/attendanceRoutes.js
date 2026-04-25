const express = require("express");
const { body, param } = require("express-validator");

const {
  markAttendanceBulk,
  getCourseAttendance,
  getStudentAttendance,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);  

router.post(
  "/mark-bulk", 
  authorize("Teacher", "Admin"),
  [
    body("courseId").isMongoId().withMessage("Valid course id is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("records").isArray({ min: 1 }).withMessage("Records array is required"),
    body("records.*.student").isMongoId().withMessage("Valid student id is required"),
    body("records.*.status")
      .isIn(["Present", "Absent", "Late", "Excused"])
      .withMessage("Invalid attendance status"),
  ],
  markAttendanceBulk
);

router.get(
  "/course/:courseId", 
  authorize("Admin", "Teacher"),
  [param("courseId").isMongoId().withMessage("Invalid course id")],
  getCourseAttendance
);

router.get(
  "/student/:studentId",
  authorize("Admin", "Teacher", "Student"),
  [param("studentId").isMongoId().withMessage("Invalid student id")],
  getStudentAttendance
);

module.exports = router;
