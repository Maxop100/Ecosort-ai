import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, ScanRecord, WasteRule, SystemStats } from '../src/types';
import { INITIAL_WASTE_RULES } from './waste_rules_seed';
import { initMongo, WasteRuleModel, UserModel, ScanRecordModel } from './mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RULES_FILE = path.join(DATA_DIR, 'waste_rules.json');
const SCANS_FILE = path.join(DATA_DIR, 'scans.json');

// In-memory memory structures
let users: User[] = [];
let rules: WasteRule[] = [];
let scans: ScanRecord[] = [];

// Helper password hasher
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_ecosort_salt_2026').digest('hex');
}

// Initial default users
const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-demo-1',
    name: 'Eco Citizen (Demo)',
    email: 'demo@ecosort.org',
    role: 'user',
    points: 85,
    streak: 4,
    lastScanDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    passwordHash: hashPassword('password123')
  },
  {
    id: 'user-admin-1',
    name: 'Municipal Admin',
    email: 'admin@ecosort.org',
    role: 'admin',
    points: 240,
    streak: 12,
    lastScanDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    passwordHash: hashPassword('admin123')
  }
];

// Initial default scans for demo user to showcase history immediately
const DEFAULT_SCANS: ScanRecord[] = [
  {
    id: 'scan-init-1',
    userId: 'user-demo-1',
    userName: 'Eco Citizen (Demo)',
    inputType: 'text',
    inputData: 'Empty aluminum sparkling water can',
    aiCategory: 'recyclable',
    aiConfidence: 0.98,
    reasoning: 'Aluminum is an infinitely recyclable metal that does not degrade in quality through remelting cycles.',
    disposalInstruction: 'Empty and rinse remaining liquids. Place in the blue recycling bin.',
    matchedRuleKeyword: 'aluminum can, soda can',
    matchedRuleMunicipality: 'general',
    municipality: 'general',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'scan-init-2',
    userId: 'user-demo-1',
    userName: 'Eco Citizen (Demo)',
    inputType: 'text',
    inputData: 'Swollen phone lithium battery',
    aiCategory: 'hazardous',
    aiConfidence: 0.96,
    reasoning: 'Swollen lithium-ion cells pose severe thermal runaway and spontaneous ignition hazards under mechanical compaction.',
    disposalInstruction: 'CRITICAL FIRE HAZARD: Never throw into household trash. Tape terminals and drop at municipal hazardous e-waste kiosk.',
    matchedRuleKeyword: 'lithium battery, phone battery',
    matchedRuleMunicipality: 'general',
    municipality: 'general',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'scan-init-3',
    userId: 'user-demo-1',
    userName: 'Eco Citizen (Demo)',
    inputType: 'text',
    inputData: 'Banana peels and coffee grounds',
    aiCategory: 'organic',
    aiConfidence: 0.99,
    reasoning: 'Decomposable nitrogen- and carbon-rich organic biomass suitable for aerobic composting or municipal anaerobic digesters.',
    disposalInstruction: 'Deposit into the green wet/organic waste bin loose or in certified compostable paper.',
    matchedRuleKeyword: 'banana peel, coffee grounds',
    matchedRuleMunicipality: 'general',
    municipality: 'general',
    createdAt: new Date().toISOString()
  }
];

// Load from disk or initialize
export function initDatabase() {
  try {
    if (fs.existsSync(RULES_FILE)) {
      const data = fs.readFileSync(RULES_FILE, 'utf-8');
      rules = JSON.parse(data);
    } else {
      resetRulesToSeed();
    }

    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      users = JSON.parse(data);
    } else {
      users = DEFAULT_USERS;
      saveUsers();
    }

    if (fs.existsSync(SCANS_FILE)) {
      const data = fs.readFileSync(SCANS_FILE, 'utf-8');
      scans = JSON.parse(data);
    } else {
      scans = DEFAULT_SCANS;
      saveScans();
    }

    console.log(`Database ready. Rules: ${rules.length}, Users: ${users.length}, Scans: ${scans.length}`);
  } catch (err) {
    console.error('Failed to init DB, resetting to defaults:', err);
    resetRulesToSeed();
    users = DEFAULT_USERS;
    scans = DEFAULT_SCANS;
  }

  // Attempt connection to MongoDB Atlas if MONGODB_URI is provided
  initMongo().catch((err) => {
    console.warn('MongoDB background initialization error:', err?.message);
  });
}

export function resetRulesToSeed(): WasteRule[] {
  rules = INITIAL_WASTE_RULES.map((r, i) => ({
    ...r,
    id: `rule-${i + 1}`,
    updatedAt: new Date().toISOString()
  }));
  saveRules();
  return rules;
}

