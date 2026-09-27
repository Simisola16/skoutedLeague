import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Trash2,
  Pin,
  ExternalLink,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Layers,
  Radio,
  Eye,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { SocialIcon } from './SocialIcons';
import { SOCIAL_LINKS } from '../constants/socialLinks';

export default function AdminSocialManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Fast Curation Form
  const [curateUrl, setCurateUrl] = useState('');
  const [curateTitle, setCurateTitle] = useState('');
  const [curateCaption, setCurateCaption] = useState('');
  const [curatePinned, setCuratePinned] = useState(false);
  const [curatingLoading, setCuratingLoading] = useState(false);

  // YouTube Sync State
  const [syncingYT, setSyncingYT] = useState(false);
  const [syncSummary, setSyncSummary] = useState(null);

  // Webhook details modal / dropdown
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getSocialPosts({ platform: platformFilter, limit: 100 });
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching social posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [platformFilter]);

  // Handle Manual YouTube Sync
  const handleSyncYouTube = async () => {
    setSyncingYT(true);
    try {
      const res = await api.syncYouTubeSocial();
      if (res.success) {
        const count = res.syncedCount || 0;
        showToast(`YouTube sync complete! Synced ${count} match videos.`);
        setSyncSummary({
          lastRun: new Date().toLocaleTimeString(),
          count
        });
        fetchPosts();
      } else {
        showToast(res.error || 'Failed to sync YouTube feed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error syncing YouTube', 'error');
    } finally {
      setSyncingYT(false);
    }
  };

  // Handle Quick Add Social Post
  const handleCurateSubmit = async (e) => {
    e.preventDefault();
    if (!curateUrl.trim()) {
      showToast('Please enter an Instagram, Facebook, or YouTube URL', 'error');
      return;
    }

    setCuratingLoading(true);
    try {
      const res = await api.curateSocialPost({
        url: curateUrl.trim(),
        title: curateTitle.trim(),
        caption: curateCaption.trim(),
        pinned: curatePinned
      });

      if (res.success) {
        showToast('Social post published successfully!');
        setCurateUrl('');
        setCurateTitle('');
        setCurateCaption('');
        setCuratePinned(false);
        fetchPosts();
      } else {
        showToast(res.error || 'Failed to publish post', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error publishing post', 'error');
    } finally {
      setCuratingLoading(false);
    }
  };

  // Handle Toggle Pin
  const handleTogglePin = async (id) => {
    try {
      const res = await api.togglePinSocialPost(id);
      if (res.success) {
        showToast(res.pinned ? 'Post pinned to top!' : 'Post unpinned');
        setPosts(prev => prev.map(p => p._id === id ? { ...p, pinned: res.pinned } : p));
      }
    } catch (err) {
      showToast('Failed to toggle pin', 'error');
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this social post from the feed?')) return;
    try {
      const res = await api.deleteSocialPost(id);
      if (res.success) {
        showToast('Social post deleted');
        setPosts(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      showToast('Failed to delete post', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border animate-in slide-in-from-top ${
          toast.type === 'error'
            ? 'bg-rose-950 border-rose-500/50 text-rose-300'
            : 'bg-[#0E1B15] border-[#00E676]/40 text-[#00E676]'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-[#00E676]" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Banner / Auto-Sync Overview */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#111622] via-[#0E131E] to-[#0A0D15] border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10 shrink-0">
              <SocialIcon platform="youtube" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-white">Automated Social Media Feed Engine</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 font-bold uppercase">
                  Auto-Sync Active (Every 45m)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically fetches official YouTube match videos and aggregates Instagram Reels & Facebook Posts.
              </p>
            </div>
          </div>

          {/* YouTube Sync Trigger */}
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={handleSyncYouTube}
              disabled={syncingYT}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingYT ? 'animate-spin' : ''}`} />
              <span>{syncingYT ? 'Syncing YouTube...' : 'Sync YouTube Now'}</span>
            </button>

            <button
              onClick={() => setShowWebhookGuide(!showWebhookGuide)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Webhook Ingest API</span>
            </button>
          </div>
        </div>

        {/* Sync Status Feedback */}
        {syncSummary && (
          <div className="text-[11px] font-mono text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Latest Sync: {syncSummary.lastRun} — Synced {syncSummary.count} posts.</span>
          </div>
        )}

        {/* Connected Channels Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
                <SocialIcon platform="youtube" className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">YouTube Channel</div>
                <div className="text-[10px] text-slate-400 font-mono">@Skoutedyouthleague</div>
              </div>
            </div>
            <a
              href={SOCIAL_LINKS.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center">
                <SocialIcon platform="instagram" className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Instagram</div>
                <div className="text-[10px] text-slate-400 font-mono">@skouted_youth_league</div>
              </div>
            </div>
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <SocialIcon platform="facebook" className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Facebook Page</div>
                <div className="text-[10px] text-slate-400 font-mono">Skouted Youth League</div>
              </div>
            </div>
            <a
              href={SOCIAL_LINKS.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Webhook Guide Modal / Drawer */}
      {showWebhookGuide && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Automated Webhook Ingestion Pipeline (Zapier / Make / Curator / RSS.app)</span>
            </div>
            <button
              onClick={() => setShowWebhookGuide(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Connect your social media auto-posting workflow directly to the Skouted Youth League platform. Whenever a new Instagram post, Reel, or Facebook update is published, your automation bot can post JSON directly to the league:
          </p>
          <div className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-x-auto">
            <div><strong className="text-indigo-400">Endpoint:</strong> POST <span className="text-[#00E676]">https://skoutedyouthleague.com/api/social/webhook</span></div>
            <div><strong className="text-indigo-400">Header:</strong> <span className="text-amber-400">x-sync-secret:</span> skouted_social_sync_secret_2026</div>
            <div><strong className="text-indigo-400">Payload:</strong> &#123; "platform": "instagram" | "facebook" | "youtube", "postUrl": "https://...", "caption": "Matchday 14 highlights!", "thumbnailUrl": "https://..." &#125;</div>
          </div>
        </div>
      )}

      {/* Operator Fast-Curation Fallback Bar ("Quick Add Social Post") */}
      <div className="p-5 rounded-3xl bg-[#131622] border border-[#232838] space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00E676]/15 text-[#00E676] flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Quick Add Social Post (Fast-Curation)</h4>
            <p className="text-[11px] text-slate-400">
              Paste any Instagram Reel / Post link, Facebook Post URL, or YouTube video to publish immediately.
            </p>
          </div>
        </div>

        <form onSubmit={handleCurateSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Post or Reel URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={curateUrl}
                  onChange={(e) => setCurateUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..., https://facebook.com/..., or https://youtu.be/..."
                  className="w-full bg-[#090B10] border border-[#2B3145] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Custom Headline / Title (Optional)
              </label>
              <input
                type="text"
                value={curateTitle}
                onChange={(e) => setCurateTitle(e.target.value)}
                placeholder="e.g. Week 15 Top Goal Highlight"
                className="w-full bg-[#090B10] border border-[#2B3145] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Caption / Context Notes (Optional)
            </label>
            <input
              type="text"
              value={curateCaption}
              onChange={(e) => setCurateCaption(e.target.value)}
              placeholder="e.g. Sensational volley from inside the box against VIA FA..."
              className="w-full bg-[#090B10] border border-[#2B3145] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676] transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={curatePinned}
                onChange={(e) => setCuratePinned(e.target.checked)}
                className="w-4 h-4 rounded accent-[#00E676] cursor-pointer"
              />
              <span className="font-semibold">Pin to top of public social reels</span>
            </label>

            <button
              type="submit"
              disabled={curatingLoading}
              className="px-5 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 cursor-pointer disabled:opacity-50 transition-all self-end sm:self-auto"
            >
              {curatingLoading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish to Social Feed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Post Collection Table */}
      <div className="bg-[#111622] border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00E676]" />
            <h4 className="text-sm font-extrabold text-white">
              Aggregated Social Feed ({posts.length} Posts)
            </h4>
          </div>

          {/* Platform Filters */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: 'all', label: 'All' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'facebook', label: 'Facebook' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPlatformFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  platformFilter === f.id
                    ? 'bg-[#00E676] text-black font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin" />
            <span>Loading aggregated social feed...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-500" />
            <p className="font-bold text-white">No social posts found for this filter.</p>
            <p className="text-[11px] text-slate-500">
              Click "Sync YouTube Now" or use the Quick Add bar above to curate reels and posts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => {
              const platformColors = {
                youtube: 'bg-red-500/15 text-red-400 border-red-500/30',
                instagram: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
                facebook: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              };

              return (
                <div
                  key={post._id}
                  className={`rounded-2xl bg-[#090B10] border transition-all flex flex-col justify-between overflow-hidden group ${
                    post.pinned ? 'border-[#00E676]/40 ring-1 ring-[#00E676]/30' : 'border-[#222738] hover:border-slate-600'
                  }`}
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video bg-black/60 overflow-hidden">
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <SocialIcon platform={post.platform} className="w-10 h-10 opacity-30" />
                        </div>
                      )}

                      {/* Platform & Pinned Badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase flex items-center gap-1 border ${platformColors[post.platform] || 'bg-slate-800 text-white'}`}>
                          <SocialIcon platform={post.platform} className="w-3 h-3" />
                          <span>{post.platform}</span>
                        </span>
                        {post.pinned && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00E676] text-black flex items-center gap-1">
                            <Pin className="w-3 h-3" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-slate-300">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 space-y-1.5">
                      <h5 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                        {post.title || post.caption || 'Official Post'}
                      </h5>
                      {post.caption && post.title && (
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {post.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-black/20 border-t border-white/5 flex items-center justify-between">
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Open Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePin(post._id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          post.pinned
                            ? 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40'
                            : 'bg-white/5 text-slate-400 hover:text-white border-transparent'
                        }`}
                        title={post.pinned ? 'Unpin post' : 'Pin to top of feed'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
