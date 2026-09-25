import React from 'react';
import { Trophy, Shield } from 'lucide-react';

export default function StandingsTable({ standings = [], onTeamClick }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-[#222735]">
        <Trophy className="w-12 h-12 mx-auto text-[#00E676] opacity-40 mb-2" />
        <h4 className="font-bold text-base text-white font-display">No Tournament Standings Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Championship points, goal differences, and form guides will automatically calculate as matches conclude.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl border border-[#222735] overflow-hidden">
      
      {/* Table Title Bar */}
      <div className="p-4 sm:p-5 border-b border-[#1E2330] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFB800]" />
          <div>
            <h3 className="font-display font-extrabold text-base text-white">Championship League Table</h3>
            <p className="text-[11px] text-slate-400">12 Clubs • 22 Matches per club (Home & Away) • Season 2026/2027</p>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2330] text-[11px] text-slate-400 font-mono uppercase bg-[#10131B]">
              <th className="py-3 px-3 sm:px-4 text-center w-8">#</th>
              <th className="py-3 px-2 sm:px-4">Club</th>
              <th className="py-3 px-2 text-center">PL</th>
              <th className="py-3 px-2 text-center">W</th>
              <th className="py-3 px-2 text-center">D</th>
              <th className="py-3 px-2 text-center">L</th>
              <th className="py-3 px-2 text-center hidden sm:table-cell">GF</th>
              <th className="py-3 px-2 text-center hidden sm:table-cell">GA</th>
              <th className="py-3 px-2 text-center">GD</th>
              <th className="py-3 px-3 text-center font-bold text-white">PTS</th>
              <th className="py-3 px-3 text-center hidden md:table-cell">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2330]">
            {standings.map((t, idx) => {
              const pos = idx + 1;
              const stats = t.stats || {};
              const isChampionshipLeader = pos === 1;
              const isPlayoffs = pos === 2 || pos === 3;

              return (
                <tr
                  key={t._id}
                  onClick={() => onTeamClick && onTeamClick(t)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  {/* Position */}
                  <td className="py-3 px-3 sm:px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-md font-mono text-xs font-bold ${
                        isChampionshipLeader
                          ? 'bg-[#FFB800] text-black shadow-sm'
                          : isPlayoffs
                            ? 'bg-[#00E676]/20 text-[#00E676]'
                            : 'text-slate-400'
                      }`}
                    >
                      {pos}
                    </span>
                  </td>

                  {/* Club info */}
                  <td className="py-3 px-2 sm:px-4 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      {t.logo ? (
                        <img
                          src={t.logo}
                          alt={t.name}
                          className="w-6 h-6 rounded-lg object-cover shrink-0 bg-slate-800 border border-white/10"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-[#1A1D28] border border-white/10 flex items-center justify-center text-[9px] font-black text-[#00E676] shrink-0">
                          {t.shortCode || 'FC'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold truncate text-xs sm:text-sm block">{t.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{t.shortCode}</span>
                      </div>
                    </div>
                  </td>

                  {/* Matches Played */}
                  <td className="py-3 px-2 text-center font-mono text-slate-300">{stats.played || 0}</td>

                  {/* Won */}
                  <td className="py-3 px-2 text-center font-mono text-slate-300">{stats.won || 0}</td>

                  {/* Drawn */}
                  <td className="py-3 px-2 text-center font-mono text-slate-400">{stats.drawn || 0}</td>

                  {/* Lost */}
                  <td className="py-3 px-2 text-center font-mono text-slate-400">{stats.lost || 0}</td>

                  {/* Goals For */}
                  <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">{stats.goalsFor || 0}</td>

                  {/* Goals Against */}
                  <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">{stats.goalsAgainst || 0}</td>

                  {/* Goal Difference */}
                  <td className="py-3 px-2 text-center font-mono font-bold">
                    <span className={(stats.goalDifference || 0) > 0 ? 'text-[#00E676]' : (stats.goalDifference || 0) < 0 ? 'text-[#FF4B4B]' : 'text-slate-400'}>
                      {(stats.goalDifference || 0) > 0 ? `+${stats.goalDifference}` : (stats.goalDifference || 0)}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-3 px-3 text-center font-mono text-sm font-black text-white bg-white/[0.02]">
                    {stats.points || 0}
                  </td>

                  {/* Form Badges (W/D/L) */}
                  <td className="py-3 px-3 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {(!stats.form || stats.form.length === 0) ? (
                        <span className="text-[10px] text-slate-600">-</span>
                      ) : (
                        stats.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-md font-mono font-black text-[10px] flex items-center justify-center ${
                              res === 'W'
                                ? 'bg-[#00E676] text-black'
                                : res === 'D'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-[#FF4B4B]/20 text-[#FF4B4B] border border-[#FF4B4B]/30'
                            }`}
                          >
                            {res}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend Footer */}
      <div className="p-3 border-t border-[#1E2330] bg-[#10131B] flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FFB800]"></span>
          <span>1st: League Cup & Champion's Trophy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#00E676]/60"></span>
          <span>2nd-3rd: Finalist Playoffs</span>
        </div>
      </div>

    </div>
  );
}
