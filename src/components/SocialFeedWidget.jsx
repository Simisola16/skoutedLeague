import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ExternalLink, 
  Sparkles, 
  Share2, 
  Check, 
  Youtube, 
  Maximize2, 
  X, 
  Radio, 
  Pin,
  Clock,
  RefreshCw,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import socket from '../services/socket';
import { SOCIAL_LINKS, YOUTUBE_CHANNEL_ID } from '../constants/socialLinks';
import { SocialIcon } from './SocialIcons';

export default function SocialFeedWidget({
  title = "Official Social & Matchday Media Hub",
  subtitle = "Automatically synced highlights, scouting reels, and tournament announcements",
  limit = 12,
  showViewAll = true,
  onNavigateMedia
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('all'); // 'all' | 'youtube' | 'instagram' | 'facebook'
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchSocialPosts = async () => {
    try {
      setLoading(true);
      const res = await api.getSocialPosts({
        platform: activePlatform === 'all' ? undefined : activePlatform,
        limit
      });
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('[SocialFeedWidget] Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialPosts();
  }, [activePlatform, limit]);

  // Real-time socket listener
  useEffect(() => {
    const handleSocialUpdate = (newPosts) => {
      if (Array.isArray(newPosts)) {
        if (activePlatform === 'all') {
          setPosts(newPosts.slice(0, limit));
        } else {
          setPosts(newPosts.filter(p => p.platform === activePlatform).slice(0, limit));
        }
      } else {
        fetchSocialPosts();
      }
    };

    socket.on('social_posts_updated', handleSocialUpdate);
    return () => {
      socket.off('social_posts_updated', handleSocialUpdate);
    };
  }, [activePlatform, limit]);

  const handleShare = (post, e) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(post.postUrl);
      setCopiedId(post._id || post.externalId);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const getPlatformDetails = (platform) => {
    switch (platform) {
      case 'youtube':
        return {
          name: 'YouTube',
          color: '#FF0000',
          badgeClass: 'bg-red-500/15 border-red-500/30 text-red-400',
          handle: '@Skoutedyouthleague',
          cta: 'Watch Video'
        };
      case 'instagram':
        return {
          name: 'Instagram',
          color: '#E1306C',
          badgeClass: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
          handle: '@skouted_youth_league',
          cta: 'View Reel'
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: '#1877F2',
          badgeClass: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
          handle: 'Skouted Youth League',
          cta: 'Read Post'
        };
      default:
        return {
          name: platform,
          color: '#00E676',
          badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          handle: 'Skouted League',
          cta: 'View Post'
        };
    }
  };

  const formatPublishDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <section className="space-y-5">
      
      {/* Header & Platform Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#1E2330]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-bold tracking-wider uppercase mb-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Multi-Platform Social Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Channels', icon: Sparkles },
            { id: 'youtube', label: 'YouTube Matches', icon: Youtube, color: 'text-red-500' },
            { id: 'instagram', label: 'Instagram', icon: SocialIcon, color: 'text-[#E1306C]' },
            { id: 'facebook', label: 'Facebook', icon: SocialIcon, color: 'text-[#1877F2]' }
          ].map((tab) => {
            const active = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-black font-black shadow-md shadow-white/10 scale-105'
                    : 'bg-[#141824] hover:bg-[#1C2234] border border-[#22293A] text-slate-300 hover:text-white'
                }`}
              >
                {tab.id === 'instagram' ? (
                  <SocialIcon platform="instagram" className="w-3.5 h-3.5 text-[#E1306C]" />
                ) : tab.id === 'facebook' ? (
                  <SocialIcon platform="facebook" className="w-3.5 h-3.5 text-[#1877F2]" />
                ) : (
                  <tab.icon className={`w-3.5 h-3.5 ${tab.color || ''}`} />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Social Feed Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#141824] border border-[#22293A] p-4 space-y-3 animate-pulse">
              <div className="aspect-video bg-white/5 rounded-xl" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl p-8 sm:p-12 text-center space-y-3 border border-slate-800 bg-slate-900/60">
          <Youtube className="w-10 h-10 mx-auto text-red-500 opacity-60" />
          <h4 className="font-bold text-white text-base">No Social Posts Found</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Posts are automatically pulled from YouTube, Instagram, and Facebook. Click below to refresh or check our official channels directly.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={fetchSocialPosts}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
            <a
              href={SOCIAL_LINKS.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Visit YouTube Channel</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => {
            const pInfo = getPlatformDetails(post.platform);
            const isYouTube = post.platform === 'youtube';

            return (
              <div
                key={post._id || post.externalId}
                onClick={() => {
                  if (isYouTube && post.externalId) {
                    setActiveVideoModal(post);
                  } else {
                    window.open(post.postUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="group relative rounded-2xl bg-[#121622] hover:bg-[#161B2A] border border-[#202636] hover:border-[#00E676]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl cursor-pointer"
              >
                
                {/* Media Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                  <img
                    src={post.thumbnailUrl || (isYouTube ? `https://i.ytimg.com/vi/${post.externalId}/hqdefault.jpg` : '/logo.png')}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-black/40" />

                  {/* Top Badges: Platform + Pinned */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold backdrop-blur-md ${pInfo.badgeClass}`}>
                      <SocialIcon platform={post.platform} className="w-3 h-3" />
                      <span>{pInfo.name.toUpperCase()}</span>
                    </div>

                    {post.pinned && (
                      <span className="p-1 rounded-md bg-[#FFB800] text-black shadow-md">
                        <Pin className="w-3 h-3 fill-black" />
                      </span>
                    )}
                  </div>

                  {/* Center Play Button for YouTube Videos */}
                  {isYouTube && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-red-500 transition-all">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Duration / Date Pill */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                      {formatPublishDate(post.publishedAt)}
                    </span>
                    <span className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm text-slate-400 group-hover:text-white">
                      {isYouTube ? 'MATCH VIDEO' : 'POST'}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E676] transition-colors line-clamp-2 leading-snug">
                      {post.title || `${pInfo.name} Match Update`}
                    </h3>
                    {post.caption && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {post.caption}
                      </p>
                    )}
                  </div>

                  {/* Footer Action Bar */}
                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-[120px]">
                      {pInfo.handle}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleShare(post, e)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Copy link"
                      >
                        {copiedId === (post._id || post.externalId) ? (
                          <Check className="w-3.5 h-3.5 text-[#00E676]" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title={`Open on ${pInfo.name}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Video Modal for YouTube Plays */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-2xl bg-[#0F131D] border border-[#232A3B] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-[#131722]">
              <div className="flex items-center gap-2 truncate">
                <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.externalId}?autoplay=1`}
                title={activeVideoModal.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#121622] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5 text-xs">
              <div className="space-y-0.5">
                <div className="font-mono text-[#00E676] font-bold">
                  Skouted Youth League Official Channel
                </div>
                <div className="text-slate-400">
                  {activeVideoModal.caption || 'Live match commentary, highlights, and verified scouting dossiers.'}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeVideoModal.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-red-600/25"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
