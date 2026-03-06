import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Goals from './components/Goals';
import AIChat from './components/AIChat';
import Auth from './components/Auth';
import { api } from './lib/api';
import { geminiService } from './services/geminiService';
import { User, Transaction, Goal, AIInsights, Prediction } from './types';
import { Loader2 } from 'lucide-react';
import { cn } from './components/ui/Base';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.auth.me();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Initial auth check failed', error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [txs, gds, pred] = await Promise.all([
        api.transactions.getAll(),
        api.goals.getAll(),
        api.prediction.get()
      ]);
      setTransactions(txs);
      setGoals(gds);
      setPrediction(pred);

      // Fetch insights from Gemini directly
      const ins = await geminiService.getInsights(txs);
      setInsights(ins);
    } catch (error: any) {
      console.error('Failed to fetch data', error);
      if (error.message.includes('User no longer exists') || error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        handleLogout();
      }
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    if (res.error) throw new Error(res.error);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const handleSignup = async (name: string, email: string, pass: string) => {
    const res = await api.auth.signup({ name, email, password: pass });
    if (res.error) throw new Error(res.error);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleAddTransaction = async (data: any) => {
    try {
      await api.transactions.create(data);
      fetchData();
    } catch (error: any) {
      if (error.message.includes('User no longer exists') || error.message.includes('Unauthorized')) {
        handleLogout();
      }
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await api.transactions.delete(id);
      fetchData();
    } catch (error: any) {
      if (error.message.includes('User no longer exists') || error.message.includes('Unauthorized')) {
        handleLogout();
      }
    }
  };

  const handleAddGoal = async (data: any) => {
    try {
      await api.goals.create(data);
      fetchData();
    } catch (error: any) {
      if (error.message.includes('User no longer exists') || error.message.includes('Unauthorized')) {
        handleLogout();
      }
    }
  };

  const handleUpdateGoal = async (id: number, saved: number) => {
    try {
      await api.goals.update(id, { current_saved: saved });
      fetchData();
    } catch (error: any) {
      if (error.message.includes('User no longer exists') || error.message.includes('Unauthorized')) {
        handleLogout();
      }
    }
  };

  const handleSendMessage = async (msg: string) => {
    return await geminiService.chat(msg, transactions, goals);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="flex min-h-screen bg-[#030014] text-white selection:bg-violet-500/30 font-sans">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        userName={user.name}
      />

      <main className="flex-1 h-screen overflow-y-auto p-8 relative z-10">
        <div className={cn(
          "mx-auto transition-all duration-500",
          activeTab === 'chat' ? "max-w-7xl" : "max-w-6xl"
        )}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              transactions={transactions} 
              insights={insights} 
              prediction={prediction} 
            />
          )}
          {activeTab === 'transactions' && (
            <Transactions 
              transactions={transactions} 
              onAdd={handleAddTransaction} 
              onDelete={handleDeleteTransaction} 
            />
          )}
          {activeTab === 'goals' && (
            <Goals 
              goals={goals} 
              onAdd={handleAddGoal} 
              onUpdate={handleUpdateGoal} 
            />
          )}
          {activeTab === 'chat' && (
            <AIChat onSendMessage={handleSendMessage} />
          )}
        </div>
      </main>
    </div>
  );
}
