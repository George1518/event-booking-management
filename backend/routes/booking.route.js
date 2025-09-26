import express from 'express';
import Booking from '../model/bookings.js';
import Event from '../model/events.js';
import mongoose from 'mongoose';
import auth from '../middleware/user.auth.js';

const router = express.Router();


// POST /bookings - Create new booking (authenticated users)
router.post("/", auth, async (req, res) => {
    try {
        const { eventId, numberOfTickets } = req.body;
        const userId = req.session.userId;

        // Validation
        if (!eventId || !numberOfTickets) {
            return res.status(400).json({
                success: false,
                message: "Event ID and number of tickets are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID format"
            });
        }

        if (numberOfTickets < 1) {
            return res.status(400).json({
                success: false,
                message: "Number of tickets must be at least 1"
            });
        }

        // Check if event exists and get details
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        if (!event.isActive) {
            return res.status(400).json({
                success: false,
                message: "This event is no longer available"
            });
        }

        // Check seat availability
        if (!event.isSeatAvailable(numberOfTickets)) {
            return res.status(400).json({
                success: false,
                message: `Only ${event.availableSeats} seats available. Requested ${numberOfTickets} seats.`
            });
        }

        // Calculate total amount
        const totalAmount = event.price * numberOfTickets;

        // Create booking using the static method
        const booking = await Booking.createBooking({
            user: userId,
            event: eventId,
            numberOfTickets: numberOfTickets,
            totalAmount: totalAmount,
           
        });

        // Populate the booking with event and user details
        await booking.populate('event', 'title date time venue price');
        await booking.populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                booking: booking,
                summary: {
                    eventTitle: event.title,
                    tickets: numberOfTickets,
                    pricePerTicket: event.price,
                    totalAmount: totalAmount,
                    availableSeatsLeft: event.availableSeats - numberOfTickets
                }
            }
        });

    } catch (error) {
        console.log('Error in create booking:', error);
        
        if (error.message.includes('Not enough seats available') || 
            error.message.includes('Event not found')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// GET /bookings/preview - Preview booking without saving (calculate total)
router.post("/preview", auth, async (req, res) => {
    try {
        const { eventId, numberOfTickets } = req.body;

        // Validation
        if (!eventId || !numberOfTickets) {
            return res.status(400).json({
                success: false,
                message: "Event ID and number of tickets are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID format"
            });
        }

        if (numberOfTickets < 1) {
            return res.status(400).json({
                success: false,
                message: "Number of tickets must be at least 1"
            });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        if (!event.isActive) {
            return res.status(400).json({
                success: false,
                message: "This event is no longer available"
            });
        }

        // Check seat availability
        if (!event.isSeatAvailable(numberOfTickets)) {
            return res.status(400).json({
                success: false,
                message: `Only ${event.availableSeats} seats available. Requested ${numberOfTickets} seats.`
            });
        }

        // Calculate total amount
        const totalAmount = event.price * numberOfTickets;

        res.json({
            success: true,
            data: {
                preview: {
                    event: {
                        title: event.title,
                        date: event.date,
                        time: event.time,
                        venue: event.venue,
                        price: event.price
                    },
                    numberOfTickets: numberOfTickets,
                    pricePerTicket: event.price,
                    totalAmount: totalAmount,
                    availableSeats: event.availableSeats,
                    seatsAfterBooking: event.availableSeats - numberOfTickets
                }
            }
        });

    } catch (error) {
        console.log('Error in booking preview:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// GET /bookings/my-bookings - Get current user's bookings
router.get("/my-bookings", auth, async (req, res) => {
    try {
        const userId = req.session.userId;

        const bookings = await Booking.find({ user: userId })
            .populate('event', 'title date time venue price image')
            .populate('user', 'name email')
            .sort({ bookingDate: -1 });

        res.json({
            success: true,
            data: {
                bookings: bookings
            }
        });

    } catch (error) {
        console.log('Error in get user bookings:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// GET /bookings/:id - Get specific booking by ID
router.get("/:id", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID format"
            });
        }

        const booking = await Booking.findById(req.params.id)
            .populate('event', 'title date time venue price image')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if the booking belongs to the current user
        if (booking.user._id.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. This booking does not belong to you."
            });
        }

        res.json({
            success: true,
            data: {
                booking: booking
            }
        });

    } catch (error) {
        console.log('Error in get booking by ID:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// PUT bookings/:id/cancel - Cancel a booking
router.put("/:id/cancel", auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID format"
            });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if the booking belongs to the current user
        if (booking.user.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. This booking does not belong to you."
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.paymentStatus = 'refunded'; // Adjust based on your refund policy

        // The pre-remove middleware will handle seat restoration
        await booking.save();

        // Restore seats to the event
        const event = await Event.findById(booking.event);
        if (event) {
            await event.cancelSeats(booking.numberOfTickets);
        }

        await booking.populate('event', 'title date');
        await booking.populate('user', 'name email');

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            data: {
                booking: booking
            }
        });

    } catch (error) {
        console.log('Error in cancel booking:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

export default router;