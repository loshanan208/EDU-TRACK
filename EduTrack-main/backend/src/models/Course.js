const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h HH:mm format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h HH:mm format"],
    },
    room: {
      type: String,
      trim: true,
      maxlength: 50,
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1200,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 100,
      index: true,
    },
    credits: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
      default: 3,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 30,
    },
    enrolledCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    academicYear: {
      type: Number,
      required: true,
      min: 2000,
      index: true,
    },
    schedule: {
      type: [scheduleSchema],
      default: [],
      validate: {
        validator: function validateSchedule(schedule) {
          return schedule.length > 0;
        },
        message: "At least one schedule entry is required",
      },
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

courseSchema.index({ semester: 1, academicYear: 1, subject: 1 });

module.exports = mongoose.model("Course", courseSchema);
