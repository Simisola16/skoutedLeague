import React, { useState } from 'react';
import { Shield, Users, MapPin, UserCheck, ArrowLeft, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';

export default function TeamsPage({ teams = [], onBackToHome, onSelectTeam }) {
  const [selectedGroup, setSelectedGroup] = useState('All');

  const groups = ['All', 'Group A', 'Group B'];

  const filteredTeams = teams.filter(t => {
    if (selectedGroup === 'All') return true;
    return (t.group || 'Group A') === selectedGroup;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#0A0D13] border border-[#1E2536] p-6 sm:p-10">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Matches</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>2025/2026 U-19 CHAMPIONSHIP</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            Registered League Clubs ({teams.length})
          </h1>

          <p className="text-sm sm:text-base text-slate-300">
            Meet the 12 elite youth academies and clubs competing in this season's Skouted Youth League.
          </p>
        </div>
      </section>

      {/* 2. Group Filter Pills */}
      <div className="flex items-center gap-2 pb-1">
        {groups.map(grp => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              selectedGroup === grp
                ? 'bg-[#00E676] text-black border-[#00E676] shadow-md shadow-[#00E676]/20'
                : 'bg-[#141722] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* 3. Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const squadCount = team.players?.length || 0;
          return (
            <div
              key={team._id}
              className="group glass-card rounded-2xl p-6 border border-[#1E2536] hover:border-[#00E676]/50 bg-[#111520] hover:bg-[#141926] transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-4">
                
                {/* Crest & Group Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-black/50 p-2 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Shield className="w-8 h-8 text-[#00E676]" />
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {team.group || 'Group A'}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-[#00E676] font-semibold justify-end">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Club</span>
                    </div>
                  </div>
                </div>

                {/* Team Name & Short Code */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#00E676] transition-colors flex items-center gap-2">
                    <span>{team.name}</span>
                    {team.shortCode && (
                      <span className="text-xs font-mono font-normal text-slate-400">
                        ({team.shortCode})
                      </span>
                    )}
                  </h3>
                </div>

                {/* Details Meta */}
                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Manager: <strong className="text-slate-200">{team.managerName || 'Official Staff'}</strong></span>
                  </div>
                  {team.stadium && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{team.stadium}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Squad: <strong className="text-[#00E676]">{squadCount}</strong> / 35 players registered</span>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={() => onSelectTeam && onSelectTeam(team)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#00E676]/15 border border-[#1E2536] hover:border-[#00E676]/30 text-slate-300 hover:text-[#00E676] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Club Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
