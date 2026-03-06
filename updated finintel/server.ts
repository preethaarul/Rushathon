import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/lib/db.ts';
import { hashPassword, comparePassword, generateToken, verifyToken } from './src/lib/auth.ts';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Auth Middleware
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Verify user exists in DB to prevent foreign key issues with stale tokens
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists. Please log in again.' });
  }

  (req as any).userId = decoded.userId;
  next();
};

// --- API Routes ---

// Auth
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
    const token = generateToken(Number(result.lastInsertRowid));
    res.json({ token, user: { id: Number(result.lastInsertRowid), name, email } });
  } catch (error: any) {
    res.status(400).json({ error: error.message.includes('UNIQUE') ? 'Email already exists' : 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(Number(user.id));
  res.json({ token, user: { id: Number(user.id), name: user.name, email: user.email } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Transactions
app.get('/api/transactions', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC').all(userId);
  res.json(transactions);
});

app.post('/api/transactions', authenticate, (req, res) => {
  const userId = Number((req as any).userId);
  const { amount, type, category, date, description } = req.body;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Invalid user ID' });
  }

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const result = db.prepare('INSERT INTO transactions (user_id, amount, type, category, date, description) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, amount, type, category, date, description);
    res.json({ 
      id: Number(result.lastInsertRowid), 
      userId, 
      amount, 
      type, 
      category, 
      date, 
      description 
    });
  } catch (error: any) {
    console.error(`Transaction creation failed for user ${userId}:`, error);
    res.status(500).json({ error: `Failed to create transaction: ${error.message}` });
  }
});

app.delete('/api/transactions/:id', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, userId);
  res.json({ success: true });
});

// Goals
app.get('/api/goals', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(userId);
  res.json(goals);
});

app.post('/api/goals', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { title, target_amount, deadline } = req.body;
  try {
    const result = db.prepare('INSERT INTO goals (user_id, title, target_amount, deadline) VALUES (?, ?, ?, ?)')
      .run(userId, title, target_amount, deadline);
    res.json({ id: Number(result.lastInsertRowid), userId, title, target_amount, deadline, current_saved: 0 });
  } catch (error: any) {
    console.error('Goal creation failed:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

app.patch('/api/goals/:id', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { current_saved } = req.body;
  db.prepare('UPDATE goals SET current_saved = ? WHERE id = ? AND user_id = ?').run(current_saved, id, userId);
  res.json({ success: true });
});

// ML Prediction
app.get('/api/predict-expenses', authenticate, (req, res) => {
  const userId = (req as any).userId;
  const transactions = db.prepare("SELECT amount, date FROM transactions WHERE user_id = ? AND type = 'expense' ORDER BY date ASC").all(userId) as any[];

  if (transactions.length < 3) {
    return res.json({ predicted: 0, confidence: 0, message: "Need more data for prediction" });
  }

  // Simple Linear Regression: y = mx + b
  // x = index of month, y = total expense of that month
  const monthlyExpenses: { [key: string]: number } = {};
  transactions.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
  });

  const data = Object.values(monthlyExpenses);
  if (data.length < 2) {
      return res.json({ predicted: data[0] || 0, confidence: 0.5, message: "Limited data for prediction" });
  }

  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const predicted = slope * n + intercept;
  const confidence = Math.min(0.95, 0.5 + (n * 0.05)); // Simple confidence heuristic

  res.json({ 
    predicted: Math.max(0, Math.round(predicted)), 
    confidence,
    history: Object.entries(monthlyExpenses).map(([month, amount]) => ({ month, amount }))
  });
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
