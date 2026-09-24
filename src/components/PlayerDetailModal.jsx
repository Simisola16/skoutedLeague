import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Award,
  Flame,
  Zap,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  UserCheck,
  UserX,
  Activity,
  Footprints,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import {
  NATIONALITIES,
  getCountryFlag,
  formatHeight,
  formatWeight,
  calculateAge
} from '../utils/playerConstants';

export default function PlayerDetailModal({
  player,
  team = null,
  onClose,
  isAdmin = false,
  onToggleEligibility = null,
  onEdit = null
}) {
  if (!player) return null;

  const [data, setData] = useState(player);
  const [loadingFresh, setLoadingFresh] = useState(false);

  useEffect(() => {
    setData(player);
    const playerId = player?._id || player?.id;
    if (playerId) {
      setLoadingFresh(true);
      api.getPlayer(playerId)
        .then(res => {
          if (res?.success && res?.data) {
            setData(res.data);
          }
        })
        .catch(err => {
          console.warn('Could not refresh full player bio:', err.message);
        })
        .finally(() => setLoadingFresh(false));
    }
  }, [player]);

  const activePlayer = data || player;
  const playerTeam = team || activePlayer.team || {};
  const isEligible = activePlayer.status === 'Eligible' && activePlayer.isEligible !== false;
  const role = activePlayer.role || 'Squad Player';
  const rolesList = Array.isArray(activePlayer.roles) && activePlayer.roles.length > 0
    ? activePlayer.roles
    : (activePlayer.role ? [activePlayer.role] : ['Regular Squad Player']);

  const stats = activePlayer.stats || {
    matches: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    minutesPlayed: 0
  };

  const posRaw = (activePlayer.position || 'MID').toUpperCase();
  const isGk = posRaw === 'GK' || posRaw.includes('GOAL');
  const isDef = posRaw === 'DEF' || posRaw.includes('DEF');
  const isMid = posRaw === 'MID' || posRaw.includes('MID');
  const posColor = isGk
    ? { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Goalkeeper' }
    : isDef
    ? { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Defender' }
    : isMid
    ? { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Midfielder' }
    : { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Forward' };

  // Calculate age from DOB or fallback
  const computedAge = activePlayer.dateOfBirth
    ? calculateAge(activePlayer.dateOfBirth)
    : (activePlayer.age || null);

  const formattedDob = activePlayer.dateOfBirth
    ? new Date(activePlayer.dateOfBirth).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : null;

  const flagEmoji = getCountryFlag(activePlayer.nationality || 'Nigeria');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print animate-in fade-in duration-200">
      <div className="bg-[#0E1118] border border-[#232838] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl my-auto relative flex flex-col">
        
        {/* Banner Top Strip */}
        <div className="h-28 bg-gradient-to-r from-[#141A28] via-[#1A2234] to-[#121622] relative p-4 flex items-start justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5">
              <span>OFFICIAL SQUAD ACCREDITATION</span>
              {loadingFresh && <Loader2 className="w-3 h-3 animate-spin text-[#00E676]" />}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
            title="Close Dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Profile Header Card (Overlapping Banner) */}
        <div className="px-5 sm:px-6 pb-4 -mt-14 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-3.5">
            {/* Player Photo with Jersey Number Badge */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#171B26] border-2 border-[#232838] p-1 overflow-hidden shadow-2xl flex items-center justify-center">
                {activePlayer.photo || activePlayer.photoUrl ? (
                  <img
                    src={activePlayer.photo || activePlayer.photoUrl}
                    alt={`${activePlayer.firstName} ${activePlayer.lastName}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-[#00E676] text-black font-mono font-black text-sm flex items-center justify-center shadow-lg border-2 border-[#0E1118]">
                #{activePlayer.jerseyNumber || '?'}
              </span>
            </div>

            {/* Name, Roles & Club */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {rolesList.map(r => {
                  if (r === 'Captain') {
                    return (
                      <span key={r} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black uppercase tracking-wider flex items-center gap-1">
                        👑 Captain
                      </span>
                    );
                  }
                  if (r === 'Vice Captain') {
                    return (
                      <span key={r} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-black uppercase tracking-wider flex items-center gap-1">
                        🛡️ Vice Captain
                      </span>
                    );
                  }
                  if (r === 'Penalty Taker') {
                    return (
                      <span key={r} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        🎯 Penalties
                      </span>
                    );
                  }
                  if (r === 'Free Kick Specialist') {
                    return (
                      <span key={r} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                        ⚡ Free Kicks
                      </span>
                    );
                  }
                  return null;
                })}

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${posColor.bg} ${posColor.text} ${posColor.border}`}>
                  {posColor.label}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight mt-1 line-clamp-1">
                {activePlayer.firstName} {activePlayer.lastName}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span className="text-slate-200 font-bold">{playerTeam.name || 'Registered Club'}</span>
                <span>•</span>
                <span className="text-slate-400">{playerTeam.shortCode || 'FC'}</span>
                {activePlayer.subPosition && (
                  <>
                    <span>•</span>
                    <span className="text-[#00E676] font-semibold">{activePlayer.subPosition}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Eligibility Indicator */}
          <div className="self-start sm:self-end">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isEligible
                ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}>
              {isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{isEligible ? 'Matchday Eligible' : 'Suspended'}</span>
            </span>
          </div>
        </div>

        {/* Suspension Reason Alert Box (if suspended) */}
        {!isEligible && (
          <div className="mx-5 sm:mx-6 mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider text-[10px] text-rose-400">Suspension Notice</div>
              <div className="mt-0.5 text-xs">
                {activePlayer.suspensionReason || 'Player is currently suspended from matchday participation.'}
              </div>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="px-5 sm:px-6 py-2 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* Core Player Attributes Card */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Profile & Physical Specifications
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090B10] border border-[#1E2332] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              
              {/* Nationality */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Nationality</div>
                <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <span className="text-base">{flagEmoji}</span>
                  <span className="truncate">{activePlayer.nationality || 'Nigeria'}</span>
                </div>
              </div>

              {/* Age & Date of Birth */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Age / DOB</div>
                <div className="font-semibold text-slate-200 mt-0.5 font-mono">
                  {computedAge ? `${computedAge} Years` : '17 Years'}
                </div>
                {formattedDob && (
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {formattedDob}
                  </div>
                )}
              </div>

              {/* Preferred Foot */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Preferred Foot</div>
                <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>{activePlayer.preferredFoot || 'Right'} Foot</span>
                </div>
              </div>

              {/* Height */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Height</div>
                <div className="font-semibold text-slate-200 mt-0.5 font-mono">
                  {activePlayer.heightCm ? formatHeight(activePlayer.heightCm) : '—'}
                </div>
              </div>

              {/* Weight */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Weight</div>
                <div className="font-semibold text-slate-200 mt-0.5 font-mono">
                  {activePlayer.weightKg ? formatWeight(activePlayer.weightKg) : '—'}
                </div>
              </div>

              {/* Tactical Sub-Position */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Tactical Role</div>
                <div className="font-semibold text-slate-200 mt-0.5 truncate">
                  {activePlayer.subPosition || activePlayer.position || 'Player'}
                </div>
              </div>

            </div>
          </div>

          {/* Tournament Performance Stats Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Tournament Season Stats</span>
              <span className="text-[#00E676] font-mono font-bold">Skouted Youth League</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-500">Matches</div>
                <div className="text-lg font-mono font-black text-white">{stats.matches || 0}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-500">Minutes</div>
                <div className="text-lg font-mono font-black text-white">{stats.minutesPlayed || 0}'</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-center space-y-0.5 relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Goals</span>
                </div>
                <div className="text-lg font-mono font-black text-amber-300">{stats.goals || 0}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-blue-400 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>Assists</span>
                </div>
                <div className="text-lg font-mono font-black text-blue-300">{stats.assists || 0}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-yellow-500">Yellows</div>
                <div className="text-lg font-mono font-black text-yellow-400">{stats.yellowCards || 0}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-center space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-rose-500">Reds</div>
                <div className="text-lg font-mono font-black text-rose-400">{stats.redCards || 0}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-center space-y-0.5 col-span-1 sm:col-span-2">
                <div className="text-[10px] uppercase font-bold text-[#00E676]">Clean Sheets</div>
                <div className="text-lg font-mono font-black text-[#00E676]">{stats.cleanSheets || 0}</div>
              </div>
            </div>
          </div>


          {/* Admin Management Actions (if admin) */}
          {isAdmin && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Administrator Actions
              </div>

              <div className="flex items-center gap-2">
                {onToggleEligibility && (
                  <button
                    onClick={async () => {
                      if (onToggleEligibility) {
                        await onToggleEligibility(activePlayer);
                        setData(prev => {
                          if (!prev) return prev;
                          const willBeEligible = !(prev.status === 'Eligible' && prev.isEligible !== false);
                          return {
                            ...prev,
                            status: willBeEligible ? 'Eligible' : 'Suspended',
                            isEligible: willBeEligible,
                            suspensionReason: willBeEligible ? '' : 'Suspension applied by Tournament Oversight'
                          };
                        });
                      }
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isEligible
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30'
                    }`}
                  >
                    {isEligible ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    <span>{isEligible ? 'Suspend from Matchday' : 'Reinstate to Eligible'}</span>
                  </button>
                )}

                {onEdit && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(activePlayer);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Edit Record</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#090B10] flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-slate-500 truncate">
            ID: {activePlayer._id || activePlayer.id}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
