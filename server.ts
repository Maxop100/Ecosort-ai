import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserStats,
  hashPassword,
  getAllWasteRules,
  createWasteRule,
  updateWasteRule,
  deleteWasteRule,
  resetRulesToSeed,
  getAllScans,
  getUserScans,
  saveScanRecord,
  deleteScanRecord,
  getSystemStats
} from './server/db';
import { getMongoStatus, testConnection, seedMongoRules } from './server/mongodb';
import { classifyWasteItem, generateRagDisposalGuidance, generateUpcycleIdeas } from './server/ai';
import { MUNICIPAL_DROPOFF_LOCATIONS } from './server/dropoff_data';
import { retrieveClosestWasteRule } from './server/rag';
import { WasteCategory } from './src/types';

// Initialize embedded persistent database
initDatabase();

const app = express();
const PORT = 3000;

// Security & HTTPS enforcement behind reverse proxies (Cloud Run / Nginx)
app.use((req: Request, res: Response, next) => {
  // Enforce HTTPS if behind reverse proxy
  const proto = req.headers['x-forwarded-proto'];
  if (proto && proto !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  // Set standard modern security & Core Web Vitals caching headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware for JSON parsing with large limits for image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Explicit routes for robots.txt and sitemap.xml with proper content-type
app.get('/robots.txt', (req: Request, res: Response) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.type('text/plain').sendFile(robotsPath);
  } else {
    res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n');
  }
});

app.get(['/sitemap.xml', '/site.xml'], (req: Request, res: Response) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.type('application/xml').sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

// Helper to extract authenticated user from header
function getAuthUser(req: Request) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return null;
  return findUserById(userId) || null;
}

/* ========================================================================= */
/* API ROUTES                                                                */
/* ========================================================================= */

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EcoSort API',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Gemini 3.8 Flash' : 'Heuristic Fallback'
  });
});

// 2. Auth Routes
app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const user = createUser(name.trim(), email.trim().toLowerCase(), password);
    res.status(201).json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Could not register user.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const userWithHash = findUserByEmail(email.trim().toLowerCase());
    if (!userWithHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const providedHash = hashPassword(password);
    if (providedHash !== userWithHash.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { passwordHash, ...user } = userWithHash;
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

// 3. Scan & Classification API with RAG
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { inputType, inputData, municipality = 'general' } = req.body;

    if (!inputType || !inputData) {
      return res.status(400).json({ error: 'inputType (image/text) and inputData are required.' });
    }

    const authUser = getAuthUser(req);
    const userId = authUser ? authUser.id : 'guest-user';
    const userName = authUser ? authUser.name : 'Guest User';

    // Step 1: Call AI Classification (using Claude/Gemini with Prompt Template 1)
    const classification = await classifyWasteItem(inputType, inputData);

    // Step 2: RAG Knowledge Base Retrieval
    const searchTarget = classification.identifiedItem || (inputType === 'text' ? inputData : 'item');
    const matchedRule = retrieveClosestWasteRule(searchTarget, classification.category, municipality);

    // Step 3: Call AI RAG Guidance generation (Prompt Template 2)
    const disposalInstruction = await generateRagDisposalGuidance(
      classification.category,
      matchedRule,
      searchTarget
    );

    // Step 4: Persist ScanRecord to Database
    const record = saveScanRecord({
      userId,
      userName,
      inputType,
      inputData: inputType === 'image' ? (inputData.length > 500 ? inputData.substring(0, 500) + '...[image]' : inputData) : inputData,
      aiCategory: classification.category,
      aiConfidence: classification.confidence,
      reasoning: classification.reasoning,
      disposalInstruction,
      matchedRuleKeyword: matchedRule.itemKeyword,
      matchedRuleMunicipality: matchedRule.municipality,
      municipality
    });

    // Step 5: Gamification & Streak update
    let pointsEarned = 15;
    if (classification.category === 'hazardous') pointsEarned = 25; // Extra bonus for hazardous diversion
    if (classification.category === 'e-waste') pointsEarned = 20;

    let currentStreak = 1;
    let totalPoints = 15;

    if (authUser) {
      const stats = updateUserStats(authUser.id, pointsEarned);
      currentStreak = stats.streak;
      totalPoints = stats.totalPoints;
    }

    const co2SavedKg = classification.category === 'recyclable' ? 0.28 : classification.category === 'organic' ? 0.16 : 0.5;

    res.json({
      record: {
        ...record,
        // include full inputData for immediate client UI rendering
        inputData
      },
      pointsEarned,
      currentStreak,
      totalPoints,
      co2SavedKg,
      matchedRule
    });
  } catch (err: any) {
    console.error('Scan processing error:', err);
    res.status(500).json({ error: err.message || 'Failed to process waste scan.' });
  }
});

