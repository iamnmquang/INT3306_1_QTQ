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

// Get ticket by ID
ticketRouter.get(
  '/:id',
  isAuthenticated,
  TicketController.getById
);

// Get ticket by booking reference
ticketRouter.get(
  '/booking/:bookingReference',
  isAuthenticated,
  TicketController.getByBookingReference
);

// Get user's tickets
ticketRouter.get(
  '/user/my-tickets',
  isAuthenticated,
  TicketController.getUserTickets
);

// Create new ticket
ticketRouter.post(
  '/',
  isAuthenticated,
  TicketController.create
);

// Update ticket (admin only)
ticketRouter.put(
  '/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  TicketController.update
);

// Cancel ticket
ticketRouter.post(
  '/:id/cancel',
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