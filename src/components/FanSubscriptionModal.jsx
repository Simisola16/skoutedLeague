import React, { useState } from 'react';
import { X, Bell, Check, Shield, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FanSubscriptionModal({
  isOpen,
  onClose,
  teams = [],
  defaultTeamId = ''
}) {
  const [email, setEmail] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(defaultTeamId || (teams[0]?._id || ''));
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !selectedTeam) {
      setErrorMsg('Please enter your email and select your team');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.subscribeFan({ email, teamId: selectedTeam });
      if (res.success) {
        setSuccessMsg(res.message || 'Subscribed! You will get instant goal alerts.');
        localStorage.setItem('skouted_fan_subscribed', 'true');
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorMsg(res.error || 'Failed to subscribe');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error subscribing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#141720] border-t sm:border border-[#222735] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bell Banner */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/15 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-black font-display text-white">Never Miss a Goal!</h3>
            <p className="text-xs text-slate-400">Get instant Resend email alerts when your team scores</p>
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#00E676]/20 border border-[#00E676] flex items-center justify-center mx-auto text-[#00E676]">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Subscription Active!</h4>
            <p className="text-xs text-slate-400">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Team Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Your Favorite Club *
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                {teams.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>

            {/* Notification Checkboxes */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#00E676]" />
                <span>Instant Goal scored notifications</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#00E676]" />
                <span>Full-time match summary & final score</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Activate Instant Goal Alerts'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
