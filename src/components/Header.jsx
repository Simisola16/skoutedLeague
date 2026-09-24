import React from 'react';
import { Shield, Bell, User, LogOut, Radio, PlusCircle, Trophy } from 'lucide-react';

export default function Header({
  user,
  onLogout,
  onOpenLogin,
  onOpenRegisterTeam,
  onOpenFanAlerts,
  onOpenMatchOperator,
  onOpenFixtureCreator,
  onOpenTeamDashboard,
  liveMatchesCount = 0
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0D0F14]/95 backdrop-blur-md border-b border-[#1E2330]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Live Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E676] to-[#00B359] p-0.5 flex items-center justify-center shadow-lg shadow-[#00E676]/20">
              <div className="w-full h-full bg-[#0D0F14] rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#00E676]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight text-white">SKOUTED</span>
                <span className="text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                  LEAGUE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">YOUTH CHAMPIONSHIP</p>
            </div>
          </div>

          {/* Live Indicator Pill */}
          {liveMatchesCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-ping"></span>
              <span>{liveMatchesCount} LIVE</span>
            </div>
          )}
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Fan Goal Alert Bell */}
          <button
            onClick={onOpenFanAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1D28] hover:bg-[#252A38] border border-[#252A38] text-slate-300 hover:text-white transition-all text-xs font-semibold"
            title="Subscribe to instant goal alerts"
          >
            <Bell className="w-4 h-4 text-[#FFB800]" />
            <span className="hidden md:inline">Goal Alerts</span>
          </button>

          {/* Dedicated Team Portal Shortcut */}
          <button
            onClick={onOpenTeamDashboard || onOpenLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 text-[#00E676] transition-all text-xs font-bold cursor-pointer"
            title="Access Team Manager Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Team Portal</span>
          </button>

          {/* User Session / Login Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white max-w-[120px] truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="w-9 h-9 rounded-xl bg-[#1A1D28] hover:bg-rose-500/20 border border-[#252A38] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenLogin}
                className="btn-secondary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={onOpenRegisterTeam}
                className="btn-primary text-xs px-3.5 py-1.5 rounded-xl hidden sm:flex items-center gap-1 font-bold shadow-md shadow-[#00E676]/20"
              >
                <span>Register Club</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
