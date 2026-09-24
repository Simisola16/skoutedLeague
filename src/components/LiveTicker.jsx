import React from 'react';
import { Activity } from 'lucide-react';

export default function LiveTicker({ fixtures = [], selectedFixtureId, onSelectFixture }) {
  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="bg-[#12151D] border-b border-[#1E2330] py-2 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
          <span className="font-bold text-slate-300 uppercase tracking-wider">Live Scores:</span>
          <span className="text-slate-500">No active matches at the moment. Matchday coverage will stream live here.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12151D] border-b border-[#1E2330] py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Horizontal scroll container */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth">
          
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider pr-2 border-r border-[#252A38] shrink-0">
            <Activity className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Scores</span>
          </div>

          {fixtures.map(f => {
            const isLive = f.status === '1ST HALF' || f.status === '2ND HALF' || f.status === 'HT' || f.status === 'PENS';
            const isFT = f.status === 'FT';
            const isSelected = selectedFixtureId === f._id;

            return (
              <div
                key={f._id}
                onClick={() => onSelectFixture(f)}
                className={`shrink-0 cursor-pointer p-2 rounded-xl transition-all border flex items-center gap-3 min-w-[210px] ${
                  isSelected 
                    ? 'bg-[#1E2330] border-[#00E676]/60 shadow-md shadow-[#00E676]/10' 
                    : isLive 
                      ? 'bg-[#181B24] border-[#FF4B4B]/30 hover:border-[#FF4B4B]/60' 
                      : 'bg-[#141720] border-[#222735] hover:border-slate-600'
                }`}
              >
                {/* Match Status Badge / Clock */}
                <div className="flex flex-col items-center min-w-[42px] text-center border-r border-white/5 pr-2">
                  {isLive ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping mb-0.5"></span>
                      <span className="text-[10px] font-mono font-black text-[#FF4B4B]">
                        {f.status === 'HT' ? 'HT' : `${f.minute}'`}
                      </span>
                    </>
                  ) : isFT ? (
                    <span className="text-[10px] font-mono font-bold text-slate-400">FT</span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-[#00E676]">{f.time || '15:00'}</span>
                  )}
                </div>

                {/* Teams & Scores */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Home Team */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {f.homeTeam?.logo ? (
                        <img
                          src={f.homeTeam.logo}
                          alt={f.homeTeam?.shortCode}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[8px] font-bold text-[#00E676] flex items-center justify-center shrink-0">
                          {f.homeTeam?.shortCode?.[0] || 'H'}
                        </span>
                      )}
                      <span className="font-semibold text-white truncate max-w-[90px]">
                        {f.homeTeam?.shortCode || f.homeTeam?.name}
                      </span>
                    </div>
                    <span className={`font-mono font-extrabold ${isLive ? 'text-white' : 'text-slate-300'}`}>
                      {f.status === 'UPCOMING' ? '-' : f.homeScore}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {f.awayTeam?.logo ? (
                        <img
                          src={f.awayTeam.logo}
                          alt={f.awayTeam?.shortCode}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[8px] font-bold text-[#00E676] flex items-center justify-center shrink-0">
                          {f.awayTeam?.shortCode?.[0] || 'A'}
                        </span>
                      )}
                      <span className="font-semibold text-white truncate max-w-[90px]">
                        {f.awayTeam?.shortCode || f.awayTeam?.name}
                      </span>
                    </div>
                    <span className={`font-mono font-extrabold ${isLive ? 'text-white' : 'text-slate-300'}`}>
                      {f.status === 'UPCOMING' ? '-' : f.awayScore}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}
