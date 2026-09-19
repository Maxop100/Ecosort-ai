import mongoose from 'mongoose';
import { WasteRule, User, ScanRecord } from '../src/types';
import { INITIAL_WASTE_RULES } from './waste_rules_seed';

export interface MongoStatusResponse {
  configured: boolean;
  connected: boolean;
  state: 'connected' | 'connecting' | 'disconnected' | 'placeholder_detected' | 'not_configured' | 'error';
  message: string;
  maskedUri?: string;
  clusterHost?: string;
  databaseName?: string;
  ruleCount?: number;
  userCount?: number;
  scanCount?: number;
  lastError?: string;
  advice?: string[];
}

// Mongoose Schemas
const WasteRuleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  itemKeyword: { type: String, required: true },
  category: { type: String, required: true },
  disposalInstruction: { type: String, required: true },
  municipality: { type: String, default: 'general' },
  binColor: { type: String, default: 'blue' },
  specialNotes: { type: String, default: '' },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastScanDate: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  passwordHash: { type: String, required: true }
}, { timestamps: false });

const ScanRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  inputType: { type: String, required: true },
  inputData: { type: String, required: true },
  aiCategory: { type: String, required: true },
  aiConfidence: { type: Number, required: true },
  reasoning: { type: String, required: true },
  disposalInstruction: { type: String, required: true },
  matchedRuleKeyword: { type: String, default: '' },
  matchedRuleMunicipality: { type: String, default: 'general' },
  municipality: { type: String, default: 'general' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: false });

