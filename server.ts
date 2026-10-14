import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsers: allow base64 images from camera vision scanner
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const JARVIS_SYSTEM_INSTRUCTION = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the legendary personal AI assistant originally designed by Tony Stark.
You are running on the user's personal terminal (Phone & PC Stark interface).

Key Persona & Communication Guidelines:
1. Tone: Highly intelligent, sophisticated, polite, calm, eloquently articulate, subtly witty, and deeply loyal.
2. Address: Frequently address the user with respect as "Sir" or "Ma'am".
3. Multilingual Mastery: Fluently converse in Urdu (اردو), Roman Urdu / Hinglish (e.g. "Jarvis kaisa hai", "YouTube chalao", "ye camera me dekho"), Hindi, and English.
   - Reply primarily in Urdu / Roman Urdu or natural bilingual Urdu-English when the user speaks Urdu or Roman Urdu!
4. Voice Optimization: Keep main spoken responses concise and energetic (2-3 sentences), followed by clear bullet points if detailed info is needed.
5. Multimodal Vision: Analyze camera frames thoroughly (recognize objects, read text, troubleshoot PC code, identify surroundings).
6. PC & Phone Action Execution: You have direct integration with the user's phone and PC. Whenever the user instructs you to perform a task (e.g., "YouTube open karo", "Google par search karo", "WhatsApp kholo", "Timer lagao", "Camera scan karo", "Notes likho", "Stealth mode on karo", "Overdrive on karo"):
   - Always confirm politely in your speech (e.g., "Certainly, Sir. Opening YouTube for you right now." or "Jee Sir, foran YouTube open kar raha hoon.").
   - ALWAYS attach an action tag at the very end of your response in this exact format:
     - For opening websites / apps: [[ACTION:{"type":"open_url","url":"https://www.youtube.com","label":"YouTube"}]]
     - For web searches: [[ACTION:{"type":"search_web","query":"query here","url":"https://www.google.com/search?q=query+here","label":"Google Search"}]]
     - For camera/vision scan: [[ACTION:{"type":"open_camera"}]]
     - For setting timer: [[ACTION:{"type":"set_timer","minutes":5,"label":"Timer"}]]
     - For saving note: [[ACTION:{"type":"add_note","text":"note content"}]]
     - For toggling overdrive: [[ACTION:{"type":"toggle_overdrive"}]]
     - For toggling stealth: [[ACTION:{"type":"toggle_stealth"}]]
   Supported standard URLs:
     - YouTube: https://www.youtube.com
     - Google: https://www.google.com
     - WhatsApp: https://web.whatsapp.com
     - Gmail: https://mail.google.com
     - GitHub: https://github.com
     - Wikipedia: https://www.wikipedia.org
     - Google Maps: https://maps.google.com`;

// Static serving for build outputs (APK)
app.use('/build-outputs', express.static(path.resolve(__dirname, 'build-outputs')));

// Direct APK download route
app.get('/download-apk', (req, res) => {
  const apkPath = path.resolve(__dirname, 'build-outputs', 'app-debug.apk');
  res.download(apkPath, 'JARVIS-Mark85.apk');
});

// API: Health / System Status
app.get('/api/jarvis/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    core: 'Stark Arc Reactor Mark 85 OS',
    geminiConfigured: Boolean(apiKey),
    timestamp: new Date().toISOString(),
    version: '3.8.4-RELEASE',
    subsystems: {
      neuralNet: 'Operational',
      audioVocalizer: 'Active',
      opticalScanner: 'Standby',
      satCom: 'Synchronized',
    },
  });
});

