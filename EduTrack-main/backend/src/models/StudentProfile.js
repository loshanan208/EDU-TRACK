const mongoose = require("mongoose");

const guardianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    relation: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20, 
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid guardian email format"],
    },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    address: {
      line1: { type: String, trim: true, maxlength: 150 },
      line2: { type: String, trim: true, maxlength: 150 },
      city: { type: String, trim: true, maxlength: 100 },
      state: { type: String, trim: true, maxlength: 100 },
      postalCode: { type: String, trim: true, maxlength: 20 },
      country: { type: String, trim: true, maxlength: 100 },
    },
    enrollment: {
      admissionDate: {
        type: Date,
        required: [true, "Admission date is required"],
      },
      admissionYear: {
        type: Number,
        required: [true, "Admission year is required"],
        min: 2000,
      },
      currentSemester: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        default: 1,
      },
      program: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },
      department: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },
      status: {
        type: String,
        enum: ["Active", "Graduated", "Suspended", "Dropped"],
        default: "Active",
        index: true,
      },
    },
    guardian: guardianSchema,
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 120 },
      phone: { type: String, trim: true, maxlength: 20 },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
