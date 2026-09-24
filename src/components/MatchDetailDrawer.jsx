import React, { useState } from 'react';
import { X, Activity, Users, BarChart3, Clock, Shield, Flag, Award, AlertCircle } from 'lucide-react';
import TacticalPitch from './TacticalPitch';

export default function MatchDetailDrawer({
  fixture,
  events = [],
  onClose,
  onPlayerClick
}) {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'lineups' | 'stats'
  const [lineupTeam, setLineupTeam] = useState('home'); // 'home' | 'away'

  if (!fixture) return null;

  const isLive = fixture.status === '1ST HALF' || fixture.status === '2ND HALF' || fixture.status === 'HT' || fixture.status === 'PENS';
  const stats = fixture.stats || {
    homePossession: 50,
    awayPossession: 50,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homeShotsTotal: 0,
    awayShotsTotal: 0,
    homeCorners: 0,
    awayCorners: 0,
    homeFouls: 0,
    awayFouls: 0
  };

  const currentLineup = lineupTeam === 'home' ? fixture.homeLineup : fixture.awayLineup;
  const currentTeamName = lineupTeam === 'home' ? fixture.homeTeam?.name : fixture.awayTeam?.name;
  const currentTeamColor = lineupTeam === 'home' ? '#00E676' : '#3B82F6';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      
      {/* Drawer Container (full height on desktop, bottom sheet / drawer on mobile) */}
      <div className="w-full max-w-xl bg-[#0D0F14] border-l border-[#222735] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2330] bg-[#141720]">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-400">{fixture.stage}</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Teams & Score Billboard */}
          <div className="flex items-center justify-between pt-1">
            
            {/* Home Team */}
            <div className="flex flex-col items-center text-center w-1/3 min-w-0">
              {fixture.homeTeam?.logo ? (
                <img
                  src={fixture.homeTeam.logo}
                  alt={fixture.homeTeam?.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/10 bg-slate-800 shadow-md mb-1.5"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-sm font-black text-[#00E676] shadow-md mb-1.5">
                  {fixture.homeTeam?.shortCode || 'H'}
                </div>
              )}
              <span className="font-bold text-xs text-white truncate max-w-full">{fixture.homeTeam?.name}</span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">{fixture.homeTeam?.shortCode}</span>
            </div>

            {/* Score & Period Status */}
            <div className="flex flex-col items-center justify-center w-1/3">
              <div className="text-3xl font-mono font-black tracking-tight text-white mb-1">
                {fixture.status === 'UPCOMING' ? (
                  <span className="text-xl text-slate-400">VS</span>
                ) : (
                  <span>{fixture.homeScore} - {fixture.awayScore}</span>
                )}
              </div>
              {isLive ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] font-mono font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping"></span>
                  <span>{fixture.status === 'HT' ? 'HT' : `${fixture.minute}'`}</span>
                </div>
              ) : (
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {fixture.status}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center w-1/3 min-w-0">
              {fixture.awayTeam?.logo ? (
                <img
                  src={fixture.awayTeam.logo}
                  alt={fixture.awayTeam?.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/10 bg-slate-800 shadow-md mb-1.5"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-sm font-black text-[#00E676] shadow-md mb-1.5">
                  {fixture.awayTeam?.shortCode || 'A'}
                </div>
              )}
              <span className="font-bold text-xs text-white truncate max-w-full">{fixture.awayTeam?.name}</span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">{fixture.awayTeam?.shortCode}</span>
            </div>

          </div>
        </div>

        {/* Tab Switcher: Timeline, Lineups, Stats */}
        <div className="flex items-center justify-around border-b border-[#1E2330] bg-[#10131B] px-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-3 text-xs font-bold font-display flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('lineups')}
            className={`flex-1 py-3 text-xs font-bold font-display flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'lineups'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lineups</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-xs font-bold font-display flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'stats'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* 1. TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No match events recorded yet.</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Goals, cards, and substitutions will stream here in real-time.</p>
                </div>
              ) : (
                events.map(ev => {
                  const isHome = ev.team?._id === fixture.homeTeam?._id;
                  const isGoal = ev.type === 'GOAL';
                  const isYellow = ev.type === 'YELLOW_CARD';
                  const isRed = ev.type === 'RED_CARD';
                  const isSub = ev.type === 'SUB_IN' || ev.type === 'SUB_OUT';

                  return (
                    <div
                      key={ev._id}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        isGoal 
                          ? 'bg-[#00E676]/10 border-[#00E676]/30' 
                          : isRed 
                            ? 'bg-rose-500/10 border-rose-500/30' 
                            : 'bg-[#141720] border-[#222735]'
                      }`}
                    >
                      {/* Minute badge */}
                      <span className="font-mono font-black text-xs px-2 py-1 rounded-md bg-black/40 text-[#00E676] border border-white/5">
                        {ev.minute}'
                      </span>

                      {/* Event Icon */}
                      <div className="text-base shrink-0">
                        {isGoal && '⚽'}
                        {isYellow && '🟨'}
                        {isRed && '🟥'}
                        {isSub && '🔄'}
                        {ev.type === 'VAR_DECISION' && '📺'}
                        {ev.type === 'OWN_GOAL' && '⚽ (OG)'}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {ev.player ? (
                            <button
                              type="button"
                              onClick={() => onPlayerClick && onPlayerClick(ev.player)}
                              className="font-bold text-xs text-white truncate hover:text-[#00E676] hover:underline cursor-pointer text-left transition-colors"
                              title="Click to view full player details"
                            >
                              {ev.player.firstName} {ev.player.lastName}
                            </button>
                          ) : (
                            <span className="font-bold text-xs text-white truncate">
                              {ev.team?.name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">({ev.team?.shortCode})</span>
                        </div>
                        {ev.assistPlayer && (
                          <div className="text-[11px] text-slate-400">
                            Assist:{' '}
                            <button
                              type="button"
                              onClick={() => onPlayerClick && onPlayerClick(ev.assistPlayer)}
                              className="text-slate-300 hover:text-[#00E676] hover:underline cursor-pointer transition-colors"
                              title="Click to view full player details"
                            >
                              {ev.assistPlayer.firstName} {ev.assistPlayer.lastName}
                            </button>
                          </div>
                        )}
                        {ev.description && (
                          <p className="text-[11px] text-slate-300 mt-0.5">{ev.description}</p>
                        )}
                      </div>

                      {/* Score at event */}
                      {ev.scoreAtEvent && isGoal && (
                        <div className="font-mono font-bold text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                          {ev.scoreAtEvent.home}-{ev.scoreAtEvent.away}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. LINEUPS TAB */}
          {activeTab === 'lineups' && (
            <div className="space-y-4">
              
              {/* Home / Away Lineup Toggle */}
              <div className="flex rounded-xl bg-[#141720] p-1 border border-[#222735]">
                <button
                  onClick={() => setLineupTeam('home')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    lineupTeam === 'home'
                      ? 'bg-[#00E676] text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fixture.homeTeam?.name} ({fixture.homeTeam?.shortCode})
                </button>
                <button
                  onClick={() => setLineupTeam('away')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    lineupTeam === 'away'
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fixture.awayTeam?.name} ({fixture.awayTeam?.shortCode})
                </button>
              </div>

              {/* Tactical Pitch Visualizer */}
              <TacticalPitch
                lineup={currentLineup}
                teamName={currentTeamName}
                teamColor={currentTeamColor}
                onPlayerClick={onPlayerClick}
              />

            </div>
          )}

          {/* 3. STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Match Comparison</h4>
              
              {[
                { label: 'Ball Possession', home: `${stats.homePossession}%`, away: `${stats.awayPossession}%`, homeVal: stats.homePossession, awayVal: stats.awayPossession },
                { label: 'Shots on Target', home: stats.homeShotsOnTarget, away: stats.awayShotsOnTarget, homeVal: stats.homeShotsOnTarget, awayVal: stats.awayShotsOnTarget },
                { label: 'Total Shots', home: stats.homeShotsTotal, away: stats.awayShotsTotal, homeVal: stats.homeShotsTotal, awayVal: stats.awayShotsTotal },
                { label: 'Corner Kicks', home: stats.homeCorners, away: stats.awayCorners, homeVal: stats.homeCorners, awayVal: stats.awayCorners },
                { label: 'Fouls Committed', home: stats.homeFouls, away: stats.awayFouls, homeVal: stats.homeFouls, awayVal: stats.awayFouls },
                { label: 'Offsides', home: stats.homeOffsides || 0, away: stats.awayOffsides || 0, homeVal: stats.homeOffsides || 0, awayVal: stats.awayOffsides || 0 }
              ].map((row, i) => {
                const total = (row.homeVal + row.awayVal) || 1;
                const homePct = Math.round((row.homeVal / total) * 100);

                return (
                  <div key={i} className="bg-[#141720] p-3 rounded-xl border border-[#222735] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="font-mono font-bold text-white">{row.home}</span>
                      <span className="text-slate-400 text-[11px]">{row.label}</span>
                      <span className="font-mono font-bold text-white">{row.away}</span>
                    </div>
                    {/* Comparison bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div className="bg-[#00E676] h-full transition-all duration-500" style={{ width: `${homePct}%` }}></div>
                      <div className="bg-[#3B82F6] h-full transition-all duration-500" style={{ width: `${100 - homePct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
