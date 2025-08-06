// controllers/bookingController.js
const Booking = require('../models/Booking'); // Import the Mongoose Booking model

/**
 * @function createBooking
 * @description Controller to handle booking a new badminton court slot.
 * @route POST /api/bookings
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.createBooking = async (req, res) => {
    try {
        const { courtNumber, startTime, endTime, bookedBy } = req.body;
        console.log("Received booking request body:", req.body);

        // Basic validation
        if (!courtNumber || !startTime || !endTime || !bookedBy) {
            return res.status(400).json({ message: 'All fields (courtNumber, startTime, endTime, bookedBy) are required.' });
        }

        // Convert times to Date objects to ensure proper storage and comparison
        const newStartTime = new Date(startTime);
        const newEndTime = new Date(endTime);

        // Ensure end time is after start time
        if (newEndTime <= newStartTime) {
            return res.status(400).json({ message: 'End time must be after start time.' });
        }

        // Create a new booking instance
        const newBooking = new Booking({
            courtNumber,
            startTime: newStartTime,
            endTime: newEndTime,
            bookedBy,
            bookingDate: new Date() // Record the date when the booking was made
        });

        // Save the booking to the database
        const savedBooking = await newBooking.save();
        res.status(201).json({ message: 'Court booked successfully!', booking: savedBooking });

    } catch (error) {
        console.error('Error booking court:', error);
        res.status(500).json({ message: 'Server error while booking court.', error: error.message });
    }
};

/**
 * @function getAllBookings
 * @description Controller to retrieve all badminton court bookings.
 * @route GET /api/bookings
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}); // Find all bookings
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error while fetching bookings.', error: error.message });
    }
};

/**
 * @function getExpiredBookings
 * @description Controller to retrieve all expired badminton court bookings.
 * An expired slot is defined as one whose `endTime` is in the past relative to the current time.
 * @route GET /api/bookings/expired
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getExpiredBookings = async (req, res) => {
    try {
        const currentTime = new Date(); // Get the current time in UTC
        console.log("Checking for expired bookings before:", currentTime.toISOString());

        // Find bookings where the endTime is less than the current time
        const expiredBookings = await Booking.find({
            endTime: { $lt: currentTime } // $lt means "less than"
        }).sort({ endTime: 1 }); // Sort by endTime in ascending order

        res.status(200).json(expiredBookings);
    } catch (error) {
        console.error('Error fetching expired bookings:', error);
        res.status(500).json({ message: 'Server error while fetching expired bookings.', error: error.message });
    }
};

/**
 * @function getActiveBookings
 * @description Controller to retrieve all active (non-expired) badminton court bookings.
 * An active slot is defined as one whose `endTime` is in the future relative to the current time.
 * @route GET /api/bookings/active
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getActiveBookings = async (req, res) => {
    try {
        const currentTime = new Date(); // Get the current time in UTC

        // Find bookings where the endTime is greater than or equal to the current time
        const activeBookings = await Booking.find({
            endTime: { $gte: currentTime } // $gte means "greater than or equal to"
        }).sort({ startTime: 1 }); // Sort by startTime in ascending order

        res.status(200).json(activeBookings);
    } catch (error) {
        console.error('Error fetching active bookings:', error);
        res.status(500).json({ message: 'Server error while fetching active bookings.', error: error.message });
    }
};

/**
 * @function deleteBooking
 * @description Controller to delete a specific booking by its ID.
 * @route DELETE /api/bookings/:id
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBooking = await Booking.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        res.status(200).json({ message: 'Booking deleted successfully!', booking: deletedBooking });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server error while deleting booking.', error: error.message });
    }
};
