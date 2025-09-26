import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
dotenv.config();
import userRoute from "./routes/user.route.js";
import connectDB from "./config/connectDB.js";
import session from "express-session";
import eventRoute from './routes/event.route.js';
import bookingRoute from './routes/booking.route.js';
import MongoStore from "connect-mongo";

const PORT = process.env.PORT || 5000;
const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

connectDB();

app.use(express.json());
app.set("trust proxy", 1);

app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Event Booking API", status: "Running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use('/user', userRoute);
app.use('/events', eventRoute);
app.use('/bookings', bookingRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { details: err.message })
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});