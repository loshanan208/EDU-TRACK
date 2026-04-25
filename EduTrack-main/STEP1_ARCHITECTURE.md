# EDUTrack Step 1 - Project Architecture and Database Models

## Directory Structure

The workspace uses `frontend` and `backend` folders. These map directly to `client` and `server`.

```text
EDUTrack/
  frontend/                          # client
    public/
    src/
      app/
      components/
        common/
        charts/
      features/
        auth/
        students/
        courses/
        attendance/
        grades/
        reports/
      layouts/
      pages/
      services/
      store/
      styles/
      utils/

  backend/                           # server
    src/
      config/
      models/
        User.js
        StudentProfile.js
        Course.js
        Enrollment.js
        Attendance.js
        Grade.js
      controllers/
      routes/
      middlewares/
      services/
      utils/
```

## Notes

- `User` handles authentication identities and role-based access (`Admin`, `Teacher`, `Student`).
- `StudentProfile` stores student-specific academic and personal details linked to `User`.
- `Course` captures course metadata, assigned teacher, schedule, and capacity.
- `Enrollment` links students and courses.
- `Attendance` stores daily attendance records linked to student and course.
- `Grade` stores assessment-level marks with automatic percentage and letter-grade calculation.
