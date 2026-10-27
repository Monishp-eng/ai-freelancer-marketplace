const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const onlineUsers = new Map();

/**
 * Initializes socket.io handlers
 * @param {Object} io - Socket.io instance
 */
const initializeSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.query.token || socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    io.emit('user_online', { userId: socket.userId });

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, attachments } = data;
        
        const message = new Message({
          conversation: conversationId,
          sender: socket.userId,
          content,
          attachments,
          readBy: [socket.userId]
        });

        await message.save();

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: Date.now()
        });

        const populatedMessage = await message.populate('sender', 'name avatar');
        io.to(conversationId).emit('new_message', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    socket.on('typing', (conversationId) => {
      socket.to(conversationId).emit('user_typing', { userId: socket.userId, conversationId });
    });

    socket.on('stop_typing', (conversationId) => {
      socket.to(conversationId).emit('user_stop_typing', { userId: socket.userId, conversationId });
    });

    socket.on('mark_read', async (data) => {
      try {
        const { conversationId } = data;
        await Message.updateMany(
          { conversation: conversationId, readBy: { $ne: socket.userId } },
          { $addToSet: { readBy: socket.userId } }
        );
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      io.emit('user_offline', { userId: socket.userId });
    });
  });
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};

module.exports = {
  initializeSocket,
  getOnlineUsers,
  isUserOnline
};