function saveRules() {
  try {
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving rules:', e);
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

function saveScans() {
  try {
    fs.writeFileSync(SCANS_FILE, JSON.stringify(scans, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving scans:', e);
  }
}

// User methods
export function findUserByEmail(email: string): (User & { passwordHash: string }) | undefined {
  return (users as (User & { passwordHash: string })[]).find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function createUser(name: string, email: string, passwordPlain: string, role: 'user' | 'admin' = 'user'): User {
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }
  const newUser: User & { passwordHash: string } = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    email,
    role,
    points: 10,
    streak: 1,
    lastScanDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(passwordPlain)
  };
  users.push(newUser);
  saveUsers();
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    points: newUser.points,
    streak: newUser.streak,
    lastScanDate: newUser.lastScanDate,
    createdAt: newUser.createdAt
  };
}

export function updateUserStats(userId: string, pointsGained: number): { streak: number; totalPoints: number } {
  const user = users.find(u => u.id === userId);
  if (!user) return { streak: 1, totalPoints: 10 };

  const now = new Date();
  const lastScan = user.lastScanDate ? new Date(user.lastScanDate) : null;

  if (lastScan) {
    const diffHours = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60);
    if (diffHours >= 20 && diffHours <= 48) {
      user.streak = (user.streak || 0) + 1;
    } else if (diffHours > 48) {
      user.streak = 1;
    }
  } else {
    user.streak = 1;
  }

  user.points = (user.points || 0) + pointsGained;
  user.lastScanDate = now.toISOString();
  saveUsers();
  return { streak: user.streak, totalPoints: user.points };
}

// WasteRule methods
export function getAllWasteRules(): WasteRule[] {
  return [...rules];
}

export function getWasteRuleById(id: string): WasteRule | undefined {
  return rules.find(r => r.id === id);
}

export function createWasteRule(ruleData: Omit<WasteRule, 'id' | 'updatedAt'>): WasteRule {
  const newRule: WasteRule = {
    ...ruleData,
    id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    updatedAt: new Date().toISOString()
  };
  rules.unshift(newRule);
  saveRules();

  // Async sync to MongoDB
  WasteRuleModel.create(newRule).catch((err: any) => {
    // Silently ignore if mongo not connected
  });

  return newRule;
}

export function updateWasteRule(id: string, updates: Partial<WasteRule>): WasteRule | null {
  const index = rules.findIndex(r => r.id === id);
  if (index === -1) return null;
  rules[index] = {
    ...rules[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveRules();

  // Async sync to MongoDB
  WasteRuleModel.updateOne({ id }, { $set: { ...updates, updatedAt: rules[index].updatedAt } }).catch(() => {});

  return rules[index];
}

export function deleteWasteRule(id: string): boolean {
  const initialLen = rules.length;
  rules = rules.filter(r => r.id !== id);
  if (rules.length !== initialLen) {
    saveRules();
    // Async sync to MongoDB
    WasteRuleModel.deleteOne({ id }).catch(() => {});
    return true;
  }
  return false;
}

// ScanRecord methods
export function getAllScans(): ScanRecord[] {
  return [...scans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUserScans(userId: string): ScanRecord[] {
  return scans
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveScanRecord(recordData: Omit<ScanRecord, 'id' | 'createdAt'>): ScanRecord {
  const newRecord: ScanRecord = {
    ...recordData,
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString()
  };
  scans.unshift(newRecord);
  saveScans();

  // Async sync to MongoDB
  ScanRecordModel.create(newRecord).catch(() => {});

  return newRecord;
}

export function deleteScanRecord(id: string, userId?: string): boolean {
  const initialLen = scans.length;
  scans = scans.filter(s => {
    if (s.id !== id) return true;
    if (userId && s.userId !== userId) return true; // prevent unauthorized delete
    return false;
  });
  if (scans.length !== initialLen) {
    saveScans();
    // Async sync to MongoDB
    ScanRecordModel.deleteOne({ id }).catch(() => {});
    return true;
  }
  return false;
}

export function getSystemStats(): SystemStats {
  const totalScans = scans.length;
  const recycledCount = scans.filter(s => s.aiCategory === 'recyclable').length;
  const organicCount = scans.filter(s => s.aiCategory === 'organic').length;
  const eWasteCount = scans.filter(s => s.aiCategory === 'e-waste').length;
  const hazardousCount = scans.filter(s => s.aiCategory === 'hazardous').length;
  const generalCount = scans.filter(s => s.aiCategory === 'general').length;

  // Approximate metrics:
  // Recycled item ~0.25kg CO2 saved, Organic ~0.15kg CO2 avoided from methane
  const totalCo2SavedKg = Math.round((recycledCount * 0.28 + organicCount * 0.16 + eWasteCount * 0.5) * 10) / 10;
  // Landfill saved approx ~1.2 liters per item diverted
  const totalLandfillSparedLiters = Math.round((recycledCount + organicCount + eWasteCount + hazardousCount) * 1.5);

  return {
    totalScans,
    recycledCount,
    organicCount,
    eWasteCount,
    hazardousCount,
    generalCount,
    totalCo2SavedKg,
    totalLandfillSparedLiters,
    activeUsersCount: Math.max(users.length, 1)
  };
}
