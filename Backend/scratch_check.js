import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_system';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const Student = mongoose.model('Student', new mongoose.Schema({
    rollNumber: String,
    class: String
  }));

  const students = await Student.find({}).limit(10);
  console.log('Students:', JSON.stringify(students, null, 2));

  const Teacher = mongoose.model('Teacher', new mongoose.Schema({
    assignedSubjects: [{
      class: String,
      subject: mongoose.Schema.Types.ObjectId
    }]
  }));
  const teachers = await Teacher.find({}).limit(5);
  console.log('Teachers assignedSubjects:', JSON.stringify(teachers.map(t => t.assignedSubjects), null, 2));

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
