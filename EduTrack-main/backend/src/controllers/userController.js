const User = require("../models/User");
const validateRequest = require("../utils/validateRequest");

async function getTeachers(req, res, next) {
  try {
    const teachers = await User.find({ role: "Teacher", isActive: true })
      .select("fullName email phone role isActive")
      .sort({ fullName: 1 });

    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    return next(error);
  }
}

async function createTeacher(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const { fullName, email, password, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const teacher = await User.create({
      fullName,
      email,
      password,
      phone,
      role: "Teacher",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: {
        _id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        role: teacher.role,
        isActive: teacher.isActive,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTeachers,
  createTeacher,
};
