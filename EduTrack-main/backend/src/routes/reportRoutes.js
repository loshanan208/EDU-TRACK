const express = require("express");
const { param } = require("express-validator");

const {
  getStudentSummaryReport,
  getCourseSummaryReport,
  getOverviewReport,
  exportCourseReportCsv,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/overview", authorize("Admin"), getOverviewReport);

router.get(
  "/student/:studentId/summary",
  authorize("Admin", "Teacher", "Student"),
  [param("studentId").isMongoId().withMessage("Invalid student id")],
  getStudentSummaryReport
);

router.get(
  "/course/:courseId/summary",
  authorize("Admin", "Teacher"),
  [param("courseId").isMongoId().withMessage("Invalid course id")],
  getCourseSummaryReport
);

router.get(
  "/course/:courseId/export-csv",
  authorize("Admin", "Teacher"),
  [param("courseId").isMongoId().withMessage("Invalid course id")],
  exportCourseReportCsv
);

module.exports = router;
