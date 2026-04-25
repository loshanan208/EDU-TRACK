const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");

const validateRequest = require("../utils/validateRequest");

async function markAttendanceBulk(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const { courseId, date, records } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (req.user.role === "Teacher" && String(course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not assigned to this course" });
    }

    const normalizedDate = new Date(date);

    const studentIds = records.map((item) => item.student);
    const validEnrollments = await Enrollment.find({
      student: { $in: studentIds },
      course: courseId,
      status: "Enrolled",
    }).distinct("student");

    const validSet = new Set(validEnrollments.map((id) => String(id)));

    const ops = records
      .filter((item) => validSet.has(String(item.student)))
      .map((item) => ({
        updateOne: {
          filter: {
            student: item.student,
            course: courseId,
            date: normalizedDate,
          },
          update: {
            $set: {
              markedBy: req.user._id,
              status: item.status,
              remarks: item.remarks || "",
            },
          },
          upsert: true,
        },
      }));

    if (ops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid enrolled students found in records",
      });
    }

    await Attendance.bulkWrite(ops);

    const saved = await Attendance.find({ course: courseId, date: normalizedDate })
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate("markedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      data: saved,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCourseAttendance(req, res, next) {
  try {
    const { courseId } = req.params;
    const { from, to } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (req.user.role === "Teacher" && String(course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const filter = { course: courseId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const records = await Attendance.find(filter)
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate("markedBy", "fullName email")
      .sort({ date: -1 });

    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return next(error);
  }
}

async function getStudentAttendance(req, res, next) {
  try {
    const { studentId } = req.params;

    if (req.user.role === "Student") {
      const ownProfile = await StudentProfile.findOne({ user: req.user._id }).select("_id");
      if (!ownProfile || String(ownProfile._id) !== String(studentId)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const records = await Attendance.find({ student: studentId })
      .populate("course", "code title subject semester academicYear")
      .populate("markedBy", "fullName email")
      .sort({ date: -1 });

    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  markAttendanceBulk,
  getCourseAttendance,
  getStudentAttendance,
};
