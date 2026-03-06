import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { Card, Button, Input, Select, cn } from './ui/Base';
import { Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionsProps {
  transactions: Transaction[];
  onAdd: (data: any) => void;
  onDelete: (id: number) => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'Food', label: 'Food' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Rent', label: 'Rent' },
  { value: 'Bills', label: 'Bills' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Health', label: 'Health' },
  { value: 'Others', label: 'Others' },
];

const INCOME_CATEGORIES = [
  { value: 'Salary', label: 'Salary' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Investments', label: 'Investments' },
  { value: 'Gifts', label: 'Gifts' },
  { value: 'Interest', label: 'Interest' },
  { value: 'Others', label: 'Others' },
];

export default function Transactions({ transactions, onAdd, onDelete }: TransactionsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData({
      ...formData,
      type,
      category: type === 'income' ? 'Salary' : 'Food'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setShowAdd(false);
      setFormData({
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      console.error('Failed to add transaction', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Transactions</h2>
          <p className="text-white/50">Manage your income and expenses efficiently.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Transaction
        </Button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-violet-500/20">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Amount (₹)</label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Type</label>
                  <Select 
                    value={formData.type}
                    onChange={e => handleTypeChange(e.target.value as any)}
                    options={[
                      { value: 'income', label: 'Income' },
                      { value: 'expense', label: 'Expense' }
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Category</label>
                  <Select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    options={formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Date</label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Description</label>
                  <Input 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="What was this for?"
                  />
                </div>
                <div className="lg:col-span-5 flex justify-end gap-3 mt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Transaction'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
            </div>
            <Button variant="secondary" className="py-2 px-3 flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-white/30 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((t) => (
                <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        t.type === 'income' ? "bg-emerald-500/10" : "bg-red-500/10"
                      )}>
                        <Calendar className={cn(
                          "w-4 h-4",
                          t.type === 'income' ? "text-emerald-400" : "text-red-400"
                        )} />
                      </div>
                      <span className="text-sm text-white/80">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{t.description || 'No description'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {t.type === 'income' ? (
                        <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={cn(
                        "text-sm font-bold",
                        t.type === 'income' ? "text-emerald-400" : "text-red-400"
                      )}>
                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/30 italic">
                    No transactions found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
