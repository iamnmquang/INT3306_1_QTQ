const TicketService = require('./ticket.service.js');
const OTPService = require('../auth/otp.service.js')
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

  // Get ticket by booking reference (public; returns full details for authenticated requests)
  getByBookingReference: async (req, res) => {
    try {
      const tickets = await TicketService.getByBookingReference(req.params.bookingReference);
      if (!tickets || tickets.length === 0) return res.status(404).json({ message: 'Ticket not found' });

      // If the request is authenticated (middleware may set req.payload), return full records
      if (req.payload) {
        return res.json(tickets);
      }

      // Otherwise return limited view for public lookup
      const mapped = tickets.map(t => ({
        id: t.id,
        bookingReference: t.bookingReference,
        ticketNumber: t.ticketNumber,
        flight: t.flight ? {
          id: t.flight.id,
          flightNumber: t.flight.flightNumber,
          departureTime: t.flight.departureTime,
          arrivalTime: t.flight.arrivalTime,
          departureAirport: t.flight.departureAirport ? { iataCode: t.flight.departureAirport.iataCode, city: t.flight.departureAirport.city } : null,
          arrivalAirport: t.flight.arrivalAirport ? { iataCode: t.flight.arrivalAirport.iataCode, city: t.flight.arrivalAirport.city } : null,
        } : null,
        seatNumber: t.seatNumber || t.flightSeat?.seatNumber || null,
        passengerName: t.passenger?.fullName || t.passengerName || null,
        bookedAt: t.bookedAt,
        isCancelled: t.isCancelled,
      }));

      res.json(mapped);
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

  sendCancelCode: async (req, res) => {
    try {
      const { userId } = req.payload;
      const { ticketNumber } = req.body;

      if (!ticketNumber) {
        return res.status(400).json({ message: 'Ticket number is required' });
      }

      // Get ticket to verify ownership
      const ticket = await TicketService.getByTicketNumber(ticketNumber);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      if (ticket.bookedById !== userId) {
        return res.status(403).json({ message: 'You can only cancel your own tickets' });
      }

      // Send OTP to user's email
      await OTPService.sendOTP({ 
        email: ticket.bookedBy.email, 
        type: 'CANCEL_TICKET', 
        name: ticket.bookedBy.name,
        ticketNumber: ticketNumber
      });

      return res.json({ message: 'Cancel code sent to your email' });
    } catch (err) {
      res.status(400).json({ message: 'Error sending cancel code', error: err.message });
    }
  },

  verifyCancelCode: async (req, res) => {
    try {
      const { userId } = req.payload;
      const { ticketNumber, cancelCode } = req.body;

      if (!ticketNumber || !cancelCode) {
        return res.status(400).json({ message: 'Ticket number and cancel code are required' });
      }

      // Get ticket to verify ownership
      const ticket = await TicketService.getByTicketNumber(ticketNumber);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      if (ticket.bookedById !== userId) {
        return res.status(403).json({ message: 'You can only cancel your own tickets' });
      }

      // Verify OTP
      await OTPService.verifyOTP({ 
        email: ticket.bookedBy.email, 
        type: 'CANCEL_TICKET', 
        otpInput: cancelCode 
      });

      return res.json({ message: 'Cancel code verified successfully' });
    } catch (err) {
      return res.status(400).json({
        message: 'Invalid or expired cancel code',
        error: err.message,
      });
    }
  },

  // Cancel ticket
  cancel: async (req, res) => {
    try {
      const { userId } = req.payload;
      const { cancelCode, ticketNumber } = req.body;

      if (!ticketNumber) {
        return res.status(400).json({ message: 'Ticket number is required' });
      }

      const cancelledTicket = await TicketService.cancel(ticketNumber, userId, cancelCode);

      res.json({
        message: 'Ticket cancelled successfully',
      });
    } catch (err) {
      res.status(400).json({
        message: 'Error cancelling ticket',
        error: err.message,
      });
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

  confirmBookings: async (req, res) => {
    try {
      const { userId } = req.payload;
      const { bookingData } = req.body;

      if (!Array.isArray(bookingData) || bookingData.length === 0) {
        return res.status(400).json({ message: 'bookingData must be a non-empty array' });
      }

      const tickets = await TicketService.confirmBookings(userId, bookingData);
      console.log(tickets);

      // fire-and-forget: send e-ticket to user if logged in
      try {
        const bookingRef = tickets?.[0]?.bookingReference;
        if (userId && bookingRef) {
          TicketService.sendETicket(userId, bookingRef).catch((e) => console.error('sendETicket failed', e));
        }
      } catch (e) {
        console.error('Error initiating sendETicket', e);
      }

      res.status(201).json({
        message: `${tickets.length} tickets created successfully`,
        tickets,
      });
    } catch (err) {
      res.status(400).json({ message: 'Error confirming bookings', error: err.message });
    }
  },

  sendETicket: async (req, res) => {
    try {
      const { bookingRef } = req.body;

      if (!bookingRef) {
        return res.status(400).json({ message: 'bookingRef must be required' });
      }
      const { userId } = req.payload;

      const result = await TicketService.sendETicket(userId, bookingRef)

      return res.status(200).json({
        message: "E-ticket sent successfully",
        data: result
      });

    } catch (err) {
      res.status(400).json({ message: 'Error send tickets', error: err.message });
    }
  },
};

module.exports = TicketController;