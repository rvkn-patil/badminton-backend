// models/Slot.js
const mongoose = require('mongoose');

/**
 * @typedef Slot
 * @property {mongoose.Schema.Types.ObjectId} venue - Reference to the Venue where the court is booked.
 * @property {string} courtNumber - The number of the court being booked (e.g., "Court 1").
 * @property {Date} startTime - The start time of the slot (ISO Date).
 * @property {Date} endTime - The end time of the slot (ISO Date).
 * @property {string} bookedBy - The name or ID of the person slot the court.
 * @property {Date} bookingDate - The date when the slot was made.
 */

/**
 * @schema slotSchema
 * @description Defines the Mongoose schema for a Slot.
 */
const slotSchema = new mongoose.Schema({
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue', // This links to the 'Venue' model
        required: true
    },
    courtNumber: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    bookedBy: {
        type: String,
        required: true,
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    isSlotBooked: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

/**
 * @model Slot
 * @description Mongoose model for the 'slots' collection.
 */
module.exports = mongoose.model('Slot', slotSchema);
