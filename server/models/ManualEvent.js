const mongoose = require('mongoose');

// Schema for an individual manual event item
const eventItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Using existing string ID logic
    title: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    extendedProps: { type: Object, default: { type: 'manual' } },
    color: { type: String, default: '#f06595' },
    backgroundColor: { type: String, default: '#f06595' },
    borderColor: { type: String, default: '#f06595' },
    display: { type: String, default: 'block' }
}, { _id: false });

const manualEventSchema = new mongoose.Schema({
    username: { // Link back to the User
        type: String, 
        required: true, 
        unique: true, 
        ref: 'User' 
    },
    events: [eventItemSchema] // Array to hold all manual events for this user
});

module.exports = mongoose.model('ManualEvent', manualEventSchema);