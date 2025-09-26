import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
dotenv.config();
import userRoute from "./routes/user.route.js"
import connectDB from "./config/connectDB.js";
import session from "express-session";
import eventRoute from './routes/event.route.js'
import bookingRoute from './routes/booking.route.js'
import MongoStore from "connect-mongo";

const PORT = process.env.PORT;
const app = express();

app.use(cors({
  origin: "http://localhost:5173", // React dev server
  credentials: true, // allow cookies/sessions
}));
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
        secure: false
    }
}));

app.get("/", (req,res) =>
{
    res.send("task")
})

app.use('/user', userRoute)
app.use('/events',eventRoute)
app.use('/bookings',bookingRoute)

app.listen(PORT, ()=>
{
    try
    {
        console.log("your server is running on: " ,PORT)
    }
    catch(error)

    {
         console.log("error while launching: " , error)
    }


})