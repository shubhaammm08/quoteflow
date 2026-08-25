const https = require('https');
const pdfParse = require('pdf-parse');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Robust Gemini API caller with model fallbacks & timeout
async function callGeminiAPI(prompt) {
    const models = ['gemini-3.6-flash', 'gemini-1.5-flash'];
    for (const model of models) {
        try {
            const text = await new Promise((resolve, reject) => {
                const postData = JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                });

                const req = https.request({
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    method: 'POST',
                    timeout: 8000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (res) => {
                    let body = '';
                    res.on('data', (chunk) => body += chunk);
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(body);
                            if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
                                resolve(parsed.candidates[0].content.parts[0].text);
                            } else {
                                reject(new Error(`API Response missing candidate text for ${model}`));
                            }
                        } catch (e) {
                            reject(e);
                        }
                    });
                });

                req.on('error', (err) => reject(err));
                req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
                req.write(postData);
                req.end();
            });

            return text;
        } catch (err) {
            console.warn(`Gemini model ${model} error:`, err.message);
        }
    }
    throw new Error('All Gemini models failed or timed out');
}

// Fallback regex parser for PDF text if AI is unreachable
function parsePDFTextFallback(extractedText) {
    const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
    
    let companyName = '';
    let contactPerson = '';
    let email = '';
    let phone = '';
    let gstin = '';
    let address = '';
    let quoteNo = '';

    const emailMatch = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];

    const phoneMatch = extractedText.match(/(?:\+?\d{1,3}[-  ]?)?\(?\d{3,5}\)?[-  ]?\d{3,5}[-  ]?\d{3,5}/);
    if (phoneMatch) phone = phoneMatch[0];

    const gstinMatch = extractedText.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}/);
    if (gstinMatch) gstin = gstinMatch[0];

    const quoteMatch = extractedText.match(/(?:QT|QUOTATION|QUOTE)[- #:]*([A-Z0-9-]+)/i);
    if (quoteMatch) quoteNo = quoteMatch[1];

    const clientLine = lines.find(l => /client|customer|company|bill to/i.test(l));
    if (clientLine) {
        companyName = clientLine.replace(/^(client|customer|company|bill to)[: -]*/i, '').trim();
    }

    const contactLine = lines.find(l => /contact|attn|person/i.test(l));
    if (contactLine) {
        contactPerson = contactLine.replace(/^(contact|attn|person)[: -]*/i, '').trim();
    }

    // Extract items
    const items = [];
    lines.forEach(line => {
        const itemMatch = line.match(/(?:\d+[\.\)]\s*)?(.+?)\s*[-:]\s*(?:Qty|Quantity)?\s*:?\s*(\d+)\s*[-:]\s*(?:Price|Unit Price)?\s*:?\s*(?:₹|\$|€)?\s*(\d+(?:\.\d+)?)/i);
        if (itemMatch) {
            const desc = itemMatch[1].trim();
            const qty = parseFloat(itemMatch[2]) || 1;
            const price = parseFloat(itemMatch[3]) || 0;
            items.push({
                description: desc,
                qty: qty,
                price: price,
                discount: 0,
                tax: 18,
                total: qty * price
            });
        }
    });

    if (items.length === 0) {
        items.push({
            description: 'Imported Quotation Line Item',
            qty: 1,
            price: 10000,
            discount: 0,
            tax: 18,
            total: 10000
        });
    }

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
    const gst = subtotal * 0.18;

    return {
        customerInfo: {
            companyName: companyName || 'Imported Client Company',
            contactPerson: contactPerson || 'Purchasing Team',
            email: email || '',
            phone: phone || '',
            billingAddress: address || 'Billing Address Provided in PDF',
            gstin: gstin || ''
        },
        quotationInfo: {
            no: quoteNo || `QT-${Date.now().toString().slice(-4)}`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
            currency: extractedText.includes('$') ? 'USD' : extractedText.includes('€') ? 'EUR' : 'INR'
        },
        items: items,
        terms: {
            delivery: 'Delivery within 14 working days from PO acceptance.',
            payment: '100% advance along with Purchase Order.',
            conditions: 'Standard terms apply as per OEM policy.'
        },
        totals: {
            subtotal: subtotal,
            discount: 0,
            gst: gst,
            grandTotal: subtotal + gst
        }
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
        chunks.push(chunk);
        totalSize += chunk.length;
        if (totalSize > 15 * 1024 * 1024) { // 15MB limit
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const buffer = Buffer.concat(chunks);
            if (!buffer || buffer.length === 0) {
                return res.status(400).json({ success: false, error: 'Empty file uploaded.' });
            }

            // Extract text using pdf-parse
            let pdfData;
            try {
                const uint8Data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                pdfData = await pdfParse(uint8Data);
            } catch (pdfErr) {
                console.error('PDF parsing error details:', pdfErr && pdfErr.message ? pdfErr.message : pdfErr);
                return res.status(400).json({ success: false, error: 'Please upload a valid PDF file.' });
            }

            const extractedText = pdfData.text ? pdfData.text.trim() : '';

            // Scanned / Image-based PDF Detection
            if (extractedText.length < 25) {
                return res.status(200).json({
                    success: false,
                    isScanned: true,
                    error: 'This PDF appears to be scanned or image-based. AI vision/OCR extraction may be required.'
                });
            }

            let extractedData;
            try {
                const prompt = `Extract all structured quotation details from this quotation text. Return ONLY a valid JSON object without any markdown wrapping or code blocks (no \`\`\`json).

Required JSON structure:
{
  "customerInfo": {
    "companyName": "string or empty",
    "contactPerson": "string or empty",
    "email": "string or empty",
    "phone": "string or empty",
    "billingAddress": "string or empty",
    "gstin": "string or empty"
  },
  "quotationInfo": {
    "no": "string or empty",
    "date": "string or empty",
    "validUntil": "string or empty",
    "currency": "INR or USD or EUR"
  },
  "items": [
    {
      "description": "string",
      "qty": number,
      "price": number,
      "discount": number,
      "tax": number,
      "total": number
    }
  ],
  "terms": {
    "delivery": "string or empty",
    "payment": "string or empty",
    "conditions": "string or empty"
  },
  "totals": {
    "subtotal": number,
    "discount": number,
    "gst": number,
    "grandTotal": number
  }
}

Extracted PDF Text:
${extractedText.slice(0, 10000)}`;

                const rawAiText = await callGeminiAPI(prompt);
                const cleanedJsonText = rawAiText.replace(/```json/gi, '').replace(/```/g, '').trim();
                extractedData = JSON.parse(cleanedJsonText);
            } catch (aiErr) {
                console.warn('AI Extraction fallback to local regex parser:', aiErr.message);
                extractedData = parsePDFTextFallback(extractedText);
            }

            return res.status(200).json({
                success: true,
                data: extractedData,
                rawTextLength: extractedText.length
            });

        } catch (err) {
            console.error('Server extraction error:', err);
            return res.status(500).json({
                success: false,
                error: "We couldn't extract the quotation details from this PDF. Please try again or enter details manually."
            });
        }
    });
}
