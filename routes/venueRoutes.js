// routes/venueRoutes.js
const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController'); // Import the controller

/**
 * @swagger
 * tags:
 * name: Venues
 * description: API for managing badminton court venues
 */

/**
 * @swagger
 * /api/venues:
 * post:
 * summary: Creates a new venue.
 * tags: [Venues]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - maxCourts
 * properties:
 * name:
 * type: string
 * description: The name of the venue.
 * example: "City Sports Center"
 * maxCourts:
 * type: number
 * description: The maximum number of courts available at the venue.
 * example: 5
 * responses:
 * 201:
 * description: Venue created successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Venue created successfully!" }
 * venue: { $ref: '#/components/schemas/Venue' }
 * 400:
 * description: Invalid request body.
 * 409:
 * description: A venue with this name already exists.
 * 500:
 * description: Server error.
 */
router.post('/', venueController.createVenue);

/**
 * @swagger
 * /api/venues:
 * get:
 * summary: Retrieves all venues.
 * tags: [Venues]
 * responses:
 * 200:
 * description: A list of all venues.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Venue'
 * 500:
 * description: Server error.
 */
router.get('/', venueController.getAllVenues);

/**
 * @swagger
 * /api/venues/{id}:
 * get:
 * summary: Retrieves a single venue by its ID.
 * tags: [Venues]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the venue to retrieve.
 * responses:
 * 200:
 * description: Venue data.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Venue'
 * 404:
 * description: Venue not found.
 * 500:
 * description: Server error.
 */
router.get('/:id', venueController.getVenueById);

/**
 * @swagger
 * /api/venues/{id}:
 * put:
 * summary: Updates a venue by its ID.
 * tags: [Venues]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the venue to update.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * description: The updated name of the venue.
 * example: "New City Sports Center"
 * maxCourts:
 * type: number
 * description: The updated maximum number of courts.
 * example: 7
 * responses:
 * 200:
 * description: Venue updated successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Venue updated successfully!" }
 * venue: { $ref: '#/components/schemas/Venue' }
 * 400:
 * description: Invalid request body.
 * 404:
 * description: Venue not found.
 * 409:
 * description: A venue with this name already exists.
 * 500:
 * description: Server error.
 */
router.put('/:id', venueController.updateVenue);

/**
 * @swagger
 * /api/venues/{id}:
 * delete:
 * summary: Deletes a venue by its ID.
 * tags: [Venues]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the venue to delete.
 * responses:
 * 200:
 * description: Venue deleted successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Venue deleted successfully!" }
 * venue: { $ref: '#/components/schemas/Venue' }
 * 404:
 * description: Venue not found.
 * 500:
 * description: Server error.
 */
router.delete('/:id', venueController.deleteVenue);

/**
 * @swagger
 * /api/venues/{id}/availability:
 * get:
 * summary: Retrieves the number of available courts for a specific venue and time range.
 * tags: [Venues]
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the venue.
 * - in: query
 * name: startTime
 * schema:
 * type: string
 * format: date-time
 * required: true
 * description: The start time of the desired booking slot (ISO 8601 string).
 * example: "2025-08-06T10:00:00Z"
 * - in: query
 * name: endTime
 * schema:
 * type: string
 * format: date-time
 * required: true
 * description: The end time of the desired booking slot (ISO 8601 string).
 * example: "2025-08-06T11:00:00Z"
 * responses:
 * 200:
 * description: Availability information for the venue.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * venue: { type: string, example: "City Sports Center" }
 * maxCourts: { type: number, example: 5 }
 * bookedCourts: { type: number, example: 2 }
 * availableCourts: { type: number, example: 3 }
 * requestedTimeSlot:
 * type: object
 * properties:
 * startTime: { type: string, format: date-time }
 * endTime: { type: string, format: date-time }
 * 400:
 * description: Invalid query parameters.
 * 404:
 * description: Venue not found.
 * 500:
 * description: Server error.
 */
router.get('/:id/availability', venueController.getVenueAvailability);

module.exports = router;
