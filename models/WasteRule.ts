/**
 * Mongoose Schema definition for WasteRule
 */
export interface IWasteRule {
  itemKeyword: string;
  category: string;
  disposalInstruction: string;
  municipality: string;
  binColor?: string;
  specialNotes?: string;
  updatedAt?: Date;
}

export const WasteRuleSchemaDefinition = {
  itemKeyword: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ['recyclable', 'organic', 'e-waste', 'hazardous', 'general', 'general-waste'],
    required: true
  },
  disposalInstruction: { type: String, required: true },
  municipality: { type: String, default: 'general' },
  binColor: { type: String },
  specialNotes: { type: String },
  updatedAt: { type: Date, default: Date.now }
};
