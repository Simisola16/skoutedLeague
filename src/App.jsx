import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from './services/api';
import socket from './services/socket';

import Header from './components/Header';
import LiveTicker from './components/LiveTicker';
import MatchCard from './components/MatchCard';
import MatchDetailDrawer from './components/MatchDetailDrawer';
import StandingsTable from './components/StandingsTable';
import TournamentStats from './components/TournamentStats';
import FanSubscriptionModal from './components/FanSubscriptionModal';
import TeamRegisterModal from './components/TeamRegisterModal';
import TeamDashboard from './components/TeamDashboard';
import TeamLogin from './components/TeamLogin';
import LoginModal from './components/LoginModal';
import BottomNav from './components/BottomNav';
import AdminPortal from './components/AdminPortal';
import PlayerDetailModal from './components/PlayerDetailModal';
import TournamentHero from './components/TournamentHero';

import { Activity, Trophy, Award, Shield, Flame, Clock, Calendar, Bell, ChevronDown } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [user, setUser] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [standings, setStandings] = useState([]);
  const [leaders, setLeaders] = useState({});
  const [loading, setLoading] = useState(true);

  // Public navigation tabs
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'standings' | 'stats' | 'portal'
  const [matchFilter, setMatchFilter] = useState('all'); // 'all' | 'live' | 'upcoming' | 'finished'

  // Modals & Drawers
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [selectedFixtureEvents, setSelectedFixtureEvents] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegisterTeam, setShowRegisterTeam] = useState(false);
  const [showFanAlerts, setShowFanAlerts] = useState(false);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState(null);

  // Favorite clubs in localStorage
  const [favoriteTeamIds, setFavoriteTeamIds] = useState(() => {
    try {
      const saved = localStorage.getItem('skouted_fav_teams');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track browser path navigation
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch public tournament data
  const fetchData = async () => {
    try {
      const [fixRes, teamRes, standRes, leadRes] = await Promise.all([
        api.getFixtures(),
        api.getTeams(),
        api.getStandings(),
        api.getLeaders()
      ]);

      if (fixRes.success) setFixtures(fixRes.data || []);
      if (teamRes.success) setTeams(teamRes.data || []);
      if (standRes.success) setStandings(standRes.data || []);
      if (leadRes.success) setLeaders(leadRes.data || {});
    } catch (err) {
      console.error('[Fetch Data Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check existing session
    const token = localStorage.getItem('skouted_token');
    if (token) {
      api.getMe().then(res => {
        if (res.success && res.data) {
          setUser(res.data);
        }
      });
    }

    // First visit prompt for fan goal alerts
    const hasSubscribed = localStorage.getItem('skouted_fan_subscribed');
    if (!hasSubscribed) {
      const timer = setTimeout(() => {
        setShowFanAlerts(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Real-time Socket.io listeners
  useEffect(() => {
    socket.on('fixture_updated', (updated) => {
      setFixtures(prev => prev.map(f => (f._id === updated._id ? updated : f)));
      setSelectedFixture(prev => (prev?._id === updated._id ? updated : prev));
    });

    socket.on('new_match_event', (newEvent) => {
      setSelectedFixtureEvents(prev => [...prev, newEvent]);
      if (newEvent.type === 'GOAL') {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    });

    socket.on('standings_updated', (newStandings) => {
      setStandings(newStandings);
    });

    return () => {
      socket.off('fixture_updated');
      socket.off('new_match_event');
      socket.off('standings_updated');
    };
  }, []);

  // When selected fixture changes, load its events and join room
  const handleSelectFixture = async (fixture) => {
    setSelectedFixture(fixture);
    socket.emit('join_match', fixture._id);

    try {
      const res = await api.getFixture(fixture._id);
      if (res.success) {
        setSelectedFixture(res.data.fixture);
        setSelectedFixtureEvents(res.data.events || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseDrawer = () => {
    if (selectedFixture?._id) {
      socket.emit('leave_match', selectedFixture._id);
    }
    setSelectedFixture(null);
    setSelectedFixtureEvents([]);
  };

  // Toggle favorite team
  const handleToggleFavorite = (teamId) => {
    if (!teamId) return;
    setFavoriteTeamIds(prev => {
      const next = prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId];
      localStorage.setItem('skouted_fav_teams', JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('skouted_token');
    setUser(null);
  };

  // -------------------------------------------------------------
  // ISOLATED ROUTING: /sk-control or /league-ops
  // -------------------------------------------------------------
  if (currentPath === '/sk-control' || currentPath.startsWith('/sk-control') || currentPath === '/league-ops') {
    return (
      <AdminPortal
        onExit={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // ISOLATED ROUTING: /team/dashboard, /team/login, /portal
  // -------------------------------------------------------------
  const isTeamPath = currentPath === '/team/dashboard' || 
                     currentPath === '/team/login' || 
                     currentPath === '/team' || 
                     currentPath.startsWith('/team/');

  if (isTeamPath) {
    if (user && user.isVerified) {
      return (
        <TeamDashboard
          currentUser={user}
          onLogout={handleLogout}
          onOpenPublicMatches={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
          }}
        />
      );
    } else {
      return (
        <TeamLogin
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            fetchData();
            window.history.pushState({}, '', '/team/dashboard');
            setCurrentPath('/team/dashboard');
          }}
          onOpenRegister={() => setShowRegisterTeam(true)}
          onBackToHome={() => {
            window.history.pushState({}, '', '/');
            setCurrentPath('/');
          }}
        />
      );
    }
  }

  // -------------------------------------------------------------
  // PUBLIC FAN & CLUB APPLICATION
  // -------------------------------------------------------------
  const liveMatches = fixtures.filter(f =>
    f.status === '1ST HALF' || f.status === '2ND HALF' || f.status === 'HT' || f.status === 'PENS'
  );

  const upcomingFixtures = fixtures.filter(f => f.status === 'UPCOMING');
  const nextUpcomingFixture = upcomingFixtures.length > 0
    ? [...upcomingFixtures].sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))[0]
    : null;

  const filteredFixtures = fixtures.filter(f => {
    const isLive = f.status === '1ST HALF' || f.status === '2ND HALF' || f.status === 'HT' || f.status === 'PENS';
    const isFT = f.status === 'FT';
    const isUpcoming = f.status === 'UPCOMING';

    if (matchFilter === 'live') return isLive;
    if (matchFilter === 'upcoming') return isUpcoming;
    if (matchFilter === 'finished') return isFT;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0F14] text-slate-100 flex flex-col font-sans pb-16 lg:pb-8 selection:bg-[#00E676] selection:text-black">
      
      {/* 1. Flashscore Top Header (Decoupled from Admin) */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLogin(true)}
        onOpenRegisterTeam={() => setShowRegisterTeam(true)}
        onOpenFanAlerts={() => setShowFanAlerts(true)}
        onOpenTeamDashboard={() => {
          const target = (user && user.isVerified) ? '/team/dashboard' : '/team/login';
          window.history.pushState({}, '', target);
          setCurrentPath(target);
        }}
        liveMatchesCount={liveMatches.length}
      />

      {/* 2. Horizontal Live Scores Ticker */}
      <LiveTicker
        fixtures={fixtures}
        selectedFixtureId={selectedFixture?._id}
        onSelectFixture={handleSelectFixture}
      />

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5 pb-8 space-y-6">
        
        {/* Desktop View Navigation Pill Tabs (Strictly Public) */}
        <div className="hidden lg:flex items-center justify-between border-b border-[#1E2330] pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'matches', label: 'Live Matches & Fixtures', icon: Activity, badge: liveMatches.length },
              { id: 'standings', label: 'League Standings Table', icon: Trophy },
              { id: 'stats', label: 'Tournament Leaders & Awards', icon: Award },
              { id: 'portal', label: 'Club Manager Portal', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#00E676] text-black border-[#00E676] shadow-md shadow-[#00E676]/20'
                      : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Manager CTA Button */}
          {!user && (
            <button
              onClick={() => setShowRegisterTeam(true)}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#00E676]/20"
            >
              <span>+ Register Your Club</span>
            </button>
          )}
        </div>

        {/* TAB 1: MATCHES & FIXTURES */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            
            {/* 1. Hero & Tournament Overview Section (Top of Page) */}
            <TournamentHero
              liveMatchesCount={liveMatches.length}
              teamsCount={teams.length}
              onOpenTeamLogin={() => {
                const target = (user && user.isVerified) ? '/team/dashboard' : '/team/login';
                window.history.pushState({}, '', target);
                setCurrentPath(target);
              }}
              onOpenRegisterTeam={() => setShowRegisterTeam(true)}
              onScrollToScores={() => {
                const el = document.getElementById('match-center');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Integrated Live Scores & Matchday Center (Directly Below Hero) */}
            <section id="match-center" className="scroll-mt-20 space-y-4">
              
              {/* Section Title & Fan Alert Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1E2330]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shadow-sm shadow-[#00E676]/10">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
                      <span>Matchday Live Center</span>
                      {liveMatches.length > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping" />
                          <span>LIVE</span>
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Real-time pitch scores, verified lineups, and official match reports
                    </p>
                  </div>
                </div>

                {/* Fan Alert CTA */}
                <button
                  onClick={() => setShowFanAlerts(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/25 text-[#FFB800] transition-all text-xs font-semibold self-start sm:self-auto cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Get Instant Goal Alerts</span>
                </button>
              </div>

              {/* Quick Status Tabs: LIVE NOW, UPCOMING, RESULTS, ALL FIXTURES */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'live', label: 'LIVE NOW', count: liveMatches.length, isLive: true },
                  { id: 'upcoming', label: 'UPCOMING', count: upcomingFixtures.length },
                  { id: 'finished', label: 'RESULTS', count: fixtures.filter(f => f.status === 'FT').length },
                  { id: 'all', label: 'ALL FIXTURES', count: fixtures.length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setMatchFilter(tab.id)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                      matchFilter === tab.id
                        ? tab.isLive
                          ? 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-white shadow-md shadow-[#FF4B4B]/20 font-black'
                          : 'bg-[#00E676]/15 border-[#00E676] text-[#00E676] shadow-md shadow-[#00E676]/15 font-black'
                        : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {tab.isLive && tab.count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-ping" />
                    )}
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      matchFilter === tab.id
                        ? tab.isLive ? 'bg-[#FF4B4B]/30 text-white' : 'bg-[#00E676]/20 text-[#00E676]'
                        : 'bg-white/5 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Matches Grid or Clean Production Empty State */}
              {filteredFixtures.length === 0 ? (
                matchFilter === 'live' ? (
                  <div className="glass-card rounded-3xl p-8 sm:p-12 text-center text-slate-400 space-y-4 border border-[#23293A] bg-[#141722]/80">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                      <Clock className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-base sm:text-lg font-display">
                        No Matches Live Right Now
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                        {nextUpcomingFixture ? (
                          <span>
                            Next kickoff scheduled for{' '}
                            <strong className="text-[#00E676]">
                              {nextUpcomingFixture.date} • {nextUpcomingFixture.time}
                            </strong>
                            {nextUpcomingFixture.homeTeam && nextUpcomingFixture.awayTeam && (
                              <span className="block mt-1 text-slate-300 font-medium">
                                {nextUpcomingFixture.homeTeam.name} vs {nextUpcomingFixture.awayTeam.name}
                              </span>
                            )}
                          </span>
                        ) : (
                          'Matchday kickoffs will be published here once scheduled by tournament officials.'
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setMatchFilter('upcoming')}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/30 text-[#00E676] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Browse Upcoming Fixtures</span>
                      </button>
                      <button
                        onClick={() => setShowFanAlerts(true)}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-[#FFB800]" />
                        <span>Get Goal Alerts</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-3xl p-8 sm:p-12 text-center text-slate-400 space-y-3 border border-[#23293A] bg-[#141722]/80">
                    <Activity className="w-10 h-10 mx-auto text-slate-600 mb-1" />
                    <h4 className="font-bold text-white text-base font-display">
                      {matchFilter === 'upcoming'
                        ? 'No Upcoming Fixtures Scheduled'
                        : matchFilter === 'finished'
                        ? 'No Completed Results Yet'
                        : 'No Fixtures Found'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {matchFilter === 'upcoming'
                        ? 'Matchday kickoffs will be scheduled shortly by league coordinators.'
                        : matchFilter === 'finished'
                        ? 'Full-time scores and statistics will appear here as soon as matches conclude.'
                        : 'Matchday schedules will display here once scheduled by tournament officials.'}
                    </p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredFixtures.map(fixture => (
                    <MatchCard
                      key={fixture._id}
                      fixture={fixture}
                      onSelect={handleSelectFixture}
                      isFavoriteHome={favoriteTeamIds.includes(fixture.homeTeam?._id)}
                      isFavoriteAway={favoriteTeamIds.includes(fixture.awayTeam?._id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}

            </section>

          </div>
        )}

        {/* TAB 2: STANDINGS TABLE */}
        {activeTab === 'standings' && (
          <StandingsTable
            standings={standings}
            onTeamClick={(team) => {}}
          />
        )}

        {/* TAB 3: TOURNAMENT STATS & SCOUTING LEADERS */}
        {activeTab === 'stats' && (
          <TournamentStats
            leaders={leaders}
            onPlayerClick={(player) => setSelectedPlayerForDetails(player)}
          />
        )}

        {/* TAB 4: CLUB MANAGER PORTAL */}
        {activeTab === 'portal' && (
          user && user.isVerified ? (
            <TeamDashboard
              currentUser={user}
              onLogout={handleLogout}
              onOpenPublicMatches={() => setActiveTab('matches')}
            />
          ) : (
            <TeamLogin
              onLoginSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                fetchData();
              }}
              onOpenRegister={() => setShowRegisterTeam(true)}
              onBackToHome={() => setActiveTab('matches')}
            />
          )
        )}

      </main>

      {/* Interactive Match Detail Drawer */}
      {selectedFixture && (
        <MatchDetailDrawer
          fixture={selectedFixture}
          events={selectedFixtureEvents}
          onClose={handleCloseDrawer}
          onPlayerClick={(player) => setSelectedPlayerForDetails(player)}
        />
      )}

      {/* Fan Goal Alert Modal */}
      <FanSubscriptionModal
        isOpen={showFanAlerts}
        onClose={() => setShowFanAlerts(false)}
        teams={teams}
        defaultTeamId={favoriteTeamIds[0] || ''}
      />

      {/* Team Register Modal with OTP */}
      <TeamRegisterModal
        isOpen={showRegisterTeam}
        onClose={() => setShowRegisterTeam(false)}
        onRegistered={(newUser) => {
          if (newUser) setUser(newUser);
          fetchData();
        }}
      />

      {/* Manager Sign In Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoggedIn={(loggedInUser) => {
          setUser(loggedInUser);
          fetchData();
        }}
        onSwitchToRegister={() => setShowRegisterTeam(true)}
      />

      {/* Athlete Full Details Dossier Modal */}
      {selectedPlayerForDetails && (
        <PlayerDetailModal
          player={selectedPlayerForDetails}
          onClose={() => setSelectedPlayerForDetails(null)}
        />
      )}

      {/* Ultra-Mobile Bottom Navigation Bar (4 public tabs) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        liveCount={liveMatches.length}
        onGoHome={() => {
          setActiveTab('matches');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGoScores={() => {
          setActiveTab('matches');
          setTimeout(() => {
            const el = document.getElementById('match-center');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        onGoPortal={() => {
          const target = (user && user.isVerified) ? '/team/dashboard' : '/team/login';
          window.history.pushState({}, '', target);
          setCurrentPath(target);
        }}
      />

    </div>
  );
}
