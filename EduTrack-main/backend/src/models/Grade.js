const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
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
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assessmentType: {
      type: String,
      enum: ["Quiz", "Assignment", "Midterm", "Final", "Project", "Lab", "Other"],
      required: true,
      index: true,
    },
    assessmentTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    assessmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    weightage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    letterGrade: {
      type: String,
      trim: true,
      maxlength: 2,
      default: "F",
      index: true,
    },
    term: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

function toLetterGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 85) return "A";
  if (percentage >= 80) return "A-";
  if (percentage >= 75) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 65) return "B-";
  if (percentage >= 60) return "C+";
  if (percentage >= 55) return "C";
  if (percentage >= 50) return "C-";
  if (percentage >= 45) return "D";
  return "F";
}

gradeSchema.pre("validate", function computeGrade(next) {
  if (this.maxMarks > 0) {
    this.percentage = Number(((this.obtainedMarks / this.maxMarks) * 100).toFixed(2));
    this.letterGrade = toLetterGrade(this.percentage);
  }

  if (this.obtainedMarks > this.maxMarks) {
    return next(new Error("Obtained marks cannot exceed max marks"));
  }

  return next();
});

gradeSchema.index(
  { student: 1, course: 1, assessmentType: 1, assessmentTitle: 1, assessmentDate: 1 },
  { unique: true }
);
gradeSchema.index({ student: 1, term: 1, course: 1 });

module.exports = mongoose.model("Grade", gradeSchema);
