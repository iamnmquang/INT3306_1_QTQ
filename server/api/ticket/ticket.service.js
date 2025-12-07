const { generateBookingReference, generateTicketNumber } = require('../../utils/jwt');
const prisma = require('../../utils/prisma')
const { sendEmail } = require('../../utils/emailService')
const PDFDocument = require('pdfkit');
const { formatDate, formatDateShort, formatTime } = require("../../utils/helper")
const QRCode = require("qrcode");

const TicketService = {
  getAll: async () => {
    return await prisma.ticket.findMany({
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  getById: async (id) => {
    return await prisma.ticket.findUnique({
      where: { id },
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  getByBookingReference: async (bookingReference) => {
    return await prisma.ticket.findMany({
      where: { bookingReference },
      include: {
        flight: {
          include: {
            arrivalAirport: true,
            departureAirport: true,
            aircraft: true,
          }
        },
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  getByTicketNumber: async (ticketNumber) => {
    return await prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        flight: {
          include: {
            arrivalAirport: true,
            departureAirport: true,
            aircraft: true,
          }
        },
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  getTicketsByUserId: async (userId) => {
    return await prisma.ticket.findMany({
      where: { bookedById: userId },
      include: {
        flight: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  create: async (data) => {
    return await prisma.ticket.create({
      data,
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },

  update: async (id, data) => {
    return await prisma.ticket.update({
      where: { id },
      data,
      include: {
        flight: true,
        bookedBy: true,
        flightSeat: true,
        seatDetail: true,
        passenger: true,
      },
    });
  },



  cancel: async (ticketNumber, userId, cancelCode) => {
    return await prisma.$transaction(async (tx) => {
      //Get ticket and verify ownership
      const ticket = await tx.ticket.findUnique({
        where: { ticketNumber: ticketNumber },
        include: {
          seatDetail: true,
          flightSeat: true,
          passenger: true,
          flight: true,
          bookedBy: true,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      //Check if user owns this ticket
      if (ticket.bookedById !== userId) {
        throw new Error('You can only cancel your own tickets');
      }

      //Check if ticket is already cancelled
      if (ticket.isCancelled) {
        throw new Error('This ticket has already been cancelled');
      }

      // Check flight hasn't departed 
      // const now = new Date();
      // if (ticket.flight.departureTime <= now) {
      //   throw new Error('Cannot cancel ticket for flight that has already departed');
      // }

      //Cancel the ticket
      const cancelledTicket = await tx.ticket.update({
        where: { ticketNumber: ticketNumber },
        data: {
          isCancelled: true,
          cancelCode: cancelCode ,
        },
        include: {
          passenger: true,
          flight: true,
          seatDetail: true,
          flightSeat: true,
          bookedBy: true,
        },
      });

      //Release the seat (mark as not booked)
      if (ticket.seatDetail) {
        await tx.seatDetail.update({
          where: { id: ticket.seatDetail.id },
          data: {
            isBooked: false,
            isLocked: false,
            isLockedByUserId: null,
            lockedAt: null,
          },
        });
      }

      //Decrement bookedSeats count
      if (ticket.flightSeat) {
        await tx.flightSeat.update({
          where: { id: ticket.flightSeat.id },
          data: {
            bookedSeats: {
              decrement: 1,
            },
          },
        });
      }

      return cancelledTicket;
    });
  },

  delete: async (id) => {
    return await prisma.ticket.delete({ where: { id } });
  },

  //confirm booking and create a ticket
  confirmBookings: async (userId, bookingData) => {
    await prisma.$transaction(async (tx) => {
      const createdTickets = [];

      const bookingRef = generateBookingReference();

      for (const b of bookingData) {
        const { seatDetailId, flightId, flightSeatId, passengerData } = b

        const seat = await tx.seatDetail.findUnique({
          where: { id: seatDetailId },
          include: {
            flightSeat: {
              include: {
                flight: true
              }
            }
          }
        });
        if (!seat) throw new Error(`Seat ${seatDetailId} not found`);
        if (!seat.isLocked || seat.isLockedByUserId !== userId) {
          throw new Error(`Seat ${seatDetailId} is not locked by this user or lock expired`);
        }

        const flight = await tx.flight.findUnique({where: {id: flightId}})

        const passenger = await tx.passenger.create({ data: passengerData });

        //create ticket
        const ticket = await tx.ticket.create({
          data: {
            bookingReference: bookingRef,
            ticketNumber: generateTicketNumber(flight.flightNumber),
            bookedById: userId,
            flightId,
            flightSeatId,
            seatDetailId,
            passengerId: passenger.id,
            seatNumber: seat.seatNumber
          }
        });

        //change seat to booked and delete locked
        await tx.seatDetail.update({
          where: { id: seatDetailId },
          data: {
            isBooked: true,
            isLocked: false,
            isLockedByUserId: null,
            lockedAt: null,
          },
        })

        //increment bookSeats count
        await tx.flightSeat.update({
          where: { id: flightSeatId },
          data: { bookedSeats: { increment: 1 } },
        });

        createdTickets.push(ticket);
      }

      return createdTickets;
    });
  },


  generateETicketPDF: async (ticket, passenger, flight) => {
    // Generate QR code (square barcode)
    const qrPayload = {
      pnr: ticket.bookingReference,
      name: passenger.fullName,
      flight: flight.flightNumber,
      from: flight.departureAirport.iataCode,
      to: flight.arrivalAirport.iataCode,
      dep: flight.departureTime,
      seat: ticket.seatNumber
    };

    const barcodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 100
    });

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [600, 450], // Boarding pass size - increased height more
          margins: { top: 20, bottom: 30, left: 30, right: 30 }
        });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const leftColX = doc.page.margins.left;
        const rightColX = doc.page.margins.left + pageWidth / 2 + 10;
        const colWidth = (pageWidth / 2) - 10;

        // ========== LEFT COLUMN ==========
        let currentY = doc.page.margins.top;

        // Logo placeholder (top left)
        doc.fontSize(12).fillColor("#d4a574").font("Helvetica-Bold")
          .text("✈", leftColX, currentY);
        doc.fontSize(9).fillColor("#000").font("Helvetica")
          .text("QAirline", leftColX + 15, currentY + 2);

        currentY += 25;

        // BOARDING PASS header
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#000")
          .text("BOARDING PASS", leftColX, currentY, { width: colWidth });

        currentY += 20;

        // Flight class
        doc.fontSize(20).fillColor("#0066cc").font("Helvetica-Bold")
          .text((ticket.flightSeat.seatClass || "Economy").toUpperCase(), leftColX, currentY);

        currentY += 30;

        // Passenger name
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Name", leftColX, currentY);
        currentY += 12;
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(passenger.fullName.toUpperCase(), leftColX, currentY, { width: colWidth });

        currentY += 25;

        // From
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("From", leftColX, currentY);
        currentY += 12;
        const fromCity = flight.departureAirport.city || flight.departureAirport.name;
        const fromCode = flight.departureAirport.iataCode || 'undefined';
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(`${fromCity}(${fromCode})`, leftColX, currentY);

        currentY += 25;

        // Departure Time
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Departure Time", leftColX, currentY);
        currentY += 12;
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(formatTime(flight.departureTime), leftColX, currentY);

        currentY += 30;

        // Boarding gate notice
        doc.fontSize(8).fillColor("#000").font("Helvetica")
          .text("Please be at boarding gate", leftColX, currentY, { width: colWidth });
        currentY += 12;
        doc.fontSize(11).font("Helvetica-Bold")
          .text("30 minutes", leftColX, currentY);

        currentY += 28;

        // PNR
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("PNR", leftColX, currentY);
        currentY += 12;
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(ticket.bookingReference, leftColX, currentY);

        currentY += 25;

        // Barcode at bottom left (QR Code - square)
        const leftBarcodeY = doc.page.height - doc.page.margins.bottom - 70;
        try {
          const barcodeBase64 = barcodeDataUrl.split(",")[1];
          const barcodeBuffer = Buffer.from(barcodeBase64, "base64");
          doc.image(barcodeBuffer, leftColX, leftBarcodeY, {
            width: 65,
            height: 65
          });
        } catch (e) {
          console.error("Barcode error:", e);
        }

        // ========== CENTER DIVIDER ==========
        const centerX = doc.page.margins.left + pageWidth / 2;
        doc.moveTo(centerX, doc.page.margins.top)
          .lineTo(centerX, doc.page.height - doc.page.margins.bottom)
          .strokeColor("#ddd")
          .lineWidth(1)
          .dash(5, { space: 5 })
          .stroke();

        // ========== RIGHT COLUMN ==========
        currentY = doc.page.margins.top;

        // Logo placeholder (top right)
        doc.fontSize(12).fillColor("#d4a574").font("Helvetica-Bold")
          .text("✈", rightColX, currentY);
        doc.fontSize(9).fillColor("#000").font("Helvetica")
          .text("QAirline", rightColX + 15, currentY + 2);

        currentY += 25;

        // Flight class (right)
        doc.fontSize(20).fillColor("#0066cc").font("Helvetica-Bold")
          .text((ticket.flightSeat.seatClass || "Economy").toUpperCase(), rightColX, currentY);

        currentY += 30;

        // Passenger name (right)
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Name", rightColX, currentY);
        currentY += 12;
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(passenger.fullName.toUpperCase(), rightColX, currentY, { width: colWidth });

        currentY += 25;

        // Three columns: To, Date, Gate
        const col1X = rightColX;
        const col2X = rightColX + (colWidth / 3);
        const col3X = rightColX + (colWidth / 3) * 2;
        const tempY = currentY;

        // To
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("To", col1X, tempY);
        const toCity = flight.arrivalAirport.city || flight.arrivalAirport.name;
        const toCode = flight.arrivalAirport.iataCode || 'undefined';
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(`${toCity}(${toCode})`, col1X, tempY + 12);

        // Date
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Date", col2X, tempY);
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(formatDate(flight.departureTime), col2X, tempY + 12);

        // Gate
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Gate", col3X, tempY);
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(flight.gate || "08", col3X, tempY + 12);

        currentY += 40;

        // Three columns: Seat, Class, Flight
        // Seat
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Seat", col1X, currentY);
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(ticket.seatNumber || "21G", col1X, currentY + 12);

        // Class
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Class", col2X, currentY);
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(ticket.flightSeat.seatClass.charAt(0) || "E", col2X, currentY + 12);

        // Flight
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Flight", col3X, currentY);
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(flight.flightNumber, col3X, currentY + 12);

        currentY += 38;

        // Three columns: Seq, E-Ticket
        // SEQ
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("SEQ", col1X, currentY);
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(ticket.sequenceNumber || "11", col1X, currentY + 12);

        // E-Ticket
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("E-Ticket", col2X, currentY);
        doc.fontSize(7).fillColor("#000").font("Helvetica")
          .text(ticket.ticketNumber || "738-2760393", col2X, currentY + 12, { width: 80 });

        currentY += 38;

        // Route info (right column)
        const fromCode2 = flight.departureAirport.iataCode || 'undefined';
        const toCode2 = flight.arrivalAirport.iataCode || 'undefined';
        doc.fontSize(11).fillColor("#000").font("Helvetica-Bold")
          .text(`${fromCode2}/${toCode2}`, rightColX, currentY);

        currentY += 22;

        // Bottom info boxes
        // Date Time
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Date", col1X, currentY);
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(formatDateShort(flight.departureTime), col1X, currentY + 12);

        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Time", col1X + 50, currentY);
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(formatTime(flight.departureTime), col1X + 50, currentY + 12);

        // Gate
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Gate", col2X + 30, currentY);
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(flight.gate || "08", col2X + 30, currentY + 12);

        currentY += 32;

        // Flight Class Seat
        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Flight", rightColX, currentY);
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(flight.flightNumber, rightColX, currentY + 12);

        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Class", rightColX + 60, currentY);
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(ticket.flightSeat.seatClass.charAt(0) || "E", rightColX + 60, currentY + 12);

        doc.fontSize(8).fillColor("#666").font("Helvetica")
          .text("Seat", rightColX + 100, currentY);
        doc.fontSize(10).fillColor("#000").font("Helvetica-Bold")
          .text(ticket.seatNumber || "21G", rightColX + 100, currentY + 12);

        // Boarding notice
        const noticeY = doc.page.height - doc.page.margins.bottom - 78;
        doc.fontSize(7).fillColor("#000").font("Helvetica")
          .text("Boarding gate closes 15 minutes before departure time.", rightColX, noticeY, { width: colWidth });
        doc.fontSize(7).text("Late passenger may not be accepted for travel.", rightColX, noticeY + 10, { width: colWidth });

        // Barcode at bottom right (QR Code - square)
        const rightBarcodeY = doc.page.height - doc.page.margins.bottom - 70;
        try {
          const barcodeBase64 = barcodeDataUrl.split(",")[1];
          const barcodeBuffer = Buffer.from(barcodeBase64, "base64");
          doc.image(barcodeBuffer, rightColX + colWidth - 65, rightBarcodeY, {
            width: 65,
            height: 65
          });
        } catch (e) {
          console.error("Barcode error:", e);
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  },


  sendETicket: async (userId, bookingRef) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const tickets = await TicketService.getByBookingReference(bookingRef)

    if (tickets.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }


    //generate all ppdf tickets
    const pdfFiles = []
    for (const t of tickets) {
      const pdfBuffer = await TicketService.generateETicketPDF(t, t.passenger, t.flight);

      pdfFiles.push({
        filename: `ticket-${t.passenger.fullName}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      });
    }

    //send email with all attachments

    await sendEmail({
      to: user.email,
      subject: `Your E-Ticket - Booking ${bookingRef}`,
      template: "eticket",
      context: {
        name: user.fullName,
        bookingRef,
        totalTickets: tickets.length
      },
      attachments: pdfFiles
    })
  }
};

module.exports = TicketService;