const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  createConversation
} = require('../controllers/messageController');

router.get('/', protect, getConversations);
router.post('/', protect, createConversation);
router.get('/:id', protect, getMessages);
router.post('/:id', protect, sendMessage);

module.exports = router;
