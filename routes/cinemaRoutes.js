const express = require('express');
const router = express.Router();

// Import controller functions
const {
  createCinema,
  purchaseSeat,
  purchaseTwoConsecutiveSeats,
} = require('../controllers/cinemaController');

// Route to create a new cinema with seats
// POST /api/cinemas/create
router.post('/create', createCinema);

// Route to purchase a specific seat
// POST /api/cinemas/:cinemaId/purchase/:seatNumber
router.post('/:cinemaId/purchase/:seatNumber', purchaseSeat);

// Route to purchase two consecutive seats
// POST /api/cinemas/:cinemaId/purchase-consecutive
router.post('/:cinemaId/purchase-consecutive', purchaseTwoConsecutiveSeats);

module.exports = router;
