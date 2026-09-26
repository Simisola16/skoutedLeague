import React from 'react';
import { Compass, Calendar, Trophy, Users, Shield, Newspaper, Headphones } from 'lucide-react';

export default function BottomNav({
  currentPath = '/',
  onNavigate,
  liveCount = 0,
  user
}) {
  const navItems = [
    { id: 'about', label: 'About', path: '/about', icon: Compass },
    { id: 'fixtures', label: 'Fixtures', path: '/fixtures', icon: Calendar, badge: liveCount },
    { id: 'table', label: 'Table', path: '/table', icon: Trophy },
    { id: 'teams', label: 'Teams', path: '/teams', icon: Users },
    { id: 'news', label: 'News', path: '/news', icon: Newspaper },
    { id: 'portal', label: 'Portal', path: user && user.isVerified ? '/team/dashboard' : '/team/login', icon: Shield }
  ];

  const isActive = (path) => {
    if (path === '/fixtures') {
      return currentPath === '/' || currentPath === '/fixtures';
    }
    if (path.startsWith('/team')) {
      return currentPath.startsWith('/team');
    }
    return currentPath === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0F14]/95 backdrop-blur-md border-t border-[#1E2330] lg:hidden safe-bottom">
      <div className="grid grid-cols-6 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.path)}
              className={`min-h-[44px] flex flex-col items-center justify-center h-full relative transition-all ${
                active ? 'text-[#00E676]' : 'text-slate-400 hover:text-white'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4B4B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4B4B]"></span>
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold mt-1 tracking-tight truncate max-w-full px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
