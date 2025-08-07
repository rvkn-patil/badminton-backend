// controllers/bookingController.js
const Booking = require('../models/Booking'); // Import the Mongoose Booking model
const Venue = require('../models/Venue');     // Import the Mongoose Venue model
const Slot = require('../models/Slot');     // Import the Mongoose Slot model

/**
 * @function createBooking
 * @description Controller to handle booking a new badminton court slot.
 * Includes availability check based on venue's max courts and overlapping bookings.
 * @route POST /api/bookings
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.createBooking = async (req, res) => {
    try {
        const { venueId, courtNumber, startTime, endTime, bookedBy } = req.body;
        console.log("Received booking request body:", req.body);

        // Basic validation
        if (!venueId || !courtNumber || !startTime || !endTime || !bookedBy) {
            return res.status(400).json({ message: 'All fields (venueId, courtNumber, startTime, endTime, bookedBy) are required.' });
        }

        // Convert times to Date objects to ensure proper storage and comparison
        const newStartTime = new Date(startTime);
        const newEndTime = new Date(endTime);

        // Ensure end time is after start time
        if (newEndTime <= newStartTime) {
            return res.status(400).json({ message: 'End time must be after start time.' });
        }

        // --- Availability Check ---
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found.' });
        }

        // Logic to check for overlapping bookings on the same court
        // Query for any existing booking for the same court within the given time range
        const existingBooking = await Booking.findOne({
            venue: venueId,
            courtNumber: courtNumber,
            startTime: { $lt: newEndTime }, // New booking's start time is before an existing booking's end time
            endTime: { $gt: newStartTime }   // New booking's end time is after an existing booking's start time
        });

        if (existingBooking) {
            return res.status(409).json({ message: `Court ${courtNumber} is already booked for the specified time at this venue.` });
        }

        // // Find existing bookings that overlap with the new booking's time slot for this venue
        // // An overlap occurs if:
        // // (existing_start < new_end) AND (existing_end > new_start)
        // const overlappingBookingsCount = await Booking.countDocuments({
        //     venue: venueId,
        //     startTime: { $lt: newEndTime }, // Existing booking starts before the new one ends
        //     endTime: { $gt: newStartTime }   // Existing booking ends after the new one starts
        // });

        // console.log(`Overlapping bookings for venue ${venue.name}: ${overlappingBookingsCount}`);
        // console.log(`Max courts for venue ${venue.name}: ${venue.maxCourts}`);

        // if (overlappingBookingsCount >= venue.maxCourts) {
        //     return res.status(409).json({ message: 'All courts at this venue are booked for the requested time slot.' });
        // }

        // --- End Availability Check ---

        // Create a new booking instance
        const newBooking = new Booking({
            venue: venueId, // Link booking to the venue
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
 * Populates the 'venue' field to show venue details.
 * @route GET /api/bookings
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('venue'); // Find all bookings and populate venue details
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error while fetching bookings.', error: error.message });
    }
};

// exports.getAllBookings = async (req, res) => {
//     try {
//         const bookings = await Slot.find({}).populate('venue'); // Find all bookings and populate venue details
//         res.status(200).json(bookings);
//     } catch (error) {
//         console.error('Error fetching bookings:', error);
//         res.status(500).json({ message: 'Server error while fetching bookings.', error: error.message });
//     }
// };

/**
 * @function getExpiredBookings
 * @description Retrieves all expired badminton court bookings.
 * An expired slot is defined as one whose `endTime` is in the past relative to the current time.
 * Populates the 'venue' field to show venue details.
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
        }).populate('venue').sort({ endTime: 1 }); // Sort by endTime in ascending order

        res.status(200).json(expiredBookings);
    } catch (error) {
        console.error('Error fetching expired bookings:', error);
        res.status(500).json({ message: 'Server error while fetching expired bookings.', error: error.message });
    }
};

/**
 * @function getActiveBookings
 * @description Retrieves all active (non-expired) badminton court bookings.
 * An active slot is defined as one whose `endTime` is in the future relative to the current time.
 * Populates the 'venue' field to show venue details.
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
        }).populate('venue').sort({ startTime: 1 }); // Sort by startTime in ascending order

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

/**
 * @function generateDailyBookingSlots
 * @description Controller to automatically generate one-hour booking slots for all venues for the next day.
 * This function is intended to be called by a scheduler (e.g., cron job).
 * @route POST /api/bookings/generate-slots
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.generateDailyBookingSlots = async (req, res) => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Set to the beginning of tomorrow

        const venues = await Venue.find({});
        if (venues.length === 0) {
            return res.status(404).json({ message: 'No venues found to generate slots for.' });
        }

        let bookingsCreated = [];
        let skippedCount = 0;

        for (const venue of venues) {
            for (let court = 1; court <= venue.maxCourts; court++) {
                // Generate slots for each hour from 9 AM to 5 PM
                for (let hour = 9; hour < 17; hour++) {
                    const slotStartTime = new Date(tomorrow);
                    slotStartTime.setHours(hour, 0, 0, 0);

                    const slotEndTime = new Date(slotStartTime);
                    slotEndTime.setHours(hour + 1, 0, 0, 0);

                    // Check if a booking already exists for this slot
                    const existingBooking = await Slot.findOne({
                        venue: venue._id,
                        courtNumber: `Court ${court}`,
                        startTime: slotStartTime,
                        endTime: slotEndTime
                    });

                    if (!existingBooking) {
                        const newBooking = {
                            venue: venue._id,
                            courtNumber: `Court ${court}`,
                            startTime: slotStartTime,
                            endTime: slotEndTime,
                            bookedBy: 'AUTO', // Placeholder for auto-generated slots
                            isSlotBooked: false
                        };
                        const createdBooking = await Slot.create(newBooking);
                        bookingsCreated.push(createdBooking);
                    } else {
                        skippedCount++;
                    }
                }
            }
        }

        res.status(201).json({
            message: 'Daily booking slots generated successfully.',
            createdCount: bookingsCreated.length,
            skippedCount: skippedCount,
            details: bookingsCreated
        });

    } catch (error) {
        console.error('Error generating daily booking slots:', error);
        res.status(500).json({ message: 'Server error while generating daily slots.', error: error.message });
    }
};




// ------------------------------------------------------


// // controllers/bookingController.js
// const Booking = require('../models/Booking'); // Import the Mongoose Booking model

// /**
//  * @function createBooking
//  * @description Controller to handle booking a new badminton court slot.
//  * @route POST /api/bookings
//  * @param {object} req - Express request object.
//  * @param {object} res - Express response object.
//  */
// exports.createBooking = async (req, res) => {
//     try {
//         const { courtNumber, startTime, endTime, bookedBy } = req.body;
//         console.log("Received booking request body:", req.body);

