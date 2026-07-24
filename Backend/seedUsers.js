require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Enrollment = require('./src/models/Enrollment');
const Progress = require('./src/models/Progress');
const Lesson = require('./src/models/Lesson');
const LessonProgress = require('./src/models/LessonProgress');
const Certificate = require('./src/models/Certificate');
const Quiz = require('./src/models/Quiz');
const Question = require('./src/models/Question');
const QuizAttempt = require('./src/models/QuizAttempt');
const Review = require('./src/models/Review');
const Notification = require('./src/models/Notification');
const AiSession = require('./src/models/AiSession');
const courses = require('../courses.json');
const { hashPassword } = require('./src/utils/hashPassword');

const seedUsersAndCourses = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected successfully');

  // Clear all collections to prevent corrupted/orphan database references
  await User.deleteMany({});
  await Course.deleteMany({});
  await Enrollment.deleteMany({});
  await Progress.deleteMany({});
  await Lesson.deleteMany({});
  await LessonProgress.deleteMany({});
  await Certificate.deleteMany({});
  await Quiz.deleteMany({});
  await Question.deleteMany({});
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
    const tid = ['6841a1b2c3d4e5f601111111', '6841a1b2c3d4e5f601111112', '6841a1b2c3d4e5f601111113'].includes(c.teacherId)
      ? '6841a1b2c3d4e5f601111111'
      : c.teacherId;

    return {
      ...c,
      _id: new mongoose.Types.ObjectId(c._id),
      teacherId: new mongoose.Types.ObjectId(tid)
    };
  });

  const createdCourses = await Course.insertMany(docs);
  console.log(`Seed ${createdCourses.length} courses completed successfully.`);

  // Seed 3 lessons and 1 quiz (with 2 questions) for each course
  for (const course of createdCourses) {
    // 1. Create Lessons
    const lesson1 = await Lesson.create({
      courseId: course._id,
      title: 'Introduction & Basic Vocabulary',
      description: 'Get familiar with common phrases, target greetings, and basic daily vocabulary in ' + course.language + '.',
      order: 1,
      contentType: ['text', 'vocabulary'],
      textContent: 'Welcome to Lesson 1. Practicing daily greetings helps develop quick familiarity.',
      vocabulary: [
        { word: 'Hello', translation: 'Xin chào / Bonjour', pronunciation: 'həˈloʊ' },
        { word: 'Good morning', translation: 'Chào buổi sáng', pronunciation: 'ɡʊd ˈmɔːrnɪŋ' }
      ],
      status: 'published'
    });

    const lesson2 = await Lesson.create({
      courseId: course._id,
      title: 'Sentence Construction & Syntax Rules',
      description: 'Learn structure logic, word ordering, verb conjugations, and forming clean sentences.',
      order: 2,
      contentType: ['text', 'grammar'],
      textContent: 'Welcome to Lesson 2. In this section, we study how verbs connect subject and objects.',
      grammarNotes: 'Subject + Verb + Object. Make sure verb matches subject count.',
      status: 'published'
    });

    const lesson3 = await Lesson.create({
      courseId: course._id,
      title: 'Real-world Practice & Dialogue Conversation',
      description: 'Interactive conversation practice focusing on correct accent pronunciation and listening.',
      order: 3,
      contentType: ['text'],
      textContent: 'Welcome to Lesson 3. Review dialogues to prepare for the final assessment quiz.',
      status: 'published'
    });

    // Update course lessonCount to 3
    await Course.findByIdAndUpdate(course._id, { lessonCount: 3 });

    // 2. Create final Quiz
    const quiz = await Quiz.create({
      title: 'Final Course Assessment',
      courseId: course._id,
      teacherId: course.teacherId,
      timeLimitMinutes: 15,
      maxAttempts: 3,
      passingScore: 70,
      status: 'published'
    });

    // 3. Create Questions for Quiz
    await Question.create({
      quizId: quiz._id,
      type: 'multiple_choice',
      prompt: 'Which sentence structure represents clean syntax rules in English or standard translation patterns?',
      options: [
        { id: 'a', text: 'Subject + Verb + Object' },
        { id: 'b', text: 'Object + Subject + Verb' },
        { id: 'c', text: 'Verb + Object + Subject' }
      ],
      correctAnswer: 'a',
      points: 50,
      order: 1,
      explanation: 'Subject + Verb + Object represents the basic syntactic order.'
    });

    await Question.create({
      quizId: quiz._id,
      type: 'open_ended',
      prompt: 'Write a short self-introduction paragraph (about 2-3 sentences) in your target language.',
      correctAnswer: 'Hello, my name is student and I am studying.',
      points: 50,
      order: 2,
      explanation: 'Introduce yourself with name and study objectives.'
    });
  }

  console.log('Seed lessons, quizzes, and questions completed successfully for all 7 courses.');
  process.exit(0);
};

seedUsersAndCourses().catch(err => {
  console.error(err);
  process.exit(1);
});
