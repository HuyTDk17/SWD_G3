require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const courses = require('../courses.json');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await Course.deleteMany({});
    console.log('Cleared existing courses');

    const docs = courses.map(c => ({
        ...c,
        _id: new mongoose.Types.ObjectId(c._id),
        teacherId: new mongoose.Types.ObjectId(c.teacherId),
    }));

    await Course.insertMany(docs);
    console.log(`Đã seed ${docs.length} courses thành công!`);
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });