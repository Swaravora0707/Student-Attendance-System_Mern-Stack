import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import User from './models/User.js';
import Teacher from './models/Teacher.js';
import Subject from './models/Subject.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_system';

async function verify() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);

  const teacher = await Teacher.findOne().populate('user');
  const subject = await Subject.findOne();

  if (!teacher || !subject) {
    console.log('No teacher or subject found in DB to test.');
    process.exit(0);
  }

  console.log(`Found teacher: ${teacher.user.name}, subject: ${subject.name} (${subject.code})`);

  // Test adding assignment with Department, Semester, Division
  const dept = 'Data Science';
  const sem = 'Sem 2';
  const div = 'B';
  const targetClass = `${dept} - ${sem} - Div ${div}`;

  // Remove existing test assignment if present
  teacher.assignedSubjects = teacher.assignedSubjects.filter(
    (a) => a.class !== targetClass
  );

  teacher.assignedSubjects.push({
    subject: subject._id,
    department: dept,
    semester: sem,
    division: div,
    class: targetClass,
  });

  await teacher.save();

  console.log('Assigned subject via Admin module successfully!');

  // Verify populating teacher assignments
  const reloadedTeacher = await Teacher.findById(teacher._id).populate('assignedSubjects.subject');
  const lastAssignment = reloadedTeacher.assignedSubjects[reloadedTeacher.assignedSubjects.length - 1];

  console.log('Verified reloaded assignment:', {
    department: lastAssignment.department,
    semester: lastAssignment.semester,
    division: lastAssignment.division,
    class: lastAssignment.class,
    subjectCode: lastAssignment.subject?.code,
    subjectName: lastAssignment.subject?.name,
  });

  process.exit(0);
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
