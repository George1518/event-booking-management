// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import userRoute from "./routes/user.route.js";
import connectDB from "./config/connectDB.js";
import session from "express-session";
import eventRoute from './routes/event.route.js';
import bookingRoute from './routes/booking.route.js';
import MongoStore from "connect-mongo";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (Render sits behind a proxy) so secure cookies work
app.set("trust proxy", 1);

// CORS: allow dev origin, allow credentials. In production the frontend is served by the same origin.
if (process.env.NODE_ENV !== "production") {
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));
} else {
  app.use(cors({
    origin: true, // reflect origin (frontend served from same origin in prod)
    credentials: true
  }));
}

connectDB();
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
}));

// --- API routes (handle these first) ---
app.use('/user', userRoute);
app.use('/events', eventRoute);
app.use('/bookings', bookingRoute);

// --- Serve frontend static files ---
// If using Vite the build output is ../frontend/dist
const frontendDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

// SPA fallback for client-side routing. Place AFTER API routes.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
