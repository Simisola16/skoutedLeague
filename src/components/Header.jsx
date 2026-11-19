import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Shield, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Calendar, 
  Award, 
  Newspaper, 
  Headphones, 
  Handshake, 
  Compass, 
  Users,
  ChevronRight,
  ChevronDown,
  Camera,
  UserPlus,
  Download
} from 'lucide-react';
import { SOCIAL_LINKS_ARRAY, SOCIAL_LINKS } from '../constants/socialLinks';
import { SocialIcon } from './SocialIcons';

export default function Header({
  currentPath = '/',
  onNavigate,
  user,
  onLogout,
  onOpenLogin,
  onOpenRegisterTeam,
  onOpenFanAlerts,
  onOpenTeamDashboard,
  onOpenInstallApp,
  liveMatchesCount = 0
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone = window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary desktop navigation items (concise, streamlined)
  const primaryNavItems = [
    { id: 'fixtures', label: 'Fixtures', path: '/fixtures', icon: Calendar },
    { id: 'table', label: 'Standings', path: '/table', icon: Trophy },
    { id: 'stats', label: 'Scorers', path: '/stats', icon: Award },
    { id: 'teams', label: 'Teams', path: '/teams', icon: Users, badge: '12' },
    { id: 'news', label: 'News', path: '/news', icon: Newspaper },
    { id: 'gallery', label: 'Gallery', path: '/gallery', icon: Camera }
  ];

  // Secondary items housed in the "More ▾" dropdown on desktop
  const secondaryNavItems = [
    { id: 'podcasts', label: 'Podcasts', path: '/podcasts', icon: Headphones },
    { id: 'about', label: 'About League', path: '/about', icon: Compass },
    { id: 'sponsors', label: 'Sponsors', path: '/sponsors', icon: Handshake }
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const isActive = (path) => {
    if (path === '/fixtures') {
      return currentPath === '/' || currentPath === '/fixtures';
    }
    if (path === '/table') {
      return currentPath === '/table' || currentPath === '/standings';
    }
    if (path === '/stats') {
      return currentPath === '/stats' || currentPath === '/top-scorers' || currentPath === '/leaders';
    }
    return currentPath === path;
  };

  const isMoreActive = secondaryNavItems.some(item => isActive(item.path));

  return (
    <header className="sticky top-0 z-40 bg-[#0D0F14]/95 backdrop-blur-md border-b border-[#1E2330]">
      <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 xl:gap-3">
        
        {/* Brand Logo & Live Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => handleNavClick('/')}
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#00E676]/25 via-[#00B359]/15 to-transparent p-0.5 flex items-center justify-center shadow-lg shadow-[#00E676]/15 group-hover:shadow-[#00E676]/35 transition-all duration-300">
              <div className="w-full h-full bg-[#0D0F14] rounded-[10px] p-1 flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Skouted Youth League" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,230,118,0.25)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight text-white group-hover:text-[#00E676] transition-colors">SKOUTED</span>
                <span className="text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                  LEAGUE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">YOUTH CHAMPIONSHIP</p>
            </div>
          </div>

          {/* Live Indicator Pill */}
          {liveMatchesCount > 0 && (
            <div 
              onClick={() => handleNavClick('/fixtures')}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] text-xs font-mono font-bold cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-ping"></span>
              <span>{liveMatchesCount} LIVE</span>
            </div>
          )}
        </div>

        {/* Desktop Global Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {primaryNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 shadow-sm shadow-[#00E676]/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* "More" Dropdown Menu for Secondary Items */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                isMoreActive || moreMenuOpen
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#141824] border border-[#22293A] rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {secondaryNavItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        active
                          ? 'bg-[#00E676]/15 text-[#00E676]'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action CTA & User Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* YouTube Live Broadcast Stream */}
          <a
            href={SOCIAL_LINKS.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-white transition-all text-xs font-bold cursor-pointer group shrink-0"
            title="Watch live on YouTube (@Skoutedyouthleague)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <SocialIcon platform="youtube" className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden xl:inline text-[11px]">Live Stream</span>
          </a>

          {/* Live Match Push Alerts Bell */}
          <button
            onClick={onOpenFanAlerts}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#1A1D28] hover:bg-[#252A38] border border-[#252A38] text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer shrink-0"
            title="Subscribe to live match push alerts (Kickoff, Goals, Subs, Full-time)"
          >
            <Bell className="w-3.5 h-3.5 text-[#FFB800] animate-pulse" />
            <span className="hidden xl:inline text-[11px]">Match Alerts</span>
          </button>

          {/* Secondary CTA: Register Club */}
          <button
            onClick={() => handleNavClick('/team/register')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white transition-all text-xs font-bold cursor-pointer shrink-0 whitespace-nowrap"
            title="Register a new academy"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Register Club</span>
          </button>

          {/* Primary CTA: Team Portal / Login */}
          <button
            onClick={onOpenTeamDashboard || (() => handleNavClick('/team/login'))}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-extrabold transition-all text-xs shadow-md shadow-[#00E676]/25 hover:shadow-lg hover:shadow-[#00E676]/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 whitespace-nowrap"
            title="Team Portal / Login"
          >
            <Shield className="w-3.5 h-3.5 fill-black" />
            <span>Team Portal</span>
          </button>

          {/* User Session / Logout / Sign In */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white max-w-[100px] truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-xl bg-[#1A1D28] hover:bg-rose-500/20 border border-[#252A38] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer sm:hidden"
              title="Sign In"
            >
              <User className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl bg-[#1A1D28] border border-[#252A38] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Slide-down Navigation Menu (All Items) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D0F14]/98 border-b border-[#1E2330] p-4 space-y-2 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="text-[10px] font-mono text-slate-500 font-bold px-3 py-1">
            OFFICIAL LEAGUE DIRECTORY
          </div>

          <div className="grid grid-cols-1 gap-1">
            {allNavItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>
              );
            })}

            {/* Team Portal in Mobile Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenTeamDashboard) onOpenTeamDashboard();
                else handleNavClick('/team/login');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 font-bold text-xs mt-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#00E676]" />
                <span>Team Portal / Login</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#00E676]" />
            </button>

            {/* Register Club in Mobile Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('/team/register');
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 font-bold text-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4 text-[#00E676]" />
                <span>Register Club (New Academy)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Official Social Media Channels in Mobile Menu */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="text-[10px] font-mono text-slate-500 font-bold px-1 uppercase tracking-wider flex items-center justify-between">
              <span>Follow Skouted Youth League</span>
              <span className="text-red-400 font-bold">@Skoutedyouthleague</span>
            </div>

            {/* Live Stream Banner in Mobile Menu */}
            <a
              href={SOCIAL_LINKS.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-red-600/15 border border-red-500/30 text-red-200 hover:text-white font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <SocialIcon platform="youtube" className="w-4 h-4 text-red-500" />
                <span>YouTube Live Broadcast</span>
              </div>
              <span className="text-[10px] font-mono text-red-400">Watch Live &rarr;</span>
            </a>

            <div className="grid grid-cols-3 gap-2">
              {SOCIAL_LINKS_ARRAY.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#141824] border border-[#22293A] ${social.textHover} ${social.borderHover} transition-all`}
                  title={social.name}
                >
                  <SocialIcon platform={social.id} className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-bold text-slate-200">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Install App CTA in Mobile Menu */}
          {!isStandalone && onOpenInstallApp && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInstallApp();
              }}
              className="w-full mb-3 py-2.5 px-3 rounded-xl bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/30 text-[#00E676] text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download & Install SYL App</span>
            </button>
          )}

          {/* Quick Action Footer in Mobile Menu */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenFanAlerts) onOpenFanAlerts();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Match Alerts</span>
            </button>
            {!user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenRegisterTeam) onOpenRegisterTeam();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Register Club</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
