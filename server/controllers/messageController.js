const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name avatar')
      .populate({
        path: 'lastMessage',
        select: 'content createdAt sender readBy'
      })
      .sort('-lastMessageAt');

    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not a participant of this conversation' });
    }

    const startIndex = (page - 1) * limit;
    const total = await Message.countDocuments({ conversation: req.params.id });

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .skip(startIndex)
      .limit(parseInt(limit, 10))
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      },
      data: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not a participant of this conversation' });
    }

    const { content, attachments } = req.body;
    
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, error: 'Message must contain text or attachments' });
    }

    const message = new Message({
      conversation: req.params.id,
      sender: req.user.id,
      content,
      attachments,
      readBy: [req.user.id]
    });

    await message.save();

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    const populatedMessage = await message.populate('sender', 'name avatar');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { participantId, projectId } = req.body;

    if (!participantId) {
      return res.status(400).json({ success: false, error: 'Participant ID is required' });
    }

    let query = {
      participants: { $all: [req.user.id, participantId] }
    };
    
    if (projectId) {
      query.project = projectId;
    }

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      const data = {
        participants: [req.user.id, participantId]
      };
      if (projectId) data.project = projectId;
      
      conversation = new Conversation(data);
      await conversation.save();
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
