/**
 * Mongoose Schema definition for User
 */
export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role?: 'user' | 'admin';
  points?: number;
  streak?: number;
  lastScanDate?: Date;
  createdAt?: Date;
}

export const UserSchemaDefinition = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 1 },
  lastScanDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
};
