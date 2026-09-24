import React from 'react';
import { Trophy, Shield, MapPin, Users, Award, ChevronDown, ArrowRight, Radio, Flame, Sparkles } from 'lucide-react';

export default function TournamentHero({
  liveMatchesCount = 0,
  teamsCount = 0,
  onOpenTeamLogin,
  onOpenRegisterTeam,
  onScrollToScores
}) {
  const isMatchdayLive = liveMatchesCount > 0;

  const scrollToScores = () => {
    if (onScrollToScores) {
      onScrollToScores();
    } else {
      const el = document.getElementById('match-center');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#141824] via-[#0E1118] to-[#0D0F14] border border-[#202636] shadow-2xl shadow-black/60 p-5 sm:p-8 lg:p-10 mb-8">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#FF4B4B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle pitch pattern line texture */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#00E676_1px,transparent_1px)] [background-size:20px_20px]" 
      />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Dynamic Tournament Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181C28] border border-[#2B3245] shadow-inner mb-4 sm:mb-5">
          {isMatchdayLive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4B4B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF4B4B]"></span>
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-extrabold text-[#FF4B4B] tracking-wider uppercase">
                MATCHDAY LIVE • {liveMatchesCount} {liveMatchesCount === 1 ? 'MATCH' : 'MATCHES'} IN PLAY
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              <span className="text-[11px] sm:text-xs font-mono font-extrabold text-[#00E676] tracking-wider uppercase">
                REGISTRATION OPEN • SEASON 2026
              </span>
            </div>
          )}
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Sparkles className="w-3 h-3 text-[#FFB800]" />
            Official Youth Championship
          </span>
        </div>

        {/* Hero Title & Branding */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white uppercase leading-[1.1] max-w-4xl">
          Skouted League <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] via-[#10B981] to-[#38BDF8]">Championship</span>
        </h1>

        {/* High-Energy Tagline */}
        <p className="mt-3 sm:mt-4 text-base sm:text-xl font-medium text-slate-300 max-w-2xl">
          Where Champions Are Made <span className="text-[#00E676] font-bold">|</span> Season 2026
        </p>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1.5">
          The premier grassroots and youth scouting tournament. Real-time scores, verified squad dossiers, and professional matchday operations.
        </p>

        {/* 2 to 3 Concise Stat/Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl mt-6 sm:mt-8 text-left">
          
          {/* Card 1: Format */}
          <div className="glass-card rounded-2xl p-4 border border-[#232A3B] bg-[#141722]/80 hover:border-[#00E676]/40 transition-all flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/25 flex items-center justify-center shrink-0 text-[#00E676]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Competition Format</div>
              <div className="text-sm font-bold text-white mt-0.5">16 Elite Squads</div>
              <div className="text-[11px] text-slate-400">Group Stages & Knockouts</div>
            </div>
          </div>

          {/* Card 2: Venue */}
          <div className="glass-card rounded-2xl p-4 border border-[#232A3B] bg-[#141722]/80 hover:border-[#38BDF8]/40 transition-all flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/25 flex items-center justify-center shrink-0 text-[#38BDF8]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Host Venues</div>
              <div className="text-sm font-bold text-white mt-0.5">Main Stadium Arena</div>
              <div className="text-[11px] text-slate-400">Lagos, NG • Pitch Arena 1 & 2</div>
            </div>
          </div>

          {/* Card 3: Honors / Prize */}
          <div className="glass-card rounded-2xl p-4 border border-[#232A3B] bg-[#141722]/80 hover:border-[#FFB800]/40 transition-all flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/25 flex items-center justify-center shrink-0 text-[#FFB800]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Grand Honors</div>
              <div className="text-sm font-bold text-white mt-0.5">₦2,500,000 Pool</div>
              <div className="text-[11px] text-slate-400">Golden Boot, Glove & MVP</div>
            </div>
          </div>

        </div>

        {/* Primary Action Buttons (Call-to-Action) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xl mt-7 sm:mt-9">
          
          {/* Button 1 (Primary): Team Portal / Login */}
          <button
            onClick={onOpenTeamLogin}
            className="min-h-[48px] px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00B359] text-[#07120B] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Team Portal / Login</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          {/* Button 2 (Secondary): Register a Team */}
          <button
            onClick={onOpenRegisterTeam}
            className="min-h-[48px] px-6 py-3.5 rounded-xl bg-[#1A1E2B] hover:bg-[#23283A] text-white border border-[#2C344A] hover:border-[#00E676]/40 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Register a Team</span>
          </button>

          {/* Button 3 (Quick Anchor): View Live Scores */}
          <button
            onClick={scrollToScores}
            className="min-h-[48px] px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-[#00E676] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
          >
            <span>View Live Scores</span>
            <ChevronDown className="w-4 h-4 text-[#00E676] group-hover:translate-y-0.5 transition-transform" />
          </button>

        </div>

      </div>
    </section>
  );
}
