const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://gigflow-mu.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ FIX
app.use(express.json());
app.use(cookieParser());

const io = socketio(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true
  }
});

connectDB();

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/gigs", require("./routes/gigRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
