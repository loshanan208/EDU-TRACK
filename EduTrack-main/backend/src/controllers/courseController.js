const Course = require("../models/Course");
const User = require("../models/User");

const validateRequest = require("../utils/validateRequest");

async function createCourse(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const { code, title, description, subject, credits, capacity, teacher, semester, academicYear, schedule, status } =
      req.body;

    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Course code already exists" });
    }

    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== "Teacher" || !teacherUser.isActive) {
      return res.status(400).json({ success: false, message: "Invalid teacher assignment" });
    }

    const course = await Course.create({
      code,
      title,
      description,
      subject,
      credits,
      capacity,
      teacher,
      semester,
      academicYear,
      schedule,
      status,
    });

    const populated = await Course.findById(course._id).populate("teacher", "fullName email role");

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: populated,
    });
  } catch (error) {
    return next(error);
  }
}

async function getCourses(req, res, next) {
  try {
    const filter = {};

    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.semester) filter.semester = Number(req.query.semester);
    if (req.query.academicYear) filter.academicYear = Number(req.query.academicYear);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.search) {
      filter.$or = [
        { code: { $regex: req.query.search, $options: "i" } },
        { title: { $regex: req.query.search, $options: "i" } },
        { subject: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.user.role === "Teacher") {
      filter.teacher = req.user._id;
    }

    if (req.user.role === "Student") {
      filter.status = "Published";
    }

    const courses = await Course.find(filter)
      .populate("teacher", "fullName email")
      .sort({ academicYear: -1, semester: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    return next(error);
  }
}

async function getCourseById(req, res, next) {
  try {
    const course = await Course.findById(req.params.id).populate("teacher", "fullName email role");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (req.user.role === "Teacher" && String(course.teacher._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (req.user.role === "Student" && course.status !== "Published") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: course });
  } catch (error) {
    return next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const updates = req.body;

    if (updates.teacher) {
      const teacherUser = await User.findById(updates.teacher);
      if (!teacherUser || teacherUser.role !== "Teacher" || !teacherUser.isActive) {
        return res.status(400).json({ success: false, message: "Invalid teacher assignment" });
      }
    }

    if (updates.capacity !== undefined && updates.capacity < course.enrolledCount) {
      return res.status(400).json({
        success: false,
        message: "Capacity cannot be less than currently enrolled count",
      });
    }

    Object.assign(course, updates);
    await course.save();

    const updated = await Course.findById(course._id).populate("teacher", "fullName email role");

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

async function archiveCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    course.status = "Archived";
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course archived successfully",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  archiveCourse,
};
