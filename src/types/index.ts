
import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  // other profile fields
};

export type Benefit = {
  id: string; // Unique ID for benefit, can be generated client-side before save
  storeName: string;
  benefitPercentage: number;
  category?: string; // e.g., Groceries, Gas, Travel
  description?: string;
};

export type CreditCard = {
  id: string; // Firestore document ID
  name: string;
  issuer?: string; // e.g., Chase, Amex
  description?: string;
  imageUrl?: string;
  benefits: Benefit[];
  annualFee?: number;
  addedBy: string; // User UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Firestore data will use Timestamp, but client-side objects might use Date.
// This version is for data fetched from Firestore.
export type CreditCardData = Omit<CreditCard, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};


export type SpendingCategory = 'Groceries' | 'Gas' | 'Dining' | 'Travel' | 'Shopping' | 'Entertainment' | 'Utilities' | 'Other';

export const spendingCategories: SpendingCategory[] = ['Groceries', 'Gas', 'Dining', 'Travel', 'Shopping', 'Entertainment', 'Utilities', 'Other'];

export type UserSpending = {
  id: string; // Firestore document ID
  userId: string; // User UID
  category: SpendingCategory;
  amount: number;
  date: Timestamp; // Store as Firestore Timestamp
  description?: string;
  cardId?: string; // Optional: link to specific card used
  createdAt: Timestamp;
};

// For AI suggestions, matching the schema from suggest-cards.ts
export type AISuggestedCardRaw = {
  cardName: string;
  benefits: string; 
  storeAssociations: string;
};

export type AISuggestedCard = {
  id: string; // Can be generated or use a hash
  name: string;
  rawBenefits: string;
  rawStoreAssociations: string;
  // Potentially parsed benefits/associations later
};
