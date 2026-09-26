import React from 'react';
import { X, Shield, Users, MapPin, UserCheck, CheckCircle2, Eye } from 'lucide-react';

export default function TeamDetailModal({ team, onClose, onPlayerClick }) {
  if (!team) return null;

  const players = team.players || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0F131C] border border-[#23293A] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 bg-[#121622] border-b border-[#1E2536] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/50 p-1.5 border border-white/10 flex items-center justify-center">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <Shield className="w-6 h-6 text-[#00E676]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">{team.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {team.shortCode}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                  {team.group || 'Group A'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manager: <strong className="text-slate-200">{team.managerName || 'Staff'}</strong>
                {team.stadium && <span> • {team.stadium}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Squad List */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Users className="w-4 h-4 text-[#00E676]" />
              <span>OFFICIAL REGISTERED SQUAD ({players.length}/35)</span>
            </div>
            <span className="text-[10px] text-[#00E676] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Roster</span>
            </span>
          </div>

          {players.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 text-slate-400 text-xs">
              Squad list undergoing final league verification.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {players.map((p, idx) => (
                <div
                  key={p._id || idx}
                  onClick={() => onPlayerClick && onPlayerClick(p)}
                  className="group p-2.5 rounded-xl bg-[#141824] hover:bg-[#181E2E] border border-white/5 hover:border-[#00E676]/40 flex items-center justify-between text-xs cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 text-center font-mono font-black text-[#00E676]">
                      #{p.jerseyNumber || (idx + 1)}
                    </span>
                    <div>
                      <div className="font-bold text-white group-hover:text-[#00E676] transition-colors">
                        {p.name || `${p.firstName} ${p.lastName}`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.position || 'MID'}
                      </div>
                    </div>
                  </div>

                  <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00E676] transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
