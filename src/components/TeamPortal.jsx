import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Users, Sparkles, Check, AlertCircle, Upload, Star, X, Eye } from 'lucide-react';
import { api } from '../services/api';
import PlayerDetailModal from './PlayerDetailModal';

const DEFAULT_SLOTS = [
  { pos: 'GK', label: 'Goalkeeper', gridX: 50, gridY: 10 },
  { pos: 'LB', label: 'Left Back', gridX: 18, gridY: 28 },
  { pos: 'CB', label: 'Center Back (L)', gridX: 38, gridY: 25 },
  { pos: 'CB', label: 'Center Back (R)', gridX: 62, gridY: 25 },
  { pos: 'RB', label: 'Right Back', gridX: 82, gridY: 28 },
  { pos: 'CDM', label: 'Defensive Mid', gridX: 50, gridY: 46 },
  { pos: 'CM', label: 'Center Mid (L)', gridX: 32, gridY: 58 },
  { pos: 'CM', label: 'Center Mid (R)', gridX: 68, gridY: 58 },
  { pos: 'LW', label: 'Left Wing', gridX: 20, gridY: 78 },
  { pos: 'ST', label: 'Striker', gridX: 50, gridY: 86 },
  { pos: 'RW', label: 'Right Wing', gridX: 80, gridY: 78 }
];

