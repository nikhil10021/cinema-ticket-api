const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  cinema: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: true,
  },
  seatNumber: {
    type: Number,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
});

seatSchema.index({ cinema: 1, seatNumber: 1 }, { unique: true }); // prevent duplicates

module.exports = mongoose.model('Seat', seatSchema);
