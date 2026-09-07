import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

// Middleware Imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Models for seeding
import User from './models/User.js';
import Subject from './models/Subject.js';

// Configure dotenv
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basic sanity check route
app.get('/', (req, res) => {
  res.send('Student Attendance System API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// Helper for Seeding Default Admin & Subjects
const seedDatabase = async () => {
  try {
    // 1. Seed Admin
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding default Admin account...');
      await User.create({
        name: 'System Admin',
        email: 'admin@attendance.com',
        password: 'adminpassword',
        role: 'admin',
      });
      console.log('Admin seeded: admin@attendance.com / adminpassword');
    }

    // 2. Seed default subjects (including BCA Semester 1 and Semester 2 curriculum)
    const defaultSubjects = [
      // BCA Semester 1
      { name: 'Mathematics', code: 'MATH1', department: 'BCA', semester: 'Sem 1' },
      { name: 'Architecture of Computer (AOC)', code: 'AOC', department: 'BCA', semester: 'Sem 1' },
      { name: 'Programming in C', code: 'PROG_C', department: 'BCA', semester: 'Sem 1' },
      { name: 'Web Development', code: 'WEB_DEV', department: 'BCA', semester: 'Sem 1' },
      { name: 'Environmental Science', code: 'EVS', department: 'BCA', semester: 'Sem 1' },
      { name: 'Communication Skills', code: 'COMM_SKILLS_1', department: 'BCA', semester: 'Sem 1' },

      // BCA Semester 2
      { name: 'Communication Skills', code: 'COMM_SKILLS_2', department: 'BCA', semester: 'Sem 2' },
      { name: 'Analysis and Design of Systems', code: 'ADS', department: 'BCA', semester: 'Sem 2' },
      { name: 'Advanced C Programming', code: 'ADV_C', department: 'BCA', semester: 'Sem 2' },
      { name: 'Database Management System (DBMS)', code: 'DBMS', department: 'BCA', semester: 'Sem 2' },
      { name: 'Mini Project', code: 'MINI_PROJ', department: 'BCA', semester: 'Sem 2' },
      { name: 'English Through Movies', code: 'ENG_MOVIES', department: 'BCA', semester: 'Sem 2' },

      // Other core subjects
      { name: 'Python Programming', code: 'PYTHON', department: 'BCA', semester: 'Sem 3' },
      { name: 'Data Structures and Algorithms', code: 'DSA', department: 'BCA', semester: 'Sem 3' },
      { name: 'Artificial Intelligence', code: 'AI', department: 'MCA', semester: 'Sem 1' },
      { name: 'Machine Learning', code: 'ML', department: 'MCA', semester: 'Sem 2' },
      { name: 'Software Engineering', code: 'SE', department: 'BCA', semester: 'Sem 4' },
      { name: 'Computer Networks', code: 'CN', department: 'BCA', semester: 'Sem 4' },
      { name: 'Operating Systems', code: 'OS', department: 'BCA', semester: 'Sem 3' },
      { name: 'Cyber Security', code: 'CYS', department: 'Cyber Security', semester: 'Sem 1' },
      { name: 'Cloud Computing', code: 'CC', department: 'Data Science', semester: 'Sem 1' },
    ];

    let seededCount = 0;
    for (const sub of defaultSubjects) {
      const exists = await Subject.findOne({ code: sub.code });
      if (!exists) {
        await Subject.create(sub);
        seededCount++;
      } else {
        // Ensure department and semester tags are updated
        existingSubjectDepartmentUpdate(exists, sub);
      }
    }
    if (seededCount > 0) {
      console.log(`Seeded ${seededCount} new default subjects successfully.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

const existingSubjectDepartmentUpdate = async (doc, subData) => {
  if (!doc.department || !doc.semester) {
    doc.department = subData.department;
    doc.semester = subData.semester;
    await doc.save();
  }
};

// Start Server & Run Seeding
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await seedDatabase();
});
