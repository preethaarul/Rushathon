export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_saved: number;
  deadline: string;
}

export interface AIInsights {
  insights: string[];
  healthScore: number;
}

export interface Prediction {
  predicted: number;
  confidence: number;
  message?: string;
  history?: { month: string; amount: number }[];
}
