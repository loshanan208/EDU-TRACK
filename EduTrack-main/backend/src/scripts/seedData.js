require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");

function getAcademicYear() {
  return new Date().getFullYear();
}

async function clearCollections() {
  await Promise.all([
    Grade.deleteMany({}),
    Attendance.deleteMany({}),
    Enrollment.deleteMany({}),
    Course.deleteMany({}),
    StudentProfile.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function seedUsers() {
  const admin = await User.create({
    fullName: "System Admin",
    email: "admin@edutrack.edu",
    password: "Admin@12345",
    role: "Admin",
    phone: "+1-555-1000",
    isActive: true,
  });

  const teachers = await Promise.all([
    User.create({
      fullName: "Alicia Parker",
      email: "alicia.parker@edutrack.edu",
      password: "Teacher@123",
      role: "Teacher",
      phone: "+1-555-2001",
      isActive: true,
    }),
    User.create({
      fullName: "Daniel Brooks",
      email: "daniel.brooks@edutrack.edu",
      password: "Teacher@123",
      role: "Teacher",
      phone: "+1-555-2002",
      isActive: true,
    }),
  ]);

  const studentUsers = await Promise.all([
    User.create({
      fullName: "Emma Collins",
      email: "emma.collins@edutrack.edu",
      password: "Student@123",
      role: "Student",
      phone: "+1-555-3001",
      isActive: true,
    }),
    User.create({
      fullName: "Liam Turner",
      email: "liam.turner@edutrack.edu",
      password: "Student@123",
      role: "Student",
      phone: "+1-555-3002",
      isActive: true,
    }),
    User.create({
      fullName: "Sophia Reed",
      email: "sophia.reed@edutrack.edu",
      password: "Student@123",
      role: "Student",
      phone: "+1-555-3003",
      isActive: true,
    }),
  ]);

  return { admin, teachers, studentUsers };
}

async function seedStudentProfiles(studentUsers) {
  const currentYear = getAcademicYear();

  const profiles = await StudentProfile.insertMany([
    {
      user: studentUsers[0]._id,
      studentId: "EDU-S-1001",
      dateOfBirth: new Date("2004-03-14"),
      gender: "Female",
      enrollment: {
        admissionDate: new Date(`${currentYear - 2}-08-15`),
        admissionYear: currentYear - 2,
        currentSemester: 5,
        program: "BSc Computer Science",
        department: "Computing",
        status: "Active",
      },
      guardian: {
        name: "David Collins",
        relation: "Father",
        phone: "+1-555-4101",
        email: "david.collins@example.com",
      },
    },
    {
      user: studentUsers[1]._id,
      studentId: "EDU-S-1002",
      dateOfBirth: new Date("2003-11-02"),
      gender: "Male",
      enrollment: {
        admissionDate: new Date(`${currentYear - 2}-08-15`),
        admissionYear: currentYear - 2,
        currentSemester: 5,
        program: "BSc Computer Science",
        department: "Computing",
        status: "Active",
      },
      guardian: {
        name: "Martha Turner",
        relation: "Mother",
        phone: "+1-555-4102",
        email: "martha.turner@example.com",
      },
    },
    {
      user: studentUsers[2]._id,
      studentId: "EDU-S-1003",
      dateOfBirth: new Date("2004-06-21"),
      gender: "Female",
      enrollment: {
        admissionDate: new Date(`${currentYear - 1}-08-15`),
        admissionYear: currentYear - 1,
        currentSemester: 3,
        program: "BSc Data Science",
        department: "Computing",
        status: "Active",
      },
      guardian: {
        name: "Luke Reed",
        relation: "Father",
        phone: "+1-555-4103",
        email: "luke.reed@example.com",
      },
    },
  ]);

  return profiles;
}

async function seedCourses(teachers) {
  const year = getAcademicYear();

  const courses = await Course.insertMany([
    {
      code: "CS501",
      title: "Advanced Web Engineering",
      description: "Modern full-stack engineering practices.",
      subject: "Computer Science",
      credits: 3,
      capacity: 40,
      enrolledCount: 0,
      teacher: teachers[0]._id,
      semester: 5,
      academicYear: year,
      schedule: [
        { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "LAB-1" },
        { dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:30", room: "LAB-1" },
      ],
      status: "Published",
    },
    {
      code: "DS401",
      title: "Applied Machine Learning",
      description: "Practical ML workflows and model evaluation.",
      subject: "Data Science",
      credits: 3,
      capacity: 35,
      enrolledCount: 0,
      teacher: teachers[1]._id,
      semester: 5,
      academicYear: year,
      schedule: [
        { dayOfWeek: "Tuesday", startTime: "11:00", endTime: "12:30", room: "LAB-2" },
        { dayOfWeek: "Thursday", startTime: "11:00", endTime: "12:30", room: "LAB-2" },
      ],
      status: "Published",
    },
  ]);

  return courses;
}

async function seedEnrollments(studentProfiles, courses) {
  const term = `Sem-${courses[0].semester}-${courses[0].academicYear}`;

  const enrollments = await Enrollment.insertMany([
    { student: studentProfiles[0]._id, course: courses[0]._id, term, status: "Enrolled" },
    { student: studentProfiles[1]._id, course: courses[0]._id, term, status: "Enrolled" },
    { student: studentProfiles[2]._id, course: courses[1]._id, term, status: "Enrolled" },
    { student: studentProfiles[0]._id, course: courses[1]._id, term, status: "Enrolled" },
  ]);

  for (const course of courses) {
    const count = enrollments.filter((enrollment) => String(enrollment.course) === String(course._id)).length;
    course.enrolledCount = count;
    await course.save();
  }

  return enrollments;
}

async function seedAttendanceAndGrades(studentProfiles, courses, teachers) {
  const attendanceDates = [
    new Date("2026-03-16"),
    new Date("2026-03-17"),
    new Date("2026-03-18"),
  ];

  const attendanceRows = [];
  const statuses = ["Present", "Late", "Absent", "Present", "Excused"];

  let index = 0;
  for (const course of courses) {
    const enrolledStudents = studentProfiles.filter((profile) =>
      String(course.code) === "CS501"
        ? ["EDU-S-1001", "EDU-S-1002"].includes(profile.studentId)
        : ["EDU-S-1001", "EDU-S-1003"].includes(profile.studentId)
    );

    for (const date of attendanceDates) {
      for (const student of enrolledStudents) {
        attendanceRows.push({
          student: student._id,
          course: course._id,
          markedBy: course.code === "CS501" ? teachers[0]._id : teachers[1]._id,
          date,
          status: statuses[index % statuses.length],
          remarks: "Seeded record",
        });
        index += 1;
      }
    }
  }

  await Attendance.insertMany(attendanceRows);

  const gradeRows = [
    {
      student: studentProfiles[0]._id,
      course: courses[0]._id,
      recordedBy: teachers[0]._id,
      assessmentType: "Quiz",
      assessmentTitle: "Quiz 1",
      assessmentDate: new Date("2026-03-10"),
      maxMarks: 20,
      obtainedMarks: 18,
      weightage: 10,
      term: "Term-1",
      remarks: "Strong performance",
    },
    {
      student: studentProfiles[1]._id,
      course: courses[0]._id,
      recordedBy: teachers[0]._id,
      assessmentType: "Quiz",
      assessmentTitle: "Quiz 1",
      assessmentDate: new Date("2026-03-10"),
      maxMarks: 20,
      obtainedMarks: 14,
      weightage: 10,
      term: "Term-1",
      remarks: "Needs revision",
    },
    {
      student: studentProfiles[2]._id,
      course: courses[1]._id,
      recordedBy: teachers[1]._id,
      assessmentType: "Assignment",
      assessmentTitle: "Assignment 1",
      assessmentDate: new Date("2026-03-11"),
      maxMarks: 30,
      obtainedMarks: 26,
      weightage: 15,
      term: "Term-1",
      remarks: "Good analytical approach",
    },
    {
      student: studentProfiles[0]._id,
      course: courses[1]._id,
      recordedBy: teachers[1]._id,
      assessmentType: "Assignment",
      assessmentTitle: "Assignment 1",
      assessmentDate: new Date("2026-03-11"),
      maxMarks: 30,
      obtainedMarks: 28,
      weightage: 15,
      term: "Term-1",
      remarks: "Excellent work",
    },
  ];

  await Grade.insertMany(gradeRows);
}

async function seed() {
  const reset = process.argv.includes("--reset");

  await connectDB();

  if (reset) {
    await clearCollections();
  } else {
    const hasData = await User.countDocuments({});
    if (hasData > 0) {
      console.log("Data already exists. Use: npm run seed:reset");
      process.exit(0);
    }
  }

  const { admin, teachers, studentUsers } = await seedUsers();
  const studentProfiles = await seedStudentProfiles(studentUsers);
  const courses = await seedCourses(teachers);

  await seedEnrollments(studentProfiles, courses);
  await seedAttendanceAndGrades(studentProfiles, courses, teachers);

  console.log("Seed complete.");
  console.log("Admin: admin@edutrack.edu / Admin@12345");
  console.log("Teacher: alicia.parker@edutrack.edu / Teacher@123");
  console.log("Student: emma.collins@edutrack.edu / Student@123");
  console.log(`Created admin id: ${admin._id}`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
