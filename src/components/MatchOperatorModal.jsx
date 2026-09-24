import React, { useState, useEffect } from 'react';
import { X, Radio, Plus, Minus, Send, AlertTriangle, Shield, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function MatchOperatorModal({
  isOpen,
  onClose,
  fixtures = [],
  activeFixture,
  onFixtureUpdated
}) {
  const [selectedFixtureId, setSelectedFixtureId] = useState(activeFixture?._id || fixtures[0]?._id || '');
  const [minute, setMinute] = useState(activeFixture?.minute || 0);
  const [eventType, setEventType] = useState('GOAL');
  const [eventTeamId, setEventTeamId] = useState('');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [assistPlayerId, setAssistPlayerId] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const currentFixture = fixtures.find(f => f._id === selectedFixtureId) || activeFixture;

  useEffect(() => {
    if (activeFixture?._id) {
      setSelectedFixtureId(activeFixture._id);
      setMinute(activeFixture.minute || 0);
    }
  }, [activeFixture]);

  // Load squad players for event dropdowns
  useEffect(() => {
    if (!currentFixture) return;
    setMinute(currentFixture.minute || 0);
    if (!eventTeamId) setEventTeamId(currentFixture.homeTeam?._id || '');

    // Fetch home squad
    if (currentFixture.homeTeam?._id) {
      api.getTeam(currentFixture.homeTeam._id).then(res => {
        if (res.success && res.data?.team?.squad) {
          setHomePlayers(res.data.team.squad);
        }
      });
    }

    // Fetch away squad
    if (currentFixture.awayTeam?._id) {
      api.getTeam(currentFixture.awayTeam._id).then(res => {
        if (res.success && res.data?.team?.squad) {
          setAwayPlayers(res.data.team.squad);
        }
      });
    }
  }, [selectedFixtureId]);

  if (!isOpen) return null;

  const currentTeamPlayers = eventTeamId === currentFixture?.homeTeam?._id ? homePlayers : awayPlayers;

  // Handle Quick Score Change
  const handleScoreChange = async (teamSide, delta) => {
    if (!currentFixture) return;
    const newHome = teamSide === 'home' ? Math.max(0, currentFixture.homeScore + delta) : currentFixture.homeScore;
    const newAway = teamSide === 'away' ? Math.max(0, currentFixture.awayScore + delta) : currentFixture.awayScore;

    if (delta > 0) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }

    try {
      const res = await api.updateScore(currentFixture._id, newHome, newAway, minute);
      if (res.success) {
        setStatusMsg('Score updated and broadcasted live!');
        if (onFixtureUpdated) onFixtureUpdated(res.data);
        setTimeout(() => setStatusMsg(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Period Change
  const handlePeriodChange = async (newStatus) => {
    if (!currentFixture) return;
    let defMinute = minute;
    if (newStatus === '1ST HALF') defMinute = 1;
    if (newStatus === 'HT') defMinute = 45;
    if (newStatus === '2ND HALF') defMinute = 46;
    if (newStatus === 'FT') defMinute = 90;

    setMinute(defMinute);

    try {
      const res = await api.updatePeriod(currentFixture._id, newStatus, defMinute);
      if (res.success) {
        setStatusMsg(`Match period shifted to ${newStatus}`);
        if (onFixtureUpdated) onFixtureUpdated(res.data);
        setTimeout(() => setStatusMsg(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Event Logging (Goal, Card, Substitution)
  const handleLogEvent = async (e) => {
    e.preventDefault();
    if (!currentFixture) return;

    setLoading(true);
    try {
      const res = await api.logMatchEvent(currentFixture._id, {
        minute,
        type: eventType,
        teamId: eventTeamId || currentFixture.homeTeam?._id,
        playerId: eventPlayerId || undefined,
        assistPlayerId: assistPlayerId || undefined,
        description: eventDescription
      });

      if (res.success) {
        if (eventType === 'GOAL') {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
        }
        setStatusMsg(`Logged ${eventType} live! Socket.io & Email alerts triggered.`);
        setEventDescription('');
        setEventPlayerId('');
        setAssistPlayerId('');
        if (onFixtureUpdated) onFixtureUpdated(res.data.fixture);
        setTimeout(() => setStatusMsg(''), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#141720] border border-[#252A38] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2330] flex items-center justify-between bg-[#10131B]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 flex items-center justify-center text-[#FF4B4B]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-base">Match Official Controller</h3>
              <p className="text-[11px] text-slate-400">Live scoreboard, timeline event logger & fan alert broadcaster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Status Message */}
          {statusMsg && (
            <div className="p-2.5 bg-[#00E676]/15 border border-[#00E676]/30 rounded-xl text-xs text-[#00E676] font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
              <Check className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Select Fixture to Control */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Match to Control
            </label>
            <select
              value={selectedFixtureId}
              onChange={(e) => setSelectedFixtureId(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            >
              {fixtures.map(f => (
                <option key={f._id} value={f._id}>
                  [{f.status}] {f.homeTeam?.name} ({f.homeScore}) vs ({f.awayScore}) {f.awayTeam?.name} - {f.stage}
                </option>
              ))}
            </select>
          </div>

          {currentFixture && (
            <>
              {/* Quick Score Increment Pad */}
              <div className="bg-[#0D0F14] p-4 rounded-2xl border border-[#222735] space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Quick Score Pad
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Home Score Control */}
                  <div className="bg-[#141720] p-3 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="font-bold text-xs text-white truncate max-w-full mb-1">
                      {currentFixture.homeTeam?.shortCode || currentFixture.homeTeam?.name}
                    </span>
                    <div className="text-3xl font-mono font-black text-[#00E676] my-1">
                      {currentFixture.homeScore}
                    </div>
                    <div className="flex gap-2 w-full mt-1">
                      <button
                        onClick={() => handleScoreChange('home', -1)}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleScoreChange('home', 1)}
                        className="flex-1 py-1.5 rounded-lg btn-primary text-black font-black flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Away Score Control */}
                  <div className="bg-[#141720] p-3 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="font-bold text-xs text-white truncate max-w-full mb-1">
                      {currentFixture.awayTeam?.shortCode || currentFixture.awayTeam?.name}
                    </span>
                    <div className="text-3xl font-mono font-black text-[#3B82F6] my-1">
                      {currentFixture.awayScore}
                    </div>
                    <div className="flex gap-2 w-full mt-1">
                      <button
                        onClick={() => handleScoreChange('away', -1)}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-black flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleScoreChange('away', 1)}
                        className="flex-1 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Period & Minute Controls */}
              <div className="bg-[#0D0F14] p-4 rounded-2xl border border-[#222735] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Match Period: <strong className="text-white">{currentFixture.status}</strong>
                  </span>
                  
                  {/* Clock minute adjuster */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Clock:</span>
                    <input
                      type="number"
                      min="0"
                      max="130"
                      value={minute}
                      onChange={(e) => setMinute(Number(e.target.value))}
                      className="w-16 bg-[#141720] border border-[#252A38] rounded-lg px-2 py-1 text-xs font-mono font-bold text-white text-center"
                    />
                    <span className="text-xs text-slate-400">'</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {['1ST HALF', 'HT', '2ND HALF', 'FT', 'PENS'].map(st => (
                    <button
                      key={st}
                      onClick={() => handlePeriodChange(st)}
                      className={`py-2 text-[10px] sm:text-xs font-mono font-bold rounded-xl transition-all ${
                        currentFixture.status === st
                          ? 'bg-[#FF4B4B] text-white shadow'
                          : 'bg-[#141720] text-slate-400 hover:text-white hover:bg-[#1E2330]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Event Logger Form */}
              <form onSubmit={handleLogEvent} className="bg-[#0D0F14] p-4 rounded-2xl border border-[#222735] space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FF4B4B]" />
                  <span>Log Match Event (Triggers Instant Broadcast)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Event Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Event Type *</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-[#141720] border border-[#252A38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value="GOAL">⚽ Goal</option>
                      <option value="YELLOW_CARD">🟨 Yellow Card</option>
                      <option value="RED_CARD">🟥 Red Card</option>
                      <option value="SUB_IN">🔄 Substitution</option>
                      <option value="OWN_GOAL">⚽ Own Goal</option>
                      <option value="VAR_DECISION">📺 VAR Decision</option>
                    </select>
                  </div>

                  {/* Team */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Team *</label>
                    <select
                      value={eventTeamId}
                      onChange={(e) => setEventTeamId(e.target.value)}
                      className="w-full bg-[#141720] border border-[#252A38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value={currentFixture.homeTeam?._id}>{currentFixture.homeTeam?.name}</option>
                      <option value={currentFixture.awayTeam?._id}>{currentFixture.awayTeam?.name}</option>
                    </select>
                  </div>
                </div>

                {/* Player Selector */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Involved Player</label>
                    <select
                      value={eventPlayerId}
                      onChange={(e) => setEventPlayerId(e.target.value)}
                      className="w-full bg-[#141720] border border-[#252A38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value="">-- Choose Player --</option>
                      {currentTeamPlayers.map(p => (
                        <option key={p._id} value={p._id}>
                          #{p.jerseyNumber} {p.firstName} {p.lastName} ({p.position})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assist Player (if Goal) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Assist (Optional)</label>
                    <select
                      value={assistPlayerId}
                      onChange={(e) => setAssistPlayerId(e.target.value)}
                      className="w-full bg-[#141720] border border-[#252A38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value="">-- None --</option>
                      {currentTeamPlayers.filter(p => p._id !== eventPlayerId).map(p => (
                        <option key={p._id} value={p._id}>
                          #{p.jerseyNumber} {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description input */}
                <div>
                  <input
                    type="text"
                    placeholder="Short description (e.g. Diving header into top right corner)"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="w-full bg-[#141720] border border-[#252A38] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                {/* Submit Event Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#00E676]/20 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Broadcasting...' : `Log ${eventType} & Dispatch Fan Alerts`}</span>
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
