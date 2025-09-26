import express from 'express';
import requireRole from '../middleware/admin.auth.js';
import Event from '../model/events.js'

const router = express.Router();

// GET /events/admin/my-events - This route MUST come before /:id
router.get("/admin", requireRole("admin"), async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.session.userId })
            .populate('organizer', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                events: events
            }
        });

    } catch (error) {
        console.log('Error in get admin events:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


router.get("/", async (req, res) => {
    try {
        const events = await Event.find({ isActive: true })
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.json({
            success: true,
            data: {
                events: events
            }
        });

    } catch (error) {
        console.log('Error in get events:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// GET /events/:id - Get single event by ID (public)
router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.json({
            success: true,
            data: {
                event: event
            }
        });

    } catch (error) {
        console.log('Error in get event by ID:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// POST /events - Create new event (admin only)
router.post("/", requireRole("admin"), async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            time,
            venue,
            totalSeats,
            price
        } = req.body;

        // Validation
        if (!title || !description || !date || !time || !venue || !totalSeats || !price) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (totalSeats < 1) {
            return res.status(400).json({
                success: false,
                message: "Total seats must be at least 1"
            });
        }

        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative"
            });
        }

        // Create event
        const event = new Event({
            title: title.trim(),
            description: description.trim(),
            date: new Date(date),
            time: time,
            venue: venue.trim(),
            organizer: req.session.userId, // Use session user ID as organizer
            totalSeats: parseInt(totalSeats),
            availableSeats: parseInt(totalSeats), // Initially same as total seats
            price: parseFloat(price)
        });

        const savedEvent = await event.save();
        await savedEvent.populate('organizer', 'name email');

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: {
                event: savedEvent
            }
        });

    } catch (error) {
        console.log('Error in create event:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


// PUT /events/:id - Update event (admin only)
router.put("/:id", requireRole("admin"), async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            time,
            venue,
            totalSeats,
            price,
            isActive
        } = req.body;

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Update fields if provided
        if (title !== undefined) event.title = title.trim();
        if (description !== undefined) event.description = description.trim();
        if (date !== undefined) event.date = new Date(date);
        if (time !== undefined) event.time = time;
        if (venue !== undefined) event.venue = venue.trim();
        if (price !== undefined) event.price = parseFloat(price);
        if (isActive !== undefined) event.isActive = isActive;

        // Handle total seats update carefully
        if (totalSeats !== undefined) {
            const newTotalSeats = parseInt(totalSeats);
            if (newTotalSeats < event.totalSeats - event.availableSeats) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot reduce total seats below ${event.totalSeats - event.availableSeats} (already booked seats)`
                });
            }
            const difference = newTotalSeats - event.totalSeats;
            event.totalSeats = newTotalSeats;
            event.availableSeats += difference;
        }

        const updatedEvent = await event.save();
        await updatedEvent.populate('organizer', 'name email');

        res.json({
            success: true,
            message: "Event updated successfully",
            data: {
                event: updatedEvent
            }
        });

    } catch (error) {
        console.log('Error in update event:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// DELETE /events/:id - Delete event (admin only)
router.delete("/:id", requireRole("admin"), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Soft delete by setting isActive to false
        event.isActive = false;
        await event.save();

        res.json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.log('Error in delete event:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


export default router;