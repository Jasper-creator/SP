export type UserId = 'jasper' | 'senja';

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  category: string;
  done: boolean;
  addedBy: UserId;
  addedAt: number;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  category: string;
  time: string;
  ingredients: string[];
  instructions: string;
  addedBy: UserId;
  addedAt: number;
}

export interface TreffitProposal {
  id: string;
  label: string;
  emoji: string;
  proposedBy: UserId;
  proposedAt: number;
  status: 'pending' | 'confirmed' | 'declined';
}

export interface AppNotification {
  id: string;
  to: UserId;
  message: string;
  type: 'treffit' | 'kauppalista' | 'ruoka' | 'general';
  from: UserId;
  createdAt: number;
  read: Partial<Record<UserId, boolean>>;
  treffitTimestamp?: number;
}

export interface ListItem {
  id: string;
  name: string;
  emoji: string;
  addedBy: UserId;
  addedAt: number;
}
