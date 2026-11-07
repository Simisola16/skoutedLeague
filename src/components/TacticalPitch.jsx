import React from 'react';
import { Shield, User } from 'lucide-react';

export default function TacticalPitch({ lineup, teamName, teamColor = '#00E676', onPlayerClick, events = [] }) {
  if (!lineup || !lineup.startingXI || lineup.startingXI.length === 0) {
    return (
      <div className="football-pitch w-full h-[360px] flex flex-col items-center justify-center p-6 text-center text-slate-300 rounded-2xl border border-white/10">
        <Shield className="w-12 h-12 text-slate-500 mb-2 opacity-50" />
        <h4 className="text-base font-bold font-display text-white">Lineup Not Locked</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {teamName || 'This team'} has not locked in their Starting XI yet. Official submission required 3 hours before kickoff.
        </p>
      </div>
    );
  }

  const { formation = '4-3-3', startingXI = [], bench = [] } = lineup;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Pitch Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }}></span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">{teamName}</span>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[#1F2430] text-[#00E676] border border-[#00E676]/30">
          {formation}
        </span>
      </div>

      {/* 2D Grass Tactical Pitch */}
      <div 
        className="football-pitch w-full h-[400px] relative rounded-2xl overflow-hidden select-none border-2 border-white/20"
      >
        {/* Grass striping overlay */}
        <div className="absolute inset-0 pitch-stripes pointer-events-none opacity-50"></div>

        {/* Outer pitch boundary line */}
        <div className="absolute inset-2 border border-white/40 rounded-sm pointer-events-none"></div>

        {/* Halfway line */}
        <div className="absolute top-1/2 left-2 right-2 h-0 border-t border-white/40 -translate-y-1/2 pointer-events-none"></div>

        {/* Center circle & center spot */}
        <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        {/* Top Penalty Box (Keeper area) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-l border-r border-white/40 pointer-events-none"></div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-8 border-b border-l border-r border-white/40 pointer-events-none"></div>

        {/* Bottom Penalty Box (Opponent area) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-l border-r border-white/40 pointer-events-none"></div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-8 border-t border-l border-r border-white/40 pointer-events-none"></div>

        {/* Player Markers on Pitch */}
        {startingXI.map((slot, index) => {
          const playerObj = slot.player || {};
          const isCaptain = slot.isCaptain;
          const posX = slot.gridX !== undefined ? slot.gridX : 50;
          const posY = slot.gridY !== undefined ? slot.gridY : 50;

          // Goal count for this player in this match
          const pId = playerObj._id || slot.playerId;
          const pFullName = `${playerObj.firstName || ''} ${playerObj.lastName || ''}`.trim().toLowerCase();
          const pLastName = (playerObj.lastName || '').trim().toLowerCase();
          const goalCount = (events || []).filter(ev => {
            if (ev.type !== 'GOAL') return false;
            const evPId = ev.player?._id || (typeof ev.player === 'string' ? ev.player : null);
            if (pId && evPId && String(evPId) === String(pId)) return true;
            if (ev.player && typeof ev.player === 'object') {
              const evName = `${ev.player.firstName || ''} ${ev.player.lastName || ''}`.trim().toLowerCase();
              if (evName && pFullName && (evName === pFullName || pFullName.includes(evName) || evName.includes(pFullName))) return true;
              if (pLastName && pLastName.length > 2 && (ev.player.lastName || '').toLowerCase() === pLastName) return true;
            }
            if (pFullName && typeof ev.player === 'string' && ev.player.length !== 24) {
              const evStr = ev.player.trim().toLowerCase();
              if (evStr === pFullName || pFullName.includes(evStr)) return true;
            }
            if (ev.description && (pFullName || pLastName)) {
              const desc = ev.description.toLowerCase();
              if (pFullName && desc.includes(pFullName)) return true;
              if (pLastName && pLastName.length > 3 && desc.includes(pLastName)) return true;
            }
            return false;
          }).length;

          return (
            <div
              key={index}
              onClick={() => onPlayerClick && onPlayerClick(playerObj)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group transition-transform duration-200 hover:scale-110 z-10"
              style={{
                left: `${posX}%`,
                top: `${posY}%`
              }}
            >
              {/* Goal Balls Floating on Player Head */}
              {goalCount > 0 && (
                <div 
                  className="absolute -top-4.5 left-1/2 -translate-x-1/2 flex items-center justify-center gap-0.5 z-30 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] animate-bounce"
                  title={`Scored ${goalCount} ${goalCount > 1 ? 'goals' : 'goal'}!`}
                >
                  {Array.from({ length: goalCount }).map((_, gIdx) => (
                    <span key={gIdx} className="text-sm select-none filter drop-shadow">
                      ⚽
                    </span>
                  ))}
                </div>
              )}

              {/* Player Jersey Circle */}
              <div 
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shadow-lg relative"
                style={{
                  backgroundColor: slot.position === 'GK' ? '#FFB800' : teamColor,
                  color: slot.position === 'GK' ? '#000000' : '#07120B'
                }}
              >
                {playerObj.jerseyNumber || slot.position || index + 1}
                {isCaptain && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FFB800] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black shadow">
                    C
                  </span>
                )}
              </div>

              {/* Player Name Label */}
              <div className="mt-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/20 text-[10px] font-semibold text-white tracking-tight whitespace-nowrap shadow max-w-[80px] truncate text-center flex items-center gap-0.5 justify-center">
                <span>{playerObj.lastName || playerObj.firstName || slot.position}</span>
                {goalCount > 0 && (
                  <span className="text-[9px] text-[#00E676] font-mono font-black">
                    ⚽{goalCount > 1 ? `x${goalCount}` : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bench Substitutes */}
      {bench && bench.length > 0 && (
        <div className="bg-[#141720] rounded-xl p-3 border border-[#222735]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Bench Substitutes ({bench.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bench.map((b, i) => {
              const p = b.player || {};
              const bpId = p._id || b.playerId;
              const bpFullName = `${p.firstName || ''} ${p.lastName || ''}`.trim().toLowerCase();
              const bpLastName = (p.lastName || '').trim().toLowerCase();
              const bGoals = (events || []).filter(ev => {
                if (ev.type !== 'GOAL') return false;
                const evPId = ev.player?._id || (typeof ev.player === 'string' ? ev.player : null);
                if (bpId && evPId && String(evPId) === String(bpId)) return true;
                if (ev.player && typeof ev.player === 'object') {
                  const evName = `${ev.player.firstName || ''} ${ev.player.lastName || ''}`.trim().toLowerCase();
                  if (evName && bpFullName && (evName === bpFullName || bpFullName.includes(evName) || evName.includes(bpFullName))) return true;
                  if (bpLastName && bpLastName.length > 2 && (ev.player.lastName || '').toLowerCase() === bpLastName) return true;
                }
                return false;
              }).length;

              return (
                <div
                  key={i}
                  onClick={() => onPlayerClick && onPlayerClick(p)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-[#00E676]/40 cursor-pointer text-xs transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[#00E676] font-mono font-bold text-[10px] flex items-center justify-center">
                    {p.jerseyNumber || '#'}
                  </span>
                  <span className="text-slate-200 font-medium">{p.lastName || p.firstName || 'Substitute'}</span>
                  {bGoals > 0 && (
                    <span className="text-xs" title={`Scored ${bGoals} goal(s)`}>
                      {'⚽'.repeat(bGoals)}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">({b.position || p.position})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
