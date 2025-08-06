// models/Booking.js
const mongoose = require('mongoose');

/**
 * @typedef Booking
 * @property {string} courtNumber - The number of the court being booked.
 * @property {Date} startTime - The start time of the booking.
 * @property {Date} endTime - The end time of the booking.
 * @property {string} bookedBy - The name or ID of the person booking the court.
 * @property {Date} bookingDate - The date when the booking was made.
 */

/**
 * @schema bookingSchema
 * @description Defines the Mongoose schema for a Booking.
 */
const bookingSchema = new mongoose.Schema({
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
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

/**
 * @model Booking
 * @description Mongoose model for the 'bookings' collection.
 */
module.exports = mongoose.model('Booking', bookingSchema);
