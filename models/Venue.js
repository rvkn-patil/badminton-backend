// models/Venue.js
const mongoose = require('mongoose');

/**
 * @typedef Venue
 * @property {string} name - The name of the venue (e.g., "Badminton Hub Arena").
 * @property {number} maxCourts - The maximum number of courts available at this venue.
 */

/**
 * @schema venueSchema
 * @description Defines the Mongoose schema for a Venue.
 */
const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Ensure venue names are unique
    },
    maxCourts: {
        type: Number,
        required: true,
        min: 1 // A venue must have at least one court
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

/**
 * @model Venue
 * @description Mongoose model for the 'venues' collection.
 */
module.exports = mongoose.model('Venue', venueSchema);
