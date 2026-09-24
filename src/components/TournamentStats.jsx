import React, { useState } from 'react';
import { Award, Zap, Shield, Flame } from 'lucide-react';

export default function TournamentStats({ leaders = {}, onPlayerClick }) {
  const [tab, setTab] = useState('scorers'); // 'scorers' | 'assists' | 'keepers'

  const topScorers = leaders?.topScorers || [];
  const topAssists = leaders?.topAssists || [];
  const topKeepers = leaders?.topKeepers || [];

  return (
    <div className="glass-card rounded-2xl border border-[#222735] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#1E2330] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FFB800]" />
          <div>
            <h3 className="font-display font-extrabold text-base text-white">Tournament Leaders & Scouting</h3>
            <p className="text-[11px] text-slate-400">Official individual awards and performance rankings</p>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex rounded-xl bg-[#10131B] p-1 border border-[#222735]">
          <button
            onClick={() => setTab('scorers')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              tab === 'scorers' ? 'bg-[#FFB800] text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Golden Boot</span>
          </button>

          <button
            onClick={() => setTab('assists')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              tab === 'assists' ? 'bg-[#3B82F6] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Playmakers</span>
          </button>

          <button
            onClick={() => setTab('keepers')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              tab === 'keepers' ? 'bg-[#00E676] text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Clean Sheets</span>
          </button>
        </div>
      </div>

      {/* List Table */}
      <div className="p-3 sm:p-4 divide-y divide-[#1E2330]">
        
        {/* Golden Boot (Top Scorers) */}
        {tab === 'scorers' && (
          topScorers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No tournament goals recorded yet. Matchday statistics will populate here live.
            </div>
          ) : (
            topScorers.map((player, idx) => (
              <div
                key={player._id}
                onClick={() => onPlayerClick && onPlayerClick(player)}
                className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-md font-mono text-xs font-black flex items-center justify-center ${
                    idx === 0 ? 'bg-[#FFB800] text-black shadow' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.firstName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 bg-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-xs font-bold text-[#FFB800]">
                      #{player.jerseyNumber}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-white">{player.firstName} {player.lastName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>#{player.jerseyNumber}</span>
                      <span>•</span>
                      <span>{player.team?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-black text-[#FFB800] flex items-center gap-1 justify-end">
                    <span>{player.stats?.goals || 0}</span>
                    <span className="text-xs">⚽</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{player.stats?.matches || 0} matches</div>
                </div>
              </div>
            ))
          )
        )}

        {/* Playmakers (Top Assists) */}
        {tab === 'assists' && (
          topAssists.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No tournament assists logged yet. Scouting playmakers will rank here live.
            </div>
          ) : (
            topAssists.map((player, idx) => (
              <div
                key={player._id}
                onClick={() => onPlayerClick && onPlayerClick(player)}
                className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md font-mono text-xs font-black flex items-center justify-center text-slate-400">
                    {idx + 1}
                  </span>
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.firstName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 bg-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-xs font-bold text-[#3B82F6]">
                      #{player.jerseyNumber}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-white">{player.firstName} {player.lastName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>#{player.jerseyNumber}</span>
                      <span>•</span>
                      <span>{player.team?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-black text-[#3B82F6]">
                    {player.stats?.assists || 0} 🎯
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{player.stats?.matches || 0} matches</div>
                </div>
              </div>
            ))
          )
        )}

        {/* Clean Sheets */}
        {tab === 'keepers' && (
          topKeepers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No clean sheets recorded yet. Goalkeeper statistics will display here as matches conclude.
            </div>
          ) : (
            topKeepers.map((player, idx) => (
              <div
                key={player._id}
                onClick={() => onPlayerClick && onPlayerClick(player)}
                className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md font-mono text-xs font-black flex items-center justify-center text-slate-400">
                    {idx + 1}
                  </span>
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.firstName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 bg-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-xs font-bold text-[#00E676]">
                      #{player.jerseyNumber}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-white">{player.firstName} {player.lastName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>#{player.jerseyNumber} (GK)</span>
                      <span>•</span>
                      <span>{player.team?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-black text-[#00E676]">
                    {player.stats?.cleanSheets || 0} 🧤
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{player.stats?.matches || 0} matches</div>
                </div>
              </div>
            ))
          )
        )}

      </div>

    </div>
  );
}