//         // Basic validation
//         if (!courtNumber || !startTime || !endTime || !bookedBy) {
//             return res.status(400).json({ message: 'All fields (courtNumber, startTime, endTime, bookedBy) are required.' });
//         }

//         // Convert times to Date objects to ensure proper storage and comparison
//         const newStartTime = new Date(startTime);
//         const newEndTime = new Date(endTime);

//         // Ensure end time is after start time
//         if (newEndTime <= newStartTime) {
//             return res.status(400).json({ message: 'End time must be after start time.' });
//         }

//         // Create a new booking instance
//         const newBooking = new Booking({
//             courtNumber,
//             startTime: newStartTime,
//             endTime: newEndTime,
//             bookedBy,
//             bookingDate: new Date() // Record the date when the booking was made
//         });

//         // Save the booking to the database
//         const savedBooking = await newBooking.save();
//         res.status(201).json({ message: 'Court booked successfully!', booking: savedBooking });

//     } catch (error) {
//         console.error('Error booking court:', error);
//         res.status(500).json({ message: 'Server error while booking court.', error: error.message });
//     }
// };

// /**
//  * @function getAllBookings
//  * @description Controller to retrieve all badminton court bookings.
//  * @route GET /api/bookings
//  * @param {object} req - Express request object.
//  * @param {object} res - Express response object.
//  */
// exports.getAllBookings = async (req, res) => {
//     try {
//         const bookings = await Booking.find({}); // Find all bookings
//         res.status(200).json(bookings);
//     } catch (error) {
//         console.error('Error fetching bookings:', error);
//         res.status(500).json({ message: 'Server error while fetching bookings.', error: error.message });
//     }
// };

// /**
//  * @function getExpiredBookings
//  * @description Controller to retrieve all expired badminton court bookings.
//  * An expired slot is defined as one whose `endTime` is in the past relative to the current time.
//  * @route GET /api/bookings/expired
//  * @param {object} req - Express request object.
//  * @param {object} res - Express response object.
//  */
// exports.getExpiredBookings = async (req, res) => {
//     try {
//         const currentTime = new Date(); // Get the current time in UTC
//         console.log("Checking for expired bookings before:", currentTime.toISOString());

//         // Find bookings where the endTime is less than the current time
//         const expiredBookings = await Booking.find({
//             endTime: { $lt: currentTime } // $lt means "less than"
//         }).sort({ endTime: 1 }); // Sort by endTime in ascending order

//         res.status(200).json(expiredBookings);
//     } catch (error) {
//         console.error('Error fetching expired bookings:', error);
//         res.status(500).json({ message: 'Server error while fetching expired bookings.', error: error.message });
//     }
// };

// /**
//  * @function getActiveBookings
//  * @description Controller to retrieve all active (non-expired) badminton court bookings.
//  * An active slot is defined as one whose `endTime` is in the future relative to the current time.
//  * @route GET /api/bookings/active
//  * @param {object} req - Express request object.
//  * @param {object} res - Express response object.
//  */
// exports.getActiveBookings = async (req, res) => {
//     try {
//         const currentTime = new Date(); // Get the current time in UTC

//         // Find bookings where the endTime is greater than or equal to the current time
//         const activeBookings = await Booking.find({
//             endTime: { $gte: currentTime } // $gte means "greater than or equal to"
//         }).sort({ startTime: 1 }); // Sort by startTime in ascending order

//         res.status(200).json(activeBookings);
//     } catch (error) {
//         console.error('Error fetching active bookings:', error);
//         res.status(500).json({ message: 'Server error while fetching active bookings.', error: error.message });
//     }
// };

// /**
//  * @function deleteBooking
//  * @description Controller to delete a specific booking by its ID.
//  * @route DELETE /api/bookings/:id
//  * @param {object} req - Express request object.
//  * @param {object} res - Express response object.
//  */
// exports.deleteBooking = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const deletedBooking = await Booking.findByIdAndDelete(id);

//         if (!deletedBooking) {
//             return res.status(404).json({ message: 'Booking not found.' });
//         }

//         res.status(200).json({ message: 'Booking deleted successfully!', booking: deletedBooking });
//     } catch (error) {
//         console.error('Error deleting booking:', error);
//         res.status(500).json({ message: 'Server error while deleting booking.', error: error.message });
//     }
// };