export const WasteRuleModel = mongoose.models.WasteRule || mongoose.model('WasteRule', WasteRuleSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const ScanRecordModel = mongoose.models.ScanRecord || mongoose.model('ScanRecord', ScanRecordSchema);

let lastConnectionError: string | null = null;
let isAttemptingConnection = false;

/**
 * Validate URI format and check for common user mistakes
 */
export function analyzeMongoUri(rawUri?: string): {
  isValidFormat: boolean;
  hasPlaceholder: boolean;
  maskedUri: string;
  host: string;
  dbName: string;
  error?: string;
  advice: string[];
} {
  const uri = rawUri?.trim() || '';
  const advice: string[] = [];

  if (!uri) {
    return {
      isValidFormat: false,
      hasPlaceholder: false,
      maskedUri: '',
      host: '',
      dbName: '',
      error: 'MONGODB_URI is not provided.',
      advice: [
        'Set MONGODB_URI in your environment or Secrets panel.',
        'Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority'
      ]
    };
  }

  // Check for placeholders
  const placeholderRegex = /<username>|<password>|<dbname>|your_username|your_password|cluster0\.xxxxx/i;
  const hasPlaceholder = placeholderRegex.test(uri);
  if (hasPlaceholder) {
    advice.push('Your URI still contains placeholder tags (e.g. "<password>"). Replace them with your actual MongoDB Atlas database username and password.');
  }

  // Check prefix
  const isSrv = uri.startsWith('mongodb+srv://');
  const isStandard = uri.startsWith('mongodb://');
  if (!isSrv && !isStandard) {
    advice.push('The URI must begin with "mongodb+srv://" (for MongoDB Atlas) or "mongodb://" (for standard/local instances).');
  }

  // Extract host and database name safely
  let host = '';
  let dbName = 'ecosort';
  try {
    const afterScheme = uri.split('://')[1] || '';
    const atIndex = afterScheme.indexOf('@');
    if (atIndex !== -1) {
      const hostPart = afterScheme.substring(atIndex + 1).split('/')[0] || '';
      host = hostPart.split('?')[0];
      const afterHost = afterScheme.substring(atIndex + 1).split('/')[1] || '';
      dbName = afterHost.split('?')[0] || 'ecosort';
    } else {
      host = afterScheme.split('/')[0] || '';
    }
  } catch (e) {
    // ignore parse error
  }

  // Check password for special characters that need encoding
  try {
    const afterScheme = uri.split('://')[1] || '';
    const atIndex = afterScheme.indexOf('@');
    if (atIndex !== -1) {
      const authPart = afterScheme.substring(0, atIndex);
      const colonIndex = authPart.indexOf(':');
      if (colonIndex !== -1) {
        const password = authPart.substring(colonIndex + 1);
        if (password.includes('@') || password.includes(':') || password.includes('#') || password.includes('%')) {
          advice.push('Your password contains unencoded special characters (@, :, #, %). You must URL-encode them with encodeURIComponent() (e.g., replace @ with %40).');
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // Mask URI for safe display
  let maskedUri = uri;
  try {
    maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  } catch (e) {
    maskedUri = 'mongodb+srv://***:***@...';
  }

  advice.push('Make sure you have allowed Network Access from anywhere (0.0.0.0/0) in MongoDB Atlas Security settings.');

  return {
    isValidFormat: (isSrv || isStandard) && !hasPlaceholder,
    hasPlaceholder,
    maskedUri,
    host,
    dbName,
    advice
  };
}

/**
 * Connect to MongoDB if MONGODB_URI is provided
 */
export async function initMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.log('ℹ️ MONGODB_URI is not set. Operating in local embedded storage mode.');
    return false;
  }

  const analysis = analyzeMongoUri(uri);
  if (analysis.hasPlaceholder) {
    lastConnectionError = 'MONGODB_URI contains unreplaced placeholder tokens (such as <username> or <password>).';
    console.warn('⚠️ MONGODB_URI has placeholders. Using local embedded database.');
    return false;
  }

  if (isAttemptingConnection || mongoose.connection.readyState === 1) {
    return mongoose.connection.readyState === 1;
  }

  isAttemptingConnection = true;
  try {
    console.log(`Connecting to MongoDB at ${analysis.host}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log(`✅ MongoDB connected successfully to database "${analysis.dbName}".`);
    lastConnectionError = null;

    // Auto-seed if rules collection is empty
    await autoSeedIfEmpty();
    return true;
  } catch (err: any) {
    lastConnectionError = err.message || 'Unknown MongoDB connection error';
    console.error('⚠️ MongoDB connection failed:', lastConnectionError);
    console.log('ℹ️ Falling back seamlessly to local embedded JSON storage.');
    return false;
  } finally {
    isAttemptingConnection = false;
  }
}

/**
 * Automatically seeds 31 municipal waste rules if the MongoDB collection is empty
 */
export async function autoSeedIfEmpty(): Promise<number> {
  if (mongoose.connection.readyState !== 1) return 0;
  try {
    const count = await WasteRuleModel.countDocuments();
    if (count === 0) {
      console.log('MongoDB collection "wasterules" is empty. Auto-seeding 31 municipal rules...');
      const seedDocs = INITIAL_WASTE_RULES.map((r, i) => ({
        id: `rule-${i + 1}`,
        itemKeyword: r.itemKeyword,
        category: r.category,
        disposalInstruction: r.disposalInstruction,
        municipality: r.municipality || 'general',
        binColor: r.binColor || 'blue',
        specialNotes: r.specialNotes || '',
        updatedAt: new Date().toISOString()
      }));
      const inserted = await WasteRuleModel.insertMany(seedDocs);
      console.log(`✅ Auto-seeded ${inserted.length} municipal rules into MongoDB.`);
      return inserted.length;
    }
    return count;
  } catch (e: any) {
    console.error('Error during autoSeedIfEmpty:', e);
    return 0;
  }
}

/**
 * Explicit reseed of MongoDB rules
 */
export async function seedMongoRules(): Promise<{ count: number; error?: string }> {
  if (mongoose.connection.readyState !== 1) {
    return { count: 0, error: 'MongoDB is not currently connected. Check MONGODB_URI.' };
  }
  try {
    await WasteRuleModel.deleteMany({});
    const seedDocs = INITIAL_WASTE_RULES.map((r, i) => ({
      id: `rule-${i + 1}`,
      itemKeyword: r.itemKeyword,
      category: r.category,
      disposalInstruction: r.disposalInstruction,
      municipality: r.municipality || 'general',
      binColor: r.binColor || 'blue',
      specialNotes: r.specialNotes || '',
      updatedAt: new Date().toISOString()
    }));
    const inserted = await WasteRuleModel.insertMany(seedDocs);
    return { count: inserted.length };
  } catch (err: any) {
    return { count: 0, error: err.message || 'Seeding failed' };
  }
}

/**
 * Test a connection to MongoDB without mutating application state
 */
export async function testConnection(targetUri?: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const uri = (targetUri || process.env.MONGODB_URI || '').trim();
  if (!uri) {
    return {
      success: false,
      message: 'No MongoDB URI provided to test. Please supply a connection string.'
    };
  }

  const analysis = analyzeMongoUri(uri);
  if (analysis.hasPlaceholder) {
    return {
      success: false,
      message: 'URI contains placeholder values like <username> or <password>. Replace them with real database user credentials.',
      details: { advice: analysis.advice }
    };
  }

  if (!analysis.isValidFormat) {
    return {
      success: false,
      message: 'Invalid URI format. Expected mongodb+srv://... or mongodb://...',
      details: { advice: analysis.advice }
    };
  }

  // Create an isolated connection to test
  try {
    const testConn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000
    }).asPromise();

    const collections = await testConn.db?.listCollections().toArray() || [];
    await testConn.close();

    return {
      success: true,
      message: `Connection successful! Connected to cluster at "${analysis.host}" (Database: "${analysis.dbName}"). Found ${collections.length} collections.`,
      details: {
        host: analysis.host,
        dbName: analysis.dbName,
        collectionsCount: collections.length
      }
    };
  } catch (err: any) {
    const errMsg = err.message || 'Failed to connect to MongoDB cluster';
    let hint = 'Check network access and credentials.';

    if (errMsg.includes('bad auth') || errMsg.includes('Authentication failed')) {
      hint = 'Authentication failed: Verify your database username and password in MongoDB Atlas (Database Access tab). If your password has special characters, encode them with encodeURIComponent().';
    } else if (errMsg.includes('querySrv ENOTFOUND') || errMsg.includes('getaddrinfo ENOTFOUND')) {
      hint = 'DNS lookup failed: Check that the cluster host in the URI is spelled correctly (e.g. cluster0.xxxxx.mongodb.net).';
    } else if (errMsg.includes('whitelist') || errMsg.includes('timed out') || errMsg.includes('ETIMEDOUT')) {
      hint = 'Connection timed out: In MongoDB Atlas, go to "Network Access" and click "Add IP Address" -> select "Allow Access From Anywhere" (0.0.0.0/0).';
    }

    return {
      success: false,
      message: `Connection test failed: ${errMsg}`,
      details: {
        hint,
        advice: analysis.advice
      }
    };
  }
}

/**
 * Get overall MongoDB status
 */
export async function getMongoStatus(): Promise<MongoStatusResponse> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    return {
      configured: false,
      connected: false,
      state: 'not_configured',
      message: 'MONGODB_URI is not set. EcoSort is currently running on the high-performance local embedded JSON database.',
      advice: [
        'To persist data to MongoDB Atlas, add MONGODB_URI in Settings > Secrets or in your .env file.',
        'Format: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecosort?retryWrites=true&w=majority'
      ]
    };
  }

  const analysis = analyzeMongoUri(uri);
  if (analysis.hasPlaceholder) {
    return {
      configured: true,
      connected: false,
      state: 'placeholder_detected',
      message: 'MONGODB_URI contains unconfigured placeholder values (e.g. "<password>").',
      maskedUri: analysis.maskedUri,
      clusterHost: analysis.host,
      advice: analysis.advice
    };
  }

  const isConnected = mongoose.connection.readyState === 1;

  if (isConnected) {
    let ruleCount = 0;
    let userCount = 0;
    let scanCount = 0;
    try {
      ruleCount = await WasteRuleModel.countDocuments();
      userCount = await UserModel.countDocuments();
      scanCount = await ScanRecordModel.countDocuments();
    } catch (e) {
      // ignore
    }

    return {
      configured: true,
      connected: true,
      state: 'connected',
      message: `Connected to MongoDB Atlas database "${analysis.dbName}".`,
      maskedUri: analysis.maskedUri,
      clusterHost: analysis.host,
      databaseName: analysis.dbName,
      ruleCount,
      userCount,
      scanCount,
      advice: [
        'Your MongoDB database is active and synchronized.',
        'New waste scans, user accounts, and municipal rule edits are persisted in your MongoDB collection.'
      ]
    };
  }

  return {
    configured: true,
    connected: false,
    state: lastConnectionError ? 'error' : 'disconnected',
    message: lastConnectionError || 'Could not connect to MongoDB Atlas cluster. Using local embedded database.',
    maskedUri: analysis.maskedUri,
    clusterHost: analysis.host,
    lastError: lastConnectionError || undefined,
    advice: analysis.advice
  };
}
