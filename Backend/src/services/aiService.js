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
    const language = targetLanguage || 'JavaScript';
    const systemPrompt = type === 'grammar'
      ? `You are a helpful ${language} code reviewer. Review the code the student shares, point out bugs, style issues, and best-practice improvements. Keep your answers brief, encouraging, and beginner-friendly.`
      : `You are a helpful ${language} programming tutor. Answer the student's coding questions, help them debug, and explain concepts clearly. Keep your answers brief, encouraging, and beginner-friendly.`;

    const session = await AiSession.create({
      userId,
      type: type || 'conversation',
      targetLanguage: language,
      messages: [{
        role: 'system',
        content: systemPrompt
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

    // Ground the AI's answer in the real, current course catalog so it
    // recommends actual courses on this platform instead of inventing ones.
    const courseService = require('./courseService');
    const catalogSummary = await courseService.getCatalogSummaryForAi();
    const catalogContext = {
      role: 'system',
      content: `Here is the current live course catalog on this platform (CodeLearn). Each course includes its real page Link. When the student asks for course recommendations or a course link, only suggest courses from this list and give the exact Link shown — do not invent courses or URLs that aren't listed here. If nothing matches, say so honestly.\n\n${catalogSummary}`
    };

    // Insert the fresh catalog context right after the original system prompt,
    // without polluting the persisted session history.
    const messagesForModel = [session.messages[0], catalogContext, ...session.messages.slice(1)];

    // Call Gemini API
    const responseContent = await geminiClient.generateContent(messagesForModel);

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
  },

  async checkGrammar(userId, text, targetLanguage) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.aiQuotaUsed >= user.aiQuotaLimit) {
      const quotaErr = new Error('AI Quota limit exceeded for this month.');
      quotaErr.statusCode = 429;
      throw quotaErr;
    }

    if (!text || !text.trim()) {
      throw new ValidationError('Text to check is required');
    }

    const prompt = `You are a ${targetLanguage || 'JavaScript'} code reviewer for a student. Review the following code and correct any bugs, syntax errors, or bad practices.
Code: "${text}"

Return ONLY a valid JSON string (no markdown fences) of this exact schema:
{
  "corrected": "<the fully corrected code>",
  "hasErrors": <true or false>,
  "explanation": "<brief, encouraging explanation of what was fixed, or 'No issues found!' if none>"
}`;

    let result;
    try {
      const raw = await geminiClient.generateContent([{ role: 'user', content: prompt }]);
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { corrected: text, hasErrors: false, explanation: 'Could not analyze the text right now, please try again.' };
    }

    const session = await AiSession.create({
      userId,
      type: 'grammar',
      targetLanguage: targetLanguage || 'JavaScript',
      messages: [
        { role: 'user', content: text },
        { role: 'model', content: JSON.stringify(result) }
      ]
    });

    user.aiQuotaUsed += 1;
    await user.save();

    return { ...result, sessionId: session._id, quotaRemaining: Math.max(0, user.aiQuotaLimit - user.aiQuotaUsed) };
  },

  async getStudyRecommendation(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.aiQuotaUsed >= user.aiQuotaLimit) {
      const quotaErr = new Error('AI Quota limit exceeded for this month.');
      quotaErr.statusCode = 429;
      throw quotaErr;
    }

    const Enrollment = require('./../models/Enrollment');
    const Progress = require('./../models/Progress');

    const enrollments = await Enrollment.find({ studentId: userId, status: 'active' }).populate('courseId', 'title language cefrLevel category');
    const progressList = await Progress.find({ studentId: userId });

    const courseSummaries = enrollments.map((e) => {
      const prog = progressList.find((p) => p.courseId && p.courseId.toString() === e.courseId?._id?.toString());
      return `- ${e.courseId?.title || 'Unknown course'} (${e.courseId?.cefrLevel || '?'}): ${prog ? prog.completionPercent : 0}% complete`;
    });

    const prompt = `You are a friendly study advisor for an online programming courses platform. Based on this student's current courses and progress, suggest what they should focus on next.

Current courses:
${courseSummaries.length ? courseSummaries.join('\n') : 'No active enrollments yet.'}

Give a short, encouraging recommendation (3-5 sentences) about what to study next and how to build a consistent habit. Do not use markdown formatting, plain text only.`;

    const recommendation = await geminiClient.generateContent([{ role: 'user', content: prompt }]);

    await AiSession.create({
      userId,
      type: 'recommendation',
      messages: [
        { role: 'user', content: 'Generate study recommendation' },
        { role: 'model', content: recommendation }
      ]
    });

    user.aiQuotaUsed += 1;
    await user.save();

    return { recommendation, quotaRemaining: Math.max(0, user.aiQuotaLimit - user.aiQuotaUsed) };
  }
};

module.exports = aiService;
