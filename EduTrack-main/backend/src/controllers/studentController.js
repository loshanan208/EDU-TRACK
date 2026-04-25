const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Enrollment = require("../models/Enrollment");

const validateRequest = require("../utils/validateRequest");

function randomDigits(n) {
  return String(Math.floor(Math.random() * 10 ** n)).padStart(n, "0");
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

async function createStudent(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const {
      firstName,
      lastName,
      email,
      contactNo,
      studentId: rawStudentId,
      dateOfBirth,
      gender,
      address,
      enrollment,
      guardian,
      emergencyContact,
      notes,
    } = req.body;

    const fullName = `${(firstName || "").trim()} ${(lastName || "").trim()}`.trim();
    const tempPassword = `EduTrack@${new Date().getFullYear()}`;
    const studentId = rawStudentId ? rawStudentId.toUpperCase() : await generateUniqueStudentId();

    // Auto-fill admissionDate from admissionYear if not provided
    if (enrollment && !enrollment.admissionDate && enrollment.admissionYear) {
      enrollment.admissionDate = `${enrollment.admissionYear}-01-01`;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const existingStudentId = await StudentProfile.findOne({ studentId });
    if (existingStudentId) {
      return res.status(409).json({ success: false, message: "Student ID already exists" });
    }

    const user = await User.create({
      fullName,
      firstName: (firstName || "").trim(),
      lastName: (lastName || "").trim(),
      email,
      password: tempPassword,
      phone: contactNo,
      role: "Student",
      isActive: true,
    });

    // Convert plain string address to structured object
    const addressObj =
      address && typeof address === "string" ? { line1: address } : address || undefined;

    try {
      const studentProfile = await StudentProfile.create({
        user: user._id,
        studentId,
        dateOfBirth,
        gender,
        address: addressObj,
        enrollment,
        guardian,
        emergencyContact,
        notes,
      });

      const populated = await StudentProfile.findById(studentProfile._id).populate(
        "user",
        "fullName firstName lastName email role phone isActive"
      );

      return res.status(201).json({
        success: true,
        message: "Student created successfully",
        tempPassword,
        data: populated,
      });
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }
  } catch (error) {
    return next(error);
  }
}

async function getStudents(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const profileFilter = {};
    const userFilter = {};

    if (req.query.status) profileFilter["enrollment.status"] = req.query.status;
    if (req.query.program) profileFilter["enrollment.program"] = req.query.program;
    if (req.query.department) profileFilter["enrollment.department"] = req.query.department;
    if (req.query.studentId) profileFilter.studentId = req.query.studentId.toUpperCase();
    if (req.query.search) {
      userFilter.$or = [
        { fullName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const userIds = await User.find({ role: "Student", ...userFilter }).distinct("_id");
    profileFilter.user = { $in: userIds };

    const [items, total] = await Promise.all([
      StudentProfile.find(profileFilter)
        .populate("user", "fullName firstName lastName email phone isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StudentProfile.countDocuments(profileFilter),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const profile = await StudentProfile.findById(id).populate(
      "user",
      "fullName firstName lastName email phone role isActive"
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (req.user.role === "Student" && String(profile.user._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
}

async function getMyStudentProfile(req, res, next) {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      "user",
      "fullName firstName lastName email phone role isActive"
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    if (!validateRequest(req, res)) return;

    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      enrollment,
      guardian,
      emergencyContact,
      notes,
    } = req.body;

    const profile = await StudentProfile.findById(id).populate("user");
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (email && email.toLowerCase() !== profile.user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && String(existing._id) !== String(profile.user._id)) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
      profile.user.email = email;
    }

    if (fullName !== undefined) profile.user.fullName = fullName;
    if (phone !== undefined) profile.user.phone = phone;
    await profile.user.save();

    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (address !== undefined) profile.address = address;
    if (enrollment !== undefined) profile.enrollment = { ...profile.enrollment.toObject(), ...enrollment };
    if (guardian !== undefined) profile.guardian = guardian;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (notes !== undefined) profile.notes = notes;

    await profile.save();

    const updated = await StudentProfile.findById(id).populate(
      "user",
      "fullName firstName lastName email phone role isActive"
    );

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

async function deactivateStudent(req, res, next) {
  try {
    const { id } = req.params;

    const profile = await StudentProfile.findById(id).populate("user");
    if (!profile) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    profile.user.isActive = false;
    await profile.user.save();

    profile.enrollment.status = "Dropped";
    await profile.save();

    await Enrollment.updateMany(
      { student: profile._id, status: "Enrolled" },
      { $set: { status: "Dropped", completionDate: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: "Student deactivated and active enrollments dropped",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  getMyStudentProfile,
  updateStudent,
  deactivateStudent,
};
