import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  BrainCircuit,
  Zap,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card } from './ui/Base';
import { Transaction, AIInsights, Prediction } from '../types';
import { motion } from 'motion/react';
import { cn } from './ui/Base';

interface DashboardProps {
  transactions: Transaction[];
  insights: AIInsights | null;
  prediction: Prediction | null;
}

const COLORS = [
  '#2979FF', // Bright Blue
  '#FFEA00', // Bright Yellow
  '#D500F9', // Bright Purple
  '#00E5FF', // Bright Cyan
  '#F50057', // Bright Pink
  '#651FFF', // Deep Purple Accent
  '#FF9100', // Bright Orange
  '#3D5AFE', // Indigo
  '#FFC400', // Amber
  '#00B0FF', // Sky Blue
];

export default function Dashboard({ transactions, insights, prediction }: DashboardProps) {
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const savings = income - expenses;
    return { income, expenses, savings };
  }, [transactions]);

  const chartData = useMemo(() => {
    const monthly: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const date = new Date(t.date);
        const month = date.toLocaleString('default', { month: 'short' });
        monthly[month] = (monthly[month] || 0) + t.amount;
      });
    return Object.entries(monthly).map(([name, amount]) => ({ name, amount }));
  }, [transactions]);

  const comparisonData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date >= thirtyDaysAgo) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });

    return [
      { name: 'Income', amount: income, color: '#10b981' }, // Green for Income
      { name: 'Expenses', amount: expense, color: '#ef4444' } // Red for Expenses
    ];
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Financial Overview</h2>
          <p className="text-white/50">Welcome back! Here's what's happening with your money.</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="py-2 px-4 flex items-center gap-3 bg-emerald-500/10 border-emerald-500/20">
            <ShieldCheck className="text-emerald-400 w-5 h-5" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 font-bold">Health Score</p>
              <p className="text-xl font-bold text-emerald-400">{insights?.healthScore || 0}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Income', value: stats.income, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total Expenses', value: stats.expenses, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Net Savings', value: stats.savings, icon: PiggyBank, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden group">
              <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-all group-hover:scale-150", item.bg)} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm text-white/50 font-medium mb-1">{item.label}</p>
                  <h3 className="text-3xl font-bold text-white">₹{item.value.toLocaleString()}</h3>
                </div>
                <div className={cn("p-3 rounded-xl", item.bg)}>
                  <item.icon className={cn("w-6 h-6", item.color)} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                <ArrowUpRight className="w-3 h-3" />
                <span>Updated just now</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              Monthly Spending Trend
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff30" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#ffffff30" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#030014', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card>
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Spending by Category
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-white/60">{item.name}</span>
                </div>
                <span className="text-white font-medium">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Income vs Expenses (Last 30 Days)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff30" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#ffffff30" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#030014', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card className="border-violet-500/20 bg-violet-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-500 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Financial Insights</h3>
          </div>
          <div className="space-y-4">
            {Array.isArray(insights?.insights) && insights.insights.map((insight, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                <p className="text-sm text-white/80 leading-relaxed">{insight}</p>
              </motion.div>
            ))}
            {!insights && <p className="text-white/40 text-sm italic">Generating insights...</p>}
          </div>
        </Card>

        {/* Prediction */}
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Expense Prediction</h3>
          </div>
          {prediction ? (
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/50 mb-1">Next Month Forecast</p>
                  <h4 className="text-4xl font-bold text-white">₹{prediction.predicted.toLocaleString()}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-1">Confidence</p>
                  <p className="text-lg font-bold text-indigo-400">{Math.round(prediction.confidence * 100)}%</p>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence * 100}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
              <p className="text-sm text-white/60 italic">
                {prediction.message || "Based on your historical spending patterns, we expect your expenses to trend this way next month."}
              </p>
            </div>
          ) : (
            <p className="text-white/40 text-sm italic">Analyzing historical data for prediction...</p>
          )}
        </Card>
      </div>
    </div>
  );
}
