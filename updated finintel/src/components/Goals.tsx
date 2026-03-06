import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Input, cn } from './ui/Base';
import { Goal } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface GoalsProps {
  goals: Goal[];
  onAdd: (data: any) => void;
  onUpdate: (id: number, saved: number) => void;
}

export default function Goals({ goals, onAdd, onUpdate }: GoalsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      target_amount: parseFloat(formData.target_amount)
    });
    setShowAdd(false);
    setFormData({ title: '', target_amount: '', deadline: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Savings Goals</h2>
          <p className="text-white/50">Plan your future and track your progress.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Goal
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
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Goal Title</label>
                  <Input 
                    required 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. New Laptop"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Target Amount (₹)</label>
                  <Input 
                    type="number" 
                    required 
                    value={formData.target_amount}
                    onChange={e => setFormData({...formData, target_amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Deadline</label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit">Create Goal</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(100, (goal.current_saved / goal.target_amount) * 100);
          const remaining = goal.target_amount - goal.current_saved;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id}>
              <Card className="relative group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-500/10 rounded-xl">
                    <Target className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Progress</p>
                  <p className="text-xl font-bold text-violet-400">{Math.round(progress)}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Saved: ₹{goal.current_saved.toLocaleString()}</span>
                  <span className="text-white/60">Target: ₹{goal.target_amount.toLocaleString()}</span>
                </div>
                
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={cn(
                      "h-full transition-all duration-1000",
                      progress >= 100 ? "bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.5)]" : "bg-violet-600"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Time Left</span>
                    </div>
                    <p className="text-sm font-bold text-white">{daysLeft > 0 ? `${daysLeft} Days` : 'Expired'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Remaining</span>
                    </div>
                    <p className="text-sm font-bold text-white">₹{remaining > 0 ? remaining.toLocaleString() : '0'}</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Input 
                    type="number" 
                    placeholder="Add to savings..." 
                    className="flex-1 h-10 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        if (!isNaN(val)) {
                          onUpdate(goal.id, goal.current_saved + val);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  {progress >= 100 && (
                    <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
          );
        })}
        {goals.length === 0 && (
          <div className="md:col-span-2 py-20 text-center">
            <Target className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 italic">No savings goals yet. Start planning for your future!</p>
          </div>
        )}
      </div>
    </div>
  );
}
