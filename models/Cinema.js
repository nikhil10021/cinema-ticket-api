const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  totalSeats: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Cinema', cinemaSchema);
