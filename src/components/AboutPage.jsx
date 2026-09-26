import React from 'react';
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Users, 
  ShieldCheck, 
  Globe2, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function AboutPage({ onBackToHome, onOpenRegisterTeam }) {
  const missionItems = [
    {
      title: 'Consistent Competition',
      desc: 'To provide young footballers with consistent competitive football.'
    },
    {
      title: 'Scouting Exposure',
      desc: 'To create opportunities for talented players to be identified by scouts and clubs.'
    },
    {
      title: 'Club Growth & Experience',
      desc: 'To help young teams gain valuable league experience.'
    },
    {
      title: 'Professional Standards',
      desc: 'To promote professional standards and player development.'
    },
    {
      title: 'Global Pathways',
      desc: 'To connect African youth talent with opportunities locally and internationally.'
    },
    {
      title: 'Credible & Sustainable',
      desc: 'To build a credible and sustainable platform where talent can be seen, developed, and connected to opportunity.'
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      
      {/* 1. Full-bleed Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#0A0D13] border border-[#1E2536] shadow-2xl p-6 sm:p-12 lg:p-16">
        
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-5">
          
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Matches</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>THE OFFICIAL MANIFESTO</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight">
            About Skouted Youth League
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-[#00E676] tracking-tight">
            Where Talent Meets Opportunity.
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Talent is everywhere. Opportunity isn’t. We exist to build the bridge for African youth footballers to showcase their discipline, technical mastery, and athletic potential to the world.
          </p>

        </div>

      </section>

      {/* 2. Editorial Body Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Full Editorial Manifest */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-10 border border-[#1E2536] space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1E2536]">
            <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-display text-white tracking-tight">
                Our Foundation & Purpose
              </h2>
              <p className="text-xs text-slate-400">Under-19 Championship Football Development Platform</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              Skouted Youth League (SYL) is a youth football development and scouting platform created to give talented young footballers the opportunity to compete, develop, and be discovered.
            </p>
            <p>
              The league is dedicated to Under-19 football, bringing together ambitious young players and teams in a competitive environment designed to provide valuable match experience while creating genuine pathways to higher levels of the game.
            </p>
            <p>
              At Skouted Youth League, we believe talent deserves an opportunity to be seen. Through organised league competition, player exposure, scouting opportunities, performance monitoring, and connections with clubs, academies, scouts, and football professionals, we aim to bridge the gap between youth talent and professional football.
            </p>
            <p className="text-slate-200 font-medium">
              Our focus goes beyond results. We are committed to developing players who understand the demands of the modern game—discipline, teamwork, football intelligence, professionalism, and consistency.
            </p>
          </div>

          {/* Core Values Pill Grid */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Discipline', icon: ShieldCheck },
              { label: 'Teamwork', icon: Users },
              { label: 'Intelligence', icon: Sparkles },
              { label: 'Consistency', icon: TrendingUp }
            ].map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#141722] border border-[#23293A] text-center space-y-1.5">
                  <Icon className="w-5 h-5 text-[#00E676] mx-auto" />
                  <div className="text-xs font-bold text-white tracking-wide">{val.label}</div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Visual Showcase & Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="rounded-3xl overflow-hidden border border-[#1E2536] p-1 bg-gradient-to-b from-[#00E676]/30 via-[#1E2536] to-transparent">
            <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden bg-[#161B26]">
              <img
                src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=800"
                alt="Youth Player Celebration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs">
                <span className="font-mono text-[#00E676] font-bold">LEG 1 • 2025/2026</span>
                <p className="text-white font-semibold">12 Registered Clubs • U-19 Stage</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-[#1E2536] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#00E676] font-bold">
              <Award className="w-4 h-4" />
              <span>LEAGUE FORMAT</span>
            </div>
            <h4 className="text-white font-bold text-sm">Organised Under-19 Football</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every match is supervised by accredited match officials, broadcast with live statistics, and evaluated by independent scouts.
            </p>
          </div>

        </div>

      </section>

      {/* 3. Our Vision Section (Highlighted Card) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#111A1F] to-[#0E131C] border-2 border-[#00E676]/40 p-6 sm:p-10 shadow-xl shadow-[#00E676]/5">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>OUR VISION</span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white tracking-tight leading-snug">
              “To become a leading youth football platform in Africa for talent discovery, player development, and pathways to professional football.”
            </p>
          </div>

          <div className="shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-[#00E676] text-black flex items-center justify-center shadow-lg shadow-[#00E676]/30 font-display font-black text-2xl">
              SYL
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Mission Section (Clean Icon Checklist) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
              Our Mission
            </h2>
            <p className="text-xs text-slate-400">Six Core Pillars Driving Skouted Youth League</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missionItems.map((item, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-5 border border-[#1E2536] hover:border-[#00E676]/50 bg-[#121622]/90 hover:bg-[#141926] transition-all group space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] flex items-center justify-center text-xs font-mono font-bold group-hover:bg-[#00E676] group-hover:text-black transition-colors">
                  0{idx + 1}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#00E676]/60 group-hover:text-[#00E676] transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#00E676] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Closing Official Badge */}
      <section className="text-center pt-6">
        <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-[#00E676]/40 via-[#00C853]/20 to-[#00E676]/40 shadow-xl shadow-[#00E676]/10">
          <div className="px-8 py-5 rounded-[14px] bg-[#0E121A] border border-[#1E2536] flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#00E676] animate-pulse" />
            <span className="font-display font-black text-base sm:text-lg text-white tracking-wide">
              Skouted Youth League — Where Talent Meets Opportunity.
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
