import React from 'react';
import { 
  Trophy, 
  Shield, 
  Bell, 
  UserPlus, 
  ExternalLink, 
  ArrowUp, 
  Compass, 
  Calendar, 
  Camera, 
  Newspaper, 
  Headphones, 
  Handshake, 
  Users,
  CheckCircle2,
  Sparkles,
  Radio
} from 'lucide-react';
import { SOCIAL_LINKS_ARRAY } from '../constants/socialLinks';
import { SocialIcon } from './SocialIcons';

export default function Footer({ 
  onNavigate, 
  onOpenFanAlerts, 
  onOpenRegisterTeam, 
  onOpenLogin,
  leagueSettings
}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Fixtures & Results', path: '/fixtures', icon: Calendar },
    { label: 'Table / Standings', path: '/table', icon: Trophy },
    { label: 'Teams Directory', path: '/teams', icon: Users },
    { label: 'Media & Social Hub', path: '/media', icon: Radio },
    { label: 'Tournament Gallery', path: '/gallery', icon: Camera },
    { label: 'League News', path: '/news', icon: Newspaper },
    { label: 'Podcasts & Media', path: '/podcasts', icon: Headphones },
    { label: 'Official Sponsors', path: '/sponsors', icon: Handshake },
    { label: 'About SYL Manifesto', path: '/about', icon: Compass }
  ];

  return (
    <footer className="relative bg-[#090B0F] border-t border-[#1A1F2C] text-slate-300 overflow-hidden mt-16 pt-16 pb-24 lg:pb-16">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-48 bg-[#00E676]/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-12 right-12 w-64 h-64 bg-[#1877F2]/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-8 w-64 h-64 bg-[#E1306C]/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        
        {/* =================================================================== */}
        {/* TOP HIGHLIGHT BANNER: OFFICIAL SOCIAL MEDIA CHANNELS */}
        {/* =================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0E121B] to-[#0A0D14] border border-[#22293A] p-6 sm:p-8 lg:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/25 text-[#00E676] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Social Media Hub</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white tracking-tight">
                Follow The Journey. Connect With Skouted Youth League.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Stay updated on live matchdays, watch curated scouting reels, view player dossiers, and experience African youth football at its highest level.
              </p>
            </div>

            {/* Quick Goal Alert CTA Button */}
            {onOpenFanAlerts && (
              <button
                onClick={onOpenFanAlerts}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1F2C] hover:bg-[#23293A] border border-[#2D3548] text-white text-xs font-bold transition-all hover:border-[#FFB800]/50 shadow-md shrink-0 cursor-pointer self-start lg:self-auto"
              >
                <Bell className="w-4 h-4 text-[#FFB800]" />
                <span>Subscribe for Goal Alerts</span>
              </button>
            )}
          </div>

          {/* Social Channels 3-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            {SOCIAL_LINKS_ARRAY.map((social) => {
              const url = (leagueSettings?.socialLinks && leagueSettings.socialLinks[social.id]) || social.url;
              return (
                <a
                  key={social.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-5 rounded-2xl bg-[#141824]/80 hover:bg-[#181D2C] border border-[#22293A] ${social.borderHover} ${social.glowClass} transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg"
                        style={{
                          backgroundColor: `${social.accentColor}18`,
                          color: social.accentColor,
                          boxShadow: `0 4px 14px ${social.accentColor}25`
                        }}
                      >
                        <SocialIcon platform={social.id} className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-white flex items-center gap-1.5">
                          <span>{social.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                        </div>
                        <div className="text-xs font-mono font-medium text-slate-400 group-hover:text-slate-300">
                          {social.handle}
                        </div>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-white/20 transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 group-hover:text-slate-300 leading-relaxed">
                    {social.description}
                  </p>

                  <div 
                    className="text-xs font-bold flex items-center gap-1 pt-1"
                    style={{ color: social.accentColor }}
                  >
                    <span>Connect on {social.name}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* MAIN FOOTER DIRECTORY & BRAND COLUMN */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pt-4">
          
          {/* Brand & Manifesto Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div 
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => onNavigate && onNavigate('/')}
            >
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00E676]/30 via-[#00B359]/20 to-transparent p-0.5 flex items-center justify-center shadow-lg shadow-[#00E676]/20 group-hover:shadow-[#00E676]/40 transition-all">
                <div className="w-full h-full bg-[#0D0F14] rounded-[10px] p-1 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="Skouted Youth League" 
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,230,118,0.3)] group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-xl tracking-tight text-white group-hover:text-[#00E676] transition-colors">
                    SKOUTED
                  </span>
                  <span className="text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                    LEAGUE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                  Youth Championship & Scouting Platform
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              <strong className="text-slate-200">Where Talent Meets Opportunity.</strong> An elite Under-19 championship uniting academies, professional scouts, and grassroots talent under accredited match standards.
            </p>

            {/* Social Media Mini Icon Bar */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-mono text-slate-400 mr-2">Official Channels:</span>
              {SOCIAL_LINKS_ARRAY.map((item) => {
                const url = (leagueSettings?.socialLinks && leagueSettings.socialLinks[item.id]) || item.url;
                return (
                  <a
                    key={item.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Follow on ${item.name} (${item.handle})`}
                    className={`w-9 h-9 rounded-xl bg-[#141824] border border-[#22293A] text-slate-300 hover:text-white flex items-center justify-center transition-all ${item.bgHover} ${item.borderHover} ${item.glowClass} cursor-pointer`}
                    aria-label={item.name}
                  >
                    <SocialIcon platform={item.id} className="w-4 h-4" />
                  </a>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Accredited Match Officials & Anti-Doping Regulations</span>
            </div>
          </div>

          {/* Quick Navigation Links (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#00E676]">
              League Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => onNavigate && onNavigate(link.path)}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white hover:translate-x-0.5 transition-all text-left py-1 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academy & Management Portal (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#00E676]">
              Club & Team Portals
            </h4>
            <div className="space-y-2.5 text-xs">
              <button
                onClick={() => onNavigate && onNavigate('/team/login')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141824] hover:bg-[#1C2233] border border-[#22293A] hover:border-[#00E676]/40 text-slate-200 hover:text-white font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00E676]" />
                  <span>Team Portal Login</span>
                </div>
                <span>→</span>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('/team/register')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#141824] hover:bg-[#1C2233] border border-[#22293A] hover:border-[#00E676]/40 text-slate-200 hover:text-white font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#00E676]" />
                  <span>Register Academy</span>
                </div>
                <span>→</span>
              </button>

              <div className="pt-2 text-[11px] text-slate-400 leading-normal">
                Club managers require verified credential access to submit rosters, match line-ups, and transfer requests.
              </div>
            </div>
          </div>

        </div>

        {/* =================================================================== */}
        {/* BOTTOM METADATA & COPYRIGHT BAR */}
        {/* =================================================================== */}
        <div className="pt-8 border-t border-[#1A1F2C] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span>&copy; {new Date().getFullYear()} Skouted Youth League. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-400">Under-19 Championship</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-[#00E676]/80 font-mono">#SkoutedLeague</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1C2233] border border-[#22293A] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Back to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#00E676]" />
            </button>
          </div>
        </div>

      </div>

    </footer>
  );
}
