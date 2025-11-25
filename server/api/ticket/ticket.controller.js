const TicketService = require('./ticket.service.js');

const TicketController = {
  // Get all tickets
  getAll: async (req, res) => {
    try {
      const tickets = await TicketService.getAll();
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ message: 'Error getting tickets', error: err.message });
    }
  },

  // Get ticket by ID
  getById: async (req, res) => {
    try {
      const ticket = await TicketService.getById(req.params.id);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      res.json(ticket);
    } catch (err) {
      res.status(500).json({ message: 'Error getting ticket', error: err.message });
    }
  },

  // Get ticket by booking reference
  getByBookingReference: async (req, res) => {
    try {
      const ticket = await TicketService.getByBookingReference(req.params.bookingReference);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      res.json(ticket);
    } catch (err) {
      res.status(500).json({ message: 'Error getting ticket', error: err.message });
    }
  },

  // Get user's tickets
  getUserTickets: async (req, res) => {
    try {
      const { userId } = req.payload;
      const tickets = await TicketService.getTicketsByUserId(userId);
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ message: 'Error getting user tickets', error: err.message });
    }
  },

  // Create new ticket
  create: async (req, res) => {
    try {
      const { userId } = req.payload;
      const ticket = await TicketService.create({
        ...req.body,
        bookedById: userId,
      });
      res.status(201).json(ticket);
    } catch (err) {
      res.status(400).json({ message: 'Error creating ticket', error: err.message });
    }
  },

  // Update ticket
  update: async (req, res) => {
    try {
      const ticket = await TicketService.update(req.params.id, req.body);
      res.json(ticket);
    } catch (err) {
      res.status(400).json({ message: 'Error updating ticket', error: err.message });
    }
  },

  // Cancel ticket
  cancel: async (req, res) => {
    try {
      const { cancelCode } = req.body;
      if (!cancelCode) {
        return res.status(400).json({ message: 'Cancel code is required' });
      }
      const ticket = await TicketService.cancel(req.params.id, cancelCode);
      res.json(ticket);
    } catch (err) {
      res.status(400).json({ message: 'Error cancelling ticket', error: err.message });
    }
  },

  // Delete ticket
  delete: async (req, res) => {
    try {
      await TicketService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: 'Error deleting ticket', error: err.message });
    }
  },
};

module.exports = TicketController;