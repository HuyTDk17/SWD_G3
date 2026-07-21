const AiSession = require('../models/AiSession');
const User = require('../models/User');
const geminiClient = require('../utils/geminiClient');
const ValidationError = require('../exceptions/ValidationError');

const aiService = {
  async getQuota(userId) {
    const user = await User.findById(userId).select('aiQuotaLimit aiQuotaUsed');
    if (!user) throw new Error('User not found');
    return {
      quotaLimit: user.aiQuotaLimit || 50,
      quotaUsed: user.aiQuotaUsed || 0,
      quotaRemaining: Math.max(0, (user.aiQuotaLimit || 50) - (user.aiQuotaUsed || 0))
    };
  },

  async createSession(userId, type, targetLanguage) {
    const session = await AiSession.create({
      userId,
      type: type || 'conversation',
      targetLanguage: targetLanguage || 'English',
      messages: [{
        role: 'system',
        content: `You are a helpful language learning partner. Practice ${targetLanguage || 'English'} speaking and conversation. Keep your answers brief, encouraging, and write at a level suitable for language learners.`
      }]
    });
    return session;
  },

  async getSession(userId, sessionId) {
    return AiSession.findOne({ _id: sessionId, userId });
  },

  async listSessions(userId) {
    return AiSession.find({ userId }).sort({ updatedAt: -1 });
  },

  async sendMessage(userId, sessionId, content) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Quota Enforcement (Step 12 Integration)
    if (user.aiQuotaUsed >= user.aiQuotaLimit) {
      const quotaErr = new Error('AI Quota limit exceeded for this month.');
      quotaErr.statusCode = 429;
      throw quotaErr;
    }

    const session = await AiSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new Error('AI session not found.');
    }

    // Append user message
    session.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    // Call Gemini API
    const responseContent = await geminiClient.generateContent(session.messages);

    // Append model response
    session.messages.push({
      role: 'model',
      content: responseContent,
      timestamp: new Date()
    });

    await session.save();

    // Increment user quota
    user.aiQuotaUsed += 1;
    await user.save();

    return {
      response: responseContent,
      quotaRemaining: Math.max(0, user.aiQuotaLimit - user.aiQuotaUsed)
    };
  }
};

module.exports = aiService;
