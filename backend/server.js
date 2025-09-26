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

// CORS configuration for production
app.use(cors({
  origin: [
    "http://localhost:5173", // React dev server
    "https://your-frontend-domain.netlify.app", // Replace with your actual frontend domain
    process.env.FRONTEND_URL // Environment variable for flexibility
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
}));

connectDB();

app.use(express.json());
app.set("trust proxy", 1);

// Session configuration for production
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // none for cross-site in production
  }
}));

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Event Booking API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    database: "Connected", 
    timestamp: new Date().toISOString() 
  });
});

app.use('/user', userRoute);
app.use('/events', eventRoute);
app.use('/bookings', bookingRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Fixed 404 handler - Use proper wildcard pattern
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});