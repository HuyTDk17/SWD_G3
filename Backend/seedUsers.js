require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Enrollment = require('./src/models/Enrollment');
const Progress = require('./src/models/Progress');
const LessonProgress = require('./src/models/LessonProgress');
const Certificate = require('./src/models/Certificate');
const QuizAttempt = require('./src/models/QuizAttempt');
const Review = require('./src/models/Review');
const Notification = require('./src/models/Notification');
const AiSession = require('./src/models/AiSession');
const courses = require('../courses.json');
const { hashPassword } = require('./src/utils/hashPassword');

const seedUsersAndCourses = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected successfully');

  // Clear all collections to prevent corrupted/orphan database references (E.g. progress, enrollments)
  await User.deleteMany({});
  await Course.deleteMany({});
  await Enrollment.deleteMany({});
  await Progress.deleteMany({});
  await LessonProgress.deleteMany({});
  await Certificate.deleteMany({});
  await QuizAttempt.deleteMany({});
  await Review.deleteMany({});
  await Notification.deleteMany({});
  await AiSession.deleteMany({});
  console.log('Cleared all collections database records successfully.');

  const hashedPassword = await hashPassword('Password123');

  // Create standard accounts
  const student = await User.create({
    _id: new mongoose.Types.ObjectId('6841a1b2c3d4e5f602222222'),
    fullName: 'Test Student',
    email: 'student@test.com',
    passwordHash: hashedPassword,
    role: 'student',
    isEmailVerified: true,
    status: 'active'
  });

  const teacher = await User.create({
    _id: new mongoose.Types.ObjectId('6841a1b2c3d4e5f601111111'),
    fullName: 'Test Teacher',
    email: 'teacher@test.com',
    passwordHash: hashedPassword,
    role: 'teacher',
    isEmailVerified: true,
    status: 'active'
  });

  const admin = await User.create({
    _id: new mongoose.Types.ObjectId('6841a1b2c3d4e5f603333333'),
    fullName: 'Test Admin',
    email: 'admin@test.com',
    passwordHash: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
    status: 'active'
  });

  console.log('Seed users completed:');
  console.log(' - Student: student@test.com / Password123');
  console.log(' - Teacher: teacher@test.com / Password123');
  console.log(' - Admin: admin@test.com / Password123');

  // Seed courses and assign teacher owner IDs
  const docs = courses.map(c => {
    // If it points to secondary teacher IDs, assign it to our main teacher account
    const tid = ['6841a1b2c3d4e5f601111111', '6841a1b2c3d4e5f601111112', '6841a1b2c3d4e5f601111113'].includes(c.teacherId)
      ? '6841a1b2c3d4e5f601111111'
      : c.teacherId;

    return {
      ...c,
      _id: new mongoose.Types.ObjectId(c._id),
      teacherId: new mongoose.Types.ObjectId(tid)
    };
  });

  await Course.insertMany(docs);
  console.log(`Seed ${docs.length} courses completed successfully.`);

  process.exit(0);
};

seedUsersAndCourses().catch(err => {
  console.error(err);
  process.exit(1);
});
