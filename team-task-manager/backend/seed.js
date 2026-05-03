// seed.js - Script to populate the database with demo data
// Run: node seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import models
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@demo.com',
      password: 'password123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@demo.com',
      password: 'password123',
      role: 'member',
    });

    // Also create the generic "member@demo.com" account shown in login page
    const member3 = await User.create({
      name: 'Demo Member',
      email: 'member@demo.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      title: 'Website Redesign',
      description: 'Redesign the company website with modern UI',
      createdBy: admin._id,
      members: [member1._id, member2._id],
    });

    const project2 = await Project.create({
      title: 'Mobile App v2',
      description: 'Build version 2 of the mobile application',
      createdBy: admin._id,
      members: [member1._id, member3._id],
    });

    console.log('Created projects');

    // Create tasks
    const today = new Date();
    const future = (days) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    const past = (days) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

    await Task.create([
      {
        title: 'Design homepage mockup',
        description: 'Create wireframe and mockup for the new homepage',
        project: project1._id,
        assignedTo: member1._id,
        status: 'Done',
        dueDate: past(5),
        createdBy: admin._id,
      },
      {
        title: 'Implement responsive navbar',
        description: 'Make the navigation bar work on mobile devices',
        project: project1._id,
        assignedTo: member2._id,
        status: 'In Progress',
        dueDate: future(3),
        createdBy: admin._id,
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints',
        project: project1._id,
        assignedTo: member1._id,
        status: 'To Do',
        dueDate: future(7),
        createdBy: admin._id,
      },
      {
        title: 'Fix login bug',
        description: 'Users are getting logged out randomly - investigate and fix',
        project: project2._id,
        assignedTo: member1._id,
        status: 'In Progress',
        dueDate: past(2), // This one is overdue
        createdBy: admin._id,
      },
      {
        title: 'Add push notifications',
        description: 'Implement push notification support for Android and iOS',
        project: project2._id,
        assignedTo: member3._id,
        status: 'To Do',
        dueDate: future(14),
        createdBy: admin._id,
      },
    ]);

    console.log('Created tasks');
    console.log('\n✅ Seed complete!');
    console.log('\nDemo accounts:');
    console.log('  Admin:  admin@demo.com / password123');
    console.log('  Member: member@demo.com / password123');
    console.log('  Alice:  alice@demo.com / password123');
    console.log('  Bob:    bob@demo.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
