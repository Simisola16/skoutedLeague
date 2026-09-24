import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export default function LoginModal({
  isOpen,
  onClose,
  onLoggedIn,
  onSwitchToRegister
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.login(email, password);
      if (res.success) {
        if (res.data?.token) {
          localStorage.setItem('skouted_token', res.data.token);
        }
        if (onLoggedIn) onLoggedIn(res.data?.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#141720] border border-[#252A38] rounded-3xl p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00E676]" />
            <h3 className="font-bold text-base text-white">Sign In to Skouted League</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="manager@club.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-[#00E676]/20 disabled:opacity-50 mt-1"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSwitchToRegister) onSwitchToRegister();
            }}
            className="text-xs text-slate-400 hover:text-[#00E676] transition-colors"
          >
            New Club? Register Team with OTP →
          </button>
        </div>

      </div>
    </div>
  );
}
