const fs = require('fs');

async function testGroq() {
  try {
    // 1. Read .env file
    const envContent = fs.readFileSync('.env', 'utf8');
    const keyMatch = envContent.match(/VITE_GROQ_API_KEY=(.+)/);
    
    if (!keyMatch || !keyMatch[1]) {
      console.log("TEST RESULT: Could not find VITE_GROQ_API_KEY in .env file.");
      return;
    }
    
    const apiKey = keyMatch[1].trim();
    console.log("TEST RESULT: Found API Key starting with: " + apiKey.substring(0, 8) + "...");
    
    // 2. Make a request to Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
    });
    
    if (!response.ok) {
      const err = await response.text();
      console.log(`TEST RESULT: API Failed with Status ${response.status}. Error details: ${err}`);
      return;
    }
    
    const data = await response.json();
    console.log("TEST RESULT: SUCCESS! Groq API replied: " + data.choices[0].message.content);
    
  } catch(e) {
    console.log("TEST RESULT: Error running test: " + e.message);
  }
}

testGroq();
