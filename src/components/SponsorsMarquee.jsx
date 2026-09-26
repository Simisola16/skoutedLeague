import React from 'react';
import { ExternalLink, Handshake, ArrowRight } from 'lucide-react';
import { getMediaUrl } from '../utils/mediaUtils';

export default function SponsorsMarquee({ sponsors = [], onNavigateSponsors }) {
  // If no sponsors passed or loading, provide high-quality defaults
  const displaySponsors = sponsors.length > 0 ? sponsors : [
    {
      name: 'Wyscout / Hudl',
      tier: 'Scouting Partner',
      logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
      websiteUrl: 'https://hudl.com'
    },
    {
      name: 'Puma Football',
      tier: 'Technical Sponsor',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
      websiteUrl: 'https://puma.com'
    },
    {
      name: 'Gatorade Sports Science',
      tier: 'Official Partner',
      logoUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400',
      websiteUrl: 'https://gatorade.com'
    },
    {
      name: 'SuperSport Schools',
      tier: 'Media Partner',
      logoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
      websiteUrl: 'https://supersport.com'
    },
    {
      name: 'African Scouting Hub',
      tier: 'Scouting Partner',
      logoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&q=80&w=400',
      websiteUrl: 'https://skoutedyouthleague.com'
    }
  ];

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
    <section className="rounded-3xl bg-[#10141D] border border-[#1E2536] p-6 sm:p-8 space-y-6">
      
      {/* Header with Title and "View All" Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2536]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
            <Handshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-display text-white tracking-tight uppercase">
              Official League Partners & Sponsors
            </h3>
            <p className="text-xs text-slate-400">
              Powering athlete discovery, match analytics, and youth development pathways
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateSponsors}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:text-[#00C853] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>All Sponsors & Partners</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Partner Cards with Tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {displaySponsors.map((sponsor, idx) => (
          <a
            key={idx}
            href={sponsor.websiteUrl || '#'}
            target={sponsor.websiteUrl ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="group glass-card rounded-2xl p-4 border border-[#1E2536] hover:border-[#00E676]/40 bg-[#141824] hover:bg-[#181E2E] transition-all flex flex-col items-center justify-between gap-3 text-center"
          >
            <div className="w-full h-16 rounded-xl bg-black/40 p-2 flex items-center justify-center overflow-hidden border border-white/5">
              <img
                src={getMediaUrl(sponsor.logoUrl)}
                alt={sponsor.name}
                crossOrigin="anonymous"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="w-full space-y-1">
              <div className="text-xs font-bold text-white group-hover:text-[#00E676] transition-colors truncate">
                {sponsor.name}
              </div>
              <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${getTierColor(sponsor.tier)}`}>
                {sponsor.tier}
              </span>
            </div>
          </a>
        ))}
      </div>

    </section>
  );
}
