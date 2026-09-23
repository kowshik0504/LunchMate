const fs = require('fs');
async function listModels() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKey = envContent.match(/VITE_GROQ_API_KEY=(.+)/)[1].trim();
  
  const response = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await response.json();
  console.log("AVAILABLE MODELS:");
  data.data.forEach(m => console.log(m.id));
}
listModels();
