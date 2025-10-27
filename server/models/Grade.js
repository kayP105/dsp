const mongoose = require('mongoose');

// Schema for an individual grade item
const gradeItemSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Using existing Date.now() ID logic
    topic: { type: String, required: true },
    semester: { type: String, required: true },
    score: { type: Number, required: true },
    outOf: { type: Number, required: true },
    date: { type: String, required: true }
}, { _id: false });

const gradeSchema = new mongoose.Schema({
    username: { // Link back to the User
        type: String, 
        required: true, 
        unique: true, 
        ref: 'User' 
    },
    grades: [gradeItemSchema] // Array to hold all grades for this user
});

module.exports = mongoose.model('Grade', gradeSchema);