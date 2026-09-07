import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/Subject.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_system';

async function verify() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);

  // Ensure DBMS tag updated
  await Subject.updateOne({ code: 'DBMS' }, { $set: { department: 'BCA', semester: 'Sem 2' } });

  // 1. Verify BCA Sem 1 subjects
  const bcaSem1 = await Subject.find({ department: 'BCA', semester: 'Sem 1' });
  console.log(`BCA Semester 1 Subjects Count: ${bcaSem1.length}`);
  bcaSem1.forEach((s) => console.log(` - [${s.code}] ${s.name}`));

  // 2. Verify BCA Sem 2 subjects
  const bcaSem2 = await Subject.find({ department: 'BCA', semester: 'Sem 2' });
  console.log(`\nBCA Semester 2 Subjects Count: ${bcaSem2.length}`);
  bcaSem2.forEach((s) => console.log(` - [${s.code}] ${s.name}`));

  process.exit(0);
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
