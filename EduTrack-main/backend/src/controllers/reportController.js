const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escapeCell(row[h])).join(","));
  });

  return lines.join("\n");
}

async function getStudentSummaryReport(req, res, next) {
  try {
    const { studentId } = req.params;

    if (req.user.role === "Student") {
      const ownProfile = await StudentProfile.findOne({ user: req.user._id }).select("_id");
      if (!ownProfile || String(ownProfile._id) !== String(studentId)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const student = await StudentProfile.findById(studentId).populate("user", "fullName email");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const [enrollments, attendanceStats, gradeStats, termGrades] = await Promise.all([
      Enrollment.find({ student: studentId }).populate("course", "code title subject semester academicYear"),
      Attendance.aggregate([
        { $match: { student: student._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Grade.aggregate([
        { $match: { student: student._id } },
        {
          $group: {
            _id: null,
            averagePercentage: { $avg: "$percentage" },
            totalAssessments: { $sum: 1 },
          },
        },
      ]),
      Grade.aggregate([
        { $match: { student: student._id } },
        {
          $group: {
            _id: "$term",
            averagePercentage: { $avg: "$percentage" },
            assessments: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const attendanceMap = attendanceStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const totalAttendance = Object.values(attendanceMap).reduce((sum, count) => sum + count, 0);
    const presentLike = (attendanceMap.Present || 0) + (attendanceMap.Late || 0) + (attendanceMap.Excused || 0);
    const attendanceRate = totalAttendance > 0 ? Number(((presentLike / totalAttendance) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        student,
        enrollments,
        attendance: {
          breakdown: attendanceMap,
          total: totalAttendance,
          attendanceRate,
        },
        academics: {
          averagePercentage: gradeStats[0] ? Number(gradeStats[0].averagePercentage.toFixed(2)) : 0,
          totalAssessments: gradeStats[0] ? gradeStats[0].totalAssessments : 0,
          trendByTerm: termGrades.map((item) => ({
            term: item._id,
            averagePercentage: Number(item.averagePercentage.toFixed(2)),
            assessments: item.assessments,
          })),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getCourseSummaryReport(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("teacher", "fullName email");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (req.user.role === "Teacher" && String(course.teacher._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const [enrollmentStats, attendanceStats, gradeStats] = await Promise.all([
      Enrollment.aggregate([
        { $match: { course: course._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Attendance.aggregate([
        { $match: { course: course._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Grade.aggregate([
        { $match: { course: course._id } },
        {
          $group: {
            _id: null,
            averagePercentage: { $avg: "$percentage" },
            assessments: { $sum: 1 },
          },
        },
      ]),
    ]);

    const enrollmentMap = enrollmentStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const attendanceMap = attendanceStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const totalAttendance = Object.values(attendanceMap).reduce((sum, count) => sum + count, 0);
    const presentLike = (attendanceMap.Present || 0) + (attendanceMap.Late || 0) + (attendanceMap.Excused || 0);

    return res.status(200).json({
      success: true,
      data: {
        course,
        enrollment: {
          capacity: course.capacity,
          enrolledCount: course.enrolledCount,
          statusBreakdown: enrollmentMap,
        },
        attendance: {
          totalRecords: totalAttendance,
          attendanceRate: totalAttendance ? Number(((presentLike / totalAttendance) * 100).toFixed(2)) : 0,
          statusBreakdown: attendanceMap,
        },
        academics: {
          averagePercentage: gradeStats[0] ? Number(gradeStats[0].averagePercentage.toFixed(2)) : 0,
          totalAssessments: gradeStats[0] ? gradeStats[0].assessments : 0,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getOverviewReport(req, res, next) {
  try {
    const [users, students, courses, activeEnrollments, attendanceAvg, gradesAvg] = await Promise.all([
      User.countDocuments({ isActive: true }),
      StudentProfile.countDocuments({ "enrollment.status": "Active" }),
      Course.countDocuments({ status: "Published" }),
      Enrollment.countDocuments({ status: "Enrolled" }),
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            presentLike: {
              $sum: {
                $cond: [{ $in: ["$status", ["Present", "Late", "Excused"]] }, 1, 0],
              },
            },
          },
        },
      ]),
      Grade.aggregate([
        {
          $group: {
            _id: null,
            averagePercentage: { $avg: "$percentage" },
          },
        },
      ]),
    ]);

    const attendanceRate = attendanceAvg[0]
      ? Number(((attendanceAvg[0].presentLike / attendanceAvg[0].total) * 100).toFixed(2))
      : 0;

    const averageGrade = gradesAvg[0] ? Number(gradesAvg[0].averagePercentage.toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        activeUsers: users,
        activeStudents: students,
        publishedCourses: courses,
        activeEnrollments,
        institutionAttendanceRate: attendanceRate,
        institutionAverageGrade: averageGrade,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function exportCourseReportCsv(req, res, next) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("teacher", "fullName");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (req.user.role === "Teacher" && String(course.teacher._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const enrollments = await Enrollment.find({ course: course._id, status: { $in: ["Enrolled", "Completed"] } })
      .populate({ path: "student", populate: { path: "user", select: "fullName email" } })
      .lean();

    const rows = await Promise.all(
      enrollments.map(async (enrollment) => {
        const [attendanceAgg, gradesAgg] = await Promise.all([
          Attendance.aggregate([
            { $match: { course: course._id, student: enrollment.student._id } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                presentLike: {
                  $sum: {
                    $cond: [{ $in: ["$status", ["Present", "Late", "Excused"]] }, 1, 0],
                  },
                },
              },
            },
          ]),
          Grade.aggregate([
            { $match: { course: course._id, student: enrollment.student._id } },
            {
              $group: {
                _id: null,
                averagePercentage: { $avg: "$percentage" },
              },
            },
          ]),
        ]);

        const attendanceRate = attendanceAgg[0]
          ? Number(((attendanceAgg[0].presentLike / attendanceAgg[0].total) * 100).toFixed(2))
          : 0;

        return {
          studentId: enrollment.student.studentId,
          studentName: enrollment.student.user.fullName,
          studentEmail: enrollment.student.user.email,
          enrollmentStatus: enrollment.status,
          attendanceRate,
          averageGradePercentage: gradesAgg[0] ? Number(gradesAgg[0].averagePercentage.toFixed(2)) : 0,
        };
      })
    );

    const csv = toCsv(rows);
    const filename = `${course.code}_report.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStudentSummaryReport,
  getCourseSummaryReport,
  getOverviewReport,
  exportCourseReportCsv,
};
