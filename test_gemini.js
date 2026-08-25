const fs = require('fs');

const inquiry = fs.readFileSync('test_input.txt', 'utf8');

const prompt = `Extract the customer details and line items from the following inquiry. Return ONLY a valid JSON object without any markdown wrapping (no \`\`\`json). Use this exact structure:
{
  "customerInfo": {
    "companyName": "string or empty",
    "contactPerson": "string or empty",
    "email": "string or empty",
    "phone": "string or empty",
    "billingAddress": "string or empty"
  },
  "items": [
    {
      "description": "string",
      "qty": 1,
      "price": 0
    }
  ]
}

Inquiry:
${inquiry}`;

fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=YOUR_GEMINI_API_KEY', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
}).then(r => r.json()).then(data => {
    if(data.error) console.error(data.error);
    else {
        let rawText = data.candidates[0].content.parts[0].text;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) rawText = jsonMatch[0];
        console.log(rawText);
    }
}).catch(console.error);
