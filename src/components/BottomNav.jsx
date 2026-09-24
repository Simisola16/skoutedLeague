import React from 'react';
import { Activity, Trophy, Award, Shield } from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  user,
  liveCount = 0
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0F14]/95 backdrop-blur-md border-t border-[#1E2330] lg:hidden safe-bottom">
      <div className="grid grid-cols-4 h-14 items-center">
        
        {/* 1. Matches */}
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center justify-center h-full relative transition-all ${
            activeTab === 'matches' ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Activity className="w-5 h-5" />
            {liveCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#FF4B4B] animate-ping"></span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1">Matches</span>
        </button>

        {/* 2. Standings */}
        <button
          onClick={() => setActiveTab('standings')}
          className={`flex flex-col items-center justify-center h-full transition-all ${
            activeTab === 'standings' ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Table</span>
        </button>

        {/* 3. Tournament Stats */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center h-full transition-all ${
            activeTab === 'stats' ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Leaders</span>
        </button>

        {/* 4. Club Portal */}
        <button
          onClick={() => setActiveTab('portal')}
          className={`flex flex-col items-center justify-center h-full transition-all ${
            activeTab === 'portal' ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">My Club</span>
        </button>

      </div>
    </nav>
  );
}
