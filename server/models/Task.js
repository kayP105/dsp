const mongoose = require('mongoose');

// Schema for daily progress tracking within a task
const dailyProgressSchema = new mongoose.Schema({
    hours: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
}, { _id: false });

// Schema for an individual task item
const taskItemSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Using existing Date.now() ID logic
    subject: { type: String, required: true },
    startDate: { type: String, required: true },
    deadline: { type: String, required: true },
    hours: { type: Number, required: true },
    createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
    completed: { type: Boolean, default: false },
    // Keys will be date strings (e.g., "2024-10-27") mapping to dailyProgressSchema
    dailyProgress: { type: Map, of: dailyProgressSchema, default: {} }
}, { _id: false });


const taskSchema = new mongoose.Schema({
    username: { // Link back to the User
        type: String, 
        required: true, 
        unique: true, 
        ref: 'User' 
    },
    tasks: [taskItemSchema] // Array to hold all tasks for this user
});

module.exports = mongoose.model('Task', taskSchema);