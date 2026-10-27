require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initializeSocket } = require('./socket/socketHandler');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Pass io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

try { app.use('/api/projects', require('./routes/projects')); } catch(e) { console.log('Projects routes not yet available'); }
try { app.use('/api/proposals', require('./routes/proposals')); } catch(e) { console.log('Proposals routes not yet available'); }
try { app.use('/api/messages', require('./routes/messages')); } catch(e) { console.log('Messages routes not yet available'); }
try { app.use('/api/payments', require('./routes/payments')); } catch(e) { console.log('Payments routes not yet available'); }
try { app.use('/api/reviews', require('./routes/reviews')); } catch(e) { console.log('Reviews routes not yet available'); }

// Initialize Socket Handler
initializeSocket(io);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
