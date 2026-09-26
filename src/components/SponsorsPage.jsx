import React, { useState } from 'react';
import { Handshake, ExternalLink, ArrowLeft, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export default function SponsorsPage({ sponsors = [], onBackToHome }) {
  const [selectedTier, setSelectedTier] = useState('All');

  const tiers = [
    'All',
    'Official Partner',
    'Technical Sponsor',
    'Scouting Partner',
    'Media Partner'
  ];

  const filteredSponsors = sponsors.filter(s => {
    if (selectedTier === 'All') return true;
    return s.tier === selectedTier;
  });

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Technical Sponsor':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Scouting Partner':
        return 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30';
      case 'Media Partner':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30';
    }
  };

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
            <Handshake className="w-3.5 h-3.5" />
            <span>SYL ALLIANCE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            Official Sponsors & Commercial Partners
          </h1>

          <p className="text-sm sm:text-base text-slate-300">
            We collaborate with industry-leading brands, technology providers, and scouting organizations committed to advancing youth football excellence across Africa.
          </p>
        </div>
      </section>

      {/* 2. Tier Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tiers.map(tier => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              selectedTier === tier
                ? 'bg-[#00E676] text-black border-[#00E676] shadow-md shadow-[#00E676]/20'
                : 'bg-[#141722] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* 3. Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSponsors.map((sponsor) => (
          <div
            key={sponsor._id || sponsor.name}
            className="group glass-card rounded-2xl p-6 border border-[#1E2536] hover:border-[#00E676]/40 bg-[#111520] hover:bg-[#141926] transition-all flex flex-col justify-between space-y-4 shadow-lg"
          >
            <div className="space-y-4">
              {/* Logo Box */}
              <div className="w-full h-24 rounded-xl bg-black/40 p-4 flex items-center justify-center overflow-hidden border border-white/5">
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400';
                  }}
                />
              </div>

              {/* Tier Badge & Name */}
              <div className="space-y-1.5">
                <span className={`inline-block text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getTierColor(sponsor.tier)}`}>
                  {sponsor.tier}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-[#00E676] transition-colors">
                  {sponsor.name}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {sponsor.description || 'Proud sponsor of the Skouted Youth League Under-19 Championship.'}
              </p>
            </div>

            {/* Outbound Link */}
            {sponsor.websiteUrl && (
              <div className="pt-3 border-t border-white/5">
                <a
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00E676] hover:underline"
                >
                  <span>Visit Official Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. Partnership Inquiry Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/30 via-[#121724] to-[#0D1017] border border-[#1E2536] p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>JOIN THE PLATFORM</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
          Partner With Africa’s Premier Youth League
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Gain unmatched brand visibility, direct access to elite grassroots football tournaments, and support youth talent pathways.
        </p>
        <div className="pt-2">
          <a
            href="mailto:partnerships@skoutedyouthleague.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-xs tracking-wide shadow-lg shadow-[#00E676]/25 transition-all"
          >
            <Mail className="w-4 h-4 text-black" />
            <span>Inquire About Partnership</span>
          </a>
        </div>
      </section>

    </div>
  );
}
