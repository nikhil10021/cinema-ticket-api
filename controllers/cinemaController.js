const Cinema = require('../models/Cinema');
const Seat = require('../models/Seat');

/**
 * 🎯 Create a cinema with N seats
 * POST /api/cinemas/create
 */
const createCinema = async (req, res) => {
  try {
    const { totalSeats } = req.body;

    if (!totalSeats || totalSeats < 1) {
      return res.status(400).json({ message: 'Invalid number of seats' });
    }

    // Step 1: Create the cinema
    const cinema = await Cinema.create({ totalSeats });

    // Step 2: Create N seats linked to the cinema
    const seatDocs = [];
    for (let i = 1; i <= totalSeats; i++) {
      seatDocs.push({
        cinema: cinema._id,
        seatNumber: i,
        isBooked: false,
      });
    }

    await Seat.insertMany(seatDocs);

    return res.status(201).json({
      message: 'Cinema created successfully',
      cinemaId: cinema._id,
      totalSeats,
    });
  } catch (error) {
    console.error('Create Cinema Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * 🎯 Purchase a specific seat
 * POST /api/cinemas/:cinemaId/purchase/:seatNumber
 */
const purchaseSeat = async (req, res) => {
  try {
    const { cinemaId, seatNumber } = req.params;

    const seat = await Seat.findOneAndUpdate(
      {
        cinema: cinemaId,
        seatNumber: seatNumber,
        isBooked: false,
      },
      {
        isBooked: true,
      },
      {
        new: true,
      }
    );

    if (!seat) {
      return res.status(400).json({
        message: 'Seat is already booked or does not exist',
      });
    }

    return res.status(200).json({
      message: 'Seat booked successfully',
      seat: {
        seatNumber: seat.seatNumber,
        isBooked: seat.isBooked,
      },
    });
  } catch (error) {
    console.error('Purchase Seat Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * 🎯 Purchase first two free consecutive seats
 * POST /api/cinemas/:cinemaId/purchase-consecutive
 */
const purchaseTwoConsecutiveSeats = async (req, res) => {
  try {
    const { cinemaId } = req.params;

    // Find all unbooked seats, sorted by seat number
    const seats = await Seat.find({
      cinema: cinemaId,
      isBooked: false,
    })
      .sort({ seatNumber: 1 })
      .lean();

    // Find first two consecutive seats
    let first = null;
    for (let i = 0; i < seats.length - 1; i++) {
      if (seats[i + 1].seatNumber - seats[i].seatNumber === 1) {
        first = seats[i];
        break;
      }
    }

    if (!first) {
      return res.status(400).json({
        message: 'No two consecutive seats available',
      });
    }

    const secondSeatNumber = first.seatNumber + 1;

    // Try to book both seats atomically
    const result = await Seat.updateMany(
      {
        cinema: cinemaId,
        seatNumber: { $in: [first.seatNumber, secondSeatNumber] },
        isBooked: false,
      },
      { $set: { isBooked: true } }
    );

    // Check if exactly two seats were updated
    if (result.modifiedCount !== 2) {
      return res.status(409).json({
        message: 'Concurrency error. Please try again.',
      });
    }

    return res.status(200).json({
      message: 'Two consecutive seats booked successfully',
      seats: [first.seatNumber, secondSeatNumber],
    });
  } catch (error) {
    console.error('Purchase Consecutive Seats Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createCinema,
  purchaseSeat,
  purchaseTwoConsecutiveSeats,
};
