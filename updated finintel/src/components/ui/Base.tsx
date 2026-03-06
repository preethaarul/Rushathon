import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl", className)}>
      {children}
    </div>
  );
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const variants = {
    primary: "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10",
    ghost: "hover:bg-white/5 text-white/70 hover:text-white"
  };

  return (
    <button 
      className={cn("px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn("w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all", className)}
      {...props}
    />
  );
}

export function Select({ className, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select 
      className={cn("w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all", className)}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-[#030014] text-white">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
