/**
 * Mongoose Schema definition for ScanRecord
 */
export interface IScanRecord {
  userId: string;
  inputType: 'image' | 'text';
  inputData: string;
  aiCategory: string;
  aiConfidence: number;
  disposalInstruction: string;
  reasoning?: string;
  matchedRuleKeyword?: string;
  municipality?: string;
  createdAt?: Date;
}

export const ScanRecordSchemaDefinition = {
  userId: { type: String, required: true, ref: 'User' },
  inputType: { type: String, enum: ['image', 'text'], required: true },
  inputData: { type: String, required: true },
  aiCategory: { type: String, required: true },
  aiConfidence: { type: Number, required: true },
  disposalInstruction: { type: String, required: true },
  reasoning: { type: String },
  matchedRuleKeyword: { type: String },
  municipality: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
};
