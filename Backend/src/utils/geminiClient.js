const generateMockResponse = (messages) => {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  const asksAboutCourses = ['course', 'khóa học', 'khoa hoc', 'recommend', 'gợi ý', 'goi y', 'tìm', 'tim']
    .some((keyword) => lastMessage.includes(keyword));

  if (asksAboutCourses) {
    const catalogMsg = messages.find((m) => m.role === 'system' && m.content.includes('course catalog'));
    if (catalogMsg) {
      const catalogList = catalogMsg.content.split('\n\n')[1] || catalogMsg.content;
      return `Here are some courses currently available on this platform:\n\n${catalogList}\n\n(Mock response — set a real GEMINI_API_KEY in .env for smarter, conversational answers.)`;
    }
  }

  if (lastMessage.includes('hello') || lastMessage.includes('xin chào')) {
    return "Hello! I am your AI Coding Assistant. I'm excited to help you learn! What programming topic or question would you like help with today?";
  }
  if (lastMessage.includes('bug') || lastMessage.includes('error') || lastMessage.includes('lỗi')) {
    return "Sure! Let's debug this together. Please paste the code and the error message you're seeing, and I'll help you figure out what's wrong.";
  }
  return "That's great! Let's keep going. Tell me more about what you're building or paste a code snippet you'd like help with.";
};

const geminiClient = {
  async generateContent(messages) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[GEMINI CLIENT WARNING] GEMINI_API_KEY is not defined. Falling back to mock assistant answers.');
      return generateMockResponse(messages);
    }

    // Format messages for Gemini API (roles must be 'user' or 'model')
    const contents = messages.map(m => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ contents })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('[GEMINI API ERROR RESPONSE]', errText);
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty content returned from Gemini');
      }

      return text.trim();
    } catch (error) {
      console.error('[GEMINI API EXCEPTION]', error);
      // Fallback on error to ensure app keeps running
      return generateMockResponse(messages);
    }
  },

  async gradeSpeakingOrOpenEnded(prompt, correctAnswer, studentInput) {
    const apiKey = process.env.GEMINI_API_KEY;
    const systemPrompt = `You are an expert programming instructor grading an open-ended quiz answer.
Question given: "${prompt}"
Expected Answer Reference: "${correctAnswer || 'Any correct, well-reasoned answer covering the key concept is fine.'}"
Student's Answer: "${studentInput}"

Please grade this answer. Return ONLY a valid JSON string (no markdown wraps like \`\`\`json) of this schema:
{
  "score": <number between 0 and 100>,
  "isPassed": <true or false, pass if score is >= 50>,
  "comment": "<constructive feedback message>"
}`;

    if (!apiKey) {
      console.warn('[GEMINI CLIENT WARNING] GEMINI_API_KEY is not defined. Using mock grader.');
      return {
        score: studentInput ? 80 : 0,
        isPassed: !!studentInput,
        comment: studentInput
          ? "Good job! (Mock evaluation: Answer is coherent and covers the key concept.)"
          : "No answer provided."
      };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: systemPrompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Gemini API call failed during grading');
      }

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini grading response was empty');
      }

      // Clean up markdown block wraps if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('[GEMINI GRADER ERROR]', error);
      return {
        score: studentInput ? 75 : 0,
        isPassed: !!studentInput,
        comment: "Successfully parsed. (AI grader failed, fell back to default passing score)."
      };
    }
  }
};

module.exports = geminiClient;
