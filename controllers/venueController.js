// controllers/venueController.js
const Venue = require('../models/Venue'); // Import the Mongoose Venue model
const Booking = require('../models/Booking'); // Import the Mongoose Booking model

/**
 * @function createVenue
 * @description Controller to handle creating a new venue.
 * @route POST /api/venues
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.createVenue = async (req, res) => {
    try {
        const { name, maxCourts } = req.body;
        console.log("Received create venue request body:", req.body);

        // Basic validation
        if (!name || maxCourts === undefined || maxCourts < 1) {
            return res.status(400).json({ message: 'Venue name and a valid maxCourts (minimum 1) are required.' });
        }

        // Create a new venue instance
        const newVenue = new Venue({
            name,
            maxCourts
        });

        // Save the venue to the database
        const savedVenue = await newVenue.save();
        res.status(201).json({ message: 'Venue created successfully!', venue: savedVenue });

    } catch (error) {
        console.error('Error creating venue:', error);
        // Handle duplicate key error for unique 'name'
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A venue with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error while creating venue.', error: error.message });
    }
};

/**
 * @function getAllVenues
 * @description Controller to retrieve all venues.
 * @route GET /api/venues
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getAllVenues = async (req, res) => {
    try {
        const venues = await Venue.find({}); // Find all venues
        res.status(200).json(venues);
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ message: 'Server error while fetching venues.', error: error.message });
    }
};

/**
 * @function getVenueById
 * @description Controller to retrieve a single venue by its ID.
 * @route GET /api/venues/:id
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        const venue = await Venue.findById(id);

        if (!venue) {
            return res.status(404).json({ message: 'Venue not found.' });
        }

        res.status(200).json(venue);
    } catch (error) {
        console.error('Error fetching venue by ID:', error);
        res.status(500).json({ message: 'Server error while fetching venue.', error: error.message });
    }
};

/**
 * @function updateVenue
 * @description Controller to update a venue by its ID.
 * @route PUT /api/venues/:id
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, maxCourts } = req.body;

        if (!name || maxCourts === undefined || maxCourts < 1) {
            return res.status(400).json({ message: 'Venue name and a valid maxCourts (minimum 1) are required for update.' });
        }

        const updatedVenue = await Venue.findByIdAndUpdate(
            id,
            { name, maxCourts },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedVenue) {
            return res.status(404).json({ message: 'Venue not found.' });
        }

        res.status(200).json({ message: 'Venue updated successfully!', venue: updatedVenue });
    } catch (error) {
        console.error('Error updating venue:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A venue with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error while updating venue.', error: error.message });
    }
};

/**
 * @function deleteVenue
 * @description Controller to delete a venue by its ID.
 * @route DELETE /api/venues/:id
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVenue = await Venue.findByIdAndDelete(id);

        if (!deletedVenue) {
            return res.status(404).json({ message: 'Venue not found.' });
        }

        res.status(200).json({ message: 'Venue deleted successfully!', venue: deletedVenue });
    } catch (error) {
        console.error('Error deleting venue:', error);
        res.status(500).json({ message: 'Server error while deleting venue.', error: error.message });
    }
};

/**
 * @function getVenueAvailability
 * @description Controller to get the number of available courts for a specific venue
 * at a given time range.
 * @route GET /api/venues/:id/availability?startTime=<ISO_DATE>&endTime=<ISO_DATE>
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
exports.getVenueAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime } = req.query;

        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'startTime and endTime query parameters are required.' });
        }

        const checkStartTime = new Date(startTime);
        const checkEndTime = new Date(endTime);

        if (isNaN(checkStartTime.getTime()) || checkEndTime <= checkStartTime) {
            return res.status(400).json({ message: 'Invalid or overlapping startTime/endTime provided.' });
        }

        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found.' });
        }

        // Count existing bookings that overlap with the requested time slot for this venue
        const overlappingBookingsCount = await Booking.countDocuments({
            venue: id,
            startTime: { $lt: checkEndTime },
            endTime: { $gt: checkStartTime }
        });

        const availableCourts = venue.maxCourts - overlappingBookingsCount;

        res.status(200).json({
            venue: venue.name,
            maxCourts: venue.maxCourts,
            bookedCourts: overlappingBookingsCount,
            availableCourts: Math.max(0, availableCourts), // Ensure it's not negative
            requestedTimeSlot: {
                startTime: checkStartTime.toISOString(),
                endTime: checkEndTime.toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching venue availability:', error);
        res.status(500).json({ message: 'Server error while fetching venue availability.', error: error.message });
    }
};
