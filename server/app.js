const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const userRouter = require('./api/user/user.route');
const authRouter = require('./api/auth/auth.route');
const flightsRouter = require('./api/flight/flight.route');
const flightSeatRouter = require('./api/flightSeat/flightSeat.route');
const ticketRouter = require('./api/ticket/ticket.route');
const aircraftRouter = require('./api/aircraft/aircraft.route');
const airportRouter = require('./api/airport/airport.route');
const newsRouter = require('./api/news/new.route');
const chatRouter = require('./api/chat/chat.route');


const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, //allow cookies to be sent
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/flight', flightsRouter);
app.use('/flightSeat', flightSeatRouter);
app.use('/ticket', ticketRouter);
app.use('/aircraft', aircraftRouter);
app.use('/airport', airportRouter);
app.use('/news', newsRouter);
app.use('/support-chat', chatRouter);

app.use("/uploads", express.static("uploads"));




module.exports = app;
