import React from 'react';
import { Home, Activity, Trophy, Shield } from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  user,
  liveCount = 0,
  onGoHome,
  onGoScores,
  onGoPortal
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0F14]/95 backdrop-blur-md border-t border-[#1E2330] lg:hidden safe-bottom">
      <div className="grid grid-cols-4 h-16 items-center px-1">
        
        {/* 1. Home (About & Tournament Overview) */}
        <button
          onClick={() => {
            if (onGoHome) {
              onGoHome();
            } else {
              setActiveTab('matches');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center h-full relative transition-all ${
            activeTab === 'matches' ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Tournament Home & Overview"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Home</span>
        </button>

        {/* 2. Scores (Jump to Match Center) */}
        <button
          onClick={() => {
            if (onGoScores) {
              onGoScores();
            } else {
              setActiveTab('matches');
              const el = document.getElementById('match-center');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="min-h-[44px] flex flex-col items-center justify-center h-full relative transition-all text-slate-400 hover:text-white"
          aria-label="Live Scores & Fixtures"
        >
          <div className="relative">
            <Activity className="w-5 h-5" />
            {liveCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4B4B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF4B4B]"></span>
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight flex items-center gap-1">
            Scores
            {liveCount > 0 && (
              <span className="text-[9px] font-mono text-[#FF4B4B] font-extrabold">({liveCount})</span>
            )}
          </span>
        </button>

        {/* 3. Table (League Standings) */}
        <button
          onClick={() => {
            setActiveTab('standings');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center h-full transition-all ${
            activeTab === 'standings' ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Standings Table"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Table</span>
        </button>

        {/* 4. Team Portal (Login / Dashboard link) */}
        <button
          onClick={() => {
            if (onGoPortal) {
              onGoPortal();
            } else {
              setActiveTab('portal');
            }
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center h-full transition-all ${
            activeTab === 'portal' ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Team Portal & Login"
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-tight">Team Portal</span>
        </button>

      </div>
    </nav>
  );
}
