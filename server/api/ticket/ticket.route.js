const ticketRouter = require('express').Router();
const TicketController = require('./ticket.controller.js');
const { isAuthenticated, authorizeRole } = require('../../utils/middlewares');

// Get all tickets (admin only)
ticketRouter.get(
  '/',
  isAuthenticated,
  authorizeRole('ADMIN'),
  TicketController.getAll
);

// Get user's tickets
ticketRouter.get(
  '/user/my-tickets',
  isAuthenticated,
  TicketController.getUserTickets
);


// Get ticket by booking reference
ticketRouter.get(
  '/booking/:bookingReference',
  isAuthenticated,
  TicketController.getByBookingReference
);

// Get ticket by ID
ticketRouter.get(
  '/:id',
  isAuthenticated,
  TicketController.getById
);

// Create new ticket
ticketRouter.post(
  '/',
  isAuthenticated,
  TicketController.create
);

// Confirm bookings
ticketRouter.post(
  '/confirm-bookings',
  isAuthenticated,
  TicketController.confirmBookings
);

// Send e-ticket
ticketRouter.post(
  '/send-eticket',
  isAuthenticated,
  TicketController.sendETicket
);

// Update ticket (admin only)
ticketRouter.put(
  '/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  TicketController.update
);

// Send cancel code 
ticketRouter.post(
  '/cancel/send-code',
  isAuthenticated,
  TicketController.sendCancelCode
);

// Verify cancel code 
ticketRouter.post(
  '/cancel/verify-code',
  isAuthenticated,
  TicketController.verifyCancelCode
);

// Cancel ticket 
ticketRouter.post(
  '/cancel',
  isAuthenticated,
  TicketController.cancel
);

// Delete ticket (admin only)
ticketRouter.delete(
  '/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  TicketController.delete
);

module.exports = ticketRouter;