export type WasteCategory = 'recyclable' | 'organic' | 'e-waste' | 'hazardous' | 'general' | 'general-waste';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  streak: number;
  lastScanDate?: string;
  createdAt: string;
}

export interface WasteRule {
  id: string;
  itemKeyword: string;
  category: WasteCategory;
  disposalInstruction: string;
  municipality: string;
  binColor?: string;
  specialNotes?: string;
  updatedAt: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  userName?: string;
  inputType: 'image' | 'text';
  inputData: string; // Base64 data URL or text snippet
  aiCategory: WasteCategory;
  aiConfidence: number; // 0 to 1
  reasoning: string;
  disposalInstruction: string;
  matchedRuleKeyword?: string;
  matchedRuleMunicipality?: string;
  municipality: string;
  createdAt: string;
}

export interface ScanResultResponse {
  record: ScanRecord;
  pointsEarned: number;
  currentStreak: number;
  totalPoints: number;
  co2SavedKg: number;
  matchedRule?: WasteRule | null;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  progress: number;
  goal: number;
}

export interface UpcycleIdea {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Creative Pro';
  timeEstimate: string;
  toolsNeeded: string[];
  instructions: string[];
  co2SavingsEstimate: string;
  practicalUse: string;
}

export interface DropOffLocation {
  id: string;
  name: string;
  municipality: string;
  address: string;
  acceptedCategories: WasteCategory[];
  hours: string;
  notes: string;
  phone?: string;
  isSpecializedHazardous?: boolean;
}

export interface DecompositionStats {
  yearsToDecompose: number; // e.g. 450, 0.05 for organic
  displayTime: string; // e.g. "450 Years", "2-4 Weeks"
  landfillMethaneKg: number;
  recyclingEnergySavedPercent: number;
  toxicityRisk: 'Low' | 'Moderate' | 'Severe';
  oceanPollutionRisk: 'Low' | 'High' | 'Critical';
  funFact: string;
}

export interface SystemStats {
  totalScans: number;
  recycledCount: number;
  organicCount: number;
  eWasteCount: number;
  hazardousCount: number;
  generalCount: number;
  totalCo2SavedKg: number;
  totalLandfillSparedLiters: number;
  activeUsersCount: number;
}
