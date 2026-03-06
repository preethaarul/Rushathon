import React, { useState } from 'react';
import { Wallet, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Card, Button, Input, cn } from './ui/Base';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignup: (name: string, email: string, pass: string) => Promise<void>;
}

export default function Auth({ onLogin, onSignup }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await onSignup(formData.name, formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/20 mx-auto mb-6">
            <Wallet className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 font-display tracking-tight">FinIntel</h1>
          <p className="text-white/50">Your AI-Powered Financial Intelligence</p>
        </div>

        <Card className="p-8 border-white/10 bg-white/5 backdrop-blur-2xl">
          <div className="flex p-1 bg-white/5 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                isLogin ? "bg-violet-600 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                !isLogin ? "bg-violet-600 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input 
                    required 
                    className="pl-10"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input 
                  type="email" 
                  required 
                  className="pl-10"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input 
                  type="password" 
                  required 
                  className="pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            <Button disabled={isLoading} className="w-full h-12 flex items-center justify-center gap-2 group">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm text-white/30">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-violet-400 font-bold hover:underline"
          >
            {isLogin ? 'Sign up now' : 'Log in here'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
