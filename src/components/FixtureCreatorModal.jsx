import React, { useState } from 'react';
import { X, Calendar, PlusCircle, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FixtureCreatorModal({
  isOpen,
  onClose,
  teams = [],
  onFixtureCreated
}) {
  const [homeTeam, setHomeTeam] = useState(teams[0]?._id || '');
  const [awayTeam, setAwayTeam] = useState(teams[1]?._id || '');
  const [matchday, setMatchday] = useState(1);
  const [leg, setLeg] = useState(1);
  const [stage, setStage] = useState('Matchday 1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('16:00');
  const [venue, setVenue] = useState('Lekan Salami Stadium, Adamasingba, Ibadan');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam) {
      setErrorMsg('Please select both teams');
      return;
    }

    if (homeTeam === awayTeam) {
      setErrorMsg('A team cannot play against itself');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.createFixture({
        homeTeam,
        awayTeam,
        stage: stage || `Matchday ${matchday}`,
        leg: Number(leg) || 1,
        matchday: Number(matchday) || 1,
        date,
        time,
        venue
      });

      if (res.success) {
        setSuccessMsg('Fixture created! Resend notification dispatched to both managers.');
        if (onFixtureCreated) onFixtureCreated(res.data);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Failed to create fixture');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141720] border border-[#252A38] rounded-3xl p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="font-bold text-base text-white">Schedule Tournament Fixture</h3>
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

        {successMsg && (
          <div className="p-3 bg-[#00E676]/15 border border-[#00E676]/30 rounded-xl text-xs text-[#00E676] font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Home Team */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Home Team *
            </label>
            <select
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            >
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.shortCode})</option>
              ))}
            </select>
          </div>

          {/* Away Team */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Away Team *
            </label>
            <select
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            >
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.shortCode})</option>
              ))}
            </select>
          </div>

          {/* Matchday & Leg Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Matchday (1-22) *
              </label>
              <input
                type="number"
                min="1"
                max="22"
                required
                value={matchday}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMatchday(val);
                  setStage(`Matchday ${val}`);
                  if (val > 11) setLeg(2);
                  else setLeg(1);
                }}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E676]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Leg Mode *
              </label>
              <select
                value={leg}
                onChange={(e) => setLeg(Number(e.target.value))}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E676]"
              >
                <option value={1}>Leg 1 (Matchdays 1-11)</option>
                <option value={2}>Leg 2 (Matchdays 12-22)</option>
              </select>
            </div>
          </div>

          {/* Stage / Round */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Tournament Stage / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Matchday 1 or Quarter-Final"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Kick-off Time *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Venue / Pitch *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mobolaji Johnson Arena, Pitch 1"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-[#00E676]/20 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Fixture & Send Manager Emails'}
          </button>
        </form>

      </div>
    </div>
  );
}
