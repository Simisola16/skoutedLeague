import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import socket from '../services/socket';

const DEFAULT_ABOUT_IMAGE = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200';
const DEFAULT_ABOUT_CAPTION = 'Skouted Youth League Players in Action';

export default function AboutHeroShowcase({ 
  onNavigateAbout, 
  aboutImageUrl: initialImageUrl, 
  aboutImageCaption: initialImageCaption 
}) {
  const [currentImage, setCurrentImage] = useState(initialImageUrl || DEFAULT_ABOUT_IMAGE);
  const [currentCaption, setCurrentCaption] = useState(initialImageCaption || DEFAULT_ABOUT_CAPTION);

  // Sync with prop updates
  useEffect(() => {
    if (initialImageUrl) setCurrentImage(initialImageUrl);
    if (initialImageCaption) setCurrentCaption(initialImageCaption);
  }, [initialImageUrl, initialImageCaption]);

  // Fetch from API if initial prop was not supplied or to ensure fresh data
  useEffect(() => {
    if (!initialImageUrl) {
      api.getLeagueSettings()
        .then((res) => {
          if (res?.data?.aboutImageUrl) {
            setCurrentImage(res.data.aboutImageUrl);
          }
          if (res?.data?.aboutImageCaption) {
            setCurrentCaption(res.data.aboutImageCaption);
          }
        })
        .catch(() => {
          // Fallback gracefully to default
        });
    }

    // Realtime update listener: update instantly when admin updates image
    const handleSettingsUpdate = (updatedSettings) => {
      if (updatedSettings?.aboutImageUrl) {
        setCurrentImage(updatedSettings.aboutImageUrl);
      }
      if (updatedSettings?.aboutImageCaption) {
        setCurrentCaption(updatedSettings.aboutImageCaption);
      }
    };

    socket.on('league_settings_updated', handleSettingsUpdate);
    return () => {
      socket.off('league_settings_updated', handleSettingsUpdate);
    };
  }, [initialImageUrl]);

  const handleImageError = () => {
    if (currentImage !== DEFAULT_ABOUT_IMAGE) {
      setCurrentImage(DEFAULT_ABOUT_IMAGE);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0E121A] to-[#0A0D14] border border-[#1E2536] shadow-2xl p-6 sm:p-10 lg:p-12">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column (Desktop) / Main Content: Headline, Quote, Editorial Copy & CTA */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL LEAGUE DIRECTIVE</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight leading-tight">
            About Skouted Youth League
          </h2>

          {/* Mobile Image: Positioned directly below headline on small screens */}
          <div className="block lg:hidden my-4">
            <div className="relative rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#00E676]/40 via-emerald-500/20 to-transparent shadow-lg shadow-[#00E676]/10">
              <div className="relative aspect-[16/9] rounded-[15px] overflow-hidden bg-[#161B26]">
                <img
                  src={currentImage}
                  alt={currentCaption}
                  onError={handleImageError}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14]/90 via-[#0D0F14]/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-mono text-[11px] text-[#00E676] font-bold">U-19 CHAMPIONSHIP</span>
                  <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[180px]">
                    {currentCaption || 'Action Spotlight'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlighted Quote Callout */}
          <div className="relative pl-5 border-l-4 border-[#00E676] py-1 bg-white/[0.02] rounded-r-xl">
            <p className="text-base sm:text-lg font-bold text-white tracking-tight">
              Talent is everywhere. Opportunity isn’t.
            </p>
            <p className="text-sm sm:text-base text-[#00E676] font-semibold mt-0.5">
              Skouted Youth League (SYL) exists to change that.
            </p>
          </div>

          {/* Editorial Body Text */}
          <div className="space-y-3.5 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              We are an Under-19 football platform built to give young players more than just a place to play. We create a competitive stage where talent can perform, develop, get noticed, and take the next step.
            </p>
            <p>
              Through organised league football and meaningful exposure to scouts, clubs, academies, and football professionals, SYL connects ambitious young players with opportunities that can shape their future.
            </p>
            <p className="text-slate-400">
              Because every great football journey starts with someone getting the chance to be seen.
            </p>
          </div>

          {/* Bold Tagline & Action Button */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm sm:text-base font-display">
              <ShieldCheck className="w-5 h-5 text-[#00E676] shrink-0" />
              <span>Skouted Youth League — Play. Perform. Get Seen.</span>
            </div>

            <div>
              <button
                onClick={onNavigateAbout}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#00E676]/25 hover:shadow-xl hover:shadow-[#00E676]/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-black group-hover:rotate-45 transition-transform duration-300" />
                <span>Read Full Mission & Vision</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (Desktop): High-resolution showcase card with gradient border */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#00E676]/50 via-emerald-500/20 to-[#1E2536] shadow-2xl shadow-[#00E676]/10 group">
            
            <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden bg-[#161B26]">
              <img
                src={currentImage}
                alt={currentCaption}
                onError={handleImageError}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Dark vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-[#0D0F14]/20 to-transparent" />

              {/* Float badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span>EST. 2025 • U-19 PATHWAY</span>
              </div>

              {/* Bottom Card Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-[#00E676] font-bold">SCOUTING & DEVELOPMENT</div>
                <div className="text-xs font-bold text-white">Connecting African Youth Talent to the World</div>
                <div className="text-[10px] text-slate-400">Verified Matchday Exposure & Live Data Tracking</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
