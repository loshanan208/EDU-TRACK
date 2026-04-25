const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["Enrolled", "Completed", "Dropped", "Withdrawn", "Waitlisted"],
      default: "Enrolled",
      index: true,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    finalLetterGrade: {
      type: String,
      trim: true,
      maxlength: 2,
      default: null,
    },
    finalPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
