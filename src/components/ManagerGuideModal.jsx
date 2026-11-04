import React, { useState } from 'react';
import {
  X,
  BookOpen,
  UserPlus,
  Shirt,
  Calendar,
  Shield,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  Users,
  Palette,
  ExternalLink
} from 'lucide-react';

export default function ManagerGuideModal({
  isOpen,
  onClose,
  onGoToAddPlayer,
  onGoToLineup,
  onGoToSettings,
  squadCount = 0,
  maxSquadSize = 35,
  nextMatch = null
}) {
  const [activeGuideTab, setActiveGuideTab] = useState('getting_started'); // 'getting_started' | 'players' | 'lineup' | 'rules'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0E121B] border border-[#232838] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative px-6 py-5 border-b border-[#232838] bg-gradient-to-r from-[#141A28] via-[#0E121B] to-[#121824] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-lg shadow-[#00E676]/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-white text-lg tracking-tight">
                  Team Manager Portal Guide
                </h3>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30">
                  Official Instructions
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step instructions on squad registration, matchday lineups, and rules.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#232838] bg-[#0A0D14] px-4 overflow-x-auto no-scrollbar gap-1">
          {[
            { id: 'getting_started', label: '1. Getting Started', icon: Sparkles },
            { id: 'players', label: '2. Registering Players', icon: UserPlus },
            { id: 'lineup', label: '3. Starting 11 Lineup', icon: Shirt },
            { id: 'rules', label: '4. Matchday Rules', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeGuideTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveGuideTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#00E676] text-[#00E676] bg-[#00E676]/5 font-black'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: GETTING STARTED */}
          {activeGuideTab === 'getting_started' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00E676]/10 via-[#00E676]/5 to-transparent border border-[#00E676]/20">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Welcome to Your Club Dashboard</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  As the team manager or coach, your portal gives you full control of your squad roster, matchday lineup selection, and official league communication. Follow the 3 main steps below:
                </p>
              </div>

              {/* Step Flow Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Step 1 Card */}
                <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-3 relative group hover:border-[#00E676]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] text-xs font-black flex items-center justify-center font-mono">
                      1
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      squadCount >= 11 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {squadCount >= 11 ? '✓ Complete' : `${squadCount}/11 Added`}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Add Your Squad</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Register your players (minimum 11, maximum 35) with their names, jersey numbers, and photos.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onGoToAddPlayer();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#00E676] hover:text-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Players</span>
                  </button>
                </div>

                {/* Step 2 Card */}
                <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-3 relative group hover:border-[#00E676]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] text-xs font-black flex items-center justify-center font-mono">
                      2
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300">
                      Matchday
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Pick Starting 11</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Before each match, pick your formation (e.g. 4-3-3), designate your Captain (C), and assign your bench.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onGoToLineup();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#00E676] hover:text-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Open Lineup</span>
                  </button>
                </div>

                {/* Step 3 Card */}
                <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-3 relative group hover:border-[#00E676]/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] text-xs font-black flex items-center justify-center font-mono">
                      3
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300">
                      Settings
                    </span>
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Kit & Home Ground</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Confirm your official home and away kit jersey colors, home pitch, and manager contact details.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onGoToSettings();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#00E676] hover:text-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Kit Settings</span>
                  </button>
                </div>
              </div>

              {/* Quick Status Overview */}
              <div className="p-4 rounded-2xl bg-[#090B10] border border-white/5 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
                  Current Club Readiness Checklist
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    {squadCount >= 11 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span>
                      Squad Size: <strong className="text-white">{squadCount} / {maxSquadSize}</strong> {squadCount < 11 && '(Need at least 11)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    {nextMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>
                      Next Fixture: <strong className="text-white">{nextMatch ? `${nextMatch.date} (${nextMatch.time})` : 'Awaiting Schedule'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW TO REGISTER PLAYERS */}
          {activeGuideTab === 'players' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-2">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#00E676]" />
                  <span>How to Register Squad Players</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every player competing in the league must be registered on your roster so referees, fans, and scouts can identify them.
                </p>
              </div>

              {/* Steps list */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Click the "Squad Roster" Tab
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      At the top of your dashboard, click <strong className="text-white">Squad Roster</strong> (or click the green button on the Overview card).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Click "+ Register New Player"
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      A green button appears in the top-right of the squad page. Clicking it will open the registration form modal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Fill in the Player Information & Photo
                    </h5>
                    <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside mt-1">
                      <li><strong className="text-slate-200">First & Last Name:</strong> Official full names.</li>
                      <li><strong className="text-slate-200">Jersey Number:</strong> Unique number on your team kit.</li>
                      <li><strong className="text-slate-200">Position:</strong> GK (Goalkeeper), DEF (Defender), MID (Midfielder), FWD (Forward).</li>
                      <li><strong className="text-slate-200">Player Photo:</strong> Clear passport/headshot photo. Our system automatically compresses it for fast loading.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Save & Confirm
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click <strong className="text-white">Save Player</strong>. The player will immediately appear on your roster and be ready for selection in starting lineups.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onGoToAddPlayer();
                  }}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00E676]/20 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register a Player Right Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO SET STARTING 11 LINEUP */}
          {activeGuideTab === 'lineup' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-2">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-[#00E676]" />
                  <span>How to Set & Submit Your Matchday Starting XI</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Before kickoff of every match, team managers must submit their tactical lineup and captain to league match officials.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Go to "Matchday Lineup" Tab
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click the <strong className="text-white">Matchday Lineup</strong> tab in the navigation bar. Select your upcoming match from the fixture dropdown.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Select Formation & Auto-Fill (Optional)
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Choose your shape: <strong className="text-slate-200">4-3-3, 4-4-2, 4-2-3-1, or 3-5-2</strong>.
                      <br />
                      💡 <strong className="text-[#00E676]">Pro-tip:</strong> Click the <strong className="text-[#00E676]">"Auto-Fill XI"</strong> button! It automatically places your goalkeeper and top 10 outfield players onto the pitch in one click.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Designate Your Captain 👑 (C)
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Every team must have an assigned captain. Simply <strong className="text-white">click on any player on the pitch</strong> or tap the Captain ⭐ button next to their name in the Starters list. A yellow "C" badge will appear on them.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Select Bench Substitutes
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Under the starting XI list, select your matchday substitutes from your available roster so they are registered for substitutions during the match.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090B10] border border-white/5">
                  <div className="w-7 h-7 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-black flex items-center justify-center font-mono shrink-0 mt-0.5">
                    5
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-white text-xs">
                      Save & Lock In Lineup
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Click the green <strong className="text-white">"Save & Lock Official Lineup"</strong> button. The match status will switch to "Lineup Submitted", and officials will have your official team sheet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onGoToLineup();
                  }}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00E676]/20 cursor-pointer"
                >
                  <Shirt className="w-4 h-4" />
                  <span>Open Lineup Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MATCHDAY RULES & POLICIES */}
          {activeGuideTab === 'rules' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-2">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00E676]" />
                  <span>Official League Competition Guidelines</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Key rules to keep in mind throughout the championship season.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#090B10] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[#00E676]">
                    <Clock className="w-4 h-4" />
                    <h5 className="font-bold text-white text-xs">Lineup Deadlines</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Lineups must be submitted through your portal at least 60 minutes before kickoff. Late submissions may result in administrative warnings or sanction points.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090B10] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Users className="w-4 h-4" />
                    <h5 className="font-bold text-white text-xs">Squad Limits (35 Max)</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A team may have up to 35 registered players. New player additions can only be made while the official registration or mid-season transfer window is open.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090B10] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Palette className="w-4 h-4" />
                    <h5 className="font-bold text-white text-xs">Kit Clashes</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    The Home team plays in their primary kit color. If colors clash, the Away team must wear their registered away jersey. Check colors under "Club Identity & Settings".
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#090B10] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Star className="w-4 h-4" />
                    <h5 className="font-bold text-white text-xs">Captain Armband</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your designated captain must be an outfield or goalkeeper starter and is the sole representative authorized to converse with the match referee.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#232838] bg-[#0A0D14] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Skouted Youth League • Official Club Manual
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all ml-auto cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
