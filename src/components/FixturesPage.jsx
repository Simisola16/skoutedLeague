import React, { useState, useMemo } from 'react';
import MatchCard from './MatchCard';
import { Calendar, Search, Activity, Clock, Trophy, ArrowLeft, Bell, Filter } from 'lucide-react';

export default function FixturesPage({
  fixtures = [],
  onSelectFixture,
  onBackToHome,
  favoriteTeamIds = [],
  onToggleFavorite,
  onOpenFanAlerts
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'live' | 'upcoming' | 'finished'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  // Compute live, upcoming, finished subsets
  const liveCount = useMemo(() => {
    return fixtures.filter(f => ['1ST HALF', '2ND HALF', 'HT', 'PENS', 'LIVE'].includes(f.status)).length;
  }, [fixtures]);

  const upcomingCount = useMemo(() => {
    return fixtures.filter(f => f.status === 'UPCOMING').length;
  }, [fixtures]);

  const finishedCount = useMemo(() => {
    return fixtures.filter(f => f.status === 'FT').length;
  }, [fixtures]);

  // Extract unique stages
  const stages = useMemo(() => {
    const set = new Set();
    fixtures.forEach(f => {
      if (f.stage) set.add(f.stage);
    });
    return Array.from(set);
  }, [fixtures]);

  // Filtered fixtures
  const filteredFixtures = useMemo(() => {
    return fixtures.filter(f => {
      // 1. Status Filter
      const isLive = ['1ST HALF', '2ND HALF', 'HT', 'PENS', 'LIVE'].includes(f.status);
      const isUpcoming = f.status === 'UPCOMING';
      const isFinished = f.status === 'FT';

      if (statusFilter === 'live' && !isLive) return false;
      if (statusFilter === 'upcoming' && !isUpcoming) return false;
      if (statusFilter === 'finished' && !isFinished) return false;

      // 2. Stage Filter
      if (selectedStage !== 'ALL' && f.stage !== selectedStage) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const homeName = f.homeTeam?.name?.toLowerCase() || '';
        const homeCode = f.homeTeam?.shortCode?.toLowerCase() || '';
        const awayName = f.awayTeam?.name?.toLowerCase() || '';
        const awayCode = f.awayTeam?.shortCode?.toLowerCase() || '';
        const venue = f.venue?.toLowerCase() || '';
        const stage = f.stage?.toLowerCase() || '';

        const matches = homeName.includes(q) ||
          homeCode.includes(q) ||
          awayName.includes(q) ||
          awayCode.includes(q) ||
          venue.includes(q) ||
          stage.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [fixtures, statusFilter, selectedStage, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2330]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Back to Homepage"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00E676]" />
              <span>Championship Fixtures & Results</span>
              {liveCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping" />
                  <span>{liveCount} LIVE</span>
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete tournament schedule across all matchdays, real-time scores, and official reports
            </p>
          </div>
        </div>

        {onOpenFanAlerts && (
          <button
            onClick={onOpenFanAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/25 text-[#FFB800] transition-all text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Instant Goal Alerts</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Control Row */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'ALL FIXTURES', count: fixtures.length },
              { id: 'live', label: 'LIVE NOW', count: liveCount, isLive: true },
              { id: 'upcoming', label: 'UPCOMING', count: upcomingCount },
              { id: 'finished', label: 'RESULTS', count: finishedCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                  statusFilter === tab.id
                    ? tab.isLive
                      ? 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-white shadow-md shadow-[#FF4B4B]/20 font-black'
                      : 'bg-[#00E676]/15 border-[#00E676] text-[#00E676] shadow-md shadow-[#00E676]/15 font-black'
                    : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {tab.isLive && tab.count > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping" />
                )}
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  statusFilter === tab.id
                    ? tab.isLive ? 'bg-[#FF4B4B]/30 text-white' : 'bg-[#00E676]/20 text-[#00E676]'
                    : 'bg-white/5 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, venue, stage..."
              className="w-full bg-[#141720] border border-[#222735] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] transition-colors"
            />
          </div>

        </div>

        {/* Stage Pills (if multiple stages exist) */}
        {stages.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => setSelectedStage('ALL')}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${
                selectedStage === 'ALL'
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/[0.02] text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              All Stages
            </button>
            {stages.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${
                  selectedStage === st
                    ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30'
                    : 'bg-white/[0.02] text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fixtures Card Grid */}
      {filteredFixtures.length === 0 ? (
        <div className="rounded-2xl p-8 sm:p-12 text-center text-slate-400 space-y-3 border border-slate-800 bg-slate-900/60">
          <Clock className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="font-bold text-white text-base">No Matching Fixtures Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or status filter to see other tournament matchdays.
          </p>
          {(searchQuery || statusFilter !== 'all' || selectedStage !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSelectedStage('ALL');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {filteredFixtures.map(fixture => (
            <MatchCard
              key={fixture._id}
              fixture={fixture}
              onSelect={onSelectFixture}
              isFavoriteHome={favoriteTeamIds.includes(fixture.homeTeam?._id)}
              isFavoriteAway={favoriteTeamIds.includes(fixture.awayTeam?._id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Return to homepage button at bottom */}
      <div className="pt-4 text-center">
        <button
          onClick={onBackToHome}
          className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to League Homepage</span>
        </button>
      </div>

    </div>
  );
}
