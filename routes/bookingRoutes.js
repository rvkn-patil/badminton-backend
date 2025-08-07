// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController'); // Import the controller

/**
 * @swagger
 * tags:
 * name: Bookings
 * description: API for managing badminton court bookings
 */

/**
 * @swagger
 * /api/bookings:
 * post:
 * summary: Books a new badminton court slot.
 * tags: [Bookings]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - venueId
 * - courtNumber
 * - startTime
 * - endTime
 * - bookedBy
 * properties:
 * venueId:
 * type: string
 * description: The ID of the venue where the court is being booked.
 * example: "60c72b2f9b1e8b001c8e4d8a"
 * courtNumber:
 * type: string
 * description: The number of the court.
 * example: "Court 1"
 * startTime:
 * type: string
 * format: date-time
 * description: The start time of the booking (ISO 8601 string).
 * example: "2025-08-07T10:00:00Z"
 * endTime:
 * type: string
 * format: date-time
 * description: The end time of the booking (ISO 8601 string).
 * example: "2025-08-07T11:00:00Z"
 * bookedBy:
 * type: string
 * description: The name or ID of the person booking.
 * example: "Alice Smith"
 * responses:
 * 201:
 * description: Court booked successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Court booked successfully!" }
 * booking: { $ref: '#/components/schemas/Booking' }
 * 400:
 * description: Invalid request body or end time before start time.
 * 404:
 * description: Venue not found.
 * 409:
 * description: All courts at this venue are booked for the requested time slot.
 * 500:
 * description: Server error.
 */
router.post('/', bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/generate-slots:
 * post:
 * summary: Automatically generates daily one-hour booking slots for all venues.
 * tags: [Bookings]
 * description: This route is intended to be called by a scheduler (like a cron job) to pre-fill the booking calendar with available one-hour slots for the next day. It will not create slots that already exist.
 * responses:
 * 201:
 * description: Daily slots generated successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Daily booking slots generated successfully." }
 * createdCount: { type: number, example: 20 }
 * skippedCount: { type: number, example: 5 }
 * 500:
 * description: Server error.
 */
router.post('/generate-slots', bookingController.generateDailyBookingSlots);

/**
 * @swagger
 * /api/bookings:
 * get:
 * summary: Retrieves all badminton court bookings.
 * tags: [Bookings]
 * responses:
 * 200:
 * description: A list of all bookings, with venue details populated.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Booking'
 * 500:
 * description: Server error.
 */
router.get('/', bookingController.getAllBookings);

/**
 * @swagger
 * /api/bookings/expired:
 * get:
 * summary: Retrieves all expired badminton court bookings.
 * tags: [Bookings]
 * description: An expired slot is defined as one whose `endTime` is in the past relative to the current server time. Venue details are populated.
 * responses:
 * 200:
 * description: A list of expired bookings.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Booking'
 * 500:
 * description: Server error.
 */
router.get('/expired', bookingController.getExpiredBookings);

/**
 * @swagger
 * /api/bookings/active:
 * get:
 * summary: Retrieves all active (non-expired) badminton court bookings.
 * tags: [Bookings]
 * description: An active slot is defined as one whose `endTime` is in the future relative to the current server time. Venue details are populated.
 * responses:
 * 200:
 * description: A list of active bookings.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Booking'
 * 500:
 * description: Server error.
 */
router.get('/active', bookingController.getActiveBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 * delete:
 * summary: Deletes a specific booking by its ID.
 * tags: [Bookings]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the booking to delete.
 * responses:
 * 200:
 * description: Booking deleted successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Booking deleted successfully!" }
 * booking: { $ref: '#/components/schemas/Booking' }
 * 404:
 * description: Booking not found.
 * 500:
 * description: Server error.
 */
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
