const mongoose = require('mongoose');

// Schema for a single day's availability setting
const availabilityItemSchema = new mongoose.Schema({
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    enabled: { type: Boolean, required: true }
}, { _id: false }); // We don't need separate IDs for these sub-documents

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true // Remove whitespace
    },
    // WARNING: In a production app, this password MUST be hashed using bcrypt or similar.
    password: { 
        type: String, 
        required: true 
    }, 
    name: {
        type: String,
        default: function() { return this.username; } // Default name to username
    },
    // Array to hold the availability settings for all days
    availability: [availabilityItemSchema],
}, { 
    timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('User', userSchema);