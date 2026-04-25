const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const StudentProfile = require("../models/StudentProfile");

const validateRequest = require("../utils/validateRequest");

async function createEnrollment(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const { student, course, term } = req.body;

    const [studentProfile, courseDoc] = await Promise.all([
      StudentProfile.findById(student),
      Course.findById(course),
    ]);

    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    if (!courseDoc) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (courseDoc.status !== "Published") {
      return res.status(400).json({ success: false, message: "Cannot enroll into an unpublished course" });
    }

    const existing = await Enrollment.findOne({ student, course });
    if (existing) {
      return res.status(409).json({ success: false, message: "Student already enrolled in this course" });
    }

    if (courseDoc.enrolledCount >= courseDoc.capacity) {
      return res.status(400).json({ success: false, message: "Course capacity reached" });
    }

    const enrollment = await Enrollment.create({ student, course, term, status: "Enrolled" });

    courseDoc.enrolledCount += 1;
    await courseDoc.save();

    const populated = await Enrollment.findById(enrollment._id)
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "course", populate: { path: "teacher", select: "fullName email" } });

    return res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      data: populated,
    });
  } catch (error) {
    return next(error);
  }
}

async function getEnrollments(req, res, next) {
  try {
    const filter = {};

    if (req.query.student) filter.student = req.query.student;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.term) filter.term = req.query.term;

    if (req.user.role === "Student") {
      const profile = await StudentProfile.findOne({ user: req.user._id }).select("_id");
      if (!profile) {
        return res.status(404).json({ success: false, message: "Student profile not found" });
      }
      filter.student = profile._id;
    }

    let enrollments = await Enrollment.find(filter)
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate({ path: "course", populate: { path: "teacher", select: "fullName email" } })
      .sort({ createdAt: -1 });

    if (req.user.role === "Teacher") {
      enrollments = enrollments.filter((item) => String(item.course.teacher._id) === String(req.user._id));
    }

    return res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    return next(error);
  }
}

async function updateEnrollment(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const enrollment = await Enrollment.findById(req.params.id).populate("course");
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    const { status, finalLetterGrade, finalPercentage, completionDate } = req.body;
    const oldStatus = enrollment.status;

    if (status !== undefined) enrollment.status = status;
    if (finalLetterGrade !== undefined) enrollment.finalLetterGrade = finalLetterGrade;
    if (finalPercentage !== undefined) enrollment.finalPercentage = finalPercentage;
    if (completionDate !== undefined) enrollment.completionDate = completionDate;

    await enrollment.save();

    if (oldStatus === "Enrolled" && ["Dropped", "Withdrawn"].includes(enrollment.status)) {
      enrollment.course.enrolledCount = Math.max(0, enrollment.course.enrolledCount - 1);
      await enrollment.course.save();
    }

    if (["Dropped", "Withdrawn"].includes(oldStatus) && enrollment.status === "Enrolled") {
      if (enrollment.course.enrolledCount >= enrollment.course.capacity) {
        return res.status(400).json({ success: false, message: "Course capacity reached" });
      }
      enrollment.course.enrolledCount += 1;
      await enrollment.course.save();
    }

    const updated = await Enrollment.findById(enrollment._id)
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .populate("course", "code title subject semester academicYear");

    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createEnrollment,
  getEnrollments,
  updateEnrollment,
};
