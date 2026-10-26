import React, { useState, useEffect } from 'react';
import { Award, Zap, Shield, Flame } from 'lucide-react';
import Pagination from './Pagination';

export default function TournamentStats({ leaders = {}, onPlayerClick }) {
  const [tab, setTab] = useState('scorers');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when switching tabs
  useEffect(() => { setCurrentPage(1); }, [tab]);

  const topScorers = leaders?.topScorers || [];
  const topAssists = leaders?.topAssists || [];
  const topKeepers = leaders?.topKeepers || [];

  // Active list + pagination derived from current tab
  const activeList = tab === 'scorers' ? topScorers : tab === 'assists' ? topAssists : topKeepers;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = activeList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const PlayerRow = ({ player, rank, accentColor, statValue, statIcon }) => (
    <div
      key={player._id}
      onClick={() => onPlayerClick && onPlayerClick(player)}
      className="py-3 px-2 flex items-center justify-between hover:bg-white/[0.02] rounded-xl transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className={`w-6 h-6 rounded-md font-mono text-xs font-black flex items-center justify-center ${
          rank === 0 ? 'bg-[#FFB800] text-black shadow'
          : rank === 1 ? 'bg-slate-300 text-black'
          : rank === 2 ? 'bg-amber-700 text-white'
          : 'text-slate-400'
        }`}>
          {rank + 1}
        </span>
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.firstName}
            className="w-10 h-10 rounded-xl object-cover border border-white/10 bg-slate-800"
          />
        ) : (
          <div className={`w-10 h-10 rounded-xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-xs font-bold ${accentColor}`}>
            #{player.jerseyNumber}
          </div>
        )}
        <div>
          <div className="font-bold text-sm text-white">{player.firstName} {player.lastName}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>#{player.jerseyNumber}{tab === 'keepers' ? ' (GK)' : ''}</span>
            <span>•</span>
            <span>{player.team?.name}</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={`text-lg font-mono font-black ${accentColor} flex items-center gap-1 justify-end`}>
          <span>{statValue}</span>
          <span className="text-xs">{statIcon}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">{player.stats?.matches || 0} matches</div>
      </div>
    </div>
  );

  const emptyMessages = {
    scorers: 'No tournament goals recorded yet. Matchday statistics will populate here live.',
    assists: 'No tournament assists logged yet. Scouting playmakers will rank here live.',
    keepers: 'No clean sheets recorded yet. Goalkeeper statistics will display here as matches conclude.',
  };

  return (
    <div className="glass-card rounded-2xl border border-[#222735] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#1E2330] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FFB800]" />
          <div>
            <h3 className="font-display font-extrabold text-base text-white">Tournament Leaders &amp; Scouting</h3>
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
        {activeList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            {emptyMessages[tab]}
          </div>
        ) : (
          paginatedList.map((player, idx) => {
            const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx;
            if (tab === 'scorers') {
              return (
                <PlayerRow
                  key={player._id}
                  player={player}
                  rank={rank}
                  accentColor="text-[#FFB800]"
                  statValue={player.stats?.goals || 0}
                  statIcon="⚽"
                />
              );
            }
            if (tab === 'assists') {
              return (
                <PlayerRow
                  key={player._id}
                  player={player}
                  rank={rank}
                  accentColor="text-[#3B82F6]"
                  statValue={player.stats?.assists || 0}
                  statIcon="🎯"
                />
              );
            }
            return (
              <PlayerRow
                key={player._id}
                player={player}
                rank={rank}
                accentColor="text-[#00E676]"
                statValue={player.stats?.cleanSheets || 0}
                statIcon="🧤"
              />
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="px-4 pb-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={activeList.length}
          onPageChange={setCurrentPage}
          label="players"
        />
      </div>

    </div>
  );
}
