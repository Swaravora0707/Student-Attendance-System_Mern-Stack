import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_system';

async function verify() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);

  // 1. Verify students search for MCA, BCA, etc.
  const mcaStudents = await Student.find({
    $or: [
      { department: /^MCA$/i, semester: /^Sem 1$/i, division: /^A$/i },
      { class: { $regex: '(?=.*MCA)', $options: 'i' } }
    ]
  }).populate('user');

  console.log(`Found ${mcaStudents.length} MCA students.`);

  // 2. Verify attendance saving & same day edit bulk write
  const testStudent = await Student.findOne();
  const testTeacher = await User.findOne({ role: 'teacher' });

  if (testStudent && testTeacher) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    console.log(`Testing same-day edit/upsert for student ${testStudent.rollNumber}...`);

    // First save: Present
    await Attendance.updateOne(
      { student: testStudent._id, subject: '6a48d2e2e26274bb8030ea54', date: todayDate },
      { status: 'Present', markedBy: testTeacher._id },
      { upsert: true }
    );
    console.log('Saved initial status: Present');

    // Second save (Same day edit): Absent
    await Attendance.updateOne(
      { student: testStudent._id, subject: '6a48d2e2e26274bb8030ea54', date: todayDate },
      { status: 'Absent', markedBy: testTeacher._id },
      { upsert: true }
    );
    console.log('Same day edit updated status: Absent');

    const updatedRecord = await Attendance.findOne({
      student: testStudent._id,
      date: todayDate,
    });
    console.log('Verified updated record status in DB:', updatedRecord.status);
  }

  process.exit(0);
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
