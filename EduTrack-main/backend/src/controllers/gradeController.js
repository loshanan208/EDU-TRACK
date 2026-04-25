const Grade = require("../models/Grade");
const Course = require("../models/Course");
const StudentProfile = require("../models/StudentProfile");

const validateRequest = require("../utils/validateRequest");

async function recordGrade(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const {
      student,
      course,
      assessmentType,
      assessmentTitle,
      assessmentDate,
      maxMarks,
      obtainedMarks,
      weightage,
      term,
      remarks,
    } = req.body;

    const [courseDoc, studentProfile] = await Promise.all([
      Course.findById(course),
      StudentProfile.findById(student),
    ]);

    if (!courseDoc) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    if (req.user.role === "Teacher" && String(courseDoc.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not assigned to this course" });
    }

    const grade = await Grade.create({
      student,
      course,
      recordedBy: req.user._id,
      assessmentType,
      assessmentTitle,
      assessmentDate,
      maxMarks,
      obtainedMarks,
      weightage,
      term,
      remarks,
    });

    const populated = await Grade.findById(grade._id)
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate("course", "code title subject")
      .populate("recordedBy", "fullName email role");

    return res.status(201).json({
      success: true,
      message: "Grade recorded successfully",
      data: populated,
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate assessment entry for this student and course",
      });
    }

    return next(error);
  }
}

async function getGrades(req, res, next) {
  try {
    const filter = {};

    if (req.query.student) filter.student = req.query.student;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.term) filter.term = req.query.term;
    if (req.query.assessmentType) filter.assessmentType = req.query.assessmentType;

    if (req.user.role === "Student") {
      const profile = await StudentProfile.findOne({ user: req.user._id }).select("_id");
      if (!profile) {
        return res.status(404).json({ success: false, message: "Student profile not found" });
      }
      filter.student = profile._id;
    }

    let grades = await Grade.find(filter)
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate("course", "code title subject semester academicYear teacher")
      .populate("recordedBy", "fullName email role")
      .sort({ assessmentDate: -1, createdAt: -1 });

    if (req.user.role === "Teacher") {
      grades = grades.filter((grade) => String(grade.course.teacher) === String(req.user._id));
    }

    return res.status(200).json({ success: true, data: grades });
  } catch (error) {
    return next(error);
  }
}

async function updateGrade(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const grade = await Grade.findById(req.params.id).populate("course", "teacher");
    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade record not found" });
    }

    if (req.user.role === "Teacher" && String(grade.course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowedFields = [
      "assessmentType",
      "assessmentTitle",
      "assessmentDate",
      "maxMarks",
      "obtainedMarks",
      "weightage",
      "term",
      "remarks",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        grade[field] = req.body[field];
      }
    });

    grade.recordedBy = req.user._id;
    await grade.save();

    const updated = await Grade.findById(grade._id)
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate("course", "code title subject")
      .populate("recordedBy", "fullName email role");

    return res.status(200).json({
      success: true,
      message: "Grade updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  recordGrade,
  getGrades,
  updateGrade,
};
