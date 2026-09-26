import React, { useState, useEffect, useMemo } from 'react';
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
import GalleryPage from './components/GalleryPage';
import TeamRegisterPage from './components/TeamRegisterPage';
import FixturesPage from './components/FixturesPage';

// New Content & Media Components
import AboutHeroShowcase from './components/AboutHeroShowcase';
import AboutPage from './components/AboutPage';
import TeamsPage from './components/TeamsPage';
import TeamDetailModal from './components/TeamDetailModal';
import NewsPage from './components/NewsPage';
import NewsWidget from './components/NewsWidget';
import NewsArticleModal from './components/NewsArticleModal';
import PodcastsPage from './components/PodcastsPage';
import PodcastWidget from './components/PodcastWidget';
import SponsorsPage from './components/SponsorsPage';
import SponsorsMarquee from './components/SponsorsMarquee';

import { Activity, Trophy, Award, Shield, Flame, Clock, Calendar, Bell, ChevronDown, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [user, setUser] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [standings, setStandings] = useState([]);
  const [leaders, setLeaders] = useState({});
  const [newsArticles, setNewsArticles] = useState([]);
  const [podcastEpisodes, setPodcastEpisodes] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [leagueSettings, setLeagueSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Match center status filter
  const [matchFilter, setMatchFilter] = useState('all'); // 'all' | 'live' | 'upcoming' | 'finished'

  // Modals & Drawers
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [selectedFixtureEvents, setSelectedFixtureEvents] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegisterTeam, setShowRegisterTeam] = useState(false);
  const [showFanAlerts, setShowFanAlerts] = useState(false);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState(null);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState(null);
  const [selectedTeamProfile, setSelectedTeamProfile] = useState(null);

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

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch all public tournament & media data
  const fetchData = async () => {
    try {
      const [fixRes, teamRes, standRes, leadRes, newsRes, podRes, sponRes, settRes] = await Promise.all([
        api.getFixtures(),
        api.getTeams(),
        api.getStandings(),
        api.getLeaders(),
        api.getNews({ limit: 12 }),
        api.getPodcasts({ limit: 10 }),
        api.getSponsors(),
        api.getLeagueSettings()
      ]);

      if (fixRes.success) setFixtures(fixRes.data || []);
      if (teamRes.success) setTeams(teamRes.data || []);
      if (standRes.success) setStandings(standRes.data || []);
      if (leadRes.success) setLeaders(leadRes.data || {});
      if (newsRes.success) setNewsArticles(newsRes.data || []);
      if (podRes.success) setPodcastEpisodes(podRes.data || []);
      if (sponRes.success) setSponsors(sponRes.data || []);
      if (settRes?.success && settRes.data) setLeagueSettings(settRes.data);
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

    // First visit prompt for fan goal alerts (non-intrusive, dismissible)
    const hasSubscribed = localStorage.getItem('skouted_fan_subscribed');
    const wasDismissed = sessionStorage.getItem('skouted_fan_dismissed');
    if (!hasSubscribed && !wasDismissed) {
      const timer = setTimeout(() => {
        if (!sessionStorage.getItem('skouted_fan_dismissed')) {
          setShowFanAlerts(true);
        }
      }, 10000);
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

    socket.on('league_settings_updated', (updatedSettings) => {
      if (updatedSettings) {
        setLeagueSettings(prev => ({ ...(prev || {}), ...updatedSettings }));
      }
    });

    return () => {
      socket.off('fixture_updated');
      socket.off('new_match_event');
      socket.off('standings_updated');
      socket.off('league_settings_updated');
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
  // DERIVED DATA — must stay above all early routing returns
  // so that hook call order (useMemo) is always consistent.
  // -------------------------------------------------------------
  const liveMatches = fixtures.filter(f =>
    f.status === '1ST HALF' || f.status === '2ND HALF' || f.status === 'HT' || f.status === 'PENS'
  );

  const upcomingFixtures = fixtures.filter(f => f.status === 'UPCOMING');
  const nextUpcomingFixture = upcomingFixtures.length > 0
    ? [...upcomingFixtures].sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))[0]
    : null;

  // Strict Top 3 Prioritized Matches for Homepage Showcase
  // Priority 1: Live in-play matches ('1ST HALF', '2ND HALF', 'HT', 'PENS', 'LIVE')
  // Priority 2: Next immediate upcoming fixtures (sorted by kickoffTime: 1)
  // Priority 3: Most recent completed results if no live or upcoming games exist (sorted by kickoffTime: -1)
  const prioritizedHomepageMatches = useMemo(() => {
    const isLiveStatus = (s) => ['1ST HALF', '2ND HALF', 'HT', 'PENS', 'LIVE'].includes(s);

    const live = fixtures
      .filter(f => isLiveStatus(f.status))
      .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

    const upcoming = fixtures
      .filter(f => f.status === 'UPCOMING')
      .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

    const finished = fixtures
      .filter(f => f.status === 'FT')
      .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));

    const combined = [...live, ...upcoming, ...finished];
    return combined.slice(0, 3);
  }, [fixtures]);

  // -------------------------------------------------------------
  // ISOLATED ROUTING: /sk-control or /league-ops
  // -------------------------------------------------------------
  if (currentPath === '/sk-control' || currentPath.startsWith('/sk-control') || currentPath === '/league-ops') {
    return (
      <AdminPortal
        onExit={() => navigateTo('/')}
      />
    );
  }

  // -------------------------------------------------------------
  // DEDICATED ROUTING: /team/register
  // -------------------------------------------------------------
  if (currentPath === '/team/register') {
    return (
      <TeamRegisterPage
        onBackToHome={() => navigateTo('/')}
        onNavigateLogin={() => navigateTo('/team/login')}
        onRegistrationComplete={(newUser) => {
          if (newUser) setUser(newUser);
          fetchData();
          navigateTo('/team/dashboard');
        }}
      />
    );
  }

  // -------------------------------------------------------------
  // DEDICATED ROUTING: /team/login
  // -------------------------------------------------------------
  if (currentPath === '/team/login') {
    return (
      <TeamLogin
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          fetchData();
          navigateTo('/team/dashboard');
        }}
        onOpenRegister={() => navigateTo('/team/register')}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  // -------------------------------------------------------------
  // ISOLATED ROUTING: /team/dashboard, /team, /portal
  // -------------------------------------------------------------
  const isTeamPath = currentPath === '/team/dashboard' ||
                     currentPath === '/team' ||
                     currentPath.startsWith('/team/');

  if (isTeamPath) {
    if (user && user.isVerified) {
      return (
        <TeamDashboard
          currentUser={user}
          onLogout={handleLogout}
          onOpenPublicMatches={() => navigateTo('/')}
        />
      );
    } else {
      return (
        <TeamLogin
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            fetchData();
            navigateTo('/team/dashboard');
          }}
          onOpenRegister={() => navigateTo('/team/register')}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }
  }

  // -------------------------------------------------------------
  // PUBLIC FAN & CLUB APPLICATION
  // -------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0D0F14] text-slate-100 flex flex-col font-sans pb-16 lg:pb-8 selection:bg-[#00E676] selection:text-black">
      
      {/* 1. Official Header with 8-Item Global Navigation */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLogin(true)}
        onOpenRegisterTeam={() => navigateTo('/team/register')}
        onOpenFanAlerts={() => setShowFanAlerts(true)}
        onOpenTeamDashboard={() => {
          const target = (user && user.isVerified) ? '/team/dashboard' : '/team/login';
          navigateTo(target);
        }}
        liveMatchesCount={liveMatches.length}
      />

      {/* 2. Horizontal Live Scores Ticker */}
      <LiveTicker
        fixtures={fixtures}
        selectedFixtureId={selectedFixture?._id}
        onSelectFixture={handleSelectFixture}
      />

      {/* 3. Main Content Router Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-5 pb-8 space-y-8">
        
        {/* ========================================================= */}
        {/* ROUTE 1: DEDICATED ABOUT PAGE (/about) */}
        {/* ========================================================= */}
        {currentPath === '/about' && (
          <AboutPage
            onBackToHome={() => navigateTo('/')}
            onOpenRegisterTeam={() => navigateTo('/team/register')}
            aboutImageUrl={leagueSettings?.aboutImageUrl}
            aboutImageCaption={leagueSettings?.aboutImageCaption}
          />
        )}

        {/* ========================================================= */}
        {/* ROUTE 4: DEDICATED TEAMS SHOWCASE (/teams) */}
        {/* ========================================================= */}
        {currentPath === '/teams' && (
          <TeamsPage
            teams={teams}
            onBackToHome={() => navigateTo('/')}
            onSelectTeam={(team) => setSelectedTeamProfile(team)}
          />
        )}

        {/* ========================================================= */}
        {/* ROUTE 3: TABLE / STANDINGS (/table or /standings) */}
        {/* ========================================================= */}
        {(currentPath === '/table' || currentPath === '/standings') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2330]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#00E676]" />
                <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                  Official League Standings
                </h1>
              </div>
              <button
                onClick={() => navigateTo('/')}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to Matches
              </button>
            </div>
            <StandingsTable
              standings={standings}
              onTeamClick={(team) => setSelectedTeamProfile(team)}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* ROUTE: DEDICATED TOURNAMENT GALLERY (/gallery) */}
        {/* ========================================================= */}
        {currentPath === '/gallery' && (
          <GalleryPage
            onBackToHome={() => navigateTo('/')}
            onOpenRegisterTeam={() => navigateTo('/team/register')}
          />
        )}

        {/* ========================================================= */}
        {/* ROUTE 5: DEDICATED NEWS PAGE (/news) */}
        {/* ========================================================= */}
        {currentPath === '/news' && (
          <NewsPage
            articles={newsArticles}
            onBackToHome={() => navigateTo('/')}
          />
        )}

        {/* ========================================================= */}
        {/* ROUTE 6: DEDICATED PODCASTS / MEDIA HUB (/podcasts) */}
        {/* ========================================================= */}
        {currentPath === '/podcasts' && (
          <PodcastsPage
            episodes={podcastEpisodes}
            onBackToHome={() => navigateTo('/')}
          />
        )}

        {/* ========================================================= */}
        {/* ROUTE 7: DEDICATED SPONSORS / PARTNERS (/sponsors) */}
        {/* ========================================================= */}
        {currentPath === '/sponsors' && (
          <SponsorsPage
            sponsors={sponsors}
            onBackToHome={() => navigateTo('/')}
          />
        )}

        {/* ========================================================= */}
        {/* ROUTE 2: DEDICATED FIXTURES & RESULTS PAGE (/fixtures) */}
        {/* ========================================================= */}
        {currentPath === '/fixtures' && (
          <FixturesPage
            fixtures={fixtures}
            onSelectFixture={handleSelectFixture}
            onBackToHome={() => navigateTo('/')}
            favoriteTeamIds={favoriteTeamIds}
            onToggleFavorite={handleToggleFavorite}
            onOpenFanAlerts={() => setShowFanAlerts(true)}
          />
        )}

        {/* ========================================================= */}
        {/* HOMEPAGE: (/) */}
        {/* ========================================================= */}
        {currentPath === '/' && (
          <div className="space-y-8">
            
            {/* Top Hero Banner */}
            <TournamentHero
              liveMatchesCount={liveMatches.length}
              teamsCount={teams.length}
              leagueSettings={leagueSettings}
              onOpenTeamLogin={() => {
                const target = (user && user.isVerified) ? '/team/dashboard' : '/team/login';
                navigateTo(target);
              }}
              onOpenRegisterTeam={() => navigateTo('/team/register')}
              onScrollToScores={() => {
                const el = document.getElementById('match-center');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* "About the League" Section (COMES FIRST DIRECTLY BELOW HERO) */}
            <AboutHeroShowcase
              onNavigateAbout={() => navigateTo('/about')}
              aboutImageUrl={leagueSettings?.aboutImageUrl}
              aboutImageCaption={leagueSettings?.aboutImageCaption}
            />

            {/* Integrated Matchday Live Scores & Center (Strict Top 3 Priority Matches Only) */}
            <section id="match-center" className="scroll-mt-20 space-y-3.5">
              
              {/* Section Header */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#1E2330]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shadow-sm shadow-[#00E676]/10">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black font-display text-white tracking-tight uppercase flex items-center gap-2">
                      <span>Matchday Live Center</span>
                      {liveMatches.length > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] text-[10px] font-mono font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping" />
                          <span>LIVE</span>
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Top 3 featured fixtures • Real-time pitch scores & verified lineups
                    </p>
                  </div>
                </div>

                {/* View Full Schedule CTA (Desktop Header) */}
                <button
                  onClick={() => navigateTo('/fixtures')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:underline cursor-pointer group"
                >
                  <span>All Fixtures ({fixtures.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Matches List: Top 3 only (Compact Native Sports App Layout) */}
              {prioritizedHomepageMatches.length === 0 ? (
                <div className="rounded-2xl p-6 sm:p-8 text-center text-slate-400 space-y-2 border border-slate-800 bg-slate-900/60">
                  <Clock className="w-8 h-8 mx-auto text-slate-500" />
                  <h4 className="font-bold text-white text-sm">No Matches Scheduled Yet</h4>
                  <p className="text-xs text-slate-400">
                    Official tournament fixture schedule will be announced soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {prioritizedHomepageMatches.map(fixture => (
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

              {/* Prominent Full-Width Mobile & Desktop Action Button directly beneath the 3 cards */}
              <div className="pt-1">
                <button
                  onClick={() => navigateTo('/fixtures')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 border border-slate-700/80 hover:border-[#00E676]/60 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-black/40 group cursor-pointer transition-all duration-200 min-h-[48px]"
                >
                  <span>View All Fixtures & Results ({fixtures.length})</span>
                  <ArrowRight className="w-4 h-4 text-[#00E676] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </section>

            {/* League News Widget (3-Card Grid) */}
            <NewsWidget
              articles={newsArticles}
              onSelectArticle={(art) => setSelectedNewsArticle(art)}
              onNavigateNews={() => navigateTo('/news')}
            />

            {/* Podcast Preview Widget */}
            <PodcastWidget
              episodes={podcastEpisodes}
              onNavigatePodcasts={() => navigateTo('/podcasts')}
            />

            {/* Official Sponsors & Partners Logo Reel */}
            <SponsorsMarquee
              sponsors={sponsors}
              onNavigateSponsors={() => navigateTo('/sponsors')}
            />

          </div>
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

      {/* Article Reader Modal */}
      {selectedNewsArticle && (
        <NewsArticleModal
          article={selectedNewsArticle}
          onClose={() => setSelectedNewsArticle(null)}
        />
      )}

      {/* Club Squad & Profile Modal */}
      {selectedTeamProfile && (
        <TeamDetailModal
          team={selectedTeamProfile}
          onClose={() => setSelectedTeamProfile(null)}
          onPlayerClick={(player) => setSelectedPlayerForDetails({ ...player, team: selectedTeamProfile })}
        />
      )}

      {/* Ultra-Mobile Bottom Navigation Bar */}
      <BottomNav
        currentPath={currentPath}
        onNavigate={navigateTo}
        user={user}
        liveCount={liveMatches.length}
      />

    </div>
  );
}
