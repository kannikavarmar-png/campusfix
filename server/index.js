import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeCampusIssue, answerCampusQuestion } from './services/gemini.js';
import { getServerSupabaseClient } from './services/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CampusFix AI API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    supabaseConfigured: Boolean(
      (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim() &&
        (
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.SUPABASE_ANON_KEY ||
          process.env.VITE_SUPABASE_ANON_KEY
        )?.trim()
    ),
  });
});

// Public aggregate statistics from live Supabase DB (zero PII exposed)
app.get('/api/stats', async (_req, res) => {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return res.json({ source: 'unconfigured', stats: null });
  }

  try {
    const { data, error } = await supabase.rpc('get_public_campus_stats');
    if (error) {
      return res.status(502).json({
        error: 'Could not retrieve public statistics from Supabase.',
        details: error.message,
      });
    }

    const total = Number(data?.total || 0);
    const pending = Number(data?.pending || 0);
    const inProgress = Number(data?.in_progress || 0);
    const resolved = Number(data?.resolved || 0);
    const highPriority = Number(data?.high_priority || 0);

    return res.json({
      source: 'supabase',
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        highPriority,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Secure server-side AI Issue Detection (Image + Text -> Structured JSON)
app.post('/api/ai/analyze', async (req, res) => {
  const { description, location, building, floorRoom, imageDataUrl } = req.body || {};

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      error: 'Please provide an issue description (at least 5 characters) before AI analysis.',
    });
  }

  try {
    const analysis = await analyzeCampusIssue({
      description: description.trim(),
      location,
      building,
      floorRoom,
      imageDataUrl,
    });
    return res.json({ analysis });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      code: err.code || 'AI_ERROR',
      error:
        err.message ||
        'AI analysis failed. Please select the maintenance category manually to submit.',
    });
  }
});

// Grounded CampusFix Assistant Chatbot
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  try {
    const result = await answerCampusQuestion({
      message: message.trim().slice(0, 1000),
      history: Array.isArray(history) ? history : [],
    });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'CampusFix Assistant is temporarily unavailable.',
    });
  }
});

// Serve built frontend in production (or whenever dist/ exists)
const distDir = path.resolve(__dirname, '..', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile('index.html', { root: distDir });
    }
    return next();
  });
}

app.listen(PORT, () => {
  console.log(`CampusFix AI API running at http://localhost:${PORT}`);
});
