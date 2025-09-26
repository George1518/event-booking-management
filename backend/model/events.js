// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

eventSchema.methods.isSeatAvailable = function(requiredSeats) {
  return this.availableSeats >= requiredSeats;
};

eventSchema.methods.bookSeats = async function(seats) {
  if (this.availableSeats < seats) {
    throw new Error('Not enough seats available');
  }
  this.availableSeats -= seats;
  return await this.save();
};

eventSchema.methods.cancelSeats = async function(seats) {
  this.availableSeats += seats;
  // Ensure we don't exceed total seats
  this.availableSeats = Math.min(this.availableSeats, this.totalSeats);
  return await this.save();
};

const Event = mongoose.model('Event', eventSchema);

export default Event