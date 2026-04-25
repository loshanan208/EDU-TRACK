const { validationResult } = require("express-validator");

const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const generateToken = require("../utils/generateToken");

function randomDigits(length) {
  return Math.floor(Math.random() * Number(`1${"0".repeat(length)}`))
    .toString()
    .padStart(length, "0");
}

async function generateUniqueStudentId() {
  let candidate = "";
  let exists = true;

  while (exists) {
    candidate = `EDU-S-${randomDigits(6)}`;
    // eslint-disable-next-line no-await-in-loop
    exists = Boolean(await StudentProfile.findOne({ studentId: candidate }));
  }

  return candidate;
}

function buildAuthResponse(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const requestedRole = role || "Student";
    const isSystemEmpty = (await User.countDocuments({})) === 0;

    // Only first system user may self-register as Admin for bootstrap.
    const assignedRole = isSystemEmpty && requestedRole === "Admin" ? "Admin" : "Student";

    const user = await User.create({
      fullName,
      email,
      password,
      role: assignedRole,
    });

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function signup(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      fullName,
      email,
      password,
      dateOfBirth,
      gender,
      phone,
      program,
      department,
      currentSemester,
      address,
      guardian,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const admissionDate = new Date();
    const admissionYear = admissionDate.getFullYear();

    const user = await User.create({
      fullName,
      email,
      password,
      role: "Student",
      phone,
      isActive: true,
    });

    try {
      const studentId = await generateUniqueStudentId();

      await StudentProfile.create({
        user: user._id,
        studentId,
        dateOfBirth,
        gender: gender || "Prefer not to say",
        address,
        enrollment: {
          admissionDate,
          admissionYear,
          currentSemester: Number(currentSemester),
          program,
          department,
          status: "Active",
        },
        guardian,
      });
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled. Contact administrator.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: buildAuthResponse(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      user: buildAuthResponse(req.user),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  signup,
  login,
  getMe,
};
