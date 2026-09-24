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

import { Activity, Trophy, Award, Shield, Flame } from 'lucide-react';

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
          window.history.pushState({}, '', '/team/dashboard');
          setCurrentPath('/team/dashboard');
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
          <div className="space-y-4">
            
            {/* Filter Pills Bar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Fixtures', count: fixtures.length },
                  { id: 'live', label: '🔴 Live Now', count: liveMatches.length, isLive: true },
                  { id: 'upcoming', label: 'Upcoming', count: fixtures.filter(f => f.status === 'UPCOMING').length },
                  { id: 'finished', label: 'Results (FT)', count: fixtures.filter(f => f.status === 'FT').length }
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setMatchFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      matchFilter === pill.id
                        ? pill.isLive
                          ? 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-white shadow'
                          : 'bg-[#1F2430] border-[#00E676] text-[#00E676] shadow-sm'
                        : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span className="text-[10px] font-mono opacity-70">({pill.count})</span>
                  </button>
                ))}
              </div>

              {/* Fan Alert Callout */}
              <button
                onClick={() => setShowFanAlerts(true)}
                className="hidden sm:flex items-center gap-1.5 text-xs text-[#FFB800] hover:underline shrink-0 font-medium"
              >
                <span>🔔 Get goal alerts for your club</span>
              </button>
            </div>

            {/* Matches Grid or Clean Production Empty State */}
            {filteredFixtures.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-[#222735]">
                <Activity className="w-10 h-10 mx-auto text-slate-600 mb-1" />
                <h4 className="font-bold text-white text-base font-display">
                  {matchFilter === 'live' ? 'No Live Matches Currently' : 'No Fixtures Found'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {matchFilter === 'live'
                    ? 'No live fixtures at the moment. Check back soon for matchday updates.'
                    : 'Matchday schedules will display here once scheduled by tournament officials.'}
                </p>
              </div>
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
      />

    </div>
  );
}
