import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Headphones, 
  Handshake, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  Check, 
  X, 
  Upload, 
  Sparkles, 
  ExternalLink, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminMediaManager() {
  const [subTab, setSubTab] = useState('news'); // 'news' | 'podcasts' | 'sponsors'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // News State
  const [articles, setArticles] = useState([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'League Announcement',
    author: 'SYL Editorial Board',
    readTime: '4 min read',
    featured: false,
    isPublished: true,
    coverImageUrl: ''
  });
  const [articleCoverFile, setArticleCoverFile] = useState(null);

  // Podcast State
  const [podcasts, setPodcasts] = useState([]);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const [podcastForm, setPodcastForm] = useState({
    episodeNumber: '',
    title: '',
    description: '',
    audioUrl: '',
    youtubeUrl: '',
    spotifyUrl: '',
    duration: '35 mins',
    host: 'Skouted Media Team',
    guest: '',
    coverImageUrl: ''
  });
  const [podcastCoverFile, setPodcastCoverFile] = useState(null);

  // Sponsor State
  const [sponsors, setSponsors] = useState([]);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    tier: 'Official Partner',
    websiteUrl: '',
    description: '',
    order: 0,
    logoUrl: ''
  });
  const [sponsorLogoFile, setSponsorLogoFile] = useState(null);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllMedia = async () => {
    setLoading(true);
    try {
      const [nRes, pRes, sRes] = await Promise.all([
        api.getNews(),
        api.getPodcasts(),
        api.getAllSponsors ? api.getAllSponsors() : api.getSponsors()
      ]);
      if (nRes.success) setArticles(nRes.data || []);
      if (pRes.success) setPodcasts(pRes.data || []);
      if (sRes.success) setSponsors(sRes.data || []);
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to load media data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMedia();
  }, []);

  // --------------------------------------------------------------------------
  // News Handlers
  // --------------------------------------------------------------------------
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.excerpt || !articleForm.content) {
      showToastMsg('Please fill in title, excerpt, and content', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(articleForm).forEach(k => {
        formData.append(k, articleForm[k]);
      });
      if (articleCoverFile) {
        formData.append('coverImage', articleCoverFile);
      }

      let res;
      if (editingArticle) {
        res = await api.updateNewsArticle(editingArticle._id, formData);
      } else {
        res = await api.createNewsArticle(formData);
      }

      if (res.success) {
        showToastMsg(editingArticle ? 'Article updated successfully!' : 'Article published successfully!');
        setShowArticleModal(false);
        setEditingArticle(null);
        setArticleCoverFile(null);
        loadAllMedia();
      } else {
        showToastMsg(res.error || 'Failed to save article', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to remove this article?')) return;
    try {
      const res = await api.deleteNewsArticle(id);
      if (res.success) {
        showToastMsg('Article removed');
        setArticles(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Podcast Handlers
  // --------------------------------------------------------------------------
  const handleSavePodcast = async (e) => {
    e.preventDefault();
    if (!podcastForm.title || !podcastForm.description) {
      showToastMsg('Please provide a title and description', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(podcastForm).forEach(k => {
        formData.append(k, podcastForm[k]);
      });
      if (podcastCoverFile) {
        formData.append('coverImage', podcastCoverFile);
      }

      const res = await api.createPodcast(formData);
      if (res.success) {
        showToastMsg('Podcast episode uploaded!');
        setShowPodcastModal(false);
        setPodcastCoverFile(null);
        loadAllMedia();
      } else {
        showToastMsg(res.error || 'Failed to create episode', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePodcast = async (id) => {
    if (!window.confirm('Delete this podcast episode?')) return;
    try {
      const res = await api.deletePodcast(id);
      if (res.success) {
        showToastMsg('Podcast episode deleted');
        setPodcasts(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Sponsor Handlers
  // --------------------------------------------------------------------------
  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    if (!sponsorForm.name) {
      showToastMsg('Sponsor name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(sponsorForm).forEach(k => {
        formData.append(k, sponsorForm[k]);
      });
      if (sponsorLogoFile) {
        formData.append('logo', sponsorLogoFile);
      }

      const res = await api.createSponsor(formData);
      if (res.success) {
        showToastMsg('Sponsor saved!');
        setShowSponsorModal(false);
        setSponsorLogoFile(null);
        loadAllMedia();
      } else {
        showToastMsg(res.error || 'Failed to add sponsor', 'error');
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSponsor = async (id) => {
    if (!window.confirm('Delete this sponsor partner?')) return;
    try {
      const res = await api.deleteSponsor(id);
      if (res.success) {
        showToastMsg('Sponsor removed');
        setSponsors(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      showToastMsg(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            : 'bg-[#00E676]/20 border-[#00E676]/40 text-[#00E676]'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#141722] border border-[#23293A]">
        <div className="flex items-center gap-2">
          {[
            { id: 'news', label: 'News Articles', count: articles.length, icon: Newspaper },
            { id: 'podcasts', label: 'Podcasts & Audio', count: podcasts.length, icon: Headphones },
            { id: 'sponsors', label: 'Sponsors & Partners', count: sponsors.length, icon: Handshake }
          ].map(tab => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#00E676] text-black border-[#00E676] shadow-md shadow-[#00E676]/20'
                    : 'bg-[#181C28] border-[#252A38] text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${active ? 'bg-black/30' : 'bg-white/10'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={loadAllMedia}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors self-end sm:self-auto"
          title="Reload Media"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: NEWS ARTICLES */}
      {/* ==================================================================== */}
      {subTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Published League Articles ({articles.length})
            </h3>
            <button
              onClick={() => {
                setEditingArticle(null);
                setArticleForm({
                  title: '',
                  excerpt: '',
                  content: '',
                  category: 'League Announcement',
                  author: 'SYL Editorial Board',
                  readTime: '4 min read',
                  featured: false,
                  isPublished: true,
                  coverImageUrl: ''
                });
                setShowArticleModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#00E676] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00E676]/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(article => (
              <div
                key={article._id}
                className="rounded-2xl p-4 bg-[#111520] border border-[#1E2536] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/5">
                    <img
                      src={article.coverImageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-[#00E676] border border-white/10">
                        {article.category}
                      </span>
                      {article.featured && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {article.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {article.readTime} • {article.author}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingArticle(article);
                        setArticleForm({
                          title: article.title,
                          excerpt: article.excerpt,
                          content: article.content,
                          category: article.category,
                          author: article.author,
                          readTime: article.readTime,
                          featured: article.featured,
                          isPublished: article.isPublished,
                          coverImageUrl: article.coverImageUrl
                        });
                        setShowArticleModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                      title="Edit article"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article._id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: PODCASTS */}
      {/* ==================================================================== */}
      {subTab === 'podcasts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Podcast Episodes ({podcasts.length})
            </h3>
            <button
              onClick={() => {
                setPodcastForm({
                  episodeNumber: podcasts.length + 1,
                  title: '',
                  description: '',
                  audioUrl: '',
                  youtubeUrl: '',
                  spotifyUrl: '',
                  duration: '35 mins',
                  host: 'Skouted Media Team',
                  guest: '',
                  coverImageUrl: ''
                });
                setShowPodcastModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#00E676] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00E676]/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Episode</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {podcasts.map(ep => (
              <div
                key={ep._id}
                className="rounded-2xl p-4 bg-[#111520] border border-[#1E2536] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/5">
                    <img
                      src={ep.coverImageUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400'}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#00E676]">
                        EP 0{ep.episodeNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">• {ep.duration}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {ep.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {ep.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Guest: {ep.guest || 'None'}</span>
                  <button
                    onClick={() => handleDeletePodcast(ep._id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="Delete episode"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 3: SPONSORS */}
      {/* ==================================================================== */}
      {subTab === 'sponsors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              League Partners & Sponsors ({sponsors.length})
            </h3>
            <button
              onClick={() => {
                setSponsorForm({
                  name: '',
                  tier: 'Official Partner',
                  websiteUrl: '',
                  description: '',
                  order: sponsors.length + 1,
                  logoUrl: ''
                });
                setShowSponsorModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#00E676] text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00E676]/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sponsors.map(sponsor => (
              <div
                key={sponsor._id}
                className="rounded-2xl p-4 bg-[#111520] border border-[#1E2536] flex flex-col justify-between space-y-3 text-center"
              >
                <div className="w-full h-16 rounded-xl bg-black/40 p-2 flex items-center justify-center overflow-hidden border border-white/5">
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white truncate">{sponsor.name}</h4>
                  <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    {sponsor.tier}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">Order: {sponsor.order}</span>
                  <button
                    onClick={() => handleDeleteSponsor(sponsor._id)}
                    className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Delete partner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE / EDIT NEWS ARTICLE */}
      {/* ==================================================================== */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#111520] border border-[#23293A] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <h3 className="text-base font-bold text-white">
                {editingArticle ? 'Edit Article' : 'Publish New League Story'}
              </h3>
              <button onClick={() => setShowArticleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Article Headline *</label>
                <input
                  type="text"
                  required
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="e.g. Opening Weekend Tactical Review"
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  >
                    <option value="League Announcement">League Announcement</option>
                    <option value="Matchday Recap">Matchday Recap</option>
                    <option value="Scouting Report">Scouting Report</option>
                    <option value="Youth Development">Youth Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Author</label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Excerpt (Lead Summary) *</label>
                <textarea
                  required
                  rows={2}
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Brief 1-2 sentence lead paragraph shown in cards..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Article Body (Markdown supported) *</label>
                <textarea
                  required
                  rows={6}
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="### Section Heading&#10;&#10;Detailed article content..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cover Image File (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setArticleCoverFile(e.target.files[0])}
                    className="w-full text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#00E676]/20 file:text-[#00E676] file:font-bold file:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Or Image URL</label>
                  <input
                    type="text"
                    value={articleForm.coverImageUrl}
                    onChange={(e) => setArticleForm({ ...articleForm, coverImageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={articleForm.featured}
                    onChange={(e) => setArticleForm({ ...articleForm, featured: e.target.checked })}
                    className="accent-[#00E676]"
                  />
                  <span>Mark as Featured Story</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingArticle ? 'Update Article' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD PODCAST */}
      {/* ==================================================================== */}
      {showPodcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-[#111520] border border-[#23293A] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <h3 className="text-base font-bold text-white">Add Podcast Episode</h3>
              <button onClick={() => setShowPodcastModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePodcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Episode #</label>
                  <input
                    type="number"
                    value={podcastForm.episodeNumber}
                    onChange={(e) => setPodcastForm({ ...podcastForm, episodeNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    value={podcastForm.duration}
                    onChange={(e) => setPodcastForm({ ...podcastForm, duration: e.target.value })}
                    placeholder="e.g. 38 mins"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Episode Title *</label>
                <input
                  type="text"
                  required
                  value={podcastForm.title}
                  onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                  placeholder="e.g. Episode 4: Modern Scouting Frameworks"
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={podcastForm.description}
                  onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Guest / Feature</label>
                  <input
                    type="text"
                    value={podcastForm.guest}
                    onChange={(e) => setPodcastForm({ ...podcastForm, guest: e.target.value })}
                    placeholder="e.g. Chief Talent Scout"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Audio MP3 URL</label>
                  <input
                    type="text"
                    value={podcastForm.audioUrl}
                    onChange={(e) => setPodcastForm({ ...podcastForm, audioUrl: e.target.value })}
                    placeholder="https://...mp3"
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Spotify URL</label>
                  <input
                    type="text"
                    value={podcastForm.spotifyUrl}
                    onChange={(e) => setPodcastForm({ ...podcastForm, spotifyUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">YouTube URL</label>
                  <input
                    type="text"
                    value={podcastForm.youtubeUrl}
                    onChange={(e) => setPodcastForm({ ...podcastForm, youtubeUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Episode Artwork File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPodcastCoverFile(e.target.files[0])}
                  className="w-full text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#00E676]/20 file:text-[#00E676] file:font-bold file:text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setShowPodcastModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Episode</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD SPONSOR */}
      {/* ==================================================================== */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#111520] border border-[#23293A] p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2536]">
              <h3 className="text-base font-bold text-white">Add Sponsor Partner</h3>
              <button onClick={() => setShowSponsorModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSponsor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  placeholder="e.g. Nike Football"
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tier *</label>
                  <select
                    value={sponsorForm.tier}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, tier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  >
                    <option value="Official Partner">Official Partner</option>
                    <option value="Technical Sponsor">Technical Sponsor</option>
                    <option value="Scouting Partner">Scouting Partner</option>
                    <option value="Media Partner">Media Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Order Priority</label>
                  <input
                    type="number"
                    value={sponsorForm.order}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, order: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                <input
                  type="text"
                  value={sponsorForm.websiteUrl}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, websiteUrl: e.target.value })}
                  placeholder="https://partner.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={sponsorForm.description}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })}
                  placeholder="Brief role in tournament..."
                  className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Logo File (Cloudinary)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSponsorLogoFile(e.target.files[0])}
                    className="w-full text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#00E676]/20 file:text-[#00E676] file:font-bold file:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Or Logo URL</label>
                  <input
                    type="text"
                    value={sponsorForm.logoUrl}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#252A38] text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2536]">
                <button
                  type="button"
                  onClick={() => setShowSponsorModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-bold flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Partner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
