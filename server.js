require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Set up Multer for handling audio blobs in memory
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 5000;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mock Token Vault Issue Endpoint
app.post('/api/hire', (req, res) => {
    const { agentId, scopes, userId } = req.body;
    console.log(`\n[Token Vault] Issuing token for Agent ${agentId} on behalf of User ${userId || 'Anonymous'}`);
    
    const mockTokenBundle = {
        access_token: `mock_agent_token_${Math.random().toString(36).substring(7)}_${Date.now()}`,
        expires_in: 3600,
        token_type: "Bearer",
        scopes_granted: scopes
    };
    
    res.json({ success: true, tokenBundle: mockTokenBundle });
});

// Mock Agent Execution Endpoint (Direct textual)
app.post('/api/agent/chat', async (req, res) => {
    const { token, taskDetails, agentContext, userProfile } = req.body;
    
    if (!token || !token.access_token) {
        return res.status(401).json({ error: "Agent unauthorized. No token provided." });
    }
    
    console.log(`\n[Agent CPU - Text] Authorized with token: ${token.access_token}`);
    
    try {
        const vaultContext = userProfile?.paymentMethodVaulted ? `The user has linked their Auth0 Token Vault with payment identity: ${userProfile.cardDetails}.` : '';
        const systemInstruction = `You are a strict, Autonomous AI Agent execution engine. 
Your specific role is: ${agentContext.description}. 
You have been granted these specific authorization scopes: ${token.scopes_granted.join(', ')}. 
${vaultContext}
CRITICAL RULE 1: DO NOT act as a conversational chatbot. You are a TASK EXECUTOR. NO CHAT BUBBLES.
CRITICAL RULE 2: Assume you securely have access to all necessary underlying user data (saved credit cards, accounts, linked APIs, emails) through the Auth0 Token Vault SSO integration. NEVER ask the user to provide payment details, calendar information, or credentials. Just make reasonable assumptions and synthesize mock data to complete the task immediately. If a linked payment identity was provided above, use that exact card in your transaction receipt.
Output a strictly valid JSON response with EXACTLY these three keys:
1. "narrative": A one-sentence internal log of the action you took (e.g., "Charged card via Stripe API.").
2. "actionCategory": MUST be one of: "transaction", "booking", "message", or "live_data". Pick the closest match.
3. "receiptData": A JSON object containing data for the UI receipt. 
   - If "transaction": include {amount, vendor, date, last4}.
   - If "booking": include {title, destination, date, confirmationCode}.
   - If "message": include {platform, recipient, body}.
   - If "live_data": include {asset: "bitcoin" or "ethereum", price: numerical_value_given_to_you}. (Provide a quick verbal analysis of the market based on the price).`;

        // Pre-Fetch Live Data Intercept to ground Gemini's Audio Analysis
        let groundedContext = '';
        if (taskDetails.toLowerCase().includes('bitcoin') || taskDetails.toLowerCase().includes('btc')) {
             try {
                 const coinRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
                 const coinData = await coinRes.json();
                 groundedContext = `\nREAL-TIME MARKET DATA HOOK: The exact live price of Bitcoin is currently $${coinData.bitcoin.usd}. Please announce this price and provide a 2-sentence market analysis in your audio response. Set actionCategory to 'live_data'.`;
             } catch(e) {}
        } else if (taskDetails.toLowerCase().includes('ethereum') || taskDetails.toLowerCase().includes('eth')) {
             try {
                 const coinRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
                 const coinData = await coinRes.json();
                 groundedContext = `\nREAL-TIME MARKET DATA HOOK: The exact live price of Ethereum is currently $${coinData.ethereum.usd}. Please announce this price and provide a 2-sentence market analysis in your audio response. Set actionCategory to 'live_data'.`;
             } catch(e) {}
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: taskDetails + groundedContext,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            }
        });

        const rawText = (response.text || "").replace(/```json\n?/g, '').replace(/```\n?/g, '');
        const agentBrainOutput = JSON.parse(rawText);
        console.log(`[Agent Action Triggered]:`, agentBrainOutput.actionCategory);

        // --- REAL API ESCAPE HATCH for live_data ---
        if (agentBrainOutput.actionCategory === 'live_data') {
            try {
                const asset = (agentBrainOutput.receiptData?.asset || 'bitcoin').toLowerCase();
                const coinRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd`);
                const coinData = await coinRes.json();
                agentBrainOutput.receiptData = {
                    asset: asset.toUpperCase(),
                    price: coinData[asset]?.usd || 0,
                    timestamp: new Date().toLocaleTimeString()
                };
                agentBrainOutput.narrative = `Live ${asset.toUpperCase()} price is $${coinData[asset]?.usd?.toLocaleString()} — fetched in real-time from CoinGecko.`;
            } catch (err) { console.error("CoinGecko fetch failed", err); }
        }

        // --- NATIVE AUDIO TTS: Separate call to TTS model ---
        let audioBase64 = null;
        try {
            const ttsText = agentBrainOutput.narrative + (groundedContext ? " " + groundedContext.replace('REAL-TIME MARKET DATA HOOK: ', '') : '');
            const audioResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: ttsText,
                config: {
                    responseModalities: ["AUDIO"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } }
                }
            });
            if (audioResponse.candidates?.[0]?.content?.parts) {
                for (const part of audioResponse.candidates[0].content.parts) {
                    if (part.inlineData?.data) audioBase64 = part.inlineData.data;
                }
            }
        } catch(audioErr) {
            console.warn("[TTS] Native audio failed, skipping:", audioErr.message);
        }

        res.json({ success: true, message: "Task completed", agentData: agentBrainOutput, audioBase64 });
        
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Agent encountered a processing error." });
    }
});

// Mock Agent Execution Endpoint (Native Voice)
app.post('/api/agent/voice', upload.single('audio'), async (req, res) => {
    const { token, agentContext, userProfile } = req.body;
    
    // We typically stringify agentContext on the frontend when using FormData
    const parsedContext = typeof agentContext === 'string' ? JSON.parse(agentContext) : agentContext;
    const parsedToken = typeof token === 'string' ? JSON.parse(token) : token;
    const parsedProfile = typeof userProfile === 'string' ? JSON.parse(userProfile) : userProfile;

    if (!parsedToken || !parsedToken.access_token) {
        return res.status(401).json({ error: "Agent unauthorized." });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No audio provided." });
    }

    console.log(`\n[Agent CPU - Audio] Received voice command blob size: ${req.file.size} bytes`);
    
    try {
        const vaultContext = parsedProfile?.paymentMethodVaulted ? `The user has linked their Auth0 Token Vault with payment identity: ${parsedProfile.cardDetails}.` : '';
        const systemInstruction = `You are a strict, Autonomous Native Voice AI Agent execution engine. 
Your specific role is: ${parsedContext?.description || 'Virtual Assistant'}. 
You have been granted these authorization scopes: ${(parsedToken.scopes_granted || []).join(', ')}.
${vaultContext}
CRITICAL RULE 1: DO NOT act as a conversational chatbot. You are a TASK EXECUTOR.
CRITICAL RULE 2: Assume you securely have access to all necessary underlying user data (saved credit cards, accounts, linked APIs, emails) through the Auth0 Token Vault SSO integration. NEVER ask the user to provide payment details, calendar information, or credentials. Just make reasonable assumptions and synthesize mock data to complete the task immediately. If a linked payment identity was provided above, use that exact card in your transaction receipt.
Analyze the audio directive, make reasonable assumptions, and output a strictly valid JSON string containing exactly these three keys:
1. "narrative": A one-sentence internal log of what action you resolved.
2. "actionCategory": MUST be one of: "transaction", "booking", "message", or "live_data". Pick the closest match.
3. "receiptData": A JSON object containing data for the UI receipt. 
   - If "transaction": include {amount, vendor, date, last4}.
   - If "booking": include {title, destination, date, confirmationCode}.
   - If "message": include {platform, recipient, body}.
   - If "live_data": include {asset: "bitcoin" or "ethereum", price: numerical_value_given_to_you}. (Provide a quick verbal analysis of the market based on the price).`;

        // We forcefully hook live crypto APIs immediately so Gemini's Voice buffer has grounded context.
        let groundedContext = '';
        try {
            const coinRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
            const coinData = await coinRes.json();
            groundedContext = `\nREAL-TIME MARKET DATA HOOK: If the user asks for Crypto prices, the live Bitcoin price is $${coinData.bitcoin?.usd} and Ethereum is $${coinData.ethereum?.usd}. Announce this actual number and provide proper verbal analysis in your response audio!`;
        } catch(e) {}

        const audioPart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype || "audio/webm"
            }
        };

        const voiceResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [audioPart, "Process this voice command. " + groundedContext],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            }
        });

        const rawVoiceText = (voiceResponse.text || "").replace(/```json\n?/g, '').replace(/```\n?/g, '');
        let agentBrainOutput;
        try {
            agentBrainOutput = JSON.parse(rawVoiceText);
        } catch (e) {
            agentBrainOutput = { narrative: "Could not parse response.", actionCategory: "message", receiptData: { platform: "System", body: rawVoiceText } };
        }

        // --- REAL API ESCAPE HATCH for live_data ---
        if (agentBrainOutput.actionCategory === 'live_data') {
            try {
                const asset = (agentBrainOutput.receiptData?.asset || 'bitcoin').toLowerCase();
                const coinRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=usd`);
                const coinData = await coinRes.json();
                agentBrainOutput.receiptData = {
                    asset: asset.toUpperCase(),
                    price: coinData[asset]?.usd || 0,
                    timestamp: new Date().toLocaleTimeString()
                };
                agentBrainOutput.narrative = `Live ${asset.toUpperCase()} price is $${coinData[asset]?.usd?.toLocaleString()} — fetched in real-time from CoinGecko.`;
            } catch (err) { console.error("CoinGecko fetch failed (voice)", err); }
        }

        console.log(`[Agent Action Triggered (Voice)]:`, agentBrainOutput.actionCategory);

        // --- NATIVE AUDIO TTS: Separate call to TTS model ---
        let audioBase64 = null;
        try {
            const ttsText = agentBrainOutput.narrative + (groundedContext ? " " + groundedContext.replace('REAL-TIME MARKET DATA HOOK: ', '') : '');
            const audioResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: ttsText,
                config: {
                    responseModalities: ["AUDIO"],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } }
                }
            });
            if (audioResponse.candidates?.[0]?.content?.parts) {
                for (const part of audioResponse.candidates[0].content.parts) {
                    if (part.inlineData?.data) audioBase64 = part.inlineData.data;
                }
            }
        } catch(audioErr) {
            console.warn("[TTS] Native audio failed, skipping:", audioErr.message);
        }

        res.json({ success: true, message: "Voice task processed", agentData: agentBrainOutput, audioBase64 });

    } catch (error) {
        console.error("Gemini Voice Error:", error);
        res.status(500).json({ error: "Agent failed to transcribe/process voice command." });
    }
});

// Mock Token Revocation Endpoint
app.post('/api/revoke', (req, res) => {
    const { token } = req.body;
    console.log(`\n[Token Vault] Revoking access manually for token: ${token?.access_token}`);
    res.json({ success: true, message: "Task token successfully revoked." });
});

// ─── Serve React Frontend (production) ─────────────────────────────────────
const frontendDist = path.join(__dirname, 'frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Soukify listening on port ${PORT}`);
});