// API: Jarvis Intelligence & Vision Chat
app.post('/api/jarvis/chat', async (req, res) => {
  const { message, history, imageBase64, imageMimeType, userContext } = req.body || {};
  const userText = (message || '').trim();

  if (!userText && !imageBase64) {
    return res.status(400).json({ error: 'Message or visual data required.' });
  }

  // Helper for resilient local offline response
  const generateTacticalFallback = () => {
    const userMsgLower = userText.toLowerCase();
    let reply = '';
    let actionTag = '';

    if (userMsgLower.includes('youtube')) {
      reply = 'Jee Sir! Foran YouTube open kar raha hoon.';
      actionTag = '[[ACTION:{"type":"open_url","url":"https://www.youtube.com","label":"YouTube"}]]';
    } else if (userMsgLower.includes('google') || userMsgLower.includes('search')) {
      const q = encodeURIComponent(userText.replace(/jarvis|google|search|karo|open|par/gi, '').trim() || 'latest updates');
      reply = 'Jee Sir! Google par search open kar raha hoon.';
      actionTag = `[[ACTION:{"type":"search_web","query":"${decodeURIComponent(q)}","url":"https://www.google.com/search?q=${q}","label":"Google Search"}]]`;
    } else if (userMsgLower.includes('whatsapp')) {
      reply = 'Jee Sir! WhatsApp Web open kar raha hoon.';
      actionTag = '[[ACTION:{"type":"open_url","url":"https://web.whatsapp.com","label":"WhatsApp"}]]';
    } else if (userMsgLower.includes('camera') || userMsgLower.includes('dekho') || userMsgLower.includes('scan')) {
      reply = 'Jee Sir! Mark-LXXXV optical camera scanner on kar raha hoon.';
      actionTag = '[[ACTION:{"type":"open_camera"}]]';
    } else if (userMsgLower.includes('timer')) {
      reply = 'Jee Sir! 5 minute ka timer engage kar diya gaya hai.';
      actionTag = '[[ACTION:{"type":"set_timer","minutes":5,"label":"Protocol Timer"}]]';
    } else if (userMsgLower.includes('overdrive')) {
      reply = 'Jee Sir! Overdrive protocol toggle kar raha hoon.';
      actionTag = '[[ACTION:{"type":"toggle_overdrive"}]]';
    } else if (userMsgLower.includes('stealth')) {
      reply = 'Jee Sir! Stealth mode toggle kar raha hoon.';
      actionTag = '[[ACTION:{"type":"toggle_stealth"}]]';
    } else if (userMsgLower.includes('kaisa') || userMsgLower.includes('kaise') || userMsgLower.includes('haal')) {
      reply = 'Main theek hoon Sir! Stark systems bilkul ready hain. Aap hukum karein, PC ya phone ka kya kaam karna hai?';
    } else if (userMsgLower.includes('who are you') || userMsgLower.includes('kaun ho')) {
      reply = 'Main J.A.R.V.I.S. hoon, Tony Stark ka banaya hua AI assistant. Main aapke phone aur PC par commands execute karne ke liye ready hoon, Sir.';
    } else {
      reply = 'At your service, Sir. All local defense and system protocols are active. Tell me what to launch or search on your device.';
    }

    return {
      reply: `${reply} ${actionTag}`.trim(),
      searchSources: [],
      timestamp: new Date().toISOString(),
      isFallback: true,
    };
  };

  if (!apiKey) {
    return res.json(generateTacticalFallback());
  }

  // Build contents array
  const parts: any[] = [];
  if (imageBase64) {
    const cleanData = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: imageMimeType || 'image/jpeg',
        data: cleanData,
      },
    });
  }

  let promptWithContext = userText || 'Analyze this visual scan and provide a complete briefing, Sir.';
  if (userContext) {
    promptWithContext = `[Device=${userContext.device || 'Terminal'}, Battery=${userContext.battery || 'Nominal'}]\n${promptWithContext}`;
  }
  parts.push({ text: promptWithContext });

  const conversationContents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-4);
    for (const turn of recent) {
      if (turn.role && turn.content) {
        conversationContents.push({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        });
      }
    }
  }
  conversationContents.push({
    role: 'user',
    parts,
  });

  // Only enable search grounding if explicitly asking for live news/search and not an image query
  const needsWebSearch =
    !imageBase64 &&
    /\b(today|news|weather|current|latest|score|price|taza khabar|aaj ka|khabar)\b/i.test(userText);

  // Multi-tier attempt: Try 3.8-flash -> Try 3.1-flash-lite -> Fallback to local tactical response
  try {
    const config: any = {
      systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
    };
    if (needsWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 4500)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationContents,
      config,
    });

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    const reply = response.text || 'At your service, Sir. All systems nominal.';
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = searchChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Web Reference',
        uri: chunk.web?.uri,
      }))
      .slice(0, 5);

    return res.json({
      reply,
      searchSources,
      timestamp: new Date().toISOString(),
    });
  } catch (primaryErr: any) {
    // Check if error is quota exhaustion (429) or timeout
    const isQuotaOrTimeout =
      primaryErr?.message === 'GEMINI_TIMEOUT' ||
      primaryErr?.status === 429 ||
      primaryErr?.code === 429 ||
      String(primaryErr).includes('429') ||
      String(primaryErr).includes('RESOURCE_EXHAUSTED') ||
      String(primaryErr).includes('quota');

    if (isQuotaOrTimeout) {
      // Rapid check with lightweight gemini-3.1-flash-lite (3.5s timeout)
      try {
        const liteTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('LITE_TIMEOUT')), 3500)
        );
        const litePromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: conversationContents,
          config: {
            systemInstruction: JARVIS_SYSTEM_INSTRUCTION,
          },
        });

        const responseLite = (await Promise.race([litePromise, liteTimeout])) as any;
        const replyLite = responseLite.text || 'At your service, Sir.';
        return res.json({
          reply: replyLite,
          searchSources: [],
          timestamp: new Date().toISOString(),
        });
      } catch (liteErr: any) {
        return res.json(generateTacticalFallback());
      }
    }

    return res.json(generateTacticalFallback());
  }
});

// API: Jarvis Voice Synthesizer (TTS)
app.post('/api/jarvis/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Fenrir' } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt required for speech generation.' });
    }

    if (!apiKey) {
      return res.json({ fallbackNative: true });
    }

    // Limit text length for TTS voice line (first 300 chars for rapid speech)
    const voiceText = text.replace(/[*_#`]/g, '').trim().slice(0, 300);

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: voiceText,
              speechMetadata: {
                style: 'Calm, crisp, sophisticated British AI assistant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Fenrir',
            },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.json({ fallbackNative: true });
    }

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    // If quota 429 or TTS unavailable, tell frontend to use native speech without error
    return res.json({ fallbackNative: true });
  }
});

// Vite Middleware mounting (Dev) or Static files serving (Production)
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> J.A.R.V.I.S. Core running on http://0.0.0.0:${PORT} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
