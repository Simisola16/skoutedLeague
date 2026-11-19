import React, { useState, useEffect } from 'react';
import { X, Bell, Check, Shield, AlertCircle, Smartphone, Mail, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { pushManager } from '../services/pushManager';

export default function FanSubscriptionModal({
  isOpen,
  onClose,
  teams = [],
  defaultTeamId = ''
}) {
  const [activeTab, setActiveTab] = useState('push'); // 'push' or 'email'
  const [email, setEmail] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(defaultTeamId || 'ALL');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Push alert preferences
  const [notifyGoals, setNotifyGoals] = useState(true);
  const [notifyKickoff, setNotifyKickoff] = useState(true);
  const [notifySubs, setNotifySubs] = useState(true);
  const [notifyCards, setNotifyCards] = useState(true);
  const [notifyFullTime, setNotifyFullTime] = useState(true);

  const [pushSupported, setPushSupported] = useState(true);
  const [pushPermission, setPushPermission] = useState('default');

  useEffect(() => {
    if (isOpen) {
      setPushSupported(pushManager.isSupported());
      setPushPermission(pushManager.getPermission());
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleClose = () => {
    try {
      sessionStorage.setItem('skouted_fan_dismissed', 'true');
    } catch {}
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  // Handle Push Notification Activation
  const handlePushSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await pushManager.subscribe({
        teamId: selectedTeam,
        notifyGoals,
        notifyKickoff,
        notifySubs,
        notifyCards,
        notifyFullTime
      });

      if (res.success) {
        setSuccessMsg('Live Phone Alerts Enabled! A welcome notification has been sent to your device.');
        setPushPermission('granted');
        try {
          localStorage.setItem('skouted_fan_subscribed', 'true');
          localStorage.setItem('syl_push_subscribed', 'true');
        } catch {}
        setTimeout(() => {
          handleClose();
        }, 2400);
      } else {
        setErrorMsg(res.error || 'Failed to activate push alerts.');
      }
    } catch (err) {
      console.error('[Push Subscription Error]:', err);
      if (err.message && err.message.includes('not granted')) {
        setErrorMsg('Notification permission was blocked. Please enable notifications in your phone browser settings.');
      } else {
        setErrorMsg(err.message || 'Error enabling push alerts.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Subscription
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.subscribeFan({ email, teamId: selectedTeam });
      if (res.success) {
        setSuccessMsg(res.message || 'Subscribed! You will get instant goal alerts via email.');
        try {
          localStorage.setItem('skouted_fan_subscribed', 'true');
        } catch {}
        setTimeout(() => {
          handleClose();
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
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#141720] border-t sm:border border-[#222735] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300 cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bell Banner */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-black font-display text-white">Live Matchday Alerts</h3>
            <p className="text-xs text-slate-400">Get instant popups for goals, kickoffs & subs</p>
          </div>
        </div>

        {/* Mode Switcher: Phone Push vs Email */}
        <div className="flex p-1 bg-[#0D0F14] border border-[#222735] rounded-xl mb-4">
          <button
            type="button"
            onClick={() => { setActiveTab('push'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'push'
                ? 'bg-[#00E676] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Push (Lock Screen)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('email'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'email'
                ? 'bg-[#00E676] text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Alerts</span>
          </button>
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
            <h4 className="text-sm font-bold text-white">Alerts Active!</h4>
            <p className="text-xs text-slate-400">{successMsg}</p>
          </div>
        ) : activeTab === 'push' ? (
          /* ── PHONE PUSH TAB ── */
          <form onSubmit={handlePushSubscribe} className="space-y-4">
            {/* Club Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Club For Alerts
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                <option value="ALL">⭐ All 11 Clubs (Every Matchday Action)</option>
                {teams.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Event Checkboxes */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5 text-xs text-slate-300">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyKickoff}
                  onChange={e => setNotifyKickoff(e.target.checked)}
                  className="accent-[#00E676] w-4 h-4 rounded"
                />
                <span>⚽ Match Kickoff (When game starts)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyGoals}
                  onChange={e => setNotifyGoals(e.target.checked)}
                  className="accent-[#00E676] w-4 h-4 rounded"
                />
                <span>⚡ Goals Scored (Instant scorer & scoreline)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySubs}
                  onChange={e => setNotifySubs(e.target.checked)}
                  className="accent-[#00E676] w-4 h-4 rounded"
                />
                <span>🔄 Substitutions (Player IN ⇄ OUT)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyCards}
                  onChange={e => setNotifyCards(e.target.checked)}
                  className="accent-[#00E676] w-4 h-4 rounded"
                />
                <span>🟨 Red & Yellow Cards</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyFullTime}
                  onChange={e => setNotifyFullTime(e.target.checked)}
                  className="accent-[#00E676] w-4 h-4 rounded"
                />
                <span>🏁 Full-Time Whistle & Final Score</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !pushSupported}
              className="w-full btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Activating Push Alerts...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Turn On Phone Push Alerts</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Popups appear directly on your phone lock screen & status bar
            </p>
          </form>
        ) : (
          /* ── EMAIL ALERTS TAB ── */
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Your Favorite Club
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                <option value="ALL">⭐ All League Clubs</option>
                {teams.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Activate Email Alerts'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