export default function TeamPortal({
  user,
  fixtures = [],
  onPlayerAdded,
  onLineupLocked
}) {
  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState('');
  const [startingXI, setStartingXI] = useState([]);
  const [captainId, setCaptainId] = useState('');
  const [formation, setFormation] = useState('4-3-3');

  // Add player modal state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('FWD');
  const [playerPhoto, setPlayerPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Find user's team ID
  const teamId = user?.team?._id || user?.team;

  useEffect(() => {
    if (!teamId) return;
    api.getTeam(teamId).then(res => {
      if (res.success && res.data?.team) {
        setTeam(res.data.team);
        setSquad(res.data.team.squad || []);

        // Auto-assign First 11 from squad
        if (res.data.team.squad && res.data.team.squad.length > 0) {
          autoFillXI(res.data.team.squad);
        }
      }
    });
  }, [teamId]);

  // Set default upcoming fixture for this team
  useEffect(() => {
    if (!teamId || fixtures.length === 0) return;
    const teamFixture = fixtures.find(f => 
      (f.homeTeam?._id === teamId || f.awayTeam?._id === teamId) && f.status === 'UPCOMING'
    ) || fixtures[0];

    if (teamFixture) {
      setSelectedFixtureId(teamFixture._id);
    }
  }, [teamId, fixtures]);

  const autoFillXI = (playersList) => {
    const chosen = [];
    const usedIds = new Set();

    // 1. Keeper
    const gk = playersList.find(p => p.position === 'GK') || playersList[0];
    if (gk) {
      chosen.push({ playerId: gk._id, position: 'GK', gridX: 50, gridY: 10, isCaptain: false });
      usedIds.add(gk._id);
    }

    // 2. Outfield slots
    DEFAULT_SLOTS.slice(1).forEach(slot => {
      let candidate = playersList.find(p => !usedIds.has(p._id) && p.position !== 'GK');
      if (!candidate) candidate = playersList.find(p => !usedIds.has(p._id));
      if (candidate) {
        chosen.push({ playerId: candidate._id, position: slot.pos, gridX: slot.gridX, gridY: slot.gridY, isCaptain: false });
        usedIds.add(candidate._id);
      }
    });

    if (chosen.length > 0) {
      chosen[0].isCaptain = true;
      setCaptainId(chosen[0].playerId);
    }

    setStartingXI(chosen);
  };

  const handleAddPlayerSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !jerseyNumber || !position) {
      setErrorMsg('Please complete player fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('jerseyNumber', jerseyNumber);
      formData.append('position', position);
      if (playerPhoto) formData.append('photo', playerPhoto);

      const res = await api.addPlayer(teamId, formData);
      if (res.success) {
        setFeedbackMsg(`Player ${firstName} ${lastName} added to squad!`);
        setSquad(prev => [...prev, res.data]);
        setShowAddPlayer(false);
        setFirstName('');
        setLastName('');
        setJerseyNumber('');
        setPlayerPhoto(null);
        setPhotoPreview('');
        if (onPlayerAdded) onPlayerAdded(res.data);
        setTimeout(() => setFeedbackMsg(''), 3000);
      } else {
        setErrorMsg(res.error || 'Failed to add player');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLockInLineup = async () => {
    if (!selectedFixtureId) {
      setErrorMsg('Please select a fixture to submit lineup for');
      return;
    }

    if (startingXI.length !== 11) {
      setErrorMsg(`Exactly 11 starting players required! Currently selected: ${startingXI.length}`);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        teamId,
        formation,
        startingXI: startingXI.map(slot => ({
          playerId: slot.playerId,
          position: slot.position,
          gridX: slot.gridX,
          gridY: slot.gridY,
          isCaptain: slot.playerId === captainId
        })),
        bench: squad
          .filter(p => !startingXI.some(s => s.playerId === p._id))
          .slice(0, 7)
          .map(b => ({ playerId: b._id, position: b.position }))
      };

      const res = await api.submitLineup(selectedFixtureId, payload);
      if (res.success) {
        setFeedbackMsg('Starting XI locked in and transmitted to match officials!');
        if (onLineupLocked) onLineupLocked(res.data);
        setTimeout(() => setFeedbackMsg(''), 3500);
      } else {
        setErrorMsg(res.error || 'Failed to submit lineup');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Club Banner Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-[#222735] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          {team?.logo ? (
            <img
              src={team.logo}
              alt={team?.name}
              className="w-16 h-16 rounded-2xl object-cover border border-white/10 bg-slate-800 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-lg font-black text-[#00E676] shadow-lg">
              {team?.shortCode || 'FC'}
            </div>
          )}
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">{team?.name || 'Club Portal'}</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                {team?.shortCode || 'VERIFIED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manager: <strong className="text-white">{user?.name}</strong> • Ground: {team?.homeGround || 'National Stadium'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddPlayer(true)}
          className="btn-primary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#00E676]/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Squad Player</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-[#00E676]/15 border border-[#00E676]/30 rounded-2xl text-xs text-[#00E676] font-bold text-center flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-medium text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Roster & Starting XI Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered Squad Players */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-5 border border-[#222735] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00E676]" />
              <h3 className="font-display font-extrabold text-white text-sm">Squad Roster ({squad.length})</h3>
            </div>
            <span className="text-[11px] text-slate-400">Official Roster</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {squad.map(player => {
              const inStarting = startingXI.some(s => s.playerId === player._id);
              const isCaptain = player._id === captainId;

              return (
                <div
                  key={player._id}
                  onClick={() => setSelectedPlayerForDetails(player)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer group hover:border-[#00E676]/40 ${
                    inStarting ? 'bg-[#00E676]/10 border-[#00E676]/30' : 'bg-[#141720] border-[#222735]'
                  }`}
                  title="Click to view full player dossier & stats"
                >
                  <div className="flex items-center gap-2.5">
                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.firstName}
                        className="w-8 h-8 rounded-lg object-cover bg-slate-800 border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#1C2030] border border-white/10 flex items-center justify-center text-[10px] font-bold text-[#00E676]">
                        #{player.jerseyNumber}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span className="group-hover:text-[#00E676] transition-colors">
                          #{player.jerseyNumber} {player.firstName} {player.lastName}
                        </span>
                        {isCaptain && (
                          <span className="w-3.5 h-3.5 rounded-full bg-[#FFB800] text-black font-black text-[9px] flex items-center justify-center">
                            C
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{player.position}</span>
                        <span className="text-[9px] text-[#00E676] opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                          (view details)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      inStarting ? 'bg-[#00E676] text-black' : 'bg-white/5 text-slate-400'
                    }`}>
                      {inStarting ? 'FIRST 11' : 'BENCH'}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="View Full Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Matchday Lineup Submission Pad */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-5 border border-[#222735] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <h3 className="font-display font-extrabold text-white text-sm">Matchday Starting XI Builder</h3>
              <p className="text-[11px] text-slate-400">Lock in your verified 11 starters before kickoff</p>
            </div>

            {/* Quick Auto-Fill Button */}
            <button
              onClick={() => autoFillXI(squad)}
              className="text-xs text-[#00E676] hover:text-white flex items-center gap-1.5 bg-[#00E676]/10 px-3 py-1.5 rounded-xl border border-[#00E676]/20 transition-all font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fill XI</span>
            </button>
          </div>

          {/* Select Fixture */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Match Fixture</label>
              <select
                value={selectedFixtureId}
                onChange={(e) => setSelectedFixtureId(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                {fixtures.map(f => (
                  <option key={f._id} value={f._id}>
                    {f.homeTeam?.name} vs {f.awayTeam?.name} ({f.date} {f.time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Formation</label>
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                <option value="4-3-3">4-3-3 (Attack)</option>
                <option value="4-2-3-1">4-2-3-1 (Balanced)</option>
                <option value="4-4-2">4-4-2 (Classic)</option>
                <option value="3-5-2">3-5-2 (Wingback)</option>
              </select>
            </div>
          </div>

          {/* 11 Slots Mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {DEFAULT_SLOTS.map((slot, idx) => {
              const currentSlot = startingXI[idx] || {};
              const isCaptain = currentSlot.playerId === captainId;

              return (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0D0F14] border border-[#222735] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-[50px]">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-[#00E676] font-mono font-bold text-[10px] flex items-center justify-center">
                      {slot.pos}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                  </div>

                  <select
                    value={currentSlot.playerId || ''}
                    onChange={(e) => {
                      const updated = [...startingXI];
                      if (updated[idx]) {
                        updated[idx].playerId = e.target.value;
                      } else {
                        updated[idx] = { playerId: e.target.value, position: slot.pos, gridX: slot.gridX, gridY: slot.gridY, isCaptain: false };
                      }
                      setStartingXI(updated);
                    }}
                    className="flex-1 bg-[#141720] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  >
                    <option value="">-- Choose Player --</option>
                    {squad.map(p => (
                      <option key={p._id} value={p._id}>
                        #{p.jerseyNumber} {p.firstName} {p.lastName} ({p.position})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentSlot.playerId) {
                        setCaptainId(currentSlot.playerId);
                      }
                    }}
                    title="Make Captain"
                    className={`w-6 h-6 rounded-md text-[10px] font-black flex items-center justify-center border transition-all ${
                      isCaptain ? 'bg-[#FFB800] text-black border-[#FFB800]' : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    C
                  </button>
                </div>
              );
            })}
          </div>

          {/* Lock In Starting XI Button */}
          <button
            onClick={handleLockInLineup}
            disabled={loading || startingXI.filter(s => s.playerId).length !== 11}
            className="w-full btn-primary py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'Transmitting Lineup...' : 'Lock In & Submit Official Starting XI'}</span>
          </button>
        </div>

      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141720] border border-[#252A38] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-bold text-base text-white">Add Player to Squad</h3>
              <button onClick={() => setShowAddPlayer(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlayerSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ademola"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lookman"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Jersey # *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="99"
                    placeholder="10"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Position *</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#252A38] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="GK">GK - Goalkeeper</option>
                    <option value="DEF">DEF - Defender</option>
                    <option value="MID">MID - Midfielder</option>
                    <option value="FWD">FWD - Forward / Striker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Player Photo (Cloudinary)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPlayerPhoto(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide mt-2"
              >
                {loading ? 'Saving...' : 'Add Player to Squad'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Player Full Details Modal */}
      {selectedPlayerForDetails && (
        <PlayerDetailModal
          player={selectedPlayerForDetails}
          team={team}
          onClose={() => setSelectedPlayerForDetails(null)}
        />
      )}

    </div>
  );
}
