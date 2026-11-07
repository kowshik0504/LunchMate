export const chatWithGroqAI = async (messages) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq_api_key');
  
  if (!apiKey || apiKey === 'paste_your_api_key_here') {
    return "MOCK_RESPONSE: I am your AI Assistant. (Note: Please add your Groq API key in the .env file to talk to the real AI!)";
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: "groq/compound-mini",
        messages: [
          { role: 'system', content: 'You are the friendly, helpful AI support assistant for LunchMate, a school lunch delivery app. Be concise, polite, and helpful.' },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI Error:", error);
    return `Connection Error: ${error.message}. Please check if your API key is valid.`;
  }
};
