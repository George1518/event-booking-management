import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  numberOfTickets: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentId: {
    type: String,
    required: false
  }
});

// Pre-save middleware to check seat availability
bookingSchema.pre('save', async function(next) {
  try {
    const Event = mongoose.model('Event');
    const event = await Event.findById(this.event);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    if (event.availableSeats < this.numberOfTickets) {
      throw new Error('Not enough seats available');
    }
    
    // Update available seats
    event.availableSeats -= this.numberOfTickets;
    await event.save();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove middleware to restore seats when booking is cancelled
bookingSchema.pre('remove', async function(next) {
  try {
    const Event = mongoose.model('Event');
    const event = await Event.findById(this.event);
    
    if (event && this.status === 'confirmed') {
      event.availableSeats += this.numberOfTickets;
      await event.save();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

bookingSchema.statics.createBooking = async function(bookingData) {
  const Event = mongoose.model('Event');
  const event = await Event.findById(bookingData.event);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (!event.isSeatAvailable(bookingData.numberOfTickets)) {
    throw new Error('Not enough seats available');
  }
  
  // Calculate total amount
  bookingData.totalAmount = event.price * bookingData.numberOfTickets;
  
  const booking = new this(bookingData);
  return await booking.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking