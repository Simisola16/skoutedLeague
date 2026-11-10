import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  Shield,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Star,
  Users,
  Eye,
  Crown
} from 'lucide-react';
import Pagination from './Pagination';

export default function StatsPage({
  leaders = {},
  teams = [],
  onBackToHome,
  onSelectPlayer,
  onSelectTeam
}) {
  const [activeTab, setActiveTab] = useState('scorers'); // 'scorers' | 'assists' | 'contributions' | 'keepers'
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const topScorers = leaders?.topScorers || [];
  const topAssists = leaders?.topAssists || [];
  const topKeepers = leaders?.topKeepers || [];
  const totalGoals = leaders?.totalGoals || 0;
  const totalAssists = leaders?.totalAssists || 0;
  const totalMatches = leaders?.totalMatches || 0;

  // Compute Goal Contributions (Goals + Assists combined)
  const allContributingPlayers = useMemo(() => {
    const map = new Map();
    [...topScorers, ...topAssists].forEach(player => {
      if (!player?._id) return;
      if (!map.has(player._id)) {
        map.set(player._id, player);
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const aContrib = (a.stats?.goals || 0) + (a.stats?.assists || 0);
      const bContrib = (b.stats?.goals || 0) + (b.stats?.assists || 0);
      if (bContrib !== aContrib) return bContrib - aContrib;
      return (b.stats?.goals || 0) - (a.stats?.goals || 0);
    });
  }, [topScorers, topAssists]);

  // Active base dataset according to tab
  const baseList = useMemo(() => {
    switch (activeTab) {
      case 'assists':
        return topAssists;
      case 'contributions':
        return allContributingPlayers;
      case 'keepers':
        return topKeepers;
      case 'scorers':
      default:
        return topScorers;
    }
  }, [activeTab, topScorers, topAssists, allContributingPlayers, topKeepers]);

  // Filtered List
  const filteredList = useMemo(() => {
    return baseList.filter(player => {
      const fullName = `${player.firstName || ''} ${player.lastName || ''}`.toLowerCase();
      const clubName = player.team?.name?.toLowerCase() || '';
      const matchesSearch = !searchQuery || fullName.includes(searchQuery.toLowerCase()) || clubName.includes(searchQuery.toLowerCase());
      const matchesTeam = teamFilter === 'All' || player.team?._id === teamFilter || player.team?.name === teamFilter;
      const matchesPosition = positionFilter === 'All' || (player.position && player.position.toUpperCase().includes(positionFilter.toUpperCase()));
      return matchesSearch && matchesTeam && matchesPosition;
    });
  }, [baseList, searchQuery, teamFilter, positionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Top 3 Podium Leaders (from current active base list before search, or filtered)
  const podiumPlayers = (searchQuery || teamFilter !== 'All' || positionFilter !== 'All' ? filteredList : baseList).slice(0, 3);

  // Helper for stat display
  const getPrimaryStat = (player) => {
    if (activeTab === 'assists') {
      return { value: player.stats?.assists || 0, label: 'Assists', icon: '🎯' };
    }
    if (activeTab === 'contributions') {
      const g = player.stats?.goals || 0;
      const a = player.stats?.assists || 0;
      return { value: g + a, label: 'G+A', icon: '🔥', subtext: `${g}G, ${a}A` };
    }
    if (activeTab === 'keepers') {
      return { value: player.stats?.cleanSheets || 0, label: 'Clean Sheets', icon: '🧤' };
    }
    return { value: player.stats?.goals || 0, label: 'Goals', icon: '⚽' };
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#0A0D13] border border-[#1E2536] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#00E676]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Matches</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Official Tournament Individual Awards</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Season 2026/2027 • Lekan Salami Stadium
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight">
            Top Scorers & Assists Leaderboard
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Live official Golden Boot race, top playmakers, and goal contributions across the Skouted Youth League Championship.
          </p>

          {/* Quick Stats Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <span>⚽</span> Total Goals
              </div>
              <div className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
                {totalGoals}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <span>🎯</span> Total Assists
              </div>
              <div className="text-xl sm:text-2xl font-black font-display text-[#00E676] mt-0.5">
                {totalAssists}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <span>🏟️</span> Matches Played
              </div>
              <div className="text-xl sm:text-2xl font-black font-display text-cyan-400 mt-0.5">
                {totalMatches}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <span>⚡</span> Avg Goals/Match
              </div>
              <div className="text-xl sm:text-2xl font-black font-display text-amber-400 mt-0.5">
                {totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Switcher Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1E2330] pb-3 flex-wrap">
        <div className="flex items-center gap-2 bg-[#0C0F17] p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
          <button
            onClick={() => { setActiveTab('scorers'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scorers'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>⚽</span>
            <span>Top Scorers (Golden Boot)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'scorers' ? 'bg-black/25 text-black' : 'bg-white/10 text-slate-300'}`}>
              {topScorers.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('assists'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'assists'
                ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🎯</span>
            <span>Top Assists (Playmakers)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'assists' ? 'bg-black/25 text-black' : 'bg-white/10 text-slate-300'}`}>
              {topAssists.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('contributions'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contributions'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🔥</span>
            <span>Goal Contributions (G+A)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'contributions' ? 'bg-black/25 text-black' : 'bg-white/10 text-slate-300'}`}>
              {allContributingPlayers.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('keepers'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'keepers'
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/25 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🧤</span>
            <span>Clean Sheets</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'keepers' ? 'bg-black/25 text-black' : 'bg-white/10 text-slate-300'}`}>
              {topKeepers.length}
            </span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{filteredList.length}</span> ranked athletes
        </div>
      </div>

      {/* 3. The Podium Showcase (Top 3 Gold, Silver, Bronze) */}
      {podiumPlayers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Award Contenders & Leaders Podium</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {podiumPlayers.map((player, idx) => {
              const stat = getPrimaryStat(player);
              const rank = idx + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;

              const rankBorder = isGold 
                ? 'border-amber-400/50 hover:border-amber-400' 
                : isSilver 
                ? 'border-slate-300/40 hover:border-slate-300' 
                : 'border-amber-700/40 hover:border-amber-600';

              const rankBg = isGold
                ? 'bg-gradient-to-b from-amber-500/15 via-[#131722] to-[#0A0D13]'
                : isSilver
                ? 'bg-gradient-to-b from-slate-400/10 via-[#131722] to-[#0A0D13]'
                : 'bg-gradient-to-b from-amber-700/10 via-[#131722] to-[#0A0D13]';

              const rankBadgeBg = isGold
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                : isSilver
                ? 'bg-slate-300 text-black'
                : 'bg-amber-700 text-white';

              return (
                <div
                  key={player._id || idx}
                  onClick={() => onSelectPlayer && onSelectPlayer(player)}
                  className={`group relative rounded-3xl p-5 border ${rankBorder} ${rankBg} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between overflow-hidden`}
                >
                  {/* Glowing Rank Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl font-mono text-sm font-black flex items-center justify-center ${rankBadgeBg}`}>
                        #{rank}
                      </span>
                      {isGold && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Crown className="w-3 h-3" />
                          <span>Leader</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {player.position || 'Forward'}
                    </div>
                  </div>

                  {/* Player Image & Crest Showcase */}
                  <div className="py-4 flex items-center gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/60 border-2 border-white/15 overflow-hidden shrink-0 group-hover:scale-105 group-hover:border-white/30 transition-all shadow-xl">
                      {player.photo || player.photoUrl ? (
                        <img
                          src={player.photo || player.photoUrl}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center font-mono font-black text-slate-500 text-xl">
                          #{player.jerseyNumber || '?'}
                        </div>
                      )}

                      {/* Club Crest Mini Badge Overlaid */}
                      {player.team?.logo && (
                        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/80 border border-white/20 p-0.5 shadow-md">
                          <img
                            src={player.team.logo}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-mono text-[#00E676] font-bold">
                        #{player.jerseyNumber || '?'}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#00E676] transition-colors truncate">
                        {player.firstName} {player.lastName}
                      </h3>
                      <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                        <span className="font-semibold text-slate-300">{player.team?.name || 'Club'}</span>
                        {player.team?.shortCode && (
                          <span className="text-[10px] font-mono text-slate-500">({player.team.shortCode})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Primary Stat Banner */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {stat.label}
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-1.5">
                        <span className={isGold ? 'text-amber-400' : isSilver ? 'text-slate-200' : 'text-amber-500'}>
                          {stat.value}
                        </span>
                        <span className="text-sm">{stat.icon}</span>
                      </div>
                      {stat.subtext && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {stat.subtext}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono text-slate-500">Matches</div>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {player.stats?.matches || 1} MP
                      </div>
                      <div className="text-[10px] text-[#00E676] font-semibold mt-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 justify-end">
                        <span>Profile</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Search and Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0D1017] border border-[#1E2536] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by player name or club..."
            className="w-full bg-[#131722] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676]"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => { setTeamFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#131722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676] font-medium"
          >
            <option value="All">All Clubs ({teams.length || '12'})</option>
            {teams.map(t => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={positionFilter}
            onChange={(e) => { setPositionFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#131722] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676] font-medium"
          >
            <option value="All">All Positions</option>
            <option value="FWD">Forwards (ST, CF, LW, RW)</option>
            <option value="MID">Midfielders (CM, CAM, CDM)</option>
            <option value="DEF">Defenders (CB, LB, RB)</option>
            <option value="GK">Goalkeepers (GK)</option>
          </select>

          {(searchQuery || teamFilter !== 'All' || positionFilter !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setTeamFilter('All'); setPositionFilter('All'); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 5. Full Leaderboard Table */}
      <div className="bg-[#0E121B] border border-[#1E2536] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-white">Full Individual Rankings</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {paginatedList.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No players found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No athletes matched your search criteria for this category. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                  <th className="py-3 px-3 sm:px-4">Player</th>
                  <th className="py-3 px-3 sm:px-4 hidden md:table-cell">Club</th>
                  <th className="py-3 px-3 sm:px-4 text-center">Pos</th>
                  <th className="py-3 px-3 sm:px-4 text-center" title="Matches Played">MP</th>
                  <th className="py-3 px-3 sm:px-4 text-center font-bold text-amber-400" title="Total Goals Scored">Goals</th>
                  <th className="py-3 px-3 sm:px-4 text-center font-bold text-[#00E676]" title="Total Assists Delivered">Assists</th>
                  <th className="py-3 px-3 sm:px-4 text-center hidden sm:table-cell font-bold text-orange-400" title="Goal Contributions (Goals + Assists)">G+A</th>
                  <th className="py-3 px-3 sm:px-4 text-center hidden lg:table-cell text-slate-300" title="Goals per Match ratio (Goals ÷ Matches Played)">G/M</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {paginatedList.map((player, idx) => {
                  const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                  const goals = player.stats?.goals || 0;
                  const assists = player.stats?.assists || 0;
                  const matches = player.stats?.matches || 1;
                  const gpm = (goals / matches).toFixed(2);
                  const isTop3 = rank <= 3;

                  return (
                    <tr
                      key={player._id || idx}
                      onClick={() => onSelectPlayer && onSelectPlayer(player)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-black">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs ${
                          rank === 1 ? 'bg-amber-400 text-black shadow-sm font-black'
                          : rank === 2 ? 'bg-slate-300 text-black font-black'
                          : rank === 3 ? 'bg-amber-700 text-white font-black'
                          : 'text-slate-400'
                        }`}>
                          {rank}
                        </span>
                      </td>

                      {/* Player Image + Name */}
                      <td className="py-3.5 px-3 sm:px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl bg-black/50 border border-white/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow">
                            {player.photo || player.photoUrl ? (
                              <img
                                src={player.photo || player.photoUrl}
                                alt={`${player.firstName} ${player.lastName}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-mono font-bold text-slate-500 text-xs">
                                #{player.jerseyNumber || '?'}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-[#00E676] transition-colors truncate">
                              {player.firstName} {player.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 md:hidden">
                              <span>#{player.jerseyNumber || '?'}</span>
                              <span>•</span>
                              <span className="truncate">{player.team?.shortCode || player.team?.name}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Club */}
                      <td className="py-3.5 px-3 sm:px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {player.team?.logo && (
                            <img src={player.team.logo} alt="" className="w-5 h-5 object-contain shrink-0" />
                          )}
                          <span className="text-slate-300 font-medium truncate max-w-[150px]">
                            {player.team?.name || 'Club'}
                          </span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5 font-semibold">
                          {player.position || 'FWD'}
                        </span>
                      </td>

                      {/* Matches Played */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-medium text-slate-400">
                        {matches}
                      </td>

                      {/* Goals */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-black text-sm text-amber-400 bg-amber-500/[0.03]">
                        {goals}
                      </td>

                      {/* Assists */}
                      <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-black text-sm text-[#00E676] bg-[#00E676]/[0.03]">
                        {assists}
                      </td>

                      {/* G+A */}
                      <td className="py-3.5 px-3 sm:px-4 text-center hidden sm:table-cell font-mono font-black text-sm text-orange-400">
                        {goals + assists}
                      </td>

                      {/* Goals per Match */}
                      <td className="py-3.5 px-3 sm:px-4 text-center hidden lg:table-cell font-mono text-xs text-slate-400">
                        {gpm}
                      </td>

                      {/* Profile CTA */}
                      <td className="py-3.5 px-3 sm:px-4 text-right">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00E676]/15 text-[#00E676] text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          title="View complete player profile & scout dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

    </div>
  );
}