// 4. User Scan History
app.get('/api/history', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (authUser) {
    const userScans = getUserScans(authUser.id);
    return res.json({ scans: userScans });
  }
  // Return recent community/guest scans
  const all = getAllScans().slice(0, 20);
  res.json({ scans: all });
});

app.delete('/api/history/:id', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const { id } = req.params;
  const deleted = deleteScanRecord(id, authUser?.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Scan record not found or not permitted.' });
  }
  res.json({ success: true });
});

// 5. Admin Municipal Waste Rules CRUD (Protects against hardcoding)
app.get(['/api/admin/rules', '/api/rules'], (req: Request, res: Response) => {
  const rules = getAllWasteRules();
  res.json({ rules });
});

app.post('/api/admin/rules', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  // Allow authorized users or admin
  const { itemKeyword, category, disposalInstruction, municipality = 'general', binColor, specialNotes } = req.body;

  if (!itemKeyword || !category || !disposalInstruction) {
    return res.status(400).json({ error: 'itemKeyword, category, and disposalInstruction are required.' });
  }

  const validCategories: WasteCategory[] = ['recyclable', 'organic', 'e-waste', 'hazardous', 'general'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category. Must be recyclable, organic, e-waste, hazardous, or general.' });
  }

  const newRule = createWasteRule({
    itemKeyword: itemKeyword.trim(),
    category,
    disposalInstruction: disposalInstruction.trim(),
    municipality: municipality.trim(),
    binColor: binColor || (category === 'recyclable' ? 'blue' : category === 'organic' ? 'green' : category === 'hazardous' ? 'red' : category === 'e-waste' ? 'yellow' : 'black'),
    specialNotes: specialNotes?.trim()
  });

  res.status(201).json({ rule: newRule });
});

app.put('/api/admin/rules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = updateWasteRule(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Waste rule not found.' });
  }
  res.json({ rule: updated });
});

app.delete('/api/admin/rules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = deleteWasteRule(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Waste rule not found.' });
  }
  res.json({ success: true });
});

app.post('/api/admin/rules/reset-seed', (req: Request, res: Response) => {
  const rules = resetRulesToSeed();
  res.json({ message: 'Waste rules reset to seed catalog successfully.', rulesCount: rules.length });
});

// 6. MongoDB Database Integration & Diagnostics
app.get('/api/admin/mongodb/status', async (req: Request, res: Response) => {
  const status = await getMongoStatus();
  res.json({ status });
});

app.post('/api/admin/mongodb/test', async (req: Request, res: Response) => {
  const { uri } = req.body || {};
  const result = await testConnection(uri);
  res.json(result);
});

app.post('/api/admin/mongodb/seed', async (req: Request, res: Response) => {
  const result = await seedMongoRules();
  res.json(result);
});

// 7. Overall System & Community Impact Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const stats = getSystemStats();
  res.json({ stats });
});

// 8. AI Upcycling & Circular Economy Studio
app.post('/api/upcycle', async (req: Request, res: Response) => {
  try {
    const { itemDescription, category } = req.body || {};
    if (!itemDescription) {
      return res.status(400).json({ error: 'itemDescription is required.' });
    }
    const ideas = await generateUpcycleIdeas(itemDescription, category || 'general');
    res.json({ ideas });
  } catch (err: any) {
    console.error('Error generating upcycling ideas:', err);
    res.status(500).json({ error: 'Failed to generate upcycling ideas.' });
  }
});

// 9. Municipal Specialized Drop-off Centers Directory
app.get('/api/dropoff-locations', (req: Request, res: Response) => {
  const { municipality, category } = req.query;
  let locations = [...MUNICIPAL_DROPOFF_LOCATIONS];

  if (municipality && typeof municipality === 'string' && municipality !== 'all') {
    locations = locations.filter(
      (loc) =>
        loc.municipality.toLowerCase() === municipality.toLowerCase() ||
        loc.municipality === 'general'
    );
  }

  if (category && typeof category === 'string') {
    locations = locations.filter((loc) =>
      loc.acceptedCategories.includes(category as WasteCategory)
    );
  }

  res.json({ locations });
});

/* ========================================================================= */
/* VITE MIDDLEWARE & SERVER STARTUP                                          */
/* ========================================================================= */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const candidatePath = path.join(process.cwd(), 'dist');
    const distPath = fs.existsSync(candidatePath) ? candidatePath : __dirname;
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoSort full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
