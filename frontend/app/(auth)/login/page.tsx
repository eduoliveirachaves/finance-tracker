"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { post } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await post("/auth/login", { email, password });
      router.push("/");
    } catch (err: any) {
      setError(err.body?.detail ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background-dark">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-[#12141D] to-[#0A0C13] border-r border-[#1C1F2B] items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark opacity-50"></div>
        
        <div className="z-10 max-w-md">
          <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-glow-primary mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-text-main mb-6 tracking-tight">The Ledger</h1>
          <p className="text-lg text-muted font-body leading-relaxed">
            A sanctuary for your wealth. Clarity, control, and quiet reflection.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-background-dark relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
        
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-text-main">Access Your Ledger</h2>
            <p className="mt-2 text-muted font-body text-sm">Sign in to continue your journey to financial clarity.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-main">Email Address</label>
              <input 
                id="email" 
                type="email" 
                className="w-full bg-surface border border-[#1C1F2B] rounded-md px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-main">Password</label>
              <input 
                id="password" 
                type="password" 
                className="w-full bg-surface border border-[#1C1F2B] rounded-md px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            {error && <p className="text-sm font-mono text-danger bg-danger/10 p-3 rounded-md border border-danger/20">{error}</p>}

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-[#00e685] text-background-dark font-bold py-3 px-4 rounded-md transition-all shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-8"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
              {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
            </button>
          </form>

          <p className="text-center text-sm text-muted">
            Don&apos;t maintain a ledger yet?{" "}
            <Link href="/register" className="text-primary hover:text-white transition-colors underline decoration-primary/30 underline-offset-4">
              Establish one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
