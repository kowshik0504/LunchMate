const fs = require('fs');

async function testGroqModel(modelName) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKey = envContent.match(/VITE_GROQ_API_KEY=(.+)/)[1].trim();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: modelName, messages: [{ role: 'user', content: 'Say hello in English' }], max_tokens: 10 })
  });
  const data = await response.json();
  console.log(`Model ${modelName}:`, data.error ? data.error : data.choices[0].message.content);
}

testGroqModel("groq/compound-mini");
testGroqModel("canopylabs/orpheus-v1-english");
