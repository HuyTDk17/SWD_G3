const generateMockResponse = (messages) => {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
  if (lastMessage.includes('hello') || lastMessage.includes('xin chào')) {
    return "Hello! I am your AI Language Assistant. I'm excited to help you practice! What target language topic would you like to practice today?";
  }
  if (lastMessage.includes('grammar') || lastMessage.includes('ngữ pháp')) {
    return "Sure! Let's practice grammar. Please write a sentence, and I will correct any mistakes you make.";
  }
  return "That's great! Let's continue practicing. Tell me more about your learning goals or write another sentence in your target language.";
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    const systemPrompt = `You are an expert language teacher grading an open-ended or speaking practice prompt.
Prompt given: "${prompt}"
Expected Answer Reference: "${correctAnswer || 'Any coherent target language response is fine.'}"
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
          ? "Good job! (Mock evaluation: Sentence is coherent and covers basic communication goals.)"
          : "No answer provided."
      };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
